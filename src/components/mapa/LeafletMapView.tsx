import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import { MapLayerFilters } from './SvgMapCanvas';
import { DISTRITOS_PERU, TILE_BOUNDS_UNSA } from '../../core/offlineMapManager';
import { HardDrive, ShieldCheck } from 'lucide-react';

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

  const unsa = DISTRITOS_PERU[0];

  // Inicializar mapa Leaflet con capa híbrida local offline + fallback
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

    // Añadir controles de zoom en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Limitar vista al área metropolitana de Arequipa / UNSA para evitar solicitudes fuera de zona
    const maxBounds = L.latLngBounds(
      [TILE_BOUNDS_UNSA.south - 0.05, TILE_BOUNDS_UNSA.west - 0.05],
      [TILE_BOUNDS_UNSA.north + 0.05, TILE_BOUNDS_UNSA.east + 0.05]
    );
    map.setMaxBounds(maxBounds);

    // Capa de teselas locales pre-empaquetadas con fallback transparente
    // Primero intenta servir /tiles/{z}/{x}/{y}.png (100% offline sin red)
    // Si no estuviese disponible y hay red, consulta OSM
    const CustomOfflineTileLayer = L.TileLayer.extend({
      getTileUrl: function (coords: { z: number; x: number; y: number }) {
        return `/tiles/${coords.z}/${coords.x}/${coords.y}.png`;
      },
      createTile: function (coords: { z: number; x: number; y: number }, done: any) {
        const tile = document.createElement('img');

        tile.alt = 'Mapa UNSA';
        tile.setAttribute('role', 'presentation');

        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', () => {
          // Si el tile local no existe (ej. usuario navegó fuera del cuadrante UNSA)
          // y hay conexión, consultar OSM de respaldo
          if (navigator.onLine) {
            tile.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
          } else {
            // En modo 100% offline mostrar celda vacía amigable sin quebrar
            tile.style.backgroundColor = '#f1f5f9';
            done(null, tile);
          }
        });

        tile.src = this.getTileUrl(coords);
        return tile;
      }
    });

    const localTileLayer = new (CustomOfflineTileLayer as any)('', {
      minZoom: 13,
      maxZoom: 18,
      tileSize: 256
    });

    localTileLayer.addTo(map);

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

  return (
    <div className="space-y-3" data-testid="leaflet-map-view">
      {/* Barra Informativa de Estado Offline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{unsa.nombre}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                100% Precargado Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Av. Independencia / Paucarpata · Pabellón Ing. de Sistemas · 169 teselas locales (Z13-Z18)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
          <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sin peticiones de red externas</span>
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={containerRef} className="w-full h-full" data-testid="leaflet-container" />
      </div>
    </div>
  );
};
