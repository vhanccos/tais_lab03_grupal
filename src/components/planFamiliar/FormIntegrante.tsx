import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, Check, X } from 'lucide-react';
import { IntegranteFamiliar } from '../../storage/stateTypes';

interface FormIntegranteProps {
  onAdd: (data: Omit<IntegranteFamiliar, 'id'>) => { success: boolean; error?: string };
  onUpdate?: (id: string, data: Partial<Omit<IntegranteFamiliar, 'id'>>) => { success: boolean; error?: string };
  onCancelEdit?: () => void;
  editingMember?: IntegranteFamiliar | null;
  totalIntegrantes: number;
}

const ROLES_SUGERIDOS = [
  'Encargado de llevar la Mochila de Emergencia',
  'Encargado de cortar llave de gas y energía eléctrica',
  'Encargado de abrir puertas y liderar evacuación',
  'Apoyo a adultos mayores o personas con discapacidad',
  'Cuidado y evacuación de niños',
  'Cuidado y traslado de mascotas'
];

export const FormIntegrante: React.FC<FormIntegranteProps> = ({
  onAdd,
  onUpdate,
  onCancelEdit,
  editingMember,
  totalIntegrantes
}) => {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMember) {
      setNombre(editingMember.nombreCompleto);
      setRol(editingMember.rolSismo);
    } else {
      setNombre('');
      setRol('');
    }
    setError(null);
  }, [editingMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre del familiar no puede estar vacío.');
      return;
    }

    if (!rol.trim()) {
      setError('Debes especificar o seleccionar un rol de emergencia.');
      return;
    }

    if (editingMember && onUpdate) {
      const res = onUpdate(editingMember.id, {
        nombreCompleto: nombre.trim(),
        rolSismo: rol.trim()
      });
      if (res.success) {
        setNombre('');
        setRol('');
        if (onCancelEdit) onCancelEdit();
      } else if (res.error) {
        setError(res.error);
      }
      return;
    }

    const res = onAdd({
      nombreCompleto: nombre.trim(),
      rolSismo: rol.trim()
    });

    if (res.success) {
      setNombre('');
      setRol('');
    } else if (res.error) {
      setError(res.error);
    }
  };

  const isLimitReached = !editingMember && totalIntegrantes >= 20;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-red-600" />
          <span>{editingMember ? 'Editar Integrante del Hogar' : 'Agregar Integrante del Hogar'}</span>
        </h3>
        {editingMember && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            data-testid="btn-cancelar-familiar"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Asigna a cada miembro una responsabilidad clara (Mochila, gas, niños, mascotas) para evitar confusiones ante un sismo.
      </p>

      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2"
          data-testid="form-integrante-error"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLimitReached ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          Se ha alcanzado el límite máximo de 20 integrantes en el plan familiar.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Ana Torres"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={80}
              data-testid="input-nombre-familiar"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rol ante Emergencia *
            </label>
            <input
              type="text"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              placeholder="Escribe o selecciona un rol"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-2"
              maxLength={100}
              data-testid="input-rol-familiar"
            />

            <div className="flex flex-wrap gap-1.5">
              {ROLES_SUGERIDOS.map((sugRol) => (
                <button
                  key={sugRol}
                  type="button"
                  onClick={() => setRol(sugRol)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors min-h-[32px]"
                >
                  {sugRol}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              data-testid="btn-guardar-familiar"
            >
              {editingMember ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Actualizar Integrante</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Registrar Integrante</span>
                </>
              )}
            </button>

            {editingMember && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px]"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
