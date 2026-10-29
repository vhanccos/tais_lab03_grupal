import { AppState } from './stateTypes';
import { DEFAULT_ARTICULOS_INDECI } from '../core/defaultCatalog';

export const STORAGE_KEY = 'sismolisto_app_state_v1';

export function createDefaultState(): AppState {
  return {
    version: 1,
    ultimaModificacion: new Date().toISOString(),
    mochila: {
      articulos: JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_INDECI))
    },
    planFamiliar: {
      puntoEncuentroInterno: '',
      puntoEncuentroExterno: '',
      numeroFamiliarClave: '',
      integrantes: [],
      fechaActualizacion: new Date().toISOString()
    }
  };
}

export interface IStorageAdapter {
  loadState(): AppState;
  saveState(state: AppState): boolean;
  clearState(): void;
}

export class StorageAdapter implements IStorageAdapter {
  private inMemoryFallback: AppState | null = null;
  private hasLocalStorageFailed: boolean = false;

  public loadState(): AppState {
    try {
      // Si la última escritura a localStorage falló (ej. cuota excedida), priorizar copia en memoria
      if (this.hasLocalStorageFailed && this.inMemoryFallback) {
        return this.inMemoryFallback;
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          if (parsed && parsed.mochila && Array.isArray(parsed.mochila.articulos) && parsed.planFamiliar) {
            this.inMemoryFallback = parsed as AppState;
            return parsed as AppState;
          }
        }
      }

      if (this.inMemoryFallback) {
        return this.inMemoryFallback;
      }

      const defaultState = createDefaultState();
      this.saveState(defaultState);
      return defaultState;
    } catch (error) {
      console.warn('Error al deserializar almacenamiento local. Aplicando auto-recuperación.', error);
      const fallback = this.inMemoryFallback || createDefaultState();
      this.inMemoryFallback = fallback;
      return fallback;
    }
  }

  public saveState(state: AppState): boolean {
    state.ultimaModificacion = new Date().toISOString();
    this.inMemoryFallback = state;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        this.hasLocalStorageFailed = false;
        return true;
      }
      return true;
    } catch (error) {
      this.hasLocalStorageFailed = true;
      console.error('Fallo al escribir en localStorage (posible cuota excedida). Manteniendo copia en memoria.', error);
      return false;
    }
  }

  public clearState(): void {
    this.inMemoryFallback = null;
    this.hasLocalStorageFailed = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error al limpiar localStorage', e);
    }
  }
}
