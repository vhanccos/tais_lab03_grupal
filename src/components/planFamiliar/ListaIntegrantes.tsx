import React from 'react';
import { Trash2, User, ShieldCheck } from 'lucide-react';
import { IntegranteFamiliar } from '../../storage/stateTypes';

interface ListaIntegrantesProps {
  integrantes: IntegranteFamiliar[];
  onRemove: (id: string) => void;
}

export const ListaIntegrantes: React.FC<ListaIntegrantesProps> = ({ integrantes, onRemove }) => {
  if (integrantes.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 mb-6">
        <User className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold">No hay integrantes registrados aún.</p>
        <p className="text-xs text-slate-400 mt-1">
          Agrega a las personas que viven en casa para asignarles funciones específicas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-6">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-sm">
          Integrantes Registrados ({integrantes.length}/20)
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {integrantes.map((member) => (
          <div
            key={member.id}
            className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            data-testid={`integrante-item-${member.id}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm break-words">
                  {member.nombreCompleto}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="break-words font-medium">{member.rolSismo}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRemove(member.id)}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Eliminar integrante"
              aria-label={`Eliminar ${member.nombreCompleto}`}
              data-testid={`btn-eliminar-familiar-${member.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
