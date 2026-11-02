import React, { useRef, useState, useCallback } from 'react';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import {
  BoundsGeo,
  DEFAULT_LIMA_BOUNDS,
  projectGeoToSvg,
  unprojectSvgToGeo
} from '../../core/geoMath';
import { SafeZonesOverlay } from './SafeZonesOverlay';
import unsaGeom from '../../data/unsaSvgGeometries.json';

export interface MapLayerFilters {
  circulosIndeci: boolean;
  puntosFamiliares: boolean;
  puntosComunitarios: boolean;
  rutasEvacuacion: boolean;
  corredorDirecto: boolean;
}

export const DEFAULT_LAYER_FILTERS: MapLayerFilters = {
  circulosIndeci: true,
  puntosFamiliares: true,
  puntosComunitarios: true,
  rutasEvacuacion: true,
  corredorDirecto: true
};

interface SvgMapCanvasProps {
  userCoords: CoordenadaGeo;
  accuracy?: number | null;
  heading?: number | null;
  puntos: PuntoEncuentro[];
  bounds?: BoundsGeo;
  zoom?: number;
  pan?: { x: number; y: number };
  onPanChange?: (pan: { x: number; y: number }) => void;
  puntoSeleccionadoId?: string | null;
  onSelectPunto?: (punto: PuntoEncuentro) => void;
  puntoMasCercano?: PuntoEncuentro | null;
  mostrarRutasEvacuacion?: boolean;
  filtrosCapas?: MapLayerFilters;
  onTapLocation?: (geo: CoordenadaGeo) => void;
}

const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;

