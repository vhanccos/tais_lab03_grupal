import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HuaicosState,
  NivelAlertaHuaico,
  TipoSenalTemprana,
  PlanEvacuacionHuaico,
  MetricaProgresoHuaico,
  calcularProgresoHuaicos,
  createDefaultHuaicosState
} from '../core/huaicosDomain';

export const HUAICOS_STORAGE_KEY = 'sismolisto_huaicos_state_v1';

// Copia en memoria para resiliencia ante fallos de cuota o entornos sin localStorage
let inMemoryFallback: HuaicosState | null = null;
let hasLocalStorageFailed = false;

function loadHuaicosFromStorage(): HuaicosState {
  try {
    if (hasLocalStorageFailed && inMemoryFallback) {
      return inMemoryFallback;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(HUAICOS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<HuaicosState>;
        if (
          parsed &&
          Array.isArray(parsed.articulos) &&
          Array.isArray(parsed.senalesTempranas) &&
          parsed.planEvacuacion &&
          parsed.nivelAlertaActual
        ) {
          const defaultPlan = createDefaultHuaicosState().planEvacuacion;
          parsed.planEvacuacion = {
            ...defaultPlan,
            ...parsed.planEvacuacion,
            puntoEncuentroCotaAlta: parsed.planEvacuacion.puntoEncuentroCotaAlta ?? '',
            descripcionRutaPerpendicular: parsed.planEvacuacion.descripcionRutaPerpendicular ?? '',
            contactoReferenciaNombre: parsed.planEvacuacion.contactoReferenciaNombre ?? '',
            contactoReferenciaTelefono: parsed.planEvacuacion.contactoReferenciaTelefono ?? '',
            viviendaEnRiesgoAbanico: Boolean(parsed.planEvacuacion.viviendaEnRiesgoAbanico)
          };
          if (!parsed.version || typeof parsed.version !== 'number') {
            parsed.version = 1;
          }
          inMemoryFallback = parsed as HuaicosState;
          return parsed as HuaicosState;
        }
      }
    }

    if (inMemoryFallback) {
      return inMemoryFallback;
    }

    const defaultState = createDefaultHuaicosState();
    saveHuaicosToStorage(defaultState);
    return defaultState;
  } catch (error) {
    console.warn('Error al deserializar estado de huaicos. Aplicando auto-recuperación.', error);
    const fallback = createDefaultHuaicosState();
    inMemoryFallback = fallback;
    return fallback;
  }
}

export function _resetHuaicosMemoryFallbackForTesting(): void {
  inMemoryFallback = null;
  hasLocalStorageFailed = false;
}

function saveHuaicosToStorage(state: HuaicosState): boolean {
  state.ultimaModificacion = new Date().toISOString();
  inMemoryFallback = state;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(HUAICOS_STORAGE_KEY, JSON.stringify(state));
      hasLocalStorageFailed = false;
      return true;
    }
    return true;
  } catch (error) {
    hasLocalStorageFailed = true;
    console.error('Fallo al escribir estado de huaicos en localStorage. Manteniendo copia en memoria.', error);
    return false;
  }
}

export interface UseHuaicosReturn {
  state: HuaicosState;
  metricas: MetricaProgresoHuaico;
  toggleItem: (id: string) => void;
  toggleSenal: (id: TipoSenalTemprana) => void;
  setNivelAlerta: (nivel: NivelAlertaHuaico) => void;
  savePlanEvacuacion: (updates: Partial<PlanEvacuacionHuaico>) => void;
  resetToDefault: () => void;
}

export function useHuaicos(): UseHuaicosReturn {
  const [state, setState] = useState<HuaicosState>(() => loadHuaicosFromStorage());

  // Sincronizar estado entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HUAICOS_STORAGE_KEY && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue) as HuaicosState;
          if (fresh && Array.isArray(fresh.articulos)) {
            const defaultPlan = createDefaultHuaicosState().planEvacuacion;
            fresh.planEvacuacion = {
              ...defaultPlan,
              ...(fresh.planEvacuacion || {}),
              puntoEncuentroCotaAlta: fresh.planEvacuacion?.puntoEncuentroCotaAlta ?? '',
              descripcionRutaPerpendicular: fresh.planEvacuacion?.descripcionRutaPerpendicular ?? '',
              contactoReferenciaNombre: fresh.planEvacuacion?.contactoReferenciaNombre ?? '',
              contactoReferenciaTelefono: fresh.planEvacuacion?.contactoReferenciaTelefono ?? '',
              viviendaEnRiesgoAbanico: Boolean(fresh.planEvacuacion?.viviendaEnRiesgoAbanico)
            };
            setState(fresh);
            inMemoryFallback = fresh;
          }
        } catch (err) {
          console.warn('Fallo al sincronizar evento de almacenamiento de huaicos:', err);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  const persistState = useCallback((updater: (prev: HuaicosState) => HuaicosState) => {
    setState(prev => {
      const next = updater(prev);
      saveHuaicosToStorage(next);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    persistState(prev => ({
      ...prev,
      articulos: prev.articulos.map(item =>
        item.id === id ? { ...item, completado: !item.completado } : item
      )
    }));
  }, [persistState]);

  const toggleSenal = useCallback((id: TipoSenalTemprana) => {
    persistState(prev => ({
      ...prev,
      senalesTempranas: prev.senalesTempranas.map(senal =>
        senal.id === id ? { ...senal, reconocida: !senal.reconocida } : senal
      )
    }));
  }, [persistState]);

  const setNivelAlerta = useCallback((nivel: NivelAlertaHuaico) => {
    persistState(prev => ({
      ...prev,
      nivelAlertaActual: nivel
    }));
  }, [persistState]);

  const savePlanEvacuacion = useCallback((updates: Partial<PlanEvacuacionHuaico>) => {
    persistState(prev => ({
      ...prev,
      planEvacuacion: {
        ...prev.planEvacuacion,
        ...updates,
        fechaActualizacion: new Date().toISOString()
      }
    }));
  }, [persistState]);

  const resetToDefault = useCallback(() => {
    const fresh = createDefaultHuaicosState();
    persistState(() => fresh);
  }, [persistState]);

  const metricas = useMemo(() => {
    return calcularProgresoHuaicos(state.articulos);
  }, [state.articulos]);

  return {
    state,
    metricas,
    toggleItem,
    toggleSenal,
    setNivelAlerta,
    savePlanEvacuacion,
    resetToDefault
  };
}
