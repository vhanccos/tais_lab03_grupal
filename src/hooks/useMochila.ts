import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArticuloMochila, MetricaProgreso } from '../storage/stateTypes';
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

  // Persistir reactivamente al cambiar articulos
  const persistChanges = useCallback((updatedArticulos: ArticuloMochila[]) => {
    setArticulos(updatedArticulos);
    const currentState = storage.loadState();
    currentState.mochila.articulos = updatedArticulos;
    storage.saveState(currentState);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setArticulos(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, completado: !item.completado } : item
      );
      const currentState = storage.loadState();
      currentState.mochila.articulos = updated;
      storage.saveState(currentState);
      return updated;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    const cleanDefault: ArticuloMochila[] = JSON.parse(JSON.stringify(DEFAULT_ARTICULOS_INDECI)).map(
      (item: ArticuloMochila) => ({ ...item, completado: false })
    );
    persistChanges(cleanDefault);
  }, [persistChanges]);

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
    resetToDefault
  };
}
