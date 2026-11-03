import localforage from 'localforage';
import availableTiles from '../data/availableLocalTiles.json';

export interface DistritosPredefinidos {
  id: string;
  nombre: string;
  region: string;
  center: [number, number]; // [lat, lng]
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  zoomMin: number;
  zoomMax: number;
  isDefault?: boolean;
}

// Bounding box rigurosa del paquete de teselas OpenStreetMap precargadas
export const TILE_BOUNDS_UNSA = {
  south: -16.4150,
  west: -71.5374,
  north: -16.3939,
  east: -71.5100,
  zoomMin: 14,
  zoomMax: 18
};

// Distrito único y enfocado exclusivamente en Arequipa - Campus UNSA Ingenierías / Cercado
export const DISTRITOS_PERU: DistritosPredefinidos[] = [
  {
    id: 'arequipa-unsa',
    nombre: 'Arequipa - Campus UNSA Ingenierías / Cercado',
    region: 'Arequipa',
    center: [-16.40643, -71.52533],
    bounds: [
      [TILE_BOUNDS_UNSA.south, TILE_BOUNDS_UNSA.west],
      [TILE_BOUNDS_UNSA.north, TILE_BOUNDS_UNSA.east]
    ],
    zoomMin: TILE_BOUNDS_UNSA.zoomMin,
    zoomMax: TILE_BOUNDS_UNSA.zoomMax,
    isDefault: true
  }
];

// Set en memoria de las teselas locales existentes para verificación O(1)
const availableTilesSet = new Set<string>(availableTiles);

/**
 * Verifica si una coordenada de tile (z/x/y) existe localmente en el paquete precargado
 */
export function hasLocalTile(z: number, x: number, y: number): boolean {
  return availableTilesSet.has(`${z}/${x}/${y}.png`);
}

/**
 * Obtiene la URL local de una tesela o null si está fuera de cobertura
 */
export function getLocalTileUrl(z: number, x: number, y: number): string | null {
  if (hasLocalTile(z, x, y)) {
    return `/tiles/${z}/${x}/${y}.png`;
  }
  return null;
}

export const tileStore = localforage.createInstance({
  name: 'sismolisto_offline_maps',
  storeName: 'osm_tiles',
  description: 'Almacenamiento persistente de teselas de mapas de OpenStreetMap'
});

export async function getTileCount(): Promise<number> {
  return availableTilesSet.size;
}

export async function clearAllTiles(): Promise<void> {
  await tileStore.clear();
}
