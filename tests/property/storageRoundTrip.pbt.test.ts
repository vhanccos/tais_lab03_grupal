import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageAdapter } from '../../src/storage/storageAdapter';
import { AppState, ArticuloMochila, CategoriaId, IntegranteFamiliar } from '../../src/storage/stateTypes';

const CATEGORIAS_VALIDAS: CategoriaId[] = [
  'primeros_auxilios',
  'alimentos',
  'agua',
  'herramientas',
  'abrigo',
  'documentos'
];

describe('Property-Based Testing: Round-Trip de Persistencia Local', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new StorageAdapter();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Propiedad 2: Round-Trip de serialización y deserialización conserva la integridad de cualquier AppState válido', () => {
    const articuloArbitrary = fc.record<ArticuloMochila>({
      id: fc.uuid(),
      nombre: fc.string({ minLength: 1, maxLength: 40 }),
      categoriaId: fc.constantFrom(...CATEGORIAS_VALIDAS),
      completado: fc.boolean(),
      cantidadRecomendada: fc.string({ maxLength: 20 }),
      esPredeterminado: fc.boolean()
    });

    const integranteArbitrary = fc.record<IntegranteFamiliar>({
      id: fc.uuid(),
      nombreCompleto: fc.string({ minLength: 1, maxLength: 60 }),
      rolSismo: fc.string({ minLength: 1, maxLength: 80 }),
      notas: fc.option(fc.string({ maxLength: 100 }), { nil: undefined })
    });

    const appStateArbitrary = fc.record<AppState>({
      version: fc.constant(1),
      ultimaModificacion: fc.constant(new Date().toISOString()),
      mochila: fc.record({
        articulos: fc.array(articuloArbitrary, { minLength: 0, maxLength: 50 })
      }),
      planFamiliar: fc.record({
        puntoEncuentroInterno: fc.string({ maxLength: 100 }),
        puntoEncuentroExterno: fc.string({ maxLength: 100 }),
        numeroFamiliarClave: fc.stringMatching(/^(9\d{8}|)$/),
        integrantes: fc.array(integranteArbitrary, { minLength: 0, maxLength: 20 }),
        fechaActualizacion: fc.constant(new Date().toISOString())
      })
    });

    fc.assert(
      fc.property(appStateArbitrary, (originalState) => {
        // Guardar estado
        const saved = adapter.saveState(originalState);
        expect(saved).toBe(true);

        // Recuperar estado desde localStorage
        const loadedState = adapter.loadState();

        // Comprobación de integridad estructural
        expect(loadedState.version).toBe(originalState.version);
        expect(loadedState.mochila.articulos.length).toBe(originalState.mochila.articulos.length);
        expect(loadedState.planFamiliar.integrantes.length).toBe(originalState.planFamiliar.integrantes.length);
        expect(loadedState.planFamiliar.puntoEncuentroInterno).toBe(originalState.planFamiliar.puntoEncuentroInterno);
        expect(loadedState.planFamiliar.puntoEncuentroExterno).toBe(originalState.planFamiliar.puntoEncuentroExterno);
        expect(loadedState.planFamiliar.numeroFamiliarClave).toBe(originalState.planFamiliar.numeroFamiliarClave);

        // Comprobación ítem por ítem de la mochila
        for (let i = 0; i < originalState.mochila.articulos.length; i++) {
          expect(loadedState.mochila.articulos[i].id).toBe(originalState.mochila.articulos[i].id);
          expect(loadedState.mochila.articulos[i].completado).toBe(originalState.mochila.articulos[i].completado);
        }
      }),
      { numRuns: 100 }
    );
  });
});
