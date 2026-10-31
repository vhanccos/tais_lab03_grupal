import React, { useMemo, useState } from 'react';
import { RotateCcw, PlusCircle } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { CategoriaAccordion } from './CategoriaAccordion';
import { FormArticuloMochila } from './FormArticuloMochila';
import { ArticuloMochila, CategoriaId } from '../../storage/stateTypes';
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
  const {
    articulos,
    progress,
    toggleItem,
    addItem,
    updateItem,
    deleteItem,
    resetToDefault
  } = useMochila();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState<ArticuloMochila | null>(null);

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

  const handleOpenAdd = () => {
    setArticuloEditando(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (articulo: ArticuloMochila) => {
    setArticuloEditando(articulo);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: { nombre: string; categoriaId: CategoriaId; cantidadRecomendada?: string }) => {
    if (articuloEditando) {
      return updateItem(articuloEditando.id, data);
    }
    return addItem(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Mochila para Emergencias</h2>
          <p className="text-xs text-slate-500">
            Artículos esenciales para sobrevivir las primeras 24 a 48 horas (Máx. 8 kg - Norma INDECI).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
            data-testid="btn-abrir-form-articulo"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Artículo</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar todas las casillas de la mochila?')) {
                resetToDefault();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
            title="Restablecer casillas desmarcadas"
            data-testid="reset-mochila-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
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
            onEditItem={handleOpenEdit}
            onDeleteItem={deleteItem}
            defaultOpen={index === 0}
          />
        ))}
      </div>

      <FormArticuloMochila
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        articuloEditando={articuloEditando}
      />
    </div>
  );
};
