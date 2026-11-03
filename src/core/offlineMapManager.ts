import localforage from 'localforage';

export interface DistritosPredefinidos {
  id: string;
  nombre: string;
  region: string;
  center: [number, number]; // [lat, lng]
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  isDefault?: boolean;
  tamanoAproxKB: number;
  geojsonPath: string;
}

export const DISTRITOS_PERU: DistritosPredefinidos[] = [
  {
    id: 'arequipa-unsa',
    nombre: 'Arequipa - Campus UNSA Ingenierías / Cercado',
    region: 'Arequipa',
    center: [-16.40643, -71.52533],
    bounds: [
      [-16.4150, -71.5350],
      [-16.3980, -71.5150]
    ],
    isDefault: true,
    tamanoAproxKB: 226,
    geojsonPath: '/distritos/arequipa-unsa.geojson'
  },
  {
    id: 'plaza-armas',
    nombre: 'Arequipa - Centro Histórico / Plaza de Armas',
    region: 'Arequipa',
    center: [-16.39889, -71.53694],
    bounds: [
      [-16.4060, -71.5450],
      [-16.3910, -71.5290]
    ],
    tamanoAproxKB: 12,
    geojsonPath: '/distritos/plaza-armas.geojson'
  },
  {
    id: 'yanahuara',
    nombre: 'Arequipa - Yanahuara / Mirador',
    region: 'Arequipa',
    center: [-16.3875, -71.5420],
    bounds: [
      [-16.3960, -71.5510],
      [-16.3790, -71.5330]
    ],
    tamanoAproxKB: 11,
    geojsonPath: '/distritos/yanahuara.geojson'
  },
  {
    id: 'paucarpata',
    nombre: 'Arequipa - Paucarpata / JL Bustamante',
    region: 'Arequipa',
    center: [-16.4250, -71.5200],
    bounds: [
      [-16.4360, -71.5310],
      [-16.4140, -71.5090]
    ],
    tamanoAproxKB: 11,
    geojsonPath: '/distritos/paucarpata.geojson'
  }
];

export const districtPackageStore = localforage.createInstance({
  name: 'sismolisto_vector_maps',
  storeName: 'downloaded_vector_districts',
  description: 'Almacenamiento de paquetes distritales GeoJSON'
});

/**
 * Determina si unas coordenadas GPS caen dentro de los límites de un distrito
 */
export function findDistrictByCoords(lat: number, lng: number): DistritosPredefinidos | null {
  for (const d of DISTRITOS_PERU) {
    const [[south, west], [north, east]] = d.bounds;
    if (lat >= south && lat <= north && lng >= west && lng <= east) {
      return d;
    }
  }
  return null;
}

/**
 * Consulta si un distrito vectorial ya fue descargado
 */
export async function isDistrictDownloaded(districtId: string): Promise<boolean> {
  if (districtId === 'arequipa-unsa') return true;
  try {
    const val = await districtPackageStore.getItem<boolean>(districtId);
    return Boolean(val);
  } catch {
    return false;
  }
}

/**
 * Marca un distrito como descargado
 */
export async function markDistrictDownloaded(districtId: string): Promise<void> {
  await districtPackageStore.setItem(districtId, true);
}

/**
 * Carga el GeoJSON de un distrito (desde IndexedDB o fetch local)
 */
export async function loadDistrictGeoJson(distrito: DistritosPredefinidos): Promise<any> {
  const cacheKey = `geojson_${distrito.id}`;
  try {
    const cached = await districtPackageStore.getItem<any>(cacheKey);
    if (cached) return cached;
  } catch {}

  // En Node.js/Vitest, paths relativos requieren base o fallback seguro
  const url = typeof window !== 'undefined' && window.location?.origin
    ? new URL(distrito.geojsonPath, window.location.origin).toString()
    : distrito.geojsonPath;

  const res = await fetch(url);
  const data = await res.json();
  try {
    await districtPackageStore.setItem(cacheKey, data);
  } catch {}
  return data;
}

export async function clearAllTiles(): Promise<void> {
  await districtPackageStore.clear();
}
