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
  },
  {
    id: 'arequipa-cercado',
    nombre: 'Arequipa - Centro Histórico / Plaza de Armas',
    region: 'Arequipa',
    center: [-16.39889, -71.53694],
    bounds: [
      [-16.4100, -71.5480],
      [-16.3880, -71.5250]
    ],
    zoomMin: 14,
    zoomMax: 17
  },
  {
    id: 'lima-cercado',
    nombre: 'Lima - Cercado de Lima / Plaza Mayor',
    region: 'Lima',
    center: [-12.04637, -77.04279],
    bounds: [
      [-12.0600, -77.0550],
      [-12.0350, -77.0250]
    ],
    zoomMin: 14,
    zoomMax: 17
  },
  {
    id: 'lima-miraflores',
    nombre: 'Lima - Miraflores / Parque Kennedy',
    region: 'Lima',
    center: [-12.1211, -77.0305],
    bounds: [
      [-12.1350, -77.0450],
      [-12.1050, -77.0150]
    ],
    zoomMin: 14,
    zoomMax: 17
  }
];

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
