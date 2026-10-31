import React from 'react';
import {
  SenalTemprana,
  TipoSenalTemprana
} from '../../core/huaicosDomain';
import {
  AlertOctagon,
  Clock,
  Eye,
  CheckCircle2,
  Waves
} from 'lucide-react';

interface MatrizSenalesTempranasProps {
  senales: SenalTemprana[];
  onToggleSenal: (id: TipoSenalTemprana) => void;
}

export const MatrizSenalesTempranas: React.FC<MatrizSenalesTempranasProps> = ({
  senales,
  onToggleSenal
}) => {
  const senalesReconocidas = senales.filter(s => s.reconocida);
  const tienePeligroMortal = senalesReconocidas.some(s => s.esPeligroMortal);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" data-testid="matriz-senales">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Señales Naturales de Alerta Temprana</h3>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border ${
              senalesReconocidas.length > 0
                ? 'bg-red-500/20 text-red-300 border-red-500'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            data-testid="contador-senales-activas"
          >
            {senalesReconocidas.length} detectadas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Signos físicos y acústicos observables antes del impacto del aluvión cuando colapsan las telecomunicaciones.
        </p>
      </div>

      {/* Banner de peligro inminente si hay señales críticas reconocidas */}
      {tienePeligroMortal && (
        <div
          className="bg-red-600 text-white p-4 flex items-start space-x-3 animate-pulse border-b border-red-700"
          data-testid="banner-peligro-inminente"
        >
          <AlertOctagon className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-sm uppercase tracking-wide">
              ¡PELIGRO MORTAL INMINENTE DETECTADO!
            </h4>
            <p className="text-xs text-red-100 font-semibold leading-relaxed">
              Ha detectado estruendo, represamiento o vibración sísmica. La masa de lodo y rocas impactará en segundos o pocos minutos.
              <strong> ¡NO RECOJA OBJETOS! ¡Suba a laderas altas a 90° de inmediato!</strong>
            </p>
          </div>
        </div>
      )}

      {/* Rejilla de señales */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {senales.map(senal => {
            const isChecked = senal.reconocida;
            return (
              <div
                key={senal.id}
                onClick={() => onToggleSenal(senal.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isChecked
                    ? senal.esPeligroMortal
                      ? 'bg-red-50 border-red-400 shadow-sm'
                      : 'bg-amber-50 border-amber-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`senal-card-${senal.id}`}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleSenal(senal.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? senal.esPeligroMortal
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-amber-600 border-amber-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {senal.nombre}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 flex items-center gap-1 ${
                      senal.esPeligroMortal
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline" />
                    &lt; {Math.round(senal.tiempoReaccionSegundos / 60) > 0 ? `${Math.round(senal.tiempoReaccionSegundos / 60)} min` : `${senal.tiempoReaccionSegundos} s`}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                  <strong className="text-slate-900">Signo: </strong>
                  {senal.descripcionSensorial}
                </p>

                <div className="text-[11px] text-slate-500 bg-white/70 p-2 rounded border border-slate-200/70 mb-2">
                  <span className="font-semibold text-slate-700">Causa física: </span>
                  {senal.causaFisica}
                </div>

                <div
                  className={`text-xs font-semibold p-2 rounded border ${
                    isChecked
                      ? senal.esPeligroMortal
                        ? 'bg-red-100/90 text-red-950 border-red-300'
                        : 'bg-amber-100/90 text-amber-950 border-amber-300'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="block text-[10px] uppercase font-bold text-slate-500">
                    Acción Inmediata Requerida:
                  </span>
                  {senal.accionInmediata}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-sky-600" />
            Doctrina Geomecánica (INGEMMET & INDECI):
          </p>
          <p>
            Un huaico se desplaza a velocidades entre 18 y 54 km/h (5 a 15 m/s), superando la velocidad humana de carrera en pendiente (10-12 km/h). Si detecta cualquiera de estos signos, <strong>no espere confirmación oficial</strong> y ascienda inmediatamente hacia los cerros.
          </p>
        </div>
      </div>
    </div>
  );
};
