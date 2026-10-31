import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PackageCheck } from 'lucide-react';
import { ArticuloMochila, DetalleCategoria } from '../../storage/stateTypes';
import { ChecklistItem } from './ChecklistItem';

interface CategoriaAccordionProps {
  detalle: DetalleCategoria;
  articulos: ArticuloMochila[];
  onToggleItem: (id: string) => void;
  onEditItem?: (articulo: ArticuloMochila) => void;
  onDeleteItem?: (id: string) => void;
  defaultOpen?: boolean;
}

export const CategoriaAccordion: React.FC<CategoriaAccordionProps> = ({
  detalle,
  articulos,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isComplete = detalle.total > 0 && detalle.completados === detalle.total;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        data-testid={`category-accordion-btn-${detalle.categoriaId}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{detalle.nombre}</h3>
            <span className="text-xs text-slate-500 font-medium">
              {detalle.completados} de {detalle.total} ítems ({detalle.porcentaje}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isComplete
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {detalle.porcentaje}%
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-2.5">
          {articulos.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center italic">
              No hay artículos en esta categoría.
            </p>
          ) : (
            articulos.map((art) => (
              <ChecklistItem
                key={art.id}
                articulo={art}
                onToggle={onToggleItem}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
