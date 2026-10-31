import React, { useState } from 'react';
import { MapPin, Home, Check, PlusCircle, Pencil, Trash2, X, Navigation } from 'lucide-react';
import { PuntoEncuentro } from '../../storage/stateTypes';

interface ZonasSegurasProps {
  puntoInterno: string;
  puntoExterno: string;
  onSave: (interno: string, externo: string) => void;
  puntosEncuentro?: PuntoEncuentro[];
  onAddPunto?: (data: Omit<PuntoEncuentro, 'id'>) => { success: boolean; error?: string };
  onUpdatePunto?: (id: string, data: Partial<Omit<PuntoEncuentro, 'id'>>) => { success: boolean; error?: string };
  onDeletePunto?: (id: string) => { success: boolean };
}

export const ZonasSeguras: React.FC<ZonasSegurasProps> = ({
  puntoInterno,
  puntoExterno,
  onSave,
  puntosEncuentro = [],
  onAddPunto,
  onUpdatePunto,
  onDeletePunto
}) => {
  const [interno, setInterno] = useState(puntoInterno);
  const [externo, setExterno] = useState(puntoExterno);
  const [guardado, setGuardado] = useState(false);

  // Modal para agregar o editar PuntoEncuentro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPunto, setEditingPunto] = useState<PuntoEncuentro | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formTipo, setFormTipo] = useState<'interno' | 'externo' | 'comunitario' | 'seguro'>('externo');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleInternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInterno(val);
    onSave(val.trim(), externo.trim());
  };

  const handleExternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setExterno(val);
    onSave(interno.trim(), val.trim());
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(interno.trim(), externo.trim());
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const handleOpenAdd = () => {
    setEditingPunto(null);
    setFormNombre('');
    setFormTipo('externo');
    setFormDescripcion('');
    setFormLat('');
    setFormLng('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pto: PuntoEncuentro) => {
    setEditingPunto(pto);
    setFormNombre(pto.nombre);
    setFormTipo(pto.tipo);
    setFormDescripcion(pto.descripcion);
    setFormLat(pto.coordenadas?.lat !== undefined ? pto.coordenadas.lat.toString() : '');
    setFormLng(pto.coordenadas?.lng !== undefined ? pto.coordenadas.lng.toString() : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      setFormError('El nombre del punto es obligatorio.');
      return;
    }
    if (!formDescripcion.trim()) {
      setFormError('La descripción es obligatoria.');
      return;
    }

    let coords = undefined;
    if (formLat.trim() && formLng.trim()) {
      const latNum = parseFloat(formLat);
      const lngNum = parseFloat(formLng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        coords = { lat: latNum, lng: lngNum };
      }
    }

    if (editingPunto && onUpdatePunto) {
      const res = onUpdatePunto(editingPunto.id, {
        nombre: formNombre.trim(),
        tipo: formTipo,
        descripcion: formDescripcion.trim(),
        coordenadas: coords
      });
      if (!res.success) {
        setFormError(res.error || 'Error al actualizar');
        return;
      }
    } else if (onAddPunto) {
      const res = onAddPunto({
        nombre: formNombre.trim(),
        tipo: formTipo,
        descripcion: formDescripcion.trim(),
        coordenadas: coords
      });
      if (!res.success) {
        setFormError(res.error || 'Error al agregar');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'interno':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'externo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'comunitario':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'seguro':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <span>Puntos de Encuentro Seguro (INDECI)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define los puntos de reunión internos y externos con coordenadas para el mapa de evacuación.
          </p>
        </div>

        {onAddPunto && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black px-3.5 py-2 rounded-lg transition-colors min-h-[44px]"
            data-testid="btn-add-punto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Punto</span>
          </button>
        )}
      </div>

      {/* Formulario rápido para compatibilidad con versión 1 */}
      <form onSubmit={handleGuardar} className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Punto de Encuentro Interno (Zona Segura en Casa)</span>
          </label>
          <input
            type="text"
            value={interno}
            onChange={handleInternoChange}
            placeholder="Ej. Columna estructural en el pasadizo central"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
            maxLength={120}
            data-testid="input-punto-interno"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Punto de Encuentro Externo (Punto de Reunión Comunitario)</span>
          </label>
          <input
            type="text"
            value={externo}
            onChange={handleExternoChange}
            placeholder="Ej. Parque central del vecindario, zona sin cables ni postes"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
            maxLength={120}
            data-testid="input-punto-externo"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
          data-testid="btn-guardar-zonas"
        >
          {guardado ? <Check className="w-4 h-4 text-emerald-400" /> : <MapPin className="w-4 h-4" />}
          <span>{guardado ? 'Zonas Guardadas' : 'Guardar Zonas Rápidas'}</span>
        </button>
      </form>

      {/* Colección estructurada de Puntos de Encuentro */}
      {puntosEncuentro.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
            Puntos y Zonas Seguras Estructuradas ({puntosEncuentro.length})
          </h4>

          <div className="space-y-2.5">
            {puntosEncuentro.map((pto) => (
              <div
                key={pto.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                data-testid={`punto-encuentro-item-${pto.id}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{pto.nombre}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getTipoBadge(
                        pto.tipo
                      )}`}
                    >
                      {pto.tipo}
                    </span>
                    {pto.coordenadas && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                        <Navigation className="w-3 h-3 text-slate-400" />
                        {pto.coordenadas.lat.toFixed(4)}, {pto.coordenadas.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 break-words">{pto.descripcion}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  {onUpdatePunto && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(pto)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Editar punto"
                      data-testid={`btn-edit-punto-${pto.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  {onDeletePunto && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Deseas eliminar el punto "${pto.nombre}"?`)) {
                          onDeletePunto(pto.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Eliminar punto"
                      data-testid={`btn-delete-punto-${pto.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar PuntoEncuentro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPunto ? 'Editar Punto de Encuentro' : 'Nuevo Punto de Encuentro Seguro'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Punto / Zona *
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej. Círculo de Seguridad Plaza Central..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-sm"
                  data-testid="input-punto-nombre"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Punto *
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as 'interno' | 'externo' | 'comunitario' | 'seguro')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-sm bg-white"
                  data-testid="select-punto-tipo"
                >
                  <option value="interno">Interno (En el hogar o edificio)</option>
                  <option value="externo">Externo (Círculo de seguridad, parque)</option>
                  <option value="comunitario">Comunitario (Punto de reunión barrial)</option>
                  <option value="seguro">Zona Segura Amplia (Estadio, albergue)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descripción / Instrucciones de Acceso *
                </label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Ej. Círculo verde de 4.5m pintado en la losa deportiva central..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-sm"
                  data-testid="input-punto-descripcion"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Latitud (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="-12.0463"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-sm"
                    data-testid="input-punto-lat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Longitud (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="-77.0427"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-sm"
                    data-testid="input-punto-lng"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-md transition-all min-h-[44px]"
                  data-testid="btn-guardar-punto-modal"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPunto ? 'Actualizar' : 'Guardar Punto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
