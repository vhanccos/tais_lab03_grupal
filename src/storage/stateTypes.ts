export type CategoriaId =
  | 'primeros_auxilios'
  | 'alimentos'
  | 'agua'
  | 'herramientas'
  | 'abrigo'
  | 'documentos';

export interface ArticuloMochila {
  id: string;
  categoriaId: CategoriaId;
  nombre: string;
  completado: boolean;
  esPredeterminado: boolean;
  cantidadRecomendada?: string;
}

export interface IntegranteFamiliar {
  id: string;
  nombreCompleto: string; // trim().length > 0
  rolSismo: string;        // trim().length > 0
  notas?: string;
}

export interface CoordenadaGeo {
  lat: number;
  lng: number;
}

export interface PuntoEncuentro {
  id: string;
  nombre: string;
  tipo: 'interno' | 'externo' | 'comunitario' | 'seguro';
  descripcion: string;
  coordenadas?: CoordenadaGeo;
  svgCoords?: { x: number; y: number };
  esPredeterminado?: boolean;
}

export interface PlanFamiliar {
  puntoEncuentroInterno: string; // Preservado para compatibilidad
  puntoEncuentroExterno: string; // Preservado para compatibilidad
  puntosEncuentro: PuntoEncuentro[]; // Colección estructurada CRUD
  numeroFamiliarClave: string; // 9 dígitos
  integrantes: IntegranteFamiliar[];
  fechaActualizacion: string;
}

// Caja de Reserva (72h+)
export type CategoriaCajaId =
  | 'agua_alimentos'
  | 'higiene'
  | 'abrigo_refugio'
  | 'herramientas_diversos';

export interface ArticuloCajaReserva {
  id: string;
  categoriaId: CategoriaCajaId;
  nombre: string;
  completado: boolean;
  esPredeterminado: boolean;
  cantidadSugerida?: string;
}

export interface AppState {
  version: number;
  ultimaModificacion: string;
  mochila: {
    articulos: ArticuloMochila[];
  };
  cajaReserva: {
    articulos: ArticuloCajaReserva[];
  };
  planFamiliar: PlanFamiliar;
}

export interface DetalleCategoria {
  categoriaId: CategoriaId;
  nombre: string;
  total: number;
  completados: number;
  porcentaje: number;
}

export interface MetricaProgreso {
  porcentajeTotal: number; // [0, 100]
  totalArticulos: number;
  articulosCompletados: number;
  desglose: Record<CategoriaId, DetalleCategoria>;
}
