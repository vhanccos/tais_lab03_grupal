import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageAdapter, STORAGE_KEY } from '../../src/storage/storageAdapter';
import { DEFAULT_ARTICULOS_INDECI } from '../../src/core/defaultCatalog';

describe('StorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe devolver el estado inicial con el catálogo por defecto cuando no hay datos guardados', () => {
    const adapter = new StorageAdapter();
    const state = adapter.loadState();

    expect(state.version).toBe(1);
    expect(state.mochila.articulos.length).toBe(DEFAULT_ARTICULOS_INDECI.length);
    expect(state.planFamiliar.integrantes).toEqual([]);
    expect(state.planFamiliar.numeroFamiliarClave).toBe('');
  });

  it('debe guardar y cargar correctamente el estado de la aplicación', () => {
    const adapter = new StorageAdapter();
    const state = adapter.loadState();

    state.mochila.articulos[0].completado = true;
    state.planFamiliar.puntoEncuentroInterno = 'Bajo marco de puerta este';
    state.planFamiliar.numeroFamiliarClave = '987654321';

    const saved = adapter.saveState(state);
    expect(saved).toBe(true);

    const loadedState = adapter.loadState();
    expect(loadedState.mochila.articulos[0].completado).toBe(true);
    expect(loadedState.planFamiliar.puntoEncuentroInterno).toBe('Bajo marco de puerta este');
    expect(loadedState.planFamiliar.numeroFamiliarClave).toBe('987654321');
  });

  it('debe recuperarse automáticamente restaurando los valores por defecto si el JSON está corrupto', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json corrupt: true');
    const adapter = new StorageAdapter();

    const state = adapter.loadState();
    expect(state.version).toBe(1);
    expect(state.mochila.articulos.length).toBe(DEFAULT_ARTICULOS_INDECI.length);
    expect(state.mochila.articulos.every(i => !i.completado)).toBe(true);
  });

  it('debe recuperarse y usar memoria de respaldo si localStorage arroja excepción en guardado', () => {
    const adapter = new StorageAdapter();
    const state = adapter.loadState();
    state.planFamiliar.numeroFamiliarClave = '912345678';

    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const saved = adapter.saveState(state);
    expect(saved).toBe(false);

    // Debe seguir funcionando retornando el estado en memoria
    const loaded = adapter.loadState();
    expect(loaded.planFamiliar.numeroFamiliarClave).toBe('912345678');
  });
});
