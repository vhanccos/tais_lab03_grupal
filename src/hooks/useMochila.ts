import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArticuloMochila, CategoriaId, MetricaProgreso } from '../storage/stateTypes';
import { StorageAdapter } from '../storage/storageAdapter';
import { calculatePreparationProgress } from '../core/progressCalculator';
import { DEFAULT_ARTICULOS_INDECI } from '../core/defaultCatalog';

const storage = new StorageAdapter();

export function useMochila() {
  const [articulos, setArticulos] = useState<ArticuloMochila[]>(() => {
    const state = storage.loadState();
    return state.mochila.articulos;
  });

  const progress: MetricaProgreso = useMemo(() => {
    return calculatePreparationProgress(articulos);
  }, [articulos]);

  const toggleItem = useCallback((id: string) => {
    const currentState = storage.loadState();
    const updated = currentState.mochila.articulos.map(item =>
      item.id === id ? { ...item, completado: !item.completado } : item
    );
    currentState.mochila.articulos = updated;
    storage.saveState(currentState);
    setArticulos(updated);
  }, []);

  const addItem = useCallback((item: { nombre: string; categoriaId: CategoriaId; cantidadRecomendada?: string }) => {
    const trimmedNombre = item.nombre?.trim();
    if (!trimmedNombre) {
      return { success: false, error: 'El nombre del artículo es obligatorio.' };
    }
    const nuevoArticulo: ArticuloMochila = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nombre: trimmedNombre,
      categoriaId: item.categoriaId,
      completado: false,
      esPredeterminado: false,
      cantidadRecomendada: item.cantidadRecomendada?.trim() || undefined
    };

    const currentState = storage.loadState();
    const updated = [...currentState.mochila.articulos, nuevoArticulo];
    currentState.mochila.articulos = updated;
    storage.saveState(currentState);
    setArticulos(updated);

    return { success: true, item: nuevoArticulo };
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<{ nombre: string; categoriaId: CategoriaId; cantidadRecomendada?: string; completado: boolean }>) => {
    if (updates.nombre !== undefined && !updates.nombre.trim()) {
      return { success: false, error: 'El nombre no puede estar vacío.' };
    }

    const currentState = storage.loadState();
    let found = false;
    const updated = currentState.mochila.articulos.map(item => {
      if (item.id === id) {
        found = true;
        return {
          ...item,
          ...(updates.nombre !== undefined ? { nombre: updates.nombre.trim() } : {}),
          ...(updates.categoriaId !== undefined ? { categoriaId: updates.categoriaId } : {}),
          ...(updates.cantidadRecomendada !== undefined ? { cantidadRecomendada: updates.cantidadRecomendada.trim() || undefined } : {}),
          ...(updates.completado !== undefined ? { completado: updates.completado } : {})
        };
      }
      return item;
    });

    if (!found) {
      return { success: false, error: 'Artículo no encontrado.' };
    }

    currentState.mochila.articulos = updated;
    storage.saveState(currentState);
    setArticulos(updated);

    return { success: true };
  }, []);

  const deleteItem = useCallback((id: string) => {
    const currentState = storage.loadState();
    const exists = currentState.mochila.articulos.some(item => item.id === id);
    if (!exists) {
      return { success: false, error: 'Artículo no encontrado' };
    }
    const updated = currentState.mochila.articulos.filter(item => item.id !== id);
    currentState.mochila.articulos = updated;
    storage.saveState(currentState);
    setArticulos(updated);

    return { success: true };
  }, []);

  const resetToDefault = useCallback(() => {
    const cleanDefault: ArticuloMochila[] = JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_INDECI)).map(
      (item: ArticuloMochila) => ({ ...item, completado: false })
    );
    const currentState = storage.loadState();
    currentState.mochila.articulos = cleanDefault;
    storage.saveState(currentState);
    setArticulos(cleanDefault);
  }, []);

  // Sincronizar si cambia el storage externamente
  useEffect(() => {
    const handleStorageChange = () => {
      const state = storage.loadState();
      setArticulos(state.mochila.articulos);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    articulos,
    progress,
    toggleItem,
    addItem,
    updateItem,
    deleteItem,
    resetToDefault
  };
}
