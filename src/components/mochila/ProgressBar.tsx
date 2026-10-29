import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProgressBarProps {
  porcentaje: number;
  totalArticulos: number;
  articulosCompletados: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  porcentaje,
  totalArticulos,
  articulosCompletados
}) => {
  const getBarColor = (pct: number) => {
    if (pct === 100) return 'bg-emerald-500';
    if (pct >= 70) return 'bg-lime-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const isCompleted = porcentaje === 100;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          )}
          <span className="font-bold text-slate-800 text-lg">
            {isCompleted ? '¡Mochila 100% Lista!' : 'Nivel de Preparación'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900" data-testid="progress-percentage-display">
            {porcentaje}%
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${getBarColor(porcentaje)}`}
          style={{ width: `${porcentaje}%` }}
          data-testid="progress-bar-fill"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500 flex justify-between font-medium">
        <span>{articulosCompletados} de {totalArticulos} artículos empacados</span>
        <span>{isCompleted ? 'Listo para evacuación' : `${100 - porcentaje}% pendiente`}</span>
      </div>
    </div>
  );
};
