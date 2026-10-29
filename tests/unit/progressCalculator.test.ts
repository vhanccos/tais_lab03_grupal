import { describe, it, expect } from 'vitest';
import { calculatePreparationProgress } from '../../src/core/progressCalculator';
import { ArticuloMochila } from '../../src/storage/stateTypes';

describe('progressCalculator (Invariantes)', () => {
  it('debe devolver 0% invariante cuando el catálogo no tiene artículos (total = 0)', () => {
    const result = calculatePreparationProgress([]);
    expect(result.porcentajeTotal).toBe(0);
    expect(result.totalArticulos).toBe(0);
    expect(result.articulosCompletados).toBe(0);
    expect(Number.isNaN(result.porcentajeTotal)).toBe(false);
  });

  it('debe devolver 0% cuando ningún artículo está marcado', () => {
    const items: ArticuloMochila[] = [
      { id: '1', categoriaId: 'agua', nombre: 'Agua', completado: false, esPredeterminado: true },
      { id: '2', categoriaId: 'alimentos', nombre: 'Atún', completado: false, esPredeterminado: true },
    ];
    const result = calculatePreparationProgress(items);
    expect(result.porcentajeTotal).toBe(0);
    expect(result.totalArticulos).toBe(2);
    expect(result.articulosCompletados).toBe(0);
  });

  it('debe calcular el porcentaje exacto y redondear a entero acotado [0, 100]', () => {
    const items: ArticuloMochila[] = [
      { id: '1', categoriaId: 'agua', nombre: 'Agua', completado: true, esPredeterminado: true },
      { id: '2', categoriaId: 'alimentos', nombre: 'Atún', completado: false, esPredeterminado: true },
      { id: '3', categoriaId: 'herramientas', nombre: 'Linterna', completado: false, esPredeterminado: true },
    ];
    // 1 / 3 = 33.333% -> 33%
    const result = calculatePreparationProgress(items);
    expect(result.porcentajeTotal).toBe(33);
    expect(result.articulosCompletados).toBe(1);
    expect(result.totalArticulos).toBe(3);
  });

  it('debe devolver 100% cuando todos los artículos están marcados', () => {
    const items: ArticuloMochila[] = [
      { id: '1', categoriaId: 'agua', nombre: 'Agua', completado: true, esPredeterminado: true },
      { id: '2', categoriaId: 'alimentos', nombre: 'Atún', completado: true, esPredeterminado: true },
    ];
    const result = calculatePreparationProgress(items);
    expect(result.porcentajeTotal).toBe(100);
    expect(result.articulosCompletados).toBe(2);
  });

  it('debe calcular correctamente el desglose para las 6 categorías INDECI', () => {
    const items: ArticuloMochila[] = [
      { id: '1', categoriaId: 'agua', nombre: 'Agua 1', completado: true, esPredeterminado: true },
      { id: '2', categoriaId: 'agua', nombre: 'Agua 2', completado: false, esPredeterminado: true },
      { id: '3', categoriaId: 'primeros_auxilios', nombre: 'Gasa', completado: true, esPredeterminado: true },
    ];
    const result = calculatePreparationProgress(items);
    expect(result.desglose.agua.total).toBe(2);
    expect(result.desglose.agua.completados).toBe(1);
    expect(result.desglose.agua.porcentaje).toBe(50);

    expect(result.desglose.primeros_auxilios.total).toBe(1);
    expect(result.desglose.primeros_auxilios.completados).toBe(1);
    expect(result.desglose.primeros_auxilios.porcentaje).toBe(100);

    // Categoría sin artículos
    expect(result.desglose.abrigo.total).toBe(0);
    expect(result.desglose.abrigo.porcentaje).toBe(0);
    expect(Number.isNaN(result.desglose.abrigo.porcentaje)).toBe(false);
  });
});
