import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculatePreparationProgress } from '../../src/core/progressCalculator';
import { ArticuloMochila, CategoriaId } from '../../src/storage/stateTypes';

const CATEGORIAS_VALIDAS: CategoriaId[] = [
  'primeros_auxilios',
  'alimentos',
  'agua',
  'herramientas',
  'abrigo',
  'documentos'
];

describe('Property-Based Testing: Invariantes de Progreso de Mochila', () => {
  it('Propiedad 1: Para cualquier lista arbitraria de N artículos con cualquier estado booleano, el progreso total y por categoría está siempre rígidamente acotado en [0, 100] y nunca es NaN', () => {
    const articuloArbitrary = fc.record<ArticuloMochila>({
      id: fc.uuid(),
      nombre: fc.string({ minLength: 1, maxLength: 50 }),
      categoriaId: fc.constantFrom(...CATEGORIAS_VALIDAS),
      completado: fc.boolean(),
      cantidadRecomendada: fc.string(),
      esPredeterminado: fc.boolean()
    });

    fc.assert(
      fc.property(fc.array(articuloArbitrary, { minLength: 0, maxLength: 500 }), (articulos) => {
        const metric = calculatePreparationProgress(articulos);

        // Invariante 1: Progreso total en [0, 100]
        expect(metric.porcentajeTotal).toBeGreaterThanOrEqual(0);
        expect(metric.porcentajeTotal).toBeLessThanOrEqual(100);
        expect(Number.isNaN(metric.porcentajeTotal)).toBe(false);
        expect(Number.isFinite(metric.porcentajeTotal)).toBe(true);

        // Invariante 2: Si el total de artículos es 0, el porcentaje debe ser exactamente 0%
        if (articulos.length === 0) {
          expect(metric.porcentajeTotal).toBe(0);
          expect(metric.totalArticulos).toBe(0);
          expect(metric.articulosCompletados).toBe(0);
        }

        // Invariante 3: Si todos los artículos están completados (y N > 0), el porcentaje debe ser 100%
        if (articulos.length > 0 && articulos.every((a) => a.completado)) {
          expect(metric.porcentajeTotal).toBe(100);
        }

        // Invariante 4: Si ningún artículo está completado, el porcentaje debe ser 0%
        if (articulos.every((a) => !a.completado)) {
          expect(metric.porcentajeTotal).toBe(0);
        }

        // Invariante 5: Para cada una de las 6 categorías, el desglose también cumple los límites
        for (const catId of CATEGORIAS_VALIDAS) {
          const cat = metric.desglose[catId];
          expect(cat).toBeDefined();
          expect(cat.porcentaje).toBeGreaterThanOrEqual(0);
          expect(cat.porcentaje).toBeLessThanOrEqual(100);
          expect(Number.isNaN(cat.porcentaje)).toBe(false);

          if (cat.total === 0) {
            expect(cat.porcentaje).toBe(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
