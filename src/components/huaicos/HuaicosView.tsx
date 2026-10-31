import React, { useState } from 'react';
import { useHuaicos } from '../../hooks/useHuaicos';
import { SemaforoAlertas } from './SemaforoAlertas';
import { MatrizSenalesTempranas } from './MatrizSenalesTempranas';
import { GuiaEvacuacionPerpendicular } from './GuiaEvacuacionPerpendicular';
import { ChecklistTemporadaLluvias } from './ChecklistTemporadaLluvias';
import { CalculadorPotabilizacion } from './CalculadorPotabilizacion';
import {
  Waves,
  Siren,
  Compass,
  ShieldCheck,
  Droplets,
  AlertOctagon
} from 'lucide-react';

export type SubSeccionHuaico = 'alertas' | 'evacuacion' | 'checklist' | 'agua';

export const HuaicosView: React.FC = () => {
  const [subSeccion, setSubSeccion] = useState<SubSeccionHuaico>('alertas');
  const {
    state,
    metricas,
    toggleItem,
    toggleSenal,
    setNivelAlerta,
    savePlanEvacuacion,
    resetToDefault
  } = useHuaicos();

  const senalesActivas = state.senalesTempranas.filter(s => s.reconocida).length;
  const tienePeligroMortal = state.senalesTempranas.some(s => s.reconocida && s.esPeligroMortal);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4" data-testid="huaicos-view">
      {/* Banner Principal de Módulo de Huaicos */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600/90 rounded-xl text-white shadow-inner">
            <Waves className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Gestión de Riesgo de Huaicos
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                Offline
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Protocolos de supervivencia, alerta temprana y contingencia ante aluviones e inundaciones.
            </p>
          </div>
        </div>

        {/* Indicadores rápidos */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Preparación</span>
            <span className="font-extrabold text-amber-400">{metricas.porcentajeTotal}%</span>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Alerta Actual</span>
            <span className="font-extrabold uppercase text-white">{state.nivelAlertaActual}</span>
          </div>
        </div>
      </div>

      {/* Alerta flotante si hay señales críticas activas */}
      {tienePeligroMortal && subSeccion !== 'alertas' && (
        <div
          onClick={() => setSubSeccion('alertas')}
          className="bg-red-600 text-white p-3 rounded-xl flex items-center justify-between cursor-pointer animate-bounce shadow-md"
          data-testid="banner-peligro-flotante"
        >
          <div className="flex items-center space-x-2 text-xs font-bold">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>¡Señales de aluvión inminente detectadas! Toque para ver instrucciones de evacuación.</span>
          </div>
          <span className="text-xs underline font-extrabold shrink-0 ml-2">Ver Alerta</span>
        </div>
      )}

      {/* Subnavegación interactiva */}
      <div className="flex rounded-xl bg-slate-200/80 p-1 gap-1 text-xs font-bold overflow-x-auto" role="tablist">
        <button
          type="button"
          onClick={() => setSubSeccion('alertas')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            subSeccion === 'alertas'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          data-testid="subtab-alertas"
          role="tab"
          aria-selected={subSeccion === 'alertas'}
        >
          <Siren className="w-4 h-4 text-amber-500" />
          <span>Alertas y Señales</span>
          {senalesActivas > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
              {senalesActivas}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubSeccion('evacuacion')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            subSeccion === 'evacuacion'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          data-testid="subtab-evacuacion"
          role="tab"
          aria-selected={subSeccion === 'evacuacion'}
        >
          <Compass className="w-4 h-4 text-red-500" />
          <span>Evacuación 90°</span>
        </button>

        <button
          type="button"
          onClick={() => setSubSeccion('checklist')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            subSeccion === 'checklist'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          data-testid="subtab-checklist"
          role="tab"
          aria-selected={subSeccion === 'checklist'}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Checklist Temporada</span>
          <span className="ml-1 text-[10px] text-slate-500 font-bold">
            {metricas.porcentajeTotal}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubSeccion('agua')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            subSeccion === 'agua'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          data-testid="subtab-agua"
          role="tab"
          aria-selected={subSeccion === 'agua'}
        >
          <Droplets className="w-4 h-4 text-sky-500" />
          <span>Agua y Salud</span>
        </button>
      </div>

      {/* Contenido de la subsección activa */}
      <div className="space-y-4">
        {subSeccion === 'alertas' && (
          <>
            <SemaforoAlertas
              nivelActual={state.nivelAlertaActual}
              onCambiarNivel={setNivelAlerta}
            />
            <MatrizSenalesTempranas
              senales={state.senalesTempranas}
              onToggleSenal={toggleSenal}
            />
          </>
        )}

        {subSeccion === 'evacuacion' && (
          <GuiaEvacuacionPerpendicular
            plan={state.planEvacuacion}
            onGuardarPlan={savePlanEvacuacion}
          />
        )}

        {subSeccion === 'checklist' && (
          <ChecklistTemporadaLluvias
            articulos={state.articulos}
            metricas={metricas}
            onToggleItem={toggleItem}
            onReset={resetToDefault}
          />
        )}

        {subSeccion === 'agua' && (
          <CalculadorPotabilizacion />
        )}
      </div>
    </div>
  );
};
