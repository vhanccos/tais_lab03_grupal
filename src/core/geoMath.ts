import { CoordenadaGeo, PuntoEncuentro } from '../storage/stateTypes';

export interface BoundsGeo {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface SvgPoint {
  x: number;
  y: number;
}

export interface NearestPointResult {
  punto: PuntoEncuentro;
  distanciaMetros: number;
  distanciaFormateada: string;
  rumboGrados: number;
}

// Bounding box default for Arequipa Cercado / UNSA & surrounding disaster-resilience safe zones
export const DEFAULT_AREQUIPA_BOUNDS: BoundsGeo = {
  minLat: -16.420000,
  maxLat: -16.395000,
  minLng: -71.540000,
  maxLng: -71.510000
};

// Default reference coordinates (UNSA / Cercado de Arequipa: -16.4064328, -71.5253347)
export const DEFAULT_AREQUIPA_CENTER: CoordenadaGeo = {
  lat: -16.4064328,
  lng: -71.5253347
};

// Aliases for backwards compatibility
export const DEFAULT_LIMA_BOUNDS: BoundsGeo = DEFAULT_AREQUIPA_BOUNDS;
export const DEFAULT_LIMA_CENTER: CoordenadaGeo = DEFAULT_AREQUIPA_CENTER;
export const DEFAULT_MAP_BOUNDS: BoundsGeo = DEFAULT_AREQUIPA_BOUNDS;
export const DEFAULT_MAP_CENTER: CoordenadaGeo = DEFAULT_AREQUIPA_CENTER;

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine spherical trigonometry formula.
 * @returns Distance in meters.
 */
export function calcularDistanciaHaversine(
  coord1: CoordenadaGeo,
  coord2: CoordenadaGeo
): number {
  if (coord1.lat === coord2.lat && coord1.lng === coord2.lng) {
    return 0;
  }

  const phi1 = toRadians(coord1.lat);
  const phi2 = toRadians(coord2.lat);
  const deltaPhi = toRadians(coord2.lat - coord1.lat);
  const deltaLambda = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const clampedA = Math.max(0, Math.min(1, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates the forward azimuth / bearing in degrees from origin to destination.
 * @returns Bearing angle in degrees normalized to [0, 360).
 * 0° = North, 90° = East, 180° = South, 270° = West.
 */
export function calcularRumboAzimut(
  origen: CoordenadaGeo,
  destino: CoordenadaGeo
): number {
  if (origen.lat === destino.lat && origen.lng === destino.lng) {
    return 0;
  }

  const phi1 = toRadians(origen.lat);
  const phi2 = toRadians(destino.lat);
  const deltaLambda = toRadians(destino.lng - origen.lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = (toDegrees(theta) + 360) % 360;

  return bearing === 360 ? 0 : bearing;
}

/**
 * Maps geographic coordinates (lat, lng) to 2D SVG canvas plane coordinates (x, y).
 * Inverts the vertical Y axis because SVG origin is at top-left.
 */
export function projectGeoToSvg(
  coord: CoordenadaGeo,
  bounds: BoundsGeo,
  svgWidth: number,
  svgHeight: number
): SvgPoint {
  const dLng = bounds.maxLng - bounds.minLng;
  const dLat = bounds.maxLat - bounds.minLat;

  if (dLng === 0 || dLat === 0) {
    return { x: svgWidth / 2, y: svgHeight / 2 };
  }

  const x = ((coord.lng - bounds.minLng) / dLng) * svgWidth;
  const y = ((bounds.maxLat - coord.lat) / dLat) * svgHeight;

  return { x, y };
}

/**
 * Maps 2D SVG canvas plane coordinates (x, y) back to geographic coordinates (lat, lng).
 * Inverse function of projectGeoToSvg.
 */
export function unprojectSvgToGeo(
  point: SvgPoint,
  bounds: BoundsGeo,
  svgWidth: number,
  svgHeight: number
): CoordenadaGeo {
  const dLng = bounds.maxLng - bounds.minLng;
  const dLat = bounds.maxLat - bounds.minLat;

  if (svgWidth <= 0 || svgHeight <= 0) {
    return {
      lat: (bounds.minLat + bounds.maxLat) / 2,
      lng: (bounds.minLng + bounds.maxLng) / 2
    };
  }

  const lng = bounds.minLng + (point.x / svgWidth) * dLng;
  const lat = bounds.maxLat - (point.y / svgHeight) * dLat;

  return { lat, lng };
}

/**
 * Computes an adaptive bounding box that encloses the user coordinate and all meeting points,
 * ensuring margin padding and avoiding collapsed bounds.
 */
export function computeAdaptiveBounds(
  userPos: CoordenadaGeo,
  points: PuntoEncuentro[] = [],
  paddingRatio: number = 0.25
): BoundsGeo {
  const coords: CoordenadaGeo[] = [userPos];

  for (const p of points) {
    if (p.coordenadas && typeof p.coordenadas.lat === 'number' && typeof p.coordenadas.lng === 'number') {
      coords.push(p.coordenadas);
    }
  }

  let minLat = coords[0].lat;
  let maxLat = coords[0].lat;
  let minLng = coords[0].lng;
  let maxLng = coords[0].lng;

  for (let i = 1; i < coords.length; i++) {
    const c = coords[i];
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  }

  // Minimum span to avoid hyper-zooming (approx ~1.5km minimum span)
  const minSpanLat = 0.015;
  const minSpanLng = 0.015;

  let spanLat = Math.max(maxLat - minLat, minSpanLat);
  let spanLng = Math.max(maxLng - minLng, minSpanLng);

  // Apply padding ratio
  const padLat = spanLat * paddingRatio;
  const padLng = spanLng * paddingRatio;

  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLng: minLng - padLng,
    maxLng: maxLng + padLng
  };
}

/**
 * Formats distance in meters to a concise, human-readable string.
 * Examples: 45 m, 350 m, 1.2 km, 15 km.
 */
export function formatDistance(meters: number): string {
  if (isNaN(meters) || meters <= 0) {
    return '0 m';
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const km = meters / 1000;
  if (km >= 10) {
    return `${Math.round(km)} km`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Helper to identify the closest safe zone / meeting point to a given coordinate.
 */
export function findNearestSafeZone(
  userPos: CoordenadaGeo,
  points: PuntoEncuentro[]
): NearestPointResult | null {
  const validPoints = points.filter(p => p.coordenadas && typeof p.coordenadas.lat === 'number');

  if (validPoints.length === 0) {
    return null;
  }

  let nearestPoint = validPoints[0];
  let minDistance = calcularDistanciaHaversine(userPos, nearestPoint.coordenadas!);

  for (let i = 1; i < validPoints.length; i++) {
    const p = validPoints[i];
    const dist = calcularDistanciaHaversine(userPos, p.coordenadas!);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = p;
    }
  }

  const rumbo = calcularRumboAzimut(userPos, nearestPoint.coordenadas!);

  return {
    punto: nearestPoint,
    distanciaMetros: minDistance,
    distanciaFormateada: formatDistance(minDistance),
    rumboGrados: Math.round(rumbo)
  };
}

export type { CoordenadaGeo, PuntoEncuentro };
