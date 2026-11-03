import localforage from 'localforage';

export interface DistritosPredefinidos {
  id: string;
  nombre: string;
  region: string;
  center: [number, number]; // [lat, lng]
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  zoomMin: number;
  zoomMax: number;
}

// Distrito único enfocado exclusivamente en Arequipa - Campus UNSA Ingenierías / Cercado
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
    zoomMin: 14,
    zoomMax: 18
  }
];

export const TILE_BOUNDS_UNSA = {
  south: -16.4150,
  west: -71.5350,
  north: -16.3980,
  east: -71.5150,
  minZoom: 14,
  maxZoom: 18
};

export const tileStore = localforage.createInstance({
  name: 'sismolisto_offline_maps',
  storeName: 'osm_tiles',
  description: 'Almacenamiento persistente de teselas de mapas de OpenStreetMap'
});

export async function getTileCount(): Promise<number> {
  try {
    return await tileStore.length();
  } catch {
    return 0;
  }
}

export async function clearAllTiles(): Promise<void> {
  await tileStore.clear();
}
