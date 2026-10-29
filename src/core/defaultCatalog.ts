import { ArticuloMochila, CategoriaId } from '../storage/stateTypes';

export const CATEGORIAS_INFO: Record<CategoriaId, { nombre: string; descripcion: string; icono: string }> = {
  primeros_auxilios: {
    nombre: 'Primeros Auxilios',
    descripcion: 'Medicamentos básicos, curaciones e insumos sanitarios esenciales.',
    icono: 'Cross'
  },
  alimentos: {
    nombre: 'Alimentos no perecibles',
    descripcion: 'Comida enlatada, deshidratada o lista para consumir con alto valor calórico.',
    icono: 'Apple'
  },
  agua: {
    nombre: 'Agua embotellada',
    descripcion: 'Agua potable no gasificada en envases individuales resistentes.',
    icono: 'Droplets'
  },
  herramientas: {
    nombre: 'Herramientas y Comunicación',
    descripcion: 'Linternas, radio a pilas, silbato y baterías para orientación.',
    icono: 'Wrench'
  },
  abrigo: {
    nombre: 'Abrigo y Protección',
    descripcion: 'Mantas térmicas, impermeables y ropa de protección para bajas temperaturas.',
    icono: 'Shield'
  },
  documentos: {
    nombre: 'Documentos y Dinero',
    descripcion: 'Copias de identidad, duplicados de llaves y dinero en efectivo.',
    icono: 'FileText'
  }
};

export const DEFAULT_ARTICULOS_INDECI: ArticuloMochila[] = [
  // Primeros Auxilios
  {
    id: 'pa-1',
    categoriaId: 'primeros_auxilios',
    nombre: 'Botiquín de primeros auxilios (alcohol, gasas, vendas, esparadrapo)',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 estuche'
  },
  {
    id: 'pa-2',
    categoriaId: 'primeros_auxilios',
    nombre: 'Medicamentos específicos para familiares con tratamiento crónico',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: 'Dosis para 7 días'
  },
  {
    id: 'pa-3',
    categoriaId: 'primeros_auxilios',
    nombre: 'Mascarillas de protección (KN95 o quirúrgicas)',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '4 unidades por persona'
  },
  {
    id: 'pa-4',
    categoriaId: 'primeros_auxilios',
    nombre: 'Gel antibacterial o alcohol en gel (70%)',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 frasco pequeño'
  },
  {
    id: 'pa-5',
    categoriaId: 'primeros_auxilios',
    nombre: 'Guantes de látex o nitrilo descartables',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '2 pares'
  },

  // Alimentos no perecibles
  {
    id: 'al-1',
    categoriaId: 'alimentos',
    nombre: 'Conservas de pescado / atún enlatado con abre fácil',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '4 latas'
  },
  {
    id: 'al-2',
    categoriaId: 'alimentos',
    nombre: 'Barras de cereal o energéticas',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '6 unidades'
  },
  {
    id: 'al-3',
    categoriaId: 'alimentos',
    nombre: 'Galletas de soda o agua en paquete sellado',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '2 paquetes'
  },
  {
    id: 'al-4',
    categoriaId: 'alimentos',
    nombre: 'Chocolates en barra o frutos secos empacados',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '2 tabletas / 200g'
  },

  // Agua
  {
    id: 'ag-1',
    categoriaId: 'agua',
    nombre: 'Agua mineral embotellada sin gas (500 ml)',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '4 botellas'
  },
  {
    id: 'ag-2',
    categoriaId: 'agua',
    nombre: 'Botella de agua de 2 litros para reposición',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 botella grande'
  },
  {
    id: 'ag-3',
    categoriaId: 'agua',
    nombre: 'Pastillas purificadoras de agua o gotero con cloro',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 blíster / frasco'
  },

  // Herramientas y Comunicación
  {
    id: 'her-1',
    categoriaId: 'herramientas',
    nombre: 'Linterna LED de alta potencia o dinamo',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 unidad'
  },
  {
    id: 'her-2',
    categoriaId: 'herramientas',
    nombre: 'Radio portátil AM/FM a pilas',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 radio'
  },
  {
    id: 'her-3',
    categoriaId: 'herramientas',
    nombre: 'Silbato de emergencia de alto decibelio',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '2 unidades'
  },
  {
    id: 'her-4',
    categoriaId: 'herramientas',
    nombre: 'Pilas y baterías de repuesto para linterna y radio',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '4 pilas AA/AAA'
  },
  {
    id: 'her-5',
    categoriaId: 'herramientas',
    nombre: 'Cuchilla / navaja multiusos',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 herramienta'
  },
  {
    id: 'her-6',
    categoriaId: 'herramientas',
    nombre: 'Encendedor de gas o fósforos en bolsa impermeable',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 encendedor'
  },
  {
    id: 'her-7',
    categoriaId: 'herramientas',
    nombre: 'Cinta adhesiva multiusos (Duct Tape)',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 rollo'
  },

  // Abrigo y Protección
  {
    id: 'ab-1',
    categoriaId: 'abrigo',
    nombre: 'Manta térmica aluminizada de emergencia',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '2 unidades'
  },
  {
    id: 'ab-2',
    categoriaId: 'abrigo',
    nombre: 'Casaca cortaviento o impermeable ligero',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 prenda por persona'
  },
  {
    id: 'ab-3',
    categoriaId: 'abrigo',
    nombre: 'Guantes de trabajo gruesos / cuero',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 par'
  },
  {
    id: 'ab-4',
    categoriaId: 'abrigo',
    nombre: 'Muda de ropa interior y medias abrigadoras',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 cambio'
  },

  // Documentos y Dinero
  {
    id: 'doc-1',
    categoriaId: 'documentos',
    nombre: 'Copia física del DNI de todos los integrantes del hogar en bolsa hermética',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: 'Juego completo de copias'
  },
  {
    id: 'doc-2',
    categoriaId: 'documentos',
    nombre: 'Libreta de notas con teléfonos de emergencia y lapicero',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 libreta pequeña'
  },
  {
    id: 'doc-3',
    categoriaId: 'documentos',
    nombre: 'Duplicado de llaves de la vivienda y del automóvil',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: '1 juego'
  },
  {
    id: 'doc-4',
    categoriaId: 'documentos',
    nombre: 'Dinero en efectivo en monedas y billetes de baja denominación',
    completado: false,
    esPredeterminado: true,
    cantidadRecomendada: 'Monto de contingencia'
  }
];
