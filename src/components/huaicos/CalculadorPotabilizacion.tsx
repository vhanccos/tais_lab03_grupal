import React, { useState } from 'react';
import { calcularPotabilizacionAgua } from '../../core/huaicosDomain';
import {
  Droplets,
  Clock,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export const CalculadorPotabilizacion: React.FC = () => {
  const [litros, setLitros] = useState<number>(5);
  const [litrosInput, setLitrosInput] = useState<string>('5');

  const resultado = calcularPotabilizacionAgua(litros);

  const handleInputChange = (val: string) => {
    setLitrosInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setLitros(num);
    } else {
      setLitros(0);
    }
  };

  const setPreset = (vol: number) => {
    setLitros(vol);
    setLitrosInput(vol.toString());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" data-testid="calculador-potabilizacion">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base">Calculador Offline de Potabilización de Agua</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500">
            Fórmula INDECI / MINSA
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Dosificación exacta de lejía comercial al 5% o pastillas potabilizadoras ante corte o turbidez del servicio.
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Selector de volumen */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Volumen de Agua a Desinfectar (Litros)
          </label>

          {/* Botones de volumen preestablecido */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 5, 20, 100].map(vol => (
              <button
                key={vol}
                type="button"
                onClick={() => setPreset(vol)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  litros === vol
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                data-testid={`preset-${vol}l`}
              >
                {vol} L
                <span className="block text-[10px] font-normal text-slate-500">
                  {vol === 1 ? 'Botella' : vol === 5 ? 'Galón' : vol === 20 ? 'Bidón' : 'Tanque'}
                </span>
              </button>
            ))}
          </div>

          {/* Input manual */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0.1"
                step="any"
                value={litrosInput}
                onChange={e => handleInputChange(e.target.value)}
                placeholder="Ej. 10"
                className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white pr-12 font-bold text-slate-900"
                data-testid="input-litros-agua"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                Litros
              </span>
            </div>
          </div>
        </div>

        {/* Advertencia si el volumen es inválido */}
        {!resultado.esValido && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-900 flex items-center gap-2" data-testid="advertencia-volumen-invalido">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{resultado.advertencia}</span>
          </div>
        )}

        {/* Resultado de dosificación */}
        {resultado.esValido && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="resultado-dosificacion">
            {/* Opción Lejía Tradicional 5% */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800 block mb-1">
                  Método 1: Lejía Tradicional al 5%
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-3xl font-black text-sky-950" data-testid="gotas-lejia-resultado">
                    {resultado.gotasLejia}
                  </span>
                  <span className="text-sm font-bold text-sky-800">gotas</span>
                </div>
                <p className="text-xs text-sky-900 font-medium">
                  (2 gotas por cada 1 litro de agua sin aroma ni colorantes).
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-sky-200 flex items-center gap-1.5 text-xs text-sky-800 font-semibold">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Reposo obligatorio: <strong>{resultado.minutosReposo} minutos</strong></span>
              </div>
            </div>

            {/* Opción Pastillas Potabilizadoras */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                  Método 2: Pastillas Potabilizadoras (Aquatabs)
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-3xl font-black text-emerald-950" data-testid="pastillas-resultado">
                    {resultado.pastillasSugeridas}
                  </span>
                  <span className="text-sm font-bold text-emerald-800">
                    pastilla{resultado.pastillasSugeridas > 1 ? 's' : ''} (aprox.)
                  </span>
                </div>
                <p className="text-xs text-emerald-900 font-medium">
                  Según especificación del fabricante (típicamente 1 pastilla cada 4-5 litros).
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Reposo recomendado: <strong>30 minutos</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Pasos de Aplicación */}
        {resultado.esValido && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Protocolo Oficial de Desinfección en Emergencias:
            </span>
            <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-decimal">
              {resultado.instruccionesClave.map((instruccion, i) => (
                <li key={i} className="leading-relaxed">{instruccion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Alerta Sanitaria de Prevención (Leptospirosis y Dengue) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs space-y-2 text-slate-800">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Alerta Sanitaria Post-Huaico (CDC MINSA):</span>
          </div>
          <ul className="space-y-1 pl-4 list-disc text-slate-700">
            <li>
              <strong>Leptospirosis:</strong> Prohibido caminar descalzo sobre el lodo. Utilice siempre botas de jebe de caña alta; las bacterias entran por raspaduras en la piel.
            </li>
            <li>
              <strong>Dengue:</strong> Tape herméticamente baldes y bidones de agua almacenada y deseche charcos estancados para evitar la reproducción del zancudo <em>Aedes aegypti</em>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
