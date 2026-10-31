import React, { useState, useMemo } from 'react';
import { Package, RotateCcw, PlusCircle, Check, Pencil, Trash2, X } from 'lucide-react';
import { useCajaReserva } from '../../hooks/useCajaReserva';
import { ArticuloCajaReserva, CategoriaCajaId } from '../../storage/stateTypes';
import { CATEGORIAS_CAJA_INFO } from '../../core/defaultCajaReserva';

const CATEGORIAS_CAJA_ORDEN: CategoriaCajaId[] = [
  'agua_alimentos',
  'higiene',
  'abrigo_refugio',
  'herramientas_diversos'
];

export const CajaReservaView: React.FC = () => {
  const {
    articulos,
    progreso,
    toggleItem,
    addItem,
    updateItem,
    deleteItem,
    resetToDefault
  } = useCajaReserva();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArticuloCajaReserva | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formCategoria, setFormCategoria] = useState<CategoriaCajaId>('agua_alimentos');
  const [formCantidad, setFormCantidad] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const articulosPorCategoria = useMemo(() => {
    const map: Record<CategoriaCajaId, ArticuloCajaReserva[]> = {
      agua_alimentos: [],
      higiene: [],
      abrigo_refugio: [],
      herramientas_diversos: []
    };
    for (const art of articulos) {
      if (map[art.categoriaId]) {
        map[art.categoriaId].push(art);
      }
    }
    return map;
  }, [articulos]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNombre('');
    setFormCategoria('agua_alimentos');
    setFormCantidad('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ArticuloCajaReserva) => {
    setEditingItem(item);
    setFormNombre(item.nombre);
    setFormCategoria(item.categoriaId);
    setFormCantidad(item.cantidadSugerida || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      setFormError('El nombre del artículo es obligatorio.');
      return;
    }

    if (editingItem) {
      const res = updateItem(editingItem.id, {
        nombre: formNombre.trim(),
        categoriaId: formCategoria,
        cantidadSugerida: formCantidad.trim() || undefined
      });
      if (!res.success) {
        setFormError(res.error || 'Error al actualizar.');
        return;
      }
    } else {
      const res = addItem({
        nombre: formNombre.trim(),
        categoriaId: formCategoria,
        cantidadSugerida: formCantidad.trim() || undefined
      });
      if (!res.success) {
        setFormError(res.error || 'Error al agregar.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-slate-900">Caja de Reserva (72h+)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Combo de Supervivencia INDECI: Suministros para los días 2 a 4. Almacenar en lugar seco y protegido dentro del hogar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
            data-testid="btn-add-caja-item"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar a Caja</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas restablecer los artículos de la Caja de Reserva?')) {
                resetToDefault();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 bg-white hover:bg-amber-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors shadow-sm min-h-[44px]"
            data-testid="btn-reset-caja"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Nivel de Preparación Caja de Reserva
          </span>
          <span
            className="text-base font-black text-amber-600"
            data-testid="caja-reserva-progress"
          >
            {progreso.porcentajeTotal}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progreso.porcentajeTotal}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
          <span>{progreso.completados} de {progreso.total} artículos listos</span>
          <span>Días 2 a 4 garantizados</span>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-4">
        {CATEGORIAS_CAJA_ORDEN.map((catId) => {
          const info = CATEGORIAS_CAJA_INFO[catId];
          const items = articulosPorCategoria[catId] || [];
          const completados = items.filter(i => i.completado).length;

          return (
            <div
              key={catId}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{info.nombre}</h3>
                  <p className="text-xs text-slate-500">{info.descripcion}</p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                  {completados}/{items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic text-center">
                    No hay artículos en esta categoría.
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                        item.completado
                          ? 'bg-amber-50/50 border-amber-200 text-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                      }`}
                      data-testid={`caja-item-${item.id}`}
                    >
                      <label
                        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                        htmlFor={`chk-caja-${item.id}`}
                      >
                        <div className="relative flex items-center justify-center mt-0.5 min-w-[20px]">
                          <input
                            id={`chk-caja-${item.id}`}
                            type="checkbox"
                            checked={item.completado}
                            onChange={() => toggleItem(item.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                              item.completado
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {item.completado && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-sm font-medium leading-snug break-words ${
                                item.completado ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {item.nombre}
                            </span>
                            {!item.esPredeterminado && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">
                                Personalizado
                              </span>
                            )}
                          </div>
                          {item.cantidadSugerida && (
                            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Sugerido: {item.cantidadSugerida}
                            </span>
                          )}
                        </div>
                      </label>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Editar"
                          data-testid={`btn-edit-caja-${item.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Deseas eliminar "${item.nombre}" de la Caja de Reserva?`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Eliminar"
                          data-testid={`btn-del-caja-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Agregar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Editar Artículo de Caja' : 'Nuevo Artículo para Caja de Reserva'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Artículo *
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej. Bidón de 5L de agua purificada..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
                  data-testid="input-caja-nombre"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoría de Reserva *
                </label>
                <select
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value as CategoriaCajaId)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                  data-testid="select-caja-categoria"
                >
                  {CATEGORIAS_CAJA_ORDEN.map((catId) => (
                    <option key={catId} value={catId}>
                      {CATEGORIAS_CAJA_INFO[catId].nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cantidad sugerida / Empaque
                </label>
                <input
                  type="text"
                  value={formCantidad}
                  onChange={(e) => setFormCantidad(e.target.value)}
                  placeholder="Ej. 2 bidones, 4 latas, 1 paquete..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
                  data-testid="input-caja-cantidad"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-md transition-all"
                  data-testid="btn-guardar-caja"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Actualizar' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
