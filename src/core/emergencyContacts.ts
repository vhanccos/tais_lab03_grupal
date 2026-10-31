export interface ContactoEmergencia {
  numero: string;
  nombre: string;
  entidad: string;
  descripcion: string;
  icono: string;
  prioridad: number;
  uri: string;
  color: string;
}

export const CONTACTOS_EMERGENCIA_PERU: ContactoEmergencia[] = [
  {
    numero: '116',
    nombre: 'Bomberos Voluntarios',
    entidad: 'CGBVP',
    descripcion: 'Rescate urbano, incendios y personas atrapadas en estructuras colapsadas.',
    icono: 'Flame',
    prioridad: 1,
    uri: 'tel:116',
    color: 'bg-red-600 hover:bg-red-700 text-white'
  },
  {
    numero: '106',
    nombre: 'SAMU - Ambulancias',
    entidad: 'MINSA',
    descripcion: 'Atención médica prehospitalaria urgente, soporte vital y ambulancias.',
    icono: 'HeartPulse',
    prioridad: 2,
    uri: 'tel:106',
    color: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  },
  {
    numero: '105',
    nombre: 'Policía Nacional',
    entidad: 'PNP',
    descripcion: 'Central de emergencias policiales, orden público, despeje y auxilio inmediato.',
    icono: 'ShieldAlert',
    prioridad: 3,
    uri: 'tel:105',
    color: 'bg-blue-700 hover:bg-blue-800 text-white'
  },
  {
    numero: '115',
    nombre: 'Defensa Civil / COEN',
    entidad: 'INDECI',
    descripcion: 'Reporte de daños, coordinación de albergues y asistencia humanitaria.',
    icono: 'Home',
    prioridad: 4,
    uri: 'tel:115',
    color: 'bg-amber-600 hover:bg-amber-700 text-white'
  },
  {
    numero: '100',
    nombre: 'Línea 100',
    entidad: 'MIMP',
    descripcion: 'Atención a personas vulnerables, menores extraviados y protección familiar.',
    icono: 'HeartHandshake',
    prioridad: 5,
    uri: 'tel:100',
    color: 'bg-purple-600 hover:bg-purple-700 text-white'
  },
  {
    numero: '110',
    nombre: 'Policía de Carreteras',
    entidad: 'PNP',
    descripcion: 'Estado de rutas interprovinciales y vías afectadas por sismos o huaicos.',
    icono: 'Truck',
    prioridad: 6,
    uri: 'tel:110',
    color: 'bg-slate-700 hover:bg-slate-800 text-white'
  },
  {
    numero: '113',
    nombre: 'Infosalud',
    entidad: 'MINSA',
    descripcion: 'Orientación médica telefónica gratuita y soporte emocional post-desastre.',
    icono: 'PhoneCall',
    prioridad: 7,
    uri: 'tel:113',
    color: 'bg-teal-700 hover:bg-teal-800 text-white'
  }
];
