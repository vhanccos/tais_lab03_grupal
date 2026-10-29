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

export interface PlanFamiliar {
  puntoEncuentroInterno: string;
  puntoEncuentroExterno: string;
  numeroFamiliarClave: string; // 9 dígitos
  integrantes: IntegranteFamiliar[];
  fechaActualizacion: string;
}

export interface AppState {
  version: number;
  ultimaModificacion: string;
  mochila: {
    articulos: ArticuloMochila[];
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
