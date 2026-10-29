import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { CategoriaAccordion } from './CategoriaAccordion';
import { CategoriaId } from '../../storage/stateTypes';
import { useMochila } from '../../hooks/useMochila';

const CATEGORIAS_ORDEN: CategoriaId[] = [
  'primeros_auxilios',
  'alimentos',
  'agua',
  'herramientas',
  'abrigo',
  'documentos'
];

export const ChecklistMochila: React.FC = () => {
  const { articulos, progress, toggleItem, resetToDefault } = useMochila();

  const articulosPorCategoria = useMemo(() => {
    const map: Record<CategoriaId, typeof articulos> = {
      primeros_auxilios: [],
      alimentos: [],
      agua: [],
      herramientas: [],
      abrigo: [],
      documentos: []
    };
    for (const art of articulos) {
      if (map[art.categoriaId]) {
        map[art.categoriaId].push(art);
      }
    }
    return map;
  }, [articulos]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Mochila de Emergencia</h2>
          <p className="text-xs text-slate-500">
            Artículos esenciales para sobrevivir las primeras 48 a 72 horas (Norma INDECI).
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('¿Deseas reiniciar todas las casillas de la mochila?')) {
              resetToDefault();
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          title="Restablecer casillas desmarcadas"
          data-testid="reset-mochila-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>

      <ProgressBar
        porcentaje={progress.porcentajeTotal}
        totalArticulos={progress.totalArticulos}
        articulosCompletados={progress.articulosCompletados}
      />

      <div className="space-y-3">
        {CATEGORIAS_ORDEN.map((catId, index) => (
          <CategoriaAccordion
            key={catId}
            detalle={progress.desglose[catId]}
            articulos={articulosPorCategoria[catId] || []}
            onToggleItem={toggleItem}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
};
