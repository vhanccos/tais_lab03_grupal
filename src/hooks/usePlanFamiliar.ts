import { useState, useCallback, useEffect } from 'react';
import { IntegranteFamiliar, PlanFamiliar } from '../storage/stateTypes';
import { StorageAdapter } from '../storage/storageAdapter';

const storage = new StorageAdapter();

export function usePlanFamiliar() {
  const [plan, setPlan] = useState<PlanFamiliar>(() => {
    const state = storage.loadState();
    return state.planFamiliar;
  });

  const persistPlan = useCallback((updatedPlan: PlanFamiliar) => {
    setPlan(updatedPlan);
    const currentState = storage.loadState();
    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
  }, []);

  const addIntegrante = useCallback((data: Omit<IntegranteFamiliar, 'id'>) => {
    if (!data.nombreCompleto.trim()) {
      return { success: false, error: 'El nombre es requerido' };
    }
    if (!data.rolSismo.trim()) {
      return { success: false, error: 'El rol ante sismos es requerido' };
    }
    if (plan.integrantes.length >= 20) {
      return { success: false, error: 'Límite máximo de 20 integrantes alcanzado' };
    }

    const nuevoIntegrante: IntegranteFamiliar = {
      id: `fam-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nombreCompleto: data.nombreCompleto.trim(),
      rolSismo: data.rolSismo.trim(),
      notas: data.notas?.trim()
    };

    const updatedIntegrantes = [...plan.integrantes, nuevoIntegrante];
    persistPlan({
      ...plan,
      integrantes: updatedIntegrantes,
      fechaActualizacion: new Date().toISOString()
    });

    return { success: true };
  }, [plan, persistPlan]);

  const removeIntegrante = useCallback((id: string) => {
    const updatedIntegrantes = plan.integrantes.filter(m => m.id !== id);
    persistPlan({
      ...plan,
      integrantes: updatedIntegrantes,
      fechaActualizacion: new Date().toISOString()
    });
  }, [plan, persistPlan]);

  const savePuntosEncuentro = useCallback((interno: string, externo: string) => {
    persistPlan({
      ...plan,
      puntoEncuentroInterno: interno,
      puntoEncuentroExterno: externo,
      fechaActualizacion: new Date().toISOString()
    });
  }, [plan, persistPlan]);

  const saveNumeroClave = useCallback((numero: string) => {
    persistPlan({
      ...plan,
      numeroFamiliarClave: numero,
      fechaActualizacion: new Date().toISOString()
    });
  }, [plan, persistPlan]);

  // Sincronización en cambios de almacenamiento
  useEffect(() => {
    const handleStorageChange = () => {
      const state = storage.loadState();
      setPlan(state.planFamiliar);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    plan,
    addIntegrante,
    removeIntegrante,
    savePuntosEncuentro,
    saveNumeroClave
  };
}
