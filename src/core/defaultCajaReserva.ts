import { ArticuloCajaReserva, CategoriaCajaId } from '../storage/stateTypes';

export const CATEGORIAS_CAJA_INFO: Record<CategoriaCajaId, { nombre: string; descripcion: string; icono: string }> = {
  agua_alimentos: {
    nombre: 'Agua y Alimentos a Granel',
    descripcion: 'Agua en bidones (3-4L/persona/día) y alimentos no perecibles para días 2 a 4.',
    icono: 'Droplets'
  },
  higiene: {
    nombre: 'Higiene y Saneamiento Extendido',
    descripcion: 'Artículos de aseo personal, papel higiénico y manejo sanitario de residuos.',
    icono: 'Sparkles'
  },
  abrigo_refugio: {
    nombre: 'Refugio, Abrigo y Menaje',
    descripcion: 'Plásticos impermeables, mantas polares, menaje y utensilios básicos.',
    icono: 'Tent'
  },
  herramientas_diversos: {
    nombre: 'Desinfección y Suministros Varios',
    descripcion: 'Lejía al 5% para purificación de agua, baterías de repuesto y elementos de fijación.',
    icono: 'ShieldCheck'
  }
};

export const DEFAULT_ARTICULOS_CAJA_RESERVA: ArticuloCajaReserva[] = [
  // Agua y Alimentos a Granel
  {
    id: 'cr-ag-1',
    categoriaId: 'agua_alimentos',
    nombre: 'Agua potable en bidones resistentes (2.5L a 5L)',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '2 bidones de 5L (3-4L/persona/día)'
  },
  {
    id: 'cr-al-1',
    categoriaId: 'agua_alimentos',
    nombre: 'Conservas de pescado, pollo y menestras enlatadas con abre-fácil',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '6 latas variadas'
  },
  {
    id: 'cr-al-2',
    categoriaId: 'agua_alimentos',
    nombre: 'Alimentos secos no perecibles (arroz, fideos, avena o menestras)',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '2 a 3 kg empacados'
  },
  {
    id: 'cr-al-3',
    categoriaId: 'agua_alimentos',
    nombre: 'Leche evaporada o en polvo y azúcar/panela',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '2 latas / 1 kg'
  },

  // Higiene y Saneamiento
  {
    id: 'cr-hig-1',
    categoriaId: 'higiene',
    nombre: 'Papel higiénico y toallas de papel absorbente',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '1 paquete multipack'
  },
  {
    id: 'cr-hig-2',
    categoriaId: 'higiene',
    nombre: 'Jabón en barra para tocador y lavado',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '3 unidades'
  },
  {
    id: 'cr-hig-3',
    categoriaId: 'higiene',
    nombre: 'Pasta y cepillos dentales para la familia',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '1 kit familiar'
  },
  {
    id: 'cr-hig-4',
    categoriaId: 'higiene',
    nombre: 'Bolsas plásticas de basura gruesas de 50L (para residuos sanitarios)',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '1 rollo de 10 unidades'
  },

  // Refugio, Abrigo y Menaje
  {
    id: 'cr-ref-1',
    categoriaId: 'abrigo_refugio',
    nombre: 'Plásticos gruesos de polietileno para impermeabilizar techo o piso',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '2 pliegos de 3x3 metros'
  },
  {
    id: 'cr-ref-2',
    categoriaId: 'abrigo_refugio',
    nombre: 'Mantas polares o frazadas térmicas adicionales',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '2 a 3 unidades'
  },
  {
    id: 'cr-ref-3',
    categoriaId: 'abrigo_refugio',
    nombre: 'Olla pequeña, cubiertos y platos descartables o de plástico duro',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '1 juego básico'
  },

  // Desinfección y Suministros Varios
  {
    id: 'cr-her-1',
    categoriaId: 'herramientas_diversos',
    nombre: 'Lejía tradicional sin aroma al 5% para desinfección de agua (2 gotas por litro)',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '1 frasco con gotero'
  },
  {
    id: 'cr-her-2',
    categoriaId: 'herramientas_diversos',
    nombre: 'Juegos de pilas alcalinas selladas adicionales (AA / AAA)',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '4 a 8 pilas'
  },
  {
    id: 'cr-her-3',
    categoriaId: 'herramientas_diversos',
    nombre: 'Cuerda / driza de nylon resistente o rafia (10 a 20 metros)',
    completado: false,
    esPredeterminado: true,
    cantidadSugerida: '1 rollo'
  }
];
