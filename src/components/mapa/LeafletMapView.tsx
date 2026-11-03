import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import { MapLayerFilters } from './SvgMapCanvas';
import {
  DISTRITOS_PERU,
  DistritosPredefinidos,
  findDistrictByCoords,
  isDistrictDownloaded,
  markDistrictDownloaded
} from '../../core/offlineMapManager';
import { HardDrive, ShieldCheck, Download, AlertCircle, CheckCircle2, Layers } from 'lucide-react';

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
  const districtPolygonsGroupRef = useRef<L.LayerGroup | null>(null);

  // Distritos descargados en estado local
  const [downloadedDistricts, setDownloadedDistricts] = useState<Record<string, boolean>>({
    'arequipa-unsa': true
  });

  // Popup de detección inicial de ubicación
  const [distritoDetectado, setDistritoDetectado] = useState<DistritosPredefinidos | null>(null);
  const [mostrarPopupDeteccion, setMostrarPopupDeteccion] = useState<boolean>(false);

  // Cuadrante seleccionado al hacer click en zona límite no descargada
  const [zonaSeleccionadaParaDescarga, setZonaSeleccionadaParaDescarga] = useState<DistritosPredefinidos | null>(null);
  const [descargandoZona, setDescargandoZona] = useState<boolean>(false);
  const [mensajeDescarga, setMensajeDescarga] = useState<string | null>(null);

  // Cargar estado de distritos descargados desde almacenamiento
  useEffect(() => {
    async function checkAll() {
      const status: Record<string, boolean> = { 'arequipa-unsa': true };
      for (const d of DISTRITOS_PERU) {
        if (d.id !== 'arequipa-unsa') {
          status[d.id] = await isDistrictDownloaded(d.id);
        }
      }
      setDownloadedDistricts(status);
    }
    checkAll();
  }, []);

  // Detectar distrito de la ubicación actual
  useEffect(() => {
    const d = findDistrictByCoords(userCoords.lat, userCoords.lng);
    if (d) {
      setDistritoDetectado(d);
      isDistrictDownloaded(d.id).then(descargado => {
        if (!descargado) {
          setMostrarPopupDeteccion(true);
        }
      });
    }
  }, [userCoords.lat, userCoords.lng]);

  // Ejecutar descarga simulada / guardado de paquete distrital
  const handleConfirmarDescarga = useCallback(async (distrito: DistritosPredefinidos) => {
    setDescargandoZona(true);
    setMensajeDescarga(`Descargando paquete offline para ${distrito.nombre}...`);

    try {
      await new Promise(r => setTimeout(r, 600)); // Latencia de guardado
      await markDistrictDownloaded(distrito.id);
      setDownloadedDistricts(prev => ({ ...prev, [distrito.id]: true }));
      setMensajeDescarga(`¡Listo! ${distrito.nombre} ahora está disponible 100% offline.`);
      setZonaSeleccionadaParaDescarga(null);
      setMostrarPopupDeteccion(false);

      // Centrar mapa en la zona descargada
      if (mapRef.current) {
        mapRef.current.flyTo(distrito.center, 15, { animate: true });
      }

      setTimeout(() => setMensajeDescarga(null), 3500);
    } catch {
      setMensajeDescarga('Error al descargar el paquete de la zona.');
    } finally {
      setDescargandoZona(false);
    }
  }, []);

  // Inicializar mapa Leaflet con capa 100% libre de requests no controlados
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Crear mapa centrado en UNSA
    const map = L.map(containerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 16,
      minZoom: 13,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Límites de navegación seguros para toda el área metropolitana de Arequipa
    const maxBounds = L.latLngBounds([-16.445, -71.565], [-16.375, -71.505]);
    map.setMaxBounds(maxBounds);
    map.options.maxBoundsViscosity = 0.8;

    // Capa de teselas locales: NUNCA hace llamadas a servidores externos
    const StrictLocalTileLayer = L.TileLayer.extend({
      getTileUrl: function (coords: { z: number; x: number; y: number }) {
        // 1. Probar en el paquete base de UNSA
        return `/tiles/${coords.z}/${coords.x}/${coords.y}.png`;
      },
      createTile: function (coords: { z: number; x: number; y: number }, done: any) {
        const tile = document.createElement('img');
        tile.alt = 'Mapa';
        tile.setAttribute('role', 'presentation');

        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', () => {
          // Si no está en /tiles, revisar si pertenece a un paquete distrital descargado
          // Verificar en distritos descargados
          let found = false;
          for (const d of DISTRITOS_PERU) {
            if (downloadedDistricts[d.id] && d.tilesBasePath !== '/tiles') {
              tile.src = `${d.tilesBasePath}/${coords.z}/${coords.x}/${coords.y}.png`;
              found = true;
              break;
            }
          }

          if (!found) {
            // Cero peticiones de red hacia afuera: mostrar celda neutral amigable
            tile.style.backgroundColor = '#f8fafc';
            tile.style.border = '0.5px dashed #e2e8f0';
            done(null, tile);
          }
        });

        tile.src = this.getTileUrl(coords);
        return tile;
      }
    });

    const localLayer = new (StrictLocalTileLayer as any)('', {
      minZoom: 13,
      maxZoom: 18,
      tileSize: 256
    });

    localLayer.addTo(map);

    // Capa de contornos de distritos y zonas descargables
    const districtGroup = L.layerGroup().addTo(map);
    districtPolygonsGroupRef.current = districtGroup;

    // Capa para geometrías, corredores y marcadores
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Evento de click en el mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      onTapLocation?.({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar rectángulos de distritos (zonas descargadas vs no descargadas para click)
  useEffect(() => {
    const group = districtPolygonsGroupRef.current;
    if (!group) return;

    group.clearLayers();

    DISTRITOS_PERU.forEach(d => {
      const isDownloaded = Boolean(downloadedDistricts[d.id]);
      const bounds = L.latLngBounds(d.bounds[0], d.bounds[1]);

      const rect = L.rectangle(bounds, {
        color: isDownloaded ? '#10b981' : '#f59e0b',
        weight: isDownloaded ? 1.5 : 2,
        dashArray: isDownloaded ? undefined : '5, 5',
        fillColor: isDownloaded ? '#10b981' : '#fef3c7',
        fillOpacity: isDownloaded ? 0.04 : 0.25,
        interactive: !isDownloaded
      });

      if (!isDownloaded) {
        rect.on('click', e => {
          L.DomEvent.stopPropagation(e);
          setZonaSeleccionadaParaDescarga(d);
        });
        rect.bindTooltip(
          `<b>📍 ${d.nombre}</b><br><span style="color:#d97706;font-size:11px">Zona no descargada · Clic para descargar (${d.tamanoAproxMB} MB)</span>`,
          { direction: 'center', permanent: false }
        );
      }

      rect.addTo(group);
    });
  }, [downloadedDistricts]);

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

    // 2. Puntos Seguros
    puntos.forEach(p => {
      if (!p.coordenadas) return;

      const esExterno = p.tipo === 'externo';
      const esInterno = p.tipo === 'interno';
      const esComunitario = p.tipo === 'comunitario';

      if (esExterno && !filtrosCapas.circulosIndeci) return;
      if (esInterno && !filtrosCapas.puntosFamiliares) return;
      if (esComunitario && !filtrosCapas.puntosComunitarios) return;

      const isSelected = puntoSeleccionadoId === p.id;
      const color = esExterno ? '#16a34a' : esInterno ? '#d97706' : '#0284c7';

      if (esExterno) {
        L.circle([p.coordenadas.lat, p.coordenadas.lng], {
          radius: 4.5,
          color: '#15803d',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 0.35
        }).addTo(layerGroup);
      }

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
      marker.on('click', e => {
        L.DomEvent.stopPropagation(e);
        onSelectPunto?.(p);
      });

      marker.bindTooltip(`<b>${p.nombre}</b><br><span style="font-size:10px">${p.descripcion}</span>`, {
        direction: 'top',
        offset: [0, -10]
      });

      marker.addTo(layerGroup);
    });

    // 3. Marcador de Posición del Usuario
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

  return (
    <div className="space-y-3" data-testid="leaflet-map-view">
      {/* 1. Barra Informativa de Estado Offline y Cobertura */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {distritoDetectado ? distritoDetectado.nombre : 'Arequipa - Campus UNSA Ingenierías'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                100% Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {Object.values(downloadedDistricts).filter(Boolean).length} de {DISTRITOS_PERU.length} zonas distritales disponibles en dispositivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sin solicitudes de red externas</span>
          </div>
        </div>
      </div>

      {/* 2. Notificación flotante de estado de descarga */}
      {mensajeDescarga && (
        <div
          className="text-xs p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 shadow-xs transition-all animate-fade-in"
          data-testid="banner-estado-descarga"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeDescarga}</span>
        </div>
      )}

      {/* 3. Popup Modal de Detección de Ubicación Actual */}
      {mostrarPopupDeteccion && distritoDetectado && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          data-testid="popup-deteccion-distrito"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Zona No Descargada Detectada</h3>
                <p className="text-xs text-slate-500">Tu GPS indica que te encuentras en:</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-xs font-bold text-slate-800">{distritoDetectado.nombre}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Paquete offline comprimido: <strong>~{distritoDetectado.tamanoAproxMB} MB</strong>
              </p>
            </div>

            <p className="text-xs text-slate-600">
              ¿Deseas descargar el mapa de este distrito ahora para que esté disponible sin conexión ante un sismo?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMostrarPopupDeteccion(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Más tarde
              </button>
              <button
                onClick={() => handleConfirmarDescarga(distritoDetectado)}
                disabled={descargandoZona}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                data-testid="btn-confirmar-descarga-deteccion"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{descargandoZona ? 'Descargando...' : 'Descargar Zona'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal de Click en Límite / Zona No Descargada */}
      {zonaSeleccionadaParaDescarga && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          data-testid="modal-descarga-zona"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Descargar Cuadrante Distrital</h3>
                <p className="text-xs text-slate-500">Has seleccionado una zona fuera de tu cobertura actual</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-xs font-bold text-slate-800">{zonaSeleccionadaParaDescarga.nombre}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Paquete offline: <strong>~{zonaSeleccionadaParaDescarga.tamanoAproxMB} MB</strong> · Zoom 14 a 17
              </p>
            </div>

            <p className="text-xs text-slate-600">
              Al descargar esta zona, quedará almacenada permanentemente en tu dispositivo para navegarla libremente sin internet.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setZonaSeleccionadaParaDescarga(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmarDescarga(zonaSeleccionadaParaDescarga)}
                disabled={descargandoZona}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                data-testid="btn-confirmar-descarga-zona"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{descargandoZona ? 'Descargando...' : 'Descargar y Ver'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={containerRef} className="w-full h-full" data-testid="leaflet-container" />
      </div>
    </div>
  );
};
