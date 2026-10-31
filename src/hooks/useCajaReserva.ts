import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArticuloCajaReserva, CategoriaCajaId } from '../storage/stateTypes';
import { StorageAdapter } from '../storage/storageAdapter';
import { DEFAULT_ARTICULOS_CAJA_RESERVA } from '../core/defaultCajaReserva';

const storage = new StorageAdapter();

export function useCajaReserva() {
  const [articulos, setArticulos] = useState<ArticuloCajaReserva[]>(() => {
    const state = storage.loadState();
    return state.cajaReserva?.articulos || DEFAULT_ARTICULOS_CAJA_RESERVA;
  });

  const progreso = useMemo(() => {
    const total = articulos.length;
    const completados = articulos.filter(a => a.completado).length;
    const porcentajeTotal = total === 0 ? 0 : Math.round((completados / total) * 100);
    return {
      porcentajeTotal: Math.min(100, Math.max(0, porcentajeTotal)),
      total,
      completados
    };
  }, [articulos]);

  const toggleItem = useCallback((id: string) => {
    const currentState = storage.loadState();
    const currentArticulos = currentState.cajaReserva?.articulos || DEFAULT_ARTICULOS_CAJA_RESERVA;
    const updated = currentArticulos.map(item =>
      item.id === id ? { ...item, completado: !item.completado } : item
    );
    currentState.cajaReserva = { articulos: updated };
    storage.saveState(currentState);
    setArticulos(updated);
  }, []);

  const addItem = useCallback((item: { nombre: string; categoriaId: CategoriaCajaId; cantidadSugerida?: string }) => {
    const trimmed = item.nombre?.trim();
    if (!trimmed) {
      return { success: false, error: 'El nombre del artículo es obligatorio.' };
    }
    const nuevo: ArticuloCajaReserva = {
      id: `cr-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nombre: trimmed,
      categoriaId: item.categoriaId,
      completado: false,
      esPredeterminado: false,
      cantidadSugerida: item.cantidadSugerida?.trim() || undefined
    };

    const currentState = storage.loadState();
    const currentArticulos = currentState.cajaReserva?.articulos || DEFAULT_ARTICULOS_CAJA_RESERVA;
    const updated = [...currentArticulos, nuevo];
    currentState.cajaReserva = { articulos: updated };
    storage.saveState(currentState);
    setArticulos(updated);

    return { success: true, item: nuevo };
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<{ nombre: string; categoriaId: CategoriaCajaId; cantidadSugerida?: string }>) => {
    if (updates.nombre !== undefined && !updates.nombre.trim()) {
      return { success: false, error: 'El nombre no puede estar vacío.' };
    }

    const currentState = storage.loadState();
    const currentArticulos = currentState.cajaReserva?.articulos || DEFAULT_ARTICULOS_CAJA_RESERVA;
    let found = false;
    const updated = currentArticulos.map(item => {
      if (item.id === id) {
        found = true;
        return {
          ...item,
          ...(updates.nombre !== undefined ? { nombre: updates.nombre.trim() } : {}),
          ...(updates.categoriaId !== undefined ? { categoriaId: updates.categoriaId } : {}),
          ...(updates.cantidadSugerida !== undefined ? { cantidadSugerida: updates.cantidadSugerida.trim() || undefined } : {})
        };
      }
      return item;
    });

    if (!found) {
      return { success: false, error: 'Artículo no encontrado.' };
    }

    currentState.cajaReserva = { articulos: updated };
    storage.saveState(currentState);
    setArticulos(updated);

    return { success: true };
  }, []);

  const deleteItem = useCallback((id: string) => {
    const currentState = storage.loadState();
    const currentArticulos = currentState.cajaReserva?.articulos || DEFAULT_ARTICULOS_CAJA_RESERVA;
    const exists = currentArticulos.some(item => item.id === id);
    if (!exists) {
      return { success: false, error: 'Artículo no encontrado' };
    }
    const updated = currentArticulos.filter(item => item.id !== id);
    currentState.cajaReserva = { articulos: updated };
    storage.saveState(currentState);
    setArticulos(updated);

    return { success: true };
  }, []);

  const resetToDefault = useCallback(() => {
    const clean = JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_CAJA_RESERVA)).map(
      (item: ArticuloCajaReserva) => ({ ...item, completado: false })
    );
    const currentState = storage.loadState();
    currentState.cajaReserva = { articulos: clean };
    storage.saveState(currentState);
    setArticulos(clean);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const state = storage.loadState();
      if (state.cajaReserva?.articulos) {
        setArticulos(state.cajaReserva.articulos);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    articulos,
    progreso,
    toggleItem,
    addItem,
    updateItem,
    deleteItem,
    resetToDefault
  };
}
