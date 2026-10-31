import { AppState, PuntoEncuentro } from './stateTypes';
import { DEFAULT_ARTICULOS_INDECI } from '../core/defaultCatalog';
import { DEFAULT_ARTICULOS_CAJA_RESERVA } from '../core/defaultCajaReserva';
import { DEFAULT_PUNTOS_ENCUENTRO } from '../core/defaultMeetingPoints';

export const STORAGE_KEY = 'sismolisto_app_state_v1';

export function createDefaultState(): AppState {
  return {
    version: 1,
    ultimaModificacion: new Date().toISOString(),
    mochila: {
      articulos: JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_INDECI))
    },
    cajaReserva: {
      articulos: JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_CAJA_RESERVA))
    },
    planFamiliar: {
      puntoEncuentroInterno: '',
      puntoEncuentroExterno: '',
      puntosEncuentro: JSON.parse(JSON.stringify(DEFAULT_PUNTOS_ENCUENTRO)),
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
          if (parsed && typeof parsed === 'object') {
            const isCorruptOrMissingVersion = !parsed.version || typeof parsed.version !== 'number';
            if (isCorruptOrMissingVersion) {
              parsed.version = 1;
            }

            // Normalización defensiva de mochila y articulos
            if (!parsed.mochila || typeof parsed.mochila !== 'object' || !Array.isArray(parsed.mochila.articulos)) {
              parsed.mochila = {
                articulos: JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_INDECI))
              };
            } else if (isCorruptOrMissingVersion && parsed.mochila.articulos.length === 0) {
              parsed.mochila.articulos = JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_INDECI));
            }

            // Normalización defensiva de cajaReserva y articulos
            if (!parsed.cajaReserva || typeof parsed.cajaReserva !== 'object' || !Array.isArray(parsed.cajaReserva.articulos)) {
              parsed.cajaReserva = {
                articulos: JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_CAJA_RESERVA))
              };
            }

            // Normalización defensiva de planFamiliar
            if (!parsed.planFamiliar || typeof parsed.planFamiliar !== 'object') {
              parsed.planFamiliar = createDefaultState().planFamiliar;
            } else {
              if (!Array.isArray(parsed.planFamiliar.integrantes)) {
                parsed.planFamiliar.integrantes = [];
              }
              if (typeof parsed.planFamiliar.numeroFamiliarClave !== 'string') {
                parsed.planFamiliar.numeroFamiliarClave = '';
              }
              if (typeof parsed.planFamiliar.puntoEncuentroInterno !== 'string') {
                parsed.planFamiliar.puntoEncuentroInterno = '';
              }
              if (typeof parsed.planFamiliar.puntoEncuentroExterno !== 'string') {
                parsed.planFamiliar.puntoEncuentroExterno = '';
              }
              if (typeof parsed.planFamiliar.fechaActualizacion !== 'string') {
                parsed.planFamiliar.fechaActualizacion = new Date().toISOString();
              }

              // Normalización defensiva hacia colección estructurada de Puntos de Encuentro
              if (!Array.isArray(parsed.planFamiliar.puntosEncuentro)) {
                const defaultPuntos: PuntoEncuentro[] = JSON.parse(JSON.stringify(DEFAULT_PUNTOS_ENCUENTRO));
                if (parsed.planFamiliar.puntoEncuentroInterno) {
                  const interno = defaultPuntos.find(p => p.tipo === 'interno');
                  if (interno) interno.descripcion = parsed.planFamiliar.puntoEncuentroInterno;
                }
                if (parsed.planFamiliar.puntoEncuentroExterno) {
                  const externo = defaultPuntos.find(p => p.tipo === 'externo');
                  if (externo) externo.descripcion = parsed.planFamiliar.puntoEncuentroExterno;
                }
                parsed.planFamiliar.puntosEncuentro = defaultPuntos;
              }
            }

            if (!parsed.ultimaModificacion || typeof parsed.ultimaModificacion !== 'string') {
              parsed.ultimaModificacion = new Date().toISOString();
            }

            this.inMemoryFallback = parsed as AppState;
            return parsed as AppState;
          }
        } else {
          // localStorage está vacío o fue limpiado
          this.inMemoryFallback = null;
        }
      }

      if (this.inMemoryFallback && this.hasLocalStorageFailed) {
        return this.inMemoryFallback;
      }

      const defaultState = createDefaultState();
      this.saveState(defaultState);
      return defaultState;
    } catch (error) {
      console.warn('Error al deserializar almacenamiento local. Aplicando auto-recuperación.', error);
      const fallback = (this.hasLocalStorageFailed && this.inMemoryFallback) || createDefaultState();
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