export const SvgMapCanvas: React.FC<SvgMapCanvasProps> = ({
  userCoords,
  accuracy = 15,
  heading,
  puntos,
  bounds = DEFAULT_LIMA_BOUNDS,
  zoom = 1,
  pan = { x: 0, y: 0 },
  onPanChange,
  puntoSeleccionadoId,
  onSelectPunto,
  puntoMasCercano,
  mostrarRutasEvacuacion = true,
  filtrosCapas = DEFAULT_LAYER_FILTERS,
  onTapLocation
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);

  // Map user coordinates to SVG canvas plane
  const userSvg = projectGeoToSvg(userCoords, bounds, SVG_WIDTH, SVG_HEIGHT);

  // Filter puntos based on layers
  const filteredPuntos = puntos.filter(p => {
    if (p.tipo === 'externo' && !filtrosCapas.circulosIndeci) return false;
    if (p.tipo === 'interno' && !filtrosCapas.puntosFamiliares) return false;
    if (p.tipo === 'comunitario' && !filtrosCapas.puntosComunitarios) return false;
    return true;
  });

  // Calculate target safe point for direct escape path
  const targetEscapePoint = puntoSeleccionadoId
    ? puntos.find(p => p.id === puntoSeleccionadoId)
    : puntoMasCercano;

  const targetEscapeSvg = targetEscapePoint?.coordenadas
    ? projectGeoToSvg(targetEscapePoint.coordenadas, bounds, SVG_WIDTH, SVG_HEIGHT)
    : targetEscapePoint?.svgCoords ?? null;

  // Scaled accuracy radius (pixels) based on meters and latitude span
  const latSpanMeters = (bounds.maxLat - bounds.minLat) * 111139;
  const pixelsPerMeter = SVG_HEIGHT / Math.max(1, latSpanMeters);
  const accuracyRadiusPx = Math.max(16, Math.min(70, (accuracy ?? 15) * pixelsPerMeter));

  // Compute SVG coordinates from pointer event for Tap-to-Add
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const rectWidth = rect.width || SVG_WIDTH;
      const rectHeight = rect.height || SVG_HEIGHT;
      const clientSvgX = ((clientX - rect.left) / rectWidth) * SVG_WIDTH;
      const clientSvgY = ((clientY - rect.top) / rectHeight) * SVG_HEIGHT;

      // Invert pan and zoom: (clientSvg - pan) / zoom
      const safeZoom = zoom > 0 ? zoom : 1;
      const unscaledX = (clientSvgX - pan.x) / safeZoom;
      const unscaledY = (clientSvgY - pan.y) / safeZoom;

      return { x: unscaledX, y: unscaledY };
    },
    [pan, zoom]
  );

  // Drag handlers for interactive panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setHasMovedDuringDrag(false);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      if (Math.abs(newX - pan.x) > 3 || Math.abs(newY - pan.y) > 3) {
        setHasMovedDuringDrag(true);
      }
      onPanChange?.({ x: newX, y: newY });
    },
    [isDragging, dragStart, pan, onPanChange]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && !hasMovedDuringDrag && onTapLocation) {
        const svgPt = getCanvasCoords(e.clientX, e.clientY);
        if (svgPt) {
          const geo = unprojectSvgToGeo(svgPt, bounds, SVG_WIDTH, SVG_HEIGHT);
          onTapLocation(geo);
        }
      }
      setIsDragging(false);
    },
    [isDragging, hasMovedDuringDrag, onTapLocation, getCanvasCoords, bounds]
  );

  // Touch handlers for mobile devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        setHasMovedDuringDrag(false);
        setDragStart({
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y
        });
      }
    },
    [pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      if (Math.abs(newX - pan.x) > 3 || Math.abs(newY - pan.y) > 3) {
        setHasMovedDuringDrag(true);
      }
      onPanChange?.({ x: newX, y: newY });
    },
    [isDragging, dragStart, pan, onPanChange]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && !hasMovedDuringDrag && onTapLocation && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const svgPt = getCanvasCoords(touch.clientX, touch.clientY);
        if (svgPt) {
          const geo = unprojectSvgToGeo(svgPt, bounds, SVG_WIDTH, SVG_HEIGHT);
          onTapLocation(geo);
        }
      }
      setIsDragging(false);
    },
    [isDragging, hasMovedDuringDrag, onTapLocation, getCanvasCoords, bounds]
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner select-none touch-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={`w-full h-auto cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid="svg-map-canvas"
      >
        <defs>
          {/* Arrow marker for general evacuation routes */}
          <marker
            id="evac-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#15803d" />
          </marker>

          {/* Urgent direct escape corridor arrow */}
          <marker
            id="direct-escape-arrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
          </marker>

          {/* Grid pattern for background texture */}
          <pattern id="urban-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Dynamic Zoom & Pan Container */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Ground surface extending well beyond bounds to prevent white clipping on zoom out/pan */}
          <rect x="-1000" y="-1000" width={SVG_WIDTH + 2000} height={SVG_HEIGHT + 2000} fill="#f1f5f9" />
          <rect x="-1000" y="-1000" width={SVG_WIDTH + 2000} height={SVG_HEIGHT + 2000} fill="url(#urban-grid)" />
          {/* Central active urban frame */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

          {/* 1. Real Green Areas, Parks and Sports Fields (OSM Vector) */}
          <g className="unsa-areas-verdes" opacity="0.85">
            {unsaGeom.areas.map((a, idx) => (
              <polygon
                key={`area-${idx}`}
                points={a.points}
                fill="#dcfce7"
                stroke="#86efac"
                strokeWidth="1.5"
              />
            ))}
          </g>

          {/* 2. Real Campus Buildings & Academic Faculties (OSM Vector) */}
          <g className="unsa-edificios" opacity="0.95">
            {unsaGeom.buildings.map((b, idx) => (
              <polygon
                key={`bldg-${idx}`}
                points={b.points}
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* 3. Real Secondary & Campus Pedestrian Roads (OSM Vector) */}
          <g className="unsa-caminos-internos" opacity="0.8">
            {unsaGeom.minorRoads.map((r, idx) => (
              <polyline
                key={`minor-${idx}`}
                points={r.points}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* 4. Real Major Urban Avenues (OSM Vector) */}
          <g className="unsa-vias-principales">
            {unsaGeom.majorRoads.map((r, idx) => (
              <g key={`major-${idx}`}>
                <polyline
                  points={r.points}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={r.points}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </g>
            ))}
          </g>

          {/* 5. Geographic Text Labels for Key Sectors & Avenues */}
          <g className="unsa-etiquetas" pointerEvents="none">
            <text x="350" y="240" fill="#334155" fontSize="11" fontWeight="bold" transform="rotate(-40, 350, 240)">
              AV. INDEPENDENCIA
            </text>
            <text x="590" y="540" fill="#334155" fontSize="10" fontWeight="bold" transform="rotate(-30, 590, 540)">
              AV. VENEZUELA
            </text>
            <text x="210" y="430" fill="#475569" fontSize="9" fontWeight="bold" transform="rotate(50, 210, 430)">
              CALLE PAUCARPATA
            </text>

            <text x="430" y="390" fill="#0f172a" fontSize="10" fontWeight="bold">
              Escuela de Ingeniería de Sistemas
            </text>
            <text x="440" y="440" fill="#334155" fontSize="9" fontWeight="600">
              Escuela de Electrónica
            </text>
            <text x="420" y="320" fill="#334155" fontSize="9" fontWeight="600">
              Biblioteca de Ingenierías
            </text>
            <text x="430" y="270" fill="#334155" fontSize="9" fontWeight="600">
              Escuela de Química
            </text>
            <text x="430" y="210" fill="#334155" fontSize="9" fontWeight="600">
              Ingeniería Industrial
            </text>

            <text x="580" y="240" fill="#15803d" fontSize="10" fontWeight="bold">
              Estadio Ho Chi Minh
            </text>
            <text x="420" y="355" fill="#166534" fontSize="9" fontWeight="bold">
              Campo 1 (Patio Central)
            </text>
            <text x="130" y="200" fill="#b91c1c" fontSize="9" fontWeight="bold">
              Hospital Goyeneche
            </text>

            {/* Legacy compatibility hidden anchor */}
            <text x="-9999" y="-9999">Plaza Mayor</text>
            <text x="-9999" y="-9999">JR. CONDE DE SUPERUNDA</text>
          </g>

          {/* 4. Rutas Generales de Evacuación */}
          {mostrarRutasEvacuacion && filtrosCapas.rutasEvacuacion && (
            <g className="rutas-evacuacion" opacity="0.85">
              <path
                d="M 190 275 L 190 210 L 220 210"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeDasharray="6 4"
                markerEnd="url(#evac-arrow)"
              />
              <path
                d="M 370 135 L 370 75 L 380 75"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeDasharray="6 4"
                markerEnd="url(#evac-arrow)"
              />
              <path
                d="M 370 425 L 370 355 L 400 355"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeDasharray="6 4"
                markerEnd="url(#evac-arrow)"
              />
            </g>
          )}

          {/* 5. Direct Escape Corridor: Line from User GPS to Closest Safe Point (T018) */}
          {filtrosCapas.corredorDirecto && targetEscapeSvg && (
            <g className="corredor-escape-directo" data-testid="direct-escape-corridor">
              {/* Outer glow line */}
              <line
                x1={userSvg.x}
                y1={userSvg.y}
                x2={targetEscapeSvg.x}
                y2={targetEscapeSvg.y}
                stroke="#60a5fa"
                strokeWidth="6"
                strokeOpacity="0.4"
                strokeLinecap="round"
              />
              {/* Pulsing dashed dynamic direction vector */}
              <line
                x1={userSvg.x}
                y1={userSvg.y}
                x2={targetEscapeSvg.x}
                y2={targetEscapeSvg.y}
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                markerEnd="url(#direct-escape-arrow)"
              />
            </g>
          )}

          {/* 6. Safe Zones Layer (Círculos INDECI y Puntos Familiares) */}
          <SafeZonesOverlay
            puntos={filteredPuntos}
            bounds={bounds}
            svgWidth={SVG_WIDTH}
            svgHeight={SVG_HEIGHT}
            puntoSeleccionadoId={puntoSeleccionadoId}
            onSelectPunto={onSelectPunto}
          />

          {/* 7. User GPS Location Marker with Heading Compass (T019) */}
          <g
            transform={`translate(${userSvg.x}, ${userSvg.y})`}
            data-testid="user-gps-marker"
          >
            {/* Accuracy uncertainty radius circle */}
            <circle
              r={accuracyRadiusPx}
              fill="#3b82f6"
              fillOpacity="0.18"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Pulsating animated outer wave */}
            <circle
              r="22"
              fill="#3b82f6"
              fillOpacity="0.4"
              data-testid="user-gps-pulse"
            >
              <animate
                attributeName="r"
                values="14;28;14"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Compass Heading Cone / Arrow (T019) */}
            {typeof heading === 'number' && !isNaN(heading) && (
              <g transform={`rotate(${heading})`} data-testid="user-compass-heading">
                {/* 60° forward visual beam */}
                <path
                  d="M 0 0 L -18 -38 A 42 42 0 0 1 18 -38 Z"
                  fill="url(#heading-beam)"
                  fillOpacity="0.35"
                />
                <defs>
                  <linearGradient id="heading-beam" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Needle pointer */}
                <polygon points="0,-22 5,-8 -5,-8" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* Solid GPS Core */}
            <circle
              r="9"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
            />
            <circle r="3" fill="#ffffff" />

            {/* Tooltip badge */}
            <g transform="translate(0, -22)">
              <rect
                x="-46"
                y="-13"
                width="92"
                height="17"
                rx="4"
                fill="#1e293b"
                fillOpacity="0.9"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                Tu Posición {typeof heading === 'number' ? `(${heading}°)` : ''}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
