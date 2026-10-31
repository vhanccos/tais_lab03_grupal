import React from 'react';
import { Navigation, ShieldCheck, MapPin, Compass } from 'lucide-react';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import {
  calcularDistanciaHaversine,
  calcularRumboAzimut,
  formatDistance
} from '../../core/geoMath';

interface NearestPointRadarProps {
  userCoords: CoordenadaGeo;
  puntos: PuntoEncuentro[];
  puntoSeleccionado?: PuntoEncuentro | null;
  onSelectPunto?: (punto: PuntoEncuentro) => void;
}

function getNombreRumbo(grados: number): string {
  const direcciones = [
    { nombre: 'Norte (N)', min: 337.5, max: 360 },
    { nombre: 'Norte (N)', min: 0, max: 22.5 },
    { nombre: 'Noreste (NE)', min: 22.5, max: 67.5 },
    { nombre: 'Este (E)', min: 67.5, max: 112.5 },
    { nombre: 'Sureste (SE)', min: 112.5, max: 157.5 },
    { nombre: 'Sur (S)', min: 157.5, max: 202.5 },
    { nombre: 'Suroeste (SO)', min: 202.5, max: 247.5 },
    { nombre: 'Oeste (O)', min: 247.5, max: 292.5 },
    { nombre: 'Noroeste (NO)', min: 292.5, max: 337.5 }
  ];

  for (const d of direcciones) {
    if (grados >= d.min && grados < d.max) {
      return d.nombre;
    }
  }
  return 'Norte (N)';
}

export const NearestPointRadar: React.FC<NearestPointRadarProps> = ({
  userCoords,
  puntos,
  puntoSeleccionado,
  onSelectPunto
}) => {
  const puntosConCoords = puntos.filter(
    p => p.coordenadas && typeof p.coordenadas.lat === 'number'
  );

  if (puntosConCoords.length === 0) {
    return (
      <div
        className="bg-slate-100 rounded-xl p-4 text-center text-slate-500 border border-slate-200"
        data-testid="nearest-point-radar"
      >
        <p className="text-sm">No se encontraron zonas seguras con coordenadas geográficas.</p>
      </div>
    );
  }

  // Find nearest point
  let nearest = puntosConCoords[0];
  let minDistance = calcularDistanciaHaversine(userCoords, nearest.coordenadas!);

  for (let i = 1; i < puntosConCoords.length; i++) {
    const p = puntosConCoords[i];
    const d = calcularDistanciaHaversine(userCoords, p.coordenadas!);
    if (d < minDistance) {
      minDistance = d;
      nearest = p;
    }
  }

  // Target point: either explicitly selected or closest
  const targetPoint = puntoSeleccionado && puntoSeleccionado.coordenadas
    ? puntoSeleccionado
    : nearest;

  const distanciaMetros = calcularDistanciaHaversine(userCoords, targetPoint.coordenadas!);
  const distanciaFormateada = formatDistance(distanciaMetros);
  const rumboGrados = Math.round(calcularRumboAzimut(userCoords, targetPoint.coordenadas!));
  const nombreRumbo = getNombreRumbo(rumboGrados);
  const enZonaSegura = distanciaMetros < 5;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
        enZonaSegura
          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200'
      }`}
      data-testid="nearest-point-radar"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Direction indicator & arrow */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative transition-colors ${
              enZonaSegura ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {enZonaSegura ? (
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            ) : (
              <div
                className="transform transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${rumboGrados}deg)` }}
                data-testid="radar-bearing-arrow"
              >
                <Navigation className="w-7 h-7 fill-red-500 text-red-500 filter drop-shadow" />
              </div>
            )}
            {!enZonaSegura && (
              <div className="absolute top-1 text-[8px] font-mono font-bold text-slate-400">
                N
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {targetPoint.id === nearest.id ? 'Zona Segura Más Próxima' : 'Punto Seleccionado'}
              </span>
              {enZonaSegura && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full">
                  Llegada confirmada
                </span>
              )}
            </div>

            <h3
              className="text-base font-bold text-slate-900 leading-tight flex items-center gap-1"
              data-testid="radar-point-name"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 inline" />
              {targetPoint.nombre}
            </h3>

            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
              {targetPoint.descripcion}
            </p>
          </div>
        </div>

        {/* Right: Distance & Bearing info */}
        <div className="text-right shrink-0">
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              enZonaSegura ? 'text-emerald-700' : 'text-slate-900'
            }`}
            data-testid="radar-distance"
          >
            {distanciaFormateada}
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-500">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>{rumboGrados}° {nombreRumbo.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Target point selector pills if multiple available */}
      {puntosConCoords.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Destino:</span>
          {puntosConCoords.map(p => {
            const isTarget = targetPoint.id === p.id;
            const dist = formatDistance(calcularDistanciaHaversine(userCoords, p.coordenadas!));
            return (
              <button
                key={p.id}
                onClick={() => onSelectPunto?.(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isTarget
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{p.nombre}</span>
                <span className={`text-[10px] ${isTarget ? 'text-slate-300' : 'text-slate-500'}`}>
                  ({dist})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
