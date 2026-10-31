import { useState, useCallback, useEffect } from 'react';
import { IntegranteFamiliar, PlanFamiliar, PuntoEncuentro } from '../storage/stateTypes';
import { StorageAdapter } from '../storage/storageAdapter';
import { DEFAULT_PUNTOS_ENCUENTRO } from '../core/defaultMeetingPoints';

const storage = new StorageAdapter();

export function usePlanFamiliar() {
  const [plan, setPlan] = useState<PlanFamiliar>(() => {
    const state = storage.loadState();
    return state.planFamiliar;
  });

  const addIntegrante = useCallback((data: Omit<IntegranteFamiliar, 'id'>) => {
    if (!data.nombreCompleto?.trim()) {
      return { success: false, error: 'El nombre es requerido' };
    }
    if (!data.rolSismo?.trim()) {
      return { success: false, error: 'El rol ante sismos es requerido' };
    }

    const currentState = storage.loadState();
    if (currentState.planFamiliar.integrantes.length >= 20) {
      return { success: false, error: 'Límite máximo de 20 integrantes alcanzado' };
    }

    const nuevoIntegrante: IntegranteFamiliar = {
      id: `fam-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nombreCompleto: data.nombreCompleto.trim(),
      rolSismo: data.rolSismo.trim(),
      notas: data.notas?.trim()
    };

    const updatedIntegrantes = [...currentState.planFamiliar.integrantes, nuevoIntegrante];
    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      integrantes: updatedIntegrantes,
      fechaActualizacion: new Date().toISOString()
    };

    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);

    return { success: true, item: nuevoIntegrante };
  }, []);

  const updateIntegrante = useCallback((id: string, data: Partial<Omit<IntegranteFamiliar, 'id'>>) => {
    if (data.nombreCompleto !== undefined && !data.nombreCompleto.trim()) {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }
    if (data.rolSismo !== undefined && !data.rolSismo.trim()) {
      return { success: false, error: 'El rol ante sismos no puede estar vacío' };
    }

    const currentState = storage.loadState();
    let found = false;
    const updatedIntegrantes = currentState.planFamiliar.integrantes.map(m => {
      if (m.id === id) {
        found = true;
        return {
          ...m,
          ...(data.nombreCompleto !== undefined ? { nombreCompleto: data.nombreCompleto.trim() } : {}),
          ...(data.rolSismo !== undefined ? { rolSismo: data.rolSismo.trim() } : {}),
          ...(data.notas !== undefined ? { notas: data.notas.trim() } : {})
        };
      }
      return m;
    });

    if (!found) {
      return { success: false, error: 'Integrante no encontrado' };
    }

    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      integrantes: updatedIntegrantes,
      fechaActualizacion: new Date().toISOString()
    };

    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);

    return { success: true };
  }, []);

  const removeIntegrante = useCallback((id: string) => {
    const currentState = storage.loadState();
    const updatedIntegrantes = currentState.planFamiliar.integrantes.filter(m => m.id !== id);
    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      integrantes: updatedIntegrantes,
      fechaActualizacion: new Date().toISOString()
    };
    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);
    return { success: true };
  }, []);

  // Puntos de encuentro estructurados CRUD
  const addPuntoEncuentro = useCallback((data: Omit<PuntoEncuentro, 'id'>) => {
    if (!data.nombre?.trim()) {
      return { success: false, error: 'El nombre del punto de encuentro es requerido' };
    }
    if (!data.descripcion?.trim()) {
      return { success: false, error: 'La descripción del punto es requerida' };
    }

    const currentState = storage.loadState();
    const nuevoPunto: PuntoEncuentro = {
      id: `pto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nombre: data.nombre.trim(),
      tipo: data.tipo,
      descripcion: data.descripcion.trim(),
      coordenadas: data.coordenadas,
      svgCoords: data.svgCoords,
      esPredeterminado: false
    };

    const currentPuntos = currentState.planFamiliar.puntosEncuentro || DEFAULT_PUNTOS_ENCUENTRO;
    const updatedPuntos = [...currentPuntos, nuevoPunto];

    let interno = currentState.planFamiliar.puntoEncuentroInterno;
    let externo = currentState.planFamiliar.puntoEncuentroExterno;
    if (data.tipo === 'interno' && !interno) interno = data.descripcion.trim();
    if (data.tipo === 'externo' && !externo) externo = data.descripcion.trim();

    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      puntosEncuentro: updatedPuntos,
      puntoEncuentroInterno: interno,
      puntoEncuentroExterno: externo,
      fechaActualizacion: new Date().toISOString()
    };

    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);

    return { success: true, item: nuevoPunto };
  }, []);

  const updatePuntoEncuentro = useCallback((id: string, data: Partial<Omit<PuntoEncuentro, 'id'>>) => {
    if (data.nombre !== undefined && !data.nombre.trim()) {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }
    if (data.descripcion !== undefined && !data.descripcion.trim()) {
      return { success: false, error: 'La descripción no puede estar vacía' };
    }

    const currentState = storage.loadState();
    const currentPuntos = currentState.planFamiliar.puntosEncuentro || DEFAULT_PUNTOS_ENCUENTRO;
    let found = false;

    const updatedPuntos = currentPuntos.map(p => {
      if (p.id === id) {
        found = true;
        return {
          ...p,
          ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
          ...(data.tipo !== undefined ? { tipo: data.tipo } : {}),
          ...(data.descripcion !== undefined ? { descripcion: data.descripcion.trim() } : {}),
          ...(data.coordenadas !== undefined ? { coordenadas: data.coordenadas } : {}),
          ...(data.svgCoords !== undefined ? { svgCoords: data.svgCoords } : {})
        };
      }
      return p;
    });

    if (!found) {
      return { success: false, error: 'Punto de encuentro no encontrado' };
    }

    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      puntosEncuentro: updatedPuntos,
      fechaActualizacion: new Date().toISOString()
    };

    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);

    return { success: true };
  }, []);

  const deletePuntoEncuentro = useCallback((id: string) => {
    const currentState = storage.loadState();
    const currentPuntos = currentState.planFamiliar.puntosEncuentro || DEFAULT_PUNTOS_ENCUENTRO;
    const updatedPuntos = currentPuntos.filter(p => p.id !== id);

    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      puntosEncuentro: updatedPuntos,
      fechaActualizacion: new Date().toISOString()
    };

    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);

    return { success: true };
  }, []);

  const savePuntosEncuentro = useCallback((interno: string, externo: string) => {
    const currentState = storage.loadState();
    const currentPuntos = [...(currentState.planFamiliar.puntosEncuentro || DEFAULT_PUNTOS_ENCUENTRO)];
    const idxInt = currentPuntos.findIndex(p => p.tipo === 'interno');
    if (idxInt >= 0) {
      currentPuntos[idxInt] = { ...currentPuntos[idxInt], descripcion: interno };
    }
    const idxExt = currentPuntos.findIndex(p => p.tipo === 'externo');
    if (idxExt >= 0) {
      currentPuntos[idxExt] = { ...currentPuntos[idxExt], descripcion: externo };
    }

    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      puntoEncuentroInterno: interno,
      puntoEncuentroExterno: externo,
      puntosEncuentro: currentPuntos,
      fechaActualizacion: new Date().toISOString()
    };

    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);
  }, []);

  const saveNumeroClave = useCallback((numero: string) => {
    const currentState = storage.loadState();
    const updatedPlan: PlanFamiliar = {
      ...currentState.planFamiliar,
      numeroFamiliarClave: numero,
      fechaActualizacion: new Date().toISOString()
    };
    currentState.planFamiliar = updatedPlan;
    storage.saveState(currentState);
    setPlan(updatedPlan);
  }, []);

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
    updateIntegrante,
    removeIntegrante,
    addPuntoEncuentro,
    updatePuntoEncuentro,
    deletePuntoEncuentro,
    savePuntosEncuentro,
    saveNumeroClave
  };
}
