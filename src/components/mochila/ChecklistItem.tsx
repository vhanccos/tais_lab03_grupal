import React from 'react';
import { Check } from 'lucide-react';
import { ArticuloMochila } from '../../storage/stateTypes';

interface ChecklistItemProps {
  articulo: ArticuloMochila;
  onToggle: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ articulo, onToggle }) => {
  return (
    <label
      className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
        articulo.completado
          ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
      }`}
      data-testid={`checklist-item-${articulo.id}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
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
        <p className={`text-sm font-medium leading-snug break-words ${
          articulo.completado ? 'line-through text-slate-500' : ''
        }`}>
          {articulo.nombre}
        </p>
        {articulo.cantidadRecomendada && (
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Sugerido: {articulo.cantidadRecomendada}
          </span>
        )}
      </div>
    </label>
  );
};
