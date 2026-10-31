import { PuntoEncuentro } from '../storage/stateTypes';

export const DEFAULT_PUNTOS_ENCUENTRO: PuntoEncuentro[] = [
  {
    id: 'punto-def-interno',
    nombre: 'Zona Segura Interna (Hogar)',
    tipo: 'interno',
    descripcion: 'Junto a la columna de concreto armado o placa estructural del pasillo principal, lejos de ventanas.',
    esPredeterminado: true,
    svgCoords: { x: 120, y: 150 }
  },
  {
    id: 'punto-def-externo',
    nombre: 'Círculo de Seguridad INDECI',
    tipo: 'externo',
    descripcion: 'Círculo verde de 4.5m en el parque o losa deportiva más cercana, despejado de cables de alta tensión.',
    esPredeterminado: true,
    coordenadas: { lat: -12.046374, lng: -77.042793 },
    svgCoords: { x: 280, y: 320 }
  },
  {
    id: 'punto-def-comunitario',
    nombre: 'Punto de Encuentro Barrial / Comunitario',
    tipo: 'comunitario',
    descripcion: 'Punto de reagrupación familiar si las vías inmediatas están bloqueadas: frontis de la iglesia o comisaría.',
    esPredeterminado: true,
    coordenadas: { lat: -12.048500, lng: -77.045000 },
    svgCoords: { x: 420, y: 410 }
  }
];
