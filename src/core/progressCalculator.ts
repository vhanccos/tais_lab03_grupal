import { ArticuloMochila, CategoriaId, DetalleCategoria, MetricaProgreso } from '../storage/stateTypes';
import { CATEGORIAS_INFO } from './defaultCatalog';

const CATEGORIAS_LISTA: CategoriaId[] = [
  'primeros_auxilios',
  'alimentos',
  'agua',
  'herramientas',
  'abrigo',
  'documentos'
];

export function calculatePreparationProgress(articulos: ArticuloMochila[]): MetricaProgreso {
  const desglose = {} as Record<CategoriaId, DetalleCategoria>;

  // Inicializar desglose para cada una de las 6 categorías
  for (const catId of CATEGORIAS_LISTA) {
    desglose[catId] = {
      categoriaId: catId,
      nombre: CATEGORIAS_INFO[catId]?.nombre || catId,
      total: 0,
      completados: 0,
      porcentaje: 0
    };
  }

  const totalArticulos = articulos.length;
  let articulosCompletados = 0;

  for (const art of articulos) {
    if (desglose[art.categoriaId]) {
      desglose[art.categoriaId].total += 1;
      if (art.completado) {
        desglose[art.categoriaId].completados += 1;
        articulosCompletados += 1;
      }
    }
  }

  // Invariante para cada categoría
  for (const catId of CATEGORIAS_LISTA) {
    const itemCat = desglose[catId];
    itemCat.porcentaje = itemCat.total === 0 
      ? 0 
      : Math.min(100, Math.max(0, Math.round((itemCat.completados / itemCat.total) * 100)));
  }

  // Invariante global: si total es 0, siempre 0%. Acotado rigurosamente en [0, 100]
  const porcentajeTotal = totalArticulos === 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((articulosCompletados / totalArticulos) * 100)));

  return {
    porcentajeTotal,
    totalArticulos,
    articulosCompletados,
    desglose
  };
}
