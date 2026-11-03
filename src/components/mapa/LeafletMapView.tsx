import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import { MapLayerFilters } from './SvgMapCanvas';
import { DISTRITOS_PERU, TILE_BOUNDS_UNSA, hasLocalTile } from '../../core/offlineMapManager';
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

  // Inicializar mapa Leaflet con teselas locales OpenStreetMap 100% offline
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Crear mapa centrado en UNSA
    const map = L.map(containerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 16,
      minZoom: 14,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      // Límites físicos estrictos: no permite desplazarse fuera del área precargada
      maxBoundsViscosity: 1.0
    });

    // Añadir controles de zoom en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Delimitar vista estrictamente a las coordenadas donde existen teselas
    const strictBounds = L.latLngBounds(
      [TILE_BOUNDS_UNSA.south, TILE_BOUNDS_UNSA.west],
      [TILE_BOUNDS_UNSA.north, TILE_BOUNDS_UNSA.east]
    );
    map.setMaxBounds(strictBounds);

    // Capa de teselas locales 100% OFFLINE (CERO peticiones a tile.openstreetmap.org)
    const OfflineLocalTileLayer = L.TileLayer.extend({
      getTileUrl: function (coords: { z: number; x: number; y: number }) {
        return `/tiles/${coords.z}/${coords.x}/${coords.y}.png`;
      },
      createTile: function (coords: { z: number; x: number; y: number }, done: any) {
        const tile = document.createElement('img');
        tile.alt = 'Mapa Local OSM';
        tile.setAttribute('role', 'presentation');

        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', () => {
          // Si por alguna razón la tesela no existe, pintar un fondo neutro sin consultar internet
          tile.style.backgroundColor = '#e2e8f0';
          done(null, tile);
        });

        // Solo solicitar si existe en el manifiesto precargado local
        if (hasLocalTile(coords.z, coords.x, coords.y)) {
          tile.src = this.getTileUrl(coords);
        } else {
          tile.style.backgroundColor = '#e2e8f0';
          done(null, tile);
        }

        return tile;
      }
    });

    const localTileLayer = new (OfflineLocalTileLayer as any)('', {
      minZoom: 14,
      maxZoom: 18,
      tileSize: 256,
      bounds: strictBounds
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
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    // 1. Dibujar Corredor Directo de Escape (T018) si está activo el filtro
    if (filtrosCapas.corredorDirecto && puntoMasCercano && puntoMasCercano.coordenadas) {
      const lineCoords: [number, number][] = [
        [userCoords.lat, userCoords.lng],
        [puntoMasCercano.coordenadas.lat, puntoMasCercano.coordenadas.lng]
      ];

      L.polyline(lineCoords, {
        color: '#2563eb',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(layerGroup);
    }

    // 2. Haz de Rumbo / Dirección Compass Heading (T019)
    if (heading !== null && heading !== undefined) {
      const rad = (heading * Math.PI) / 180;
      const dist = 0.0006;
      const headingCoords: [number, number][] = [
        [userCoords.lat, userCoords.lng],
        [userCoords.lat + dist * Math.cos(rad), userCoords.lng + dist * Math.sin(rad)]
      ];

      L.polyline(headingCoords, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7
      }).addTo(layerGroup);
    }

    // 3. Ubicación del usuario con círculo de precisión
    if (accuracy && accuracy > 0) {
      L.circle([userCoords.lat, userCoords.lng], {
        radius: Math.min(accuracy, 60),
        color: '#3b82f6',
        fillColor: '#93c5fd',
        fillOpacity: 0.25,
        weight: 1
      }).addTo(layerGroup);
    }

    // Marcador del usuario (Punto Azul pulsante)
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 18px;
          height: 18px;
          background-color: #2563eb;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(37,99,235,0.6);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .bindPopup('<b>Tu Ubicación</b><br>Campus UNSA Ingenierías')
      .addTo(layerGroup);

    // 4. Marcadores de Zonas Seguras y Círculos INDECI
    puntos.forEach(punto => {
      if (!punto || !punto.coordenadas) return;

      // Filtrar según tipo
      if (punto.tipo === 'interno' && !filtrosCapas.puntosFamiliares) return;
      if (punto.tipo === 'externo' && !filtrosCapas.puntosComunitarios) return;

      const esSeleccionado = puntoSeleccionadoId === punto.id;
      const esMasCercano = puntoMasCercano?.id === punto.id;

      // Círculo INDECI normativo de 4.5m (T016 / T020)
      if (filtrosCapas.circulosIndeci) {
        L.circle([punto.coordenadas.lat, punto.coordenadas.lng], {
          radius: 4.5, // 4.5 metros exactos INDECI
          color: esSeleccionado ? '#dc2626' : esMasCercano ? '#059669' : '#10b981',
          fillColor: '#34d399',
          fillOpacity: 0.4,
          weight: esSeleccionado ? 3 : 2
        }).addTo(layerGroup);
      }

      // Pin / Marcador del Punto de Encuentro
      const colorBg =
        punto.tipo === 'interno' ? '#f59e0b' : esMasCercano ? '#059669' : '#0284c7';
      const labelBadge = punto.tipo === 'interno' ? 'I' : 'S';

      const pinIcon = L.divIcon({
        className: 'custom-safe-pin',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background-color: ${colorBg};
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transform: ${esSeleccionado ? 'scale(1.2)' : 'scale(1)'};
            transition: transform 0.2s;
          ">
            ${labelBadge}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], {
        icon: pinIcon
      }).addTo(layerGroup);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #0f172a;">${punto.nombre}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">${punto.descripcion || 'Punto Seguro INDECI'}</span>
          ${esMasCercano ? '<div style="margin-top: 4px; color: #059669; font-weight: bold; font-size: 11px;">★ Zona Segura Más Cercana</div>' : ''}
        </div>
      `);

      marker.on('click', () => {
        onSelectPunto?.(punto);
      });
    });
  }, [
    userCoords.lat,
    userCoords.lng,
    accuracy,
    heading,
    puntos,
    puntoSeleccionadoId,
    puntoMasCercano,
    filtrosCapas,
    onSelectPunto
  ]);

  return (
    <div className="space-y-3" data-testid="leaflet-map-view">
      {/* Barra de estado: Mapa Local OpenStreetMap */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{unsa.nombre}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                OpenStreetMap 100% Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cartografía real precargada en dispositivo · Cero peticiones de red
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>0 peticiones externas</span>
          </div>
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={containerRef} className="w-full h-full" data-testid="leaflet-container" />
      </div>
    </div>
  );
};
