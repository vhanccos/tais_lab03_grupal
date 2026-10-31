import React from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { ArticuloMochila } from '../../storage/stateTypes';

interface ChecklistItemProps {
  articulo: ArticuloMochila;
  onToggle: (id: string) => void;
  onEdit?: (articulo: ArticuloMochila) => void;
  onDelete?: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  articulo,
  onToggle,
  onEdit,
  onDelete
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border transition-all select-none ${
        articulo.completado
          ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
      }`}
      data-testid={`checklist-item-${articulo.id}`}
    >
      <label
        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
        htmlFor={`chk-${articulo.id}`}
      >
        <div className="relative flex items-center justify-center mt-0.5 min-w-[20px]">
          <input
            id={`chk-${articulo.id}`}
            type="checkbox"
            checked={articulo.completado}
            onChange={() => onToggle(articulo.id)}
            className="sr-only"
            aria-label={articulo.nombre}
          />
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
              articulo.completado
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {articulo.completado && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-sm font-medium leading-snug break-words ${
                articulo.completado ? 'line-through text-slate-500' : ''
              }`}
            >
              {articulo.nombre}
            </span>
            {!articulo.esPredeterminado && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">
                Personalizado
              </span>
            )}
          </div>
          {articulo.cantidadRecomendada && (
            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Sugerido: {articulo.cantidadRecomendada}
            </span>
          )}
        </div>
      </label>

      {/* Acciones de edición y eliminación */}
      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(articulo);
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Editar artículo"
            data-testid={`btn-editar-articulo-${articulo.id}`}
            aria-label={`Editar ${articulo.nombre}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`¿Deseas eliminar "${articulo.nombre}"?`)) {
                onDelete(articulo.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Eliminar artículo"
            data-testid={`btn-eliminar-articulo-${articulo.id}`}
            aria-label={`Eliminar ${articulo.nombre}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
