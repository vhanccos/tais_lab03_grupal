import localforage from 'localforage';

export interface DistritosPredefinidos {
  id: string;
  nombre: string;
  region: string;
  center: [number, number]; // [lat, lng]
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  zoomMin: number;
  zoomMax: number;
  isDefault?: boolean;
  tamanoAproxMB: number;
  tilesBasePath: string;
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
    zoomMin: 13,
    zoomMax: 18,
    isDefault: true,
    tamanoAproxMB: 3.3,
    tilesBasePath: '/tiles'
  },
  {
    id: 'plaza-armas',
    nombre: 'Arequipa - Centro Histórico / Plaza de Armas',
    region: 'Arequipa',
    center: [-16.39889, -71.53694],
    bounds: [
      [-16.4040, -71.5430],
      [-16.3930, -71.5300]
    ],
    zoomMin: 14,
    zoomMax: 17,
    tamanoAproxMB: 1.5,
    tilesBasePath: '/tiles_distritos/plaza-armas'
  },
  {
    id: 'yanahuara',
    nombre: 'Arequipa - Yanahuara / Mirador',
    region: 'Arequipa',
    center: [-16.3875, -71.5420],
    bounds: [
      [-16.3950, -71.5500],
      [-16.3820, -71.5350]
    ],
    zoomMin: 14,
    zoomMax: 17,
    tamanoAproxMB: 1.6,
    tilesBasePath: '/tiles_distritos/yanahuara'
  },
  {
    id: 'paucarpata',
    nombre: 'Arequipa - Paucarpata / JL Bustamante',
    region: 'Arequipa',
    center: [-16.4250, -71.5200],
    bounds: [
      [-16.4350, -71.5300],
      [-16.4150, -71.5120]
    ],
    zoomMin: 14,
    zoomMax: 17,
    tamanoAproxMB: 2.1,
    tilesBasePath: '/tiles_distritos/paucarpata'
  }
];

export const TILE_BOUNDS_UNSA = {
  south: -16.4150,
  west: -71.5350,
  north: -16.3980,
  east: -71.5150,
  minZoom: 13,
  maxZoom: 18
};

// Store para rastrear paquetes de distritos descargados localmente
export const tileStore = localforage.createInstance({
  name: 'sismolisto_offline_maps',
  storeName: 'osm_tiles',
  description: 'Almacenamiento persistente de teselas de mapas de OpenStreetMap'
});

export const districtPackageStore = localforage.createInstance({
  name: 'sismolisto_offline_maps',
  storeName: 'downloaded_districts',
  description: 'Registro de paquetes distritales descargados'
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
 * Consulta si un distrito ya está disponible offline en el dispositivo
 */
export async function isDistrictDownloaded(districtId: string): Promise<boolean> {
  // El distrito predeterminado (UNSA) viene precargado en la app
  if (districtId === 'arequipa-unsa') return true;
  try {
    const val = await districtPackageStore.getItem<boolean>(districtId);
    return Boolean(val);
  } catch {
    return false;
  }
}

/**
 * Marca un distrito como descargado y disponible
 */
export async function markDistrictDownloaded(districtId: string): Promise<void> {
  await districtPackageStore.setItem(districtId, true);
}

export async function getTileCount(): Promise<number> {
  try {
    return await tileStore.length();
  } catch {
    return 0;
  }
}

export async function clearAllTiles(): Promise<void> {
  await tileStore.clear();
  await districtPackageStore.clear();
}
