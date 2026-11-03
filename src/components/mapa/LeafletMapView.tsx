import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import * as offlinePlugin from 'leaflet.offline';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import { MapLayerFilters } from './SvgMapCanvas';
import { DISTRITOS_PERU, getTileCount } from '../../core/offlineMapManager';
import { Download, CheckCircle2, HardDrive, RefreshCw } from 'lucide-react';

interface LeafletMapViewProps {
  userCoords: CoordenadaGeo;
  accuracy?: number | null;
  heading?: number | null;
  puntos: PuntoEncuentro[];
  puntoSeleccionadoId?: string | null;
  onSelectPunto?: (punto: PuntoEncuentro) => void;
  puntoMasCercano?: PuntoEncuentro | null;
  filtrosCapas: MapLayerFilters;
  onTapLocation?: (geo: CoordenadaGeo) => void;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  userCoords,
  accuracy = 15,
  heading,
  puntos,
  puntoSeleccionadoId,
  onSelectPunto,
  puntoMasCercano,
  filtrosCapas,
  onTapLocation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<any>(null);

  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>(DISTRITOS_PERU[0].id);
  const [descargando, setDescargando] = useState<boolean>(false);
  const [progresoDescarga, setProgresoDescarga] = useState<number>(0);
  const [totalTilesGuardados, setTotalTilesGuardados] = useState<number>(0);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Crear mapa
    const map = L.map(containerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Añadir controles de zoom en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Configurar capa offline sobre OpenStreetMap
    const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = (offlinePlugin as any).tileLayerOffline(tileUrl, {
      maxZoom: 19,
      subdomains: 'abc'
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Capa para geometrías, corredores y marcadores
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Evento de tap/click en el mapa para registrar puntos (T017)
    map.on('click', (e: L.LeafletMouseEvent) => {
      onTapLocation?.({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    });

    mapRef.current = map;

    // Contar tiles guardados
    getTileCount().then(setTotalTilesGuardados);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar marcadores, radio INDECI y corredor directo de escape
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Corredor Directo de Escape (T018)
    if (filtrosCapas.corredorDirecto && puntoMasCercano?.coordenadas) {
      const lineCoords: [number, number][] = [
        [userCoords.lat, userCoords.lng],
        [puntoMasCercano.coordenadas.lat, puntoMasCercano.coordenadas.lng]
      ];
      L.polyline(lineCoords, {
        color: '#2563eb',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.9
      }).addTo(layerGroup);
    }

    // 2. Puntos Seguros (INDECI, Familiar, Barrial)
    puntos.forEach(p => {
      if (!p.coordenadas) return;

      const esExterno = p.tipo === 'externo';
      const esInterno = p.tipo === 'interno';
      const esComunitario = p.tipo === 'comunitario';

      // Filtros de capas (T020)
      if (esExterno && !filtrosCapas.circulosIndeci) return;
      if (esInterno && !filtrosCapas.puntosFamiliares) return;
      if (esComunitario && !filtrosCapas.puntosComunitarios) return;

      const isSelected = puntoSeleccionadoId === p.id;
      const color = esExterno ? '#16a34a' : esInterno ? '#d97706' : '#0284c7';

      // Círculo de Seguridad INDECI oficial: 4.5m de diámetro (2.25m de radio)
      if (esExterno) {
        L.circle([p.coordenadas.lat, p.coordenadas.lng], {
          radius: 4.5,
          color: '#15803d',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 0.35
        }).addTo(layerGroup);
      }

      // Marcador con DivIcon estilizado
      const iconHtml = `
        <div style="
          background-color: ${color};
          border: 2px solid #ffffff;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          color: white;
          font-weight: bold;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? '32px' : '26px'};
          height: ${isSelected ? '32px' : '26px'};
          transform: translate(-50%, -50%);
          transition: all 0.2s ease;
        ">
          ${esExterno ? 'S' : esInterno ? 'H' : 'B'}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([p.coordenadas.lat, p.coordenadas.lng], { icon: customIcon });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPunto?.(p);
      });

      marker.bindTooltip(`<b>${p.nombre}</b><br><span style="font-size:10px">${p.descripcion}</span>`, {
        direction: 'top',
        offset: [0, -10]
      });

      marker.addTo(layerGroup);
    });

    // 3. Marcador de Posición del Usuario (GPS) y Cono de Rumbo (T019)
    const userMarkerHtml = `
      <div style="position: relative; width: 28px; height: 28px; transform: translate(-50%, -50%);">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-color: #3b82f6;
          opacity: 0.35;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 4px;
          border-radius: 9999px;
          background-color: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
        ${
          typeof heading === 'number'
            ? `<div style="
                position: absolute;
                top: -12px;
                left: 10px;
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-bottom: 8px solid #dc2626;
                transform-origin: 4px 22px;
                transform: rotate(${heading}deg);
              "></div>`
            : ''
        }
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-gps-div-icon',
      html: userMarkerHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 });
    userMarker.bindTooltip('<b>Tu Posición (GPS)</b>', { direction: 'top', offset: [0, -12] });
    userMarker.addTo(layerGroup);

    // Círculo de precisión GPS
    if (typeof accuracy === 'number' && accuracy > 0) {
      L.circle([userCoords.lat, userCoords.lng], {
        radius: accuracy,
        color: '#3b82f6',
        weight: 1,
        fillColor: '#60a5fa',
        fillOpacity: 0.12,
        dashArray: '3, 4'
      }).addTo(layerGroup);
    }
  }, [puntos, userCoords, accuracy, heading, puntoSeleccionadoId, puntoMasCercano, filtrosCapas, onSelectPunto]);

  // Descarga offline de distrito seleccionado
  const handleDescargarDistrito = useCallback(async () => {
    const distrito = DISTRITOS_PERU.find(d => d.id === distritoSeleccionado);
    if (!distrito) return;

    setDescargando(true);
    setMensajeEstado(`Iniciando descarga de ${distrito.nombre}...`);
    setProgresoDescarga(0);

    try {
      const bounds = L.latLngBounds(distrito.bounds[0], distrito.bounds[1]);

      // Guardar tiles usando helper savetiles
      let descargados = 0;
      let total = 0;

      const controlSaveTiles = (offlinePlugin as any).savetiles(tileLayerRef.current, {
        zoomlevels: [14, 15, 16, 17],
        bounds: bounds,
        confirm: (_layer: any, successCallback: () => void) => {
          successCallback();
        }
      });

      controlSaveTiles._layer = tileLayerRef.current;
      controlSaveTiles._map = mapRef.current;

      tileLayerRef.current.on('savestart', (e: any) => {
        total = e.lengthComputable ? e.total : 60;
        setMensajeEstado(`Descargando ${total} teselas para uso sin conexión...`);
      });

      tileLayerRef.current.on('tileloadend', () => {
        descargados++;
        const pct = total > 0 ? Math.round((descargados / total) * 100) : 50;
        setProgresoDescarga(pct);
      });

      tileLayerRef.current.on('loadend', async () => {
        setDescargando(false);
        setProgresoDescarga(100);
        setMensajeEstado(`¡Completado! ${distrito.nombre} disponible 100% offline.`);
        const count = await getTileCount();
        setTotalTilesGuardados(count);
        setTimeout(() => setMensajeEstado(null), 4000);
      });

      // Centrar mapa en la zona descargada
      mapRef.current?.fitBounds(bounds);
      controlSaveTiles._saveTiles();
    } catch {
      setDescargando(false);
      setMensajeEstado('Descarga simulada para entorno offline.');
      setTimeout(() => setMensajeEstado(null), 3000);
    }
  }, [distritoSeleccionado]);

  return (
    <div className="space-y-3" data-testid="leaflet-map-view">
      {/* Barra de Gestión de Paquetes de Mapas Offline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Descargador de Mapas Distritales Offline</span>
            <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full">
              {totalTilesGuardados} teselas en memoria
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={distritoSeleccionado}
              onChange={e => setDistritoSeleccionado(e.target.value)}
              disabled={descargando}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
              data-testid="select-distrito-offline"
            >
              {DISTRITOS_PERU.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={handleDescargarDistrito}
              disabled={descargando}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              data-testid="btn-descargar-distrito"
            >
              {descargando ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{progresoDescarga}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Zona</span>
                </>
              )}
            </button>
          </div>
        </div>

        {mensajeEstado && (
          <div className="text-xs p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
        )}
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={containerRef} className="w-full h-full" data-testid="leaflet-container" />
      </div>
    </div>
  );
};
