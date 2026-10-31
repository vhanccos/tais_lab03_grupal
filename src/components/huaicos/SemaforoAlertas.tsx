import React from 'react';
import {
  NivelAlertaHuaico,
  INFORMACION_ALERTAS
} from '../../core/huaicosDomain';
import { AlertTriangle, ShieldCheck, Siren, Info } from 'lucide-react';

interface SemaforoAlertasProps {
  nivelActual: NivelAlertaHuaico;
  onCambiarNivel: (nivel: NivelAlertaHuaico) => void;
}

export const SemaforoAlertas: React.FC<SemaforoAlertasProps> = ({
  nivelActual,
  onCambiarNivel
}) => {
  const info = INFORMACION_ALERTAS[nivelActual];

  const niveles: NivelAlertaHuaico[] = ['verde', 'amarillo', 'naranja', 'rojo'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" data-testid="semaforo-alertas">
      {/* Header con contexto oficial */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Siren className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Semáforo de Alertas SENAMHI / INDECI</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Avisos de Quebradas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Niveles oficiales ante precipitaciones y probabilidad de activación de quebradas en cuencas peruanas.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Selector interactivo de 4 niveles */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Seleccionar Nivel Hidrometeorológico Actual
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Nivel de alerta">
            {niveles.map(nivel => {
              const item = INFORMACION_ALERTAS[nivel];
              const isSelected = nivelActual === nivel;

              let btnBorder = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';
              if (isSelected) {
                if (nivel === 'verde') btnBorder = 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500';
                if (nivel === 'amarillo') btnBorder = 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400';
                if (nivel === 'naranja') btnBorder = 'border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500';
                if (nivel === 'rojo') btnBorder = 'border-red-600 bg-red-50 text-red-950 ring-2 ring-red-600 animate-pulse';
              }

              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => onCambiarNivel(nivel)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${btnBorder}`}
                  data-testid={`btn-alerta-${nivel}`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      {nivel}
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border ${
                        nivel === 'verde'
                          ? 'bg-emerald-500 border-emerald-600'
                          : nivel === 'amarillo'
                          ? 'bg-amber-400 border-amber-500'
                          : nivel === 'naranja'
                          ? 'bg-orange-500 border-orange-600'
                          : 'bg-red-600 border-red-700'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-medium leading-tight opacity-90">
                    {item.etiqueta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjeta detallada del nivel seleccionado */}
        <div
          className={`rounded-xl border p-4 transition-colors ${info.colorBg} ${info.colorBorder}`}
          data-testid="alerta-detalle"
        >
          <div className="flex items-start space-x-3">
            <div className="mt-0.5">
              {nivelActual === 'verde' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle
                  className={`w-6 h-6 ${
                    nivelActual === 'rojo'
                      ? 'text-red-600'
                      : nivelActual === 'naranja'
                      ? 'text-orange-600'
                      : 'text-amber-600'
                  }`}
                />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4 className={`font-bold text-base ${info.colorText}`} data-testid="alerta-titulo">
                  {info.titulo}
                </h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${info.colorBadge}`}>
                  {info.etiqueta}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {info.descripcionRiesgo}
              </p>

              {/* Directiva Operativa de Supervivencia */}
              <div className="bg-white/80 rounded-lg p-3 border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Directiva Operativa Inmediata:
                </span>
                <p className="text-sm font-bold text-slate-900 leading-snug" data-testid="alerta-directiva">
                  {info.directivaOperativa}
                </p>
              </div>

              {/* Acciones recomendadas */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Acciones clave de protección:
                </span>
                <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                  {info.accionesRecomendadas.map((accion, idx) => (
                    <li key={idx}>{accion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Nota doctrinaria */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Ante lluvias extraordinarias sin señal celular, guíese inmediatamente por la matriz de <strong>Señales Naturales Tempranas</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
