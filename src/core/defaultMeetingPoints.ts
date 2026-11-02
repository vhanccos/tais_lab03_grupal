import { PuntoEncuentro } from '../storage/stateTypes';

export const DEFAULT_PUNTOS_ENCUENTRO: PuntoEncuentro[] = [
  {
    id: 'punto-def-interno',
    nombre: 'Zona Segura Interna (Pabellón)',
    tipo: 'interno',
    descripcion: 'Junto a la columna de concreto armado o placa estructural del pasillo principal, lejos de ventanales.',
    esPredeterminado: true,
    svgCoords: { x: 120, y: 150 }
  },
  {
    id: 'punto-def-externo',
    nombre: 'Círculo INDECI Campo 1 / Patio Central UNSA',
    tipo: 'externo',
    descripcion: 'Círculo de seguridad despejado de cables de media tensión en el patio central / Campo 1.',
    esPredeterminado: true,
    coordenadas: { lat: -16.405500, lng: -71.524800 },
    svgCoords: { x: 280, y: 320 }
  },
  {
    id: 'punto-def-comunitario',
    nombre: 'Estadio Ho Chi Minh / Av. Independencia',
    tipo: 'comunitario',
    descripcion: 'Punto de reagrupación comunitaria y triaje de emergencia en el Estadio Ho Chi Minh / salida Independencia.',
    esPredeterminado: true,
    coordenadas: { lat: -16.404375, lng: -71.523035 },
    svgCoords: { x: 420, y: 410 }
  }
];
