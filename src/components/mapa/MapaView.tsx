import React, { useState, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LocateFixed,
  Shield,
  Layers,
  Info,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { usePlanFamiliar } from '../../hooks/usePlanFamiliar';
import { DEFAULT_PUNTOS_ENCUENTRO } from '../../core/defaultMeetingPoints';
import { DEFAULT_LIMA_BOUNDS, formatDistance, calcularDistanciaHaversine } from '../../core/geoMath';
import { PuntoEncuentro } from '../../storage/stateTypes';
import { SvgMapCanvas } from './SvgMapCanvas';
import { NearestPointRadar } from './NearestPointRadar';

export const MapaView: React.FC = () => {
  const {
    coords,
    accuracy,
    cargando,
    error,
    esUbicacionSimulada,
    obtenerUbicacionActual
  } = useGeolocation();

  const { plan } = usePlanFamiliar();

  // Active meeting points: custom from PlanFamiliar merged with defaults if missing
  const puntosDisponibles = useMemo(() => {
    if (plan.puntosEncuentro && plan.puntosEncuentro.length > 0) {
      return plan.puntosEncuentro;
    }
    return DEFAULT_PUNTOS_ENCUENTRO;
  }, [plan.puntosEncuentro]);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoEncuentro | null>(null);
  const [mostrarRutasEvacuacion, setMostrarRutasEvacuacion] = useState<boolean>(true);

  // Zoom handlers (bounded in [0.6, 2.5])
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.6, +(prev - 0.25).toFixed(2)));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPuntoSeleccionado(null);
  }, []);

  const handleCenterUser = useCallback(() => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    obtenerUbicacionActual();
  }, [obtenerUbicacionActual]);

  const handleSelectPunto = useCallback((punto: PuntoEncuentro) => {
    setPuntoSeleccionado(prev => (prev?.id === punto.id ? null : punto));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5" data-testid="mapa-view">
      {/* 1. Status Bar: GPS & Offline state */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              cargando
                ? 'bg-amber-400 animate-ping'
                : esUbicacionSimulada
                ? 'bg-amber-500'
                : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider text-slate-800"
                data-testid="gps-status-badge"
              >
                {cargando
                  ? 'Sincronizando satélites GPS…'
                  : esUbicacionSimulada
                  ? 'Ubicación Aproximada (Lima)'
                  : 'GPS Satelital Activo'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                100% Offline
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {cargando
                ? 'Estableciendo fijación orbital...'
                : `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)} (±${Math.round(
                    accuracy ?? 25
                  )}m)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span
              className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1"
              title={error}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="max-w-[200px] truncate">{error}</span>
            </span>
          )}
          <button
            onClick={obtenerUbicacionActual}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors min-h-[36px]"
            title="Refrescar posición GPS"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Controls Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Acercar mapa (+)"
            data-testid="btn-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Alejar mapa (-)"
            data-testid="btn-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold px-2 text-slate-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Restablecer vista"
            data-testid="btn-reset-view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterUser}
            className="p-2 hover:bg-slate-100 text-blue-600 rounded-lg transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Centrar en mi ubicación"
            data-testid="btn-center-user"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle evacuation routes */}
        <button
          onClick={() => setMostrarRutasEvacuacion(prev => !prev)}
          className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors min-h-[38px] ${
            mostrarRutasEvacuacion
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Alternar rutas de evacuación seguras"
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Rutas Seguras</span>
          {mostrarRutasEvacuacion && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        </button>
      </div>

      {/* 3. Nearest Safe Zone Radar Card */}
      <NearestPointRadar
        userCoords={coords}
        puntos={puntosDisponibles}
        puntoSeleccionado={puntoSeleccionado}
        onSelectPunto={handleSelectPunto}
      />

      {/* 4. Main Offline Vector SVG Canvas */}
      <SvgMapCanvas
        userCoords={coords}
        accuracy={accuracy}
        puntos={puntosDisponibles}
        bounds={DEFAULT_LIMA_BOUNDS}
        zoom={zoom}
        pan={pan}
        onPanChange={setPan}
        puntoSeleccionadoId={puntoSeleccionado?.id}
        onSelectPunto={handleSelectPunto}
        mostrarRutasEvacuacion={mostrarRutasEvacuacion}
      />

      {/* Map Legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-around gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shadow-xs inline-block" />
          <span className="font-medium">Tu ubicación (GPS)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-700 shadow-xs inline-block" />
          <span className="font-medium">Círculo INDECI 4.5m</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-sky-700 shadow-xs inline-block" />
          <span className="font-medium">Punto Barrial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-emerald-600 inline-block border-b border-dashed" />
          <span className="font-medium">Corredor de Evacuación</span>
        </div>
      </div>

      {/* 5. Safe Zones List / Directory */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs"
        data-testid="safe-zones-list"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Zonas Seguras y Círculos de Encuentro Registrados</span>
          </h2>
          <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-full">
            {puntosDisponibles.length} puntos
          </span>
        </div>

        <div className="space-y-2.5">
          {puntosDisponibles.map(punto => {
            const hasCoords = punto.coordenadas && typeof punto.coordenadas.lat === 'number';
            const dist = hasCoords
              ? formatDistance(calcularDistanciaHaversine(coords, punto.coordenadas!))
              : 'En plano interno';
            const isSelected = puntoSeleccionado?.id === punto.id;

            return (
              <div
                key={punto.id}
                onClick={() => handleSelectPunto(punto)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      punto.tipo === 'externo'
                        ? 'bg-emerald-100 text-emerald-700'
                        : punto.tipo === 'interno'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{punto.nombre}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          punto.tipo === 'externo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : punto.tipo === 'interno'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {punto.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{punto.descripcion}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-slate-800">{dist}</div>
                  <span className="text-[10px] text-blue-600 font-semibold hover:underline">
                    {isSelected ? 'Seleccionado' : 'Ver en mapa'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. INDECI Guidelines Info Box */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Norma Técnica INDECI — Círculos de Seguridad en Exteriores:</p>
          <p className="text-emerald-800 leading-relaxed">
            Los círculos de seguridad externos (diámetro reglamentario de 4.5 metros) pintados en el suelo
            deben ubicarse en patios, plazas y parques despejados, a una distancia de seguridad equivalente a
            la mitad de la altura de los edificios circundantes, lejos de postes, cables de alta tensión o vidrios.
          </p>
        </div>
      </div>
    </div>
  );
};
