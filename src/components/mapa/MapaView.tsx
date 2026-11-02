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
  AlertTriangle,
  PlusCircle,
  Compass,
  Navigation,
  Check,
  X
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { usePlanFamiliar } from '../../hooks/usePlanFamiliar';
import { DEFAULT_PUNTOS_ENCUENTRO } from '../../core/defaultMeetingPoints';
import {
  DEFAULT_LIMA_BOUNDS,
  computeAdaptiveBounds,
  formatDistance,
  calcularDistanciaHaversine,
  findNearestSafeZone
} from '../../core/geoMath';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import { SvgMapCanvas, MapLayerFilters, DEFAULT_LAYER_FILTERS } from './SvgMapCanvas';
import { NearestPointRadar } from './NearestPointRadar';

export const MapaView: React.FC = () => {
  const {
    coords,
    accuracy,
    heading,
    cargando,
    error,
    esUbicacionSimulada,
    obtenerUbicacionActual
  } = useGeolocation();

  const { plan, addPuntoEncuentro } = usePlanFamiliar();

  // Active meeting points: custom from PlanFamiliar merged with defaults if missing
  const puntosDisponibles = useMemo(() => {
    if (plan.puntosEncuentro && plan.puntosEncuentro.length > 0) {
      return plan.puntosEncuentro;
    }
    return DEFAULT_PUNTOS_ENCUENTRO;
  }, [plan.puntosEncuentro]);

  // Compute adaptive bounding box dynamically (T016)
  const [usarEncuadreDinamico, setUsarEncuadreDinamico] = useState<boolean>(true);
  const bounds = useMemo(() => {
    if (usarEncuadreDinamico) {
      return computeAdaptiveBounds(coords, puntosDisponibles, 0.3);
    }
    return DEFAULT_LIMA_BOUNDS;
  }, [usarEncuadreDinamico, coords, puntosDisponibles]);

  // Nearest safe zone for direct path rendering
  const nearestResult = useMemo(() => {
    return findNearestSafeZone(coords, puntosDisponibles);
  }, [coords, puntosDisponibles]);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoEncuentro | null>(null);

  // Layer filters state (T020)
  const [filtrosCapas, setFiltrosCapas] = useState<MapLayerFilters>(DEFAULT_LAYER_FILTERS);
  const [mostrarMenuFiltros, setMostrarMenuFiltros] = useState<boolean>(false);

  // Tap-to-Add modal / drawer state (T017)
  const [tapCoords, setTapCoords] = useState<CoordenadaGeo | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevoTipo, setNuevoTipo] = useState<'externo' | 'comunitario' | 'interno'>('externo');
  const [nuevaDescripcion, setNuevaDescripcion] = useState<string>('');
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Zoom handlers (bounded in [0.6, 3.0])
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(3.0, +(prev + 0.25).toFixed(2)));
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

  // Handler for tapping on map canvas to create new point (T017)
  const handleMapTap = useCallback((geo: CoordenadaGeo) => {
    setTapCoords(geo);
    setNuevoNombre(`Punto Seguro ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setNuevaDescripcion(`Zona de seguridad marcada en ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`);
    setErrorModal(null);
  }, []);

  const handleGuardarPuntoTap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      setErrorModal('El nombre del punto no puede estar vacío.');
      return;
    }
    if (!tapCoords) return;

    const res = addPuntoEncuentro({
      nombre: nuevoNombre.trim(),
      tipo: nuevoTipo,
      descripcion: nuevaDescripcion.trim() || 'Punto registrado tocando el mapa.',
      coordenadas: tapCoords
    });

    if (res.success && res.item) {
      setPuntoSeleccionado(res.item);
      setTapCoords(null);
    } else if (res.error) {
      setErrorModal(res.error);
    }
  };

  const toggleCapa = (capa: keyof MapLayerFilters) => {
    setFiltrosCapas(prev => ({ ...prev, [capa]: !prev[capa] }));
  };

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
                  ? 'Ubicación Predeterminada (Arequipa / UNSA)'
                  : 'GPS Satelital Activo'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                100% Offline
              </span>
              {typeof heading === 'number' && (
                <span
                  className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  data-testid="badge-heading"
                >
                  <Compass className="w-3 h-3 text-blue-600" />
                  <span>{heading}° Azimut</span>
                </span>
              )}
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

        {/* Dynamic bounds toggle & Layers filter toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUsarEncuadreDinamico(prev => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors min-h-[38px] ${
              usarEncuadreDinamico
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Alternar entre encuadre dinámico multi-distrito o centro fijo"
            data-testid="btn-toggle-bounds"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>{usarEncuadreDinamico ? 'Encuadre Adaptativo' : 'Damero Fijo'}</span>
          </button>

          <button
            onClick={() => setMostrarMenuFiltros(prev => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors min-h-[38px] ${
              mostrarMenuFiltros
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Filtros de capas vectoriales"
            data-testid="btn-toggle-layers-menu"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Capas</span>
          </button>
        </div>
      </div>

      {/* Layers Filter Dropdown Menu (T020) */}
      {mostrarMenuFiltros && (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs"
          data-testid="layers-filter-menu"
        >
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filtrosCapas.circulosIndeci}
              onChange={() => toggleCapa('circulosIndeci')}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Círculos INDECI (4.5m)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filtrosCapas.puntosFamiliares}
              onChange={() => toggleCapa('puntosFamiliares')}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Puntos Familiares</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filtrosCapas.puntosComunitarios}
              onChange={() => toggleCapa('puntosComunitarios')}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Puntos Barriales</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filtrosCapas.rutasEvacuacion}
              onChange={() => toggleCapa('rutasEvacuacion')}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Rutas Peatonales</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filtrosCapas.corredorDirecto}
              onChange={() => toggleCapa('corredorDirecto')}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Corredor Directo de Escape</span>
          </label>
        </div>
      )}

      {/* 3. Nearest Safe Zone Radar Card */}
      <NearestPointRadar
        userCoords={coords}
        puntos={puntosDisponibles}
        puntoSeleccionado={puntoSeleccionado}
        onSelectPunto={handleSelectPunto}
      />

      {/* Helper Banner for Tap-to-Add */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <PlusCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Toca cualquier punto del mapa para registrar una nueva zona de evacuación con coordenadas GPS.</span>
        </div>
      </div>

      {/* 4. Main Offline Vector SVG Canvas */}
      <SvgMapCanvas
        userCoords={coords}
        accuracy={accuracy}
        heading={heading}
        puntos={puntosDisponibles}
        bounds={bounds}
        zoom={zoom}
        pan={pan}
        onPanChange={setPan}
        puntoSeleccionadoId={puntoSeleccionado?.id}
        onSelectPunto={handleSelectPunto}
        puntoMasCercano={nearestResult?.punto}
        filtrosCapas={filtrosCapas}
        onTapLocation={handleMapTap}
      />

      {/* Modal / Drawer to Save Tap Point (T017) */}
      {tapCoords && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          data-testid="modal-tap-punto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Agregar Punto Seguro en Coordenada</span>
              </h3>
              <button
                onClick={() => setTapCoords(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorModal && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleGuardarPuntoTap} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coordenadas Detectadas</label>
                <div className="bg-slate-100 rounded-lg p-2.5 font-mono text-xs text-slate-800 flex justify-between">
                  <span>Lat: {tapCoords.lat.toFixed(6)}</span>
                  <span>Lng: {tapCoords.lng.toFixed(6)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Zona Segura *</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Parque de la Reserva"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  maxLength={60}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Punto</label>
                <select
                  value={nuevoTipo}
                  onChange={e => setNuevoTipo(e.target.value as 'externo' | 'comunitario' | 'interno')}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="externo">Círculo de Seguridad Exterior (INDECI)</option>
                  <option value="comunitario">Punto Barrial / Comunitario</option>
                  <option value="interno">Zona de Refugio Interna</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Referencia</label>
                <textarea
                  value={nuevaDescripcion}
                  onChange={e => setNuevaDescripcion(e.target.value)}
                  placeholder="Instrucciones para llegar o puntos de referencia"
                  rows={2}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  maxLength={120}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTapCoords(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar en Plan Familiar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-700 shadow-xs inline-block" />
          <span className="font-medium">Punto Interno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-blue-600 inline-block border-b-2 border-dashed" />
          <span className="font-medium">Corredor Directo</span>
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
                    {hasCoords && (
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {punto.coordenadas!.lat.toFixed(5)}, {punto.coordenadas!.lng.toFixed(5)}
                      </p>
                    )}
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
