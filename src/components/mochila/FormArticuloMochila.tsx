import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { ArticuloMochila, CategoriaId } from '../../storage/stateTypes';
import { CATEGORIAS_INFO } from '../../core/defaultCatalog';

interface FormArticuloMochilaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre: string; categoriaId: CategoriaId; cantidadRecomendada?: string }) => { success: boolean; error?: string };
  articuloEditando?: ArticuloMochila | null;
}

const CATEGORIAS_LISTA: CategoriaId[] = [
  'primeros_auxilios',
  'alimentos',
  'agua',
  'herramientas',
  'abrigo',
  'documentos'
];

export const FormArticuloMochila: React.FC<FormArticuloMochilaProps> = ({
  isOpen,
  onClose,
  onSubmit,
  articuloEditando
}) => {
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState<CategoriaId>('primeros_auxilios');
  const [cantidadRecomendada, setCantidadRecomendada] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articuloEditando) {
      setNombre(articuloEditando.nombre);
      setCategoriaId(articuloEditando.categoriaId);
      setCantidadRecomendada(articuloEditando.cantidadRecomendada || '');
    } else {
      setNombre('');
      setCategoriaId('primeros_auxilios');
      setCantidadRecomendada('');
    }
    setError(null);
  }, [articuloEditando, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = onSubmit({
      nombre: nombre.trim(),
      categoriaId,
      cantidadRecomendada: cantidadRecomendada.trim() || undefined
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Ocurrió un error al guardar el artículo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-base">
              {articuloEditando ? 'Editar Artículo' : 'Nuevo Artículo Personalizado'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            data-testid="btn-cancelar-articulo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold"
              data-testid="form-articulo-error"
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del Artículo *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Leche especial para bebé, Insulina..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              data-testid="input-nombre-articulo"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Categoría INDECI *
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value as CategoriaId)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
              data-testid="select-categoria-articulo"
            >
              {CATEGORIAS_LISTA.map((catId) => (
                <option key={catId} value={catId}>
                  {CATEGORIAS_INFO[catId].nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cantidad sugerida / Dosis (Opcional)
            </label>
            <input
              type="text"
              value={cantidadRecomendada}
              onChange={(e) => setCantidadRecomendada(e.target.value)}
              placeholder="Ej. 1 lata, 5 frascos, 2 unidades..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              data-testid="input-cantidad-articulo"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              data-testid="btn-guardar-articulo"
            >
              <Check className="w-4 h-4" />
              <span>{articuloEditando ? 'Actualizar' : 'Agregar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
