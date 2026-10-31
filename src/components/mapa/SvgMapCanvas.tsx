import React, { useRef, useState, useCallback } from 'react';
import { CoordenadaGeo, PuntoEncuentro } from '../../storage/stateTypes';
import {
  BoundsGeo,
  DEFAULT_LIMA_BOUNDS,
  projectGeoToSvg
} from '../../core/geoMath';
import { SafeZonesOverlay } from './SafeZonesOverlay';

interface SvgMapCanvasProps {
  userCoords: CoordenadaGeo;
  accuracy?: number | null;
  puntos: PuntoEncuentro[];
  bounds?: BoundsGeo;
  zoom?: number;
  pan?: { x: number; y: number };
  onPanChange?: (pan: { x: number; y: number }) => void;
  puntoSeleccionadoId?: string | null;
  onSelectPunto?: (punto: PuntoEncuentro) => void;
  mostrarRutasEvacuacion?: boolean;
}

const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;

export const SvgMapCanvas: React.FC<SvgMapCanvasProps> = ({
  userCoords,
  accuracy = 15,
  puntos,
  bounds = DEFAULT_LIMA_BOUNDS,
  zoom = 1,
  pan = { x: 0, y: 0 },
  onPanChange,
  puntoSeleccionadoId,
  onSelectPunto,
  mostrarRutasEvacuacion = true
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map user coordinates to SVG canvas plane
  const userSvg = projectGeoToSvg(userCoords, bounds, SVG_WIDTH, SVG_HEIGHT);

  // Scaled accuracy radius (pixels) based on meters and latitude span
  const latSpanMeters = (bounds.maxLat - bounds.minLat) * 111139;
  const pixelsPerMeter = SVG_HEIGHT / latSpanMeters;
  const accuracyRadiusPx = Math.max(16, Math.min(60, (accuracy ?? 15) * pixelsPerMeter));

  // Drag handlers for interactive panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onPanChange?.({ x: newX, y: newY });
    },
    [isDragging, dragStart, onPanChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y
        });
      }
    },
    [pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      onPanChange?.({ x: newX, y: newY });
    },
    [isDragging, dragStart, onPanChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner select-none touch-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={`w-full h-auto cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid="svg-map-canvas"
      >
        <defs>
          {/* Arrow marker for evacuation routes */}
          <marker
            id="evac-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#15803d" />
          </marker>

          {/* Grid pattern for background texture */}
          <pattern id="urban-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Dynamic Zoom & Pan Container */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Ground surface */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#f8fafc" />
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#urban-grid)" />

          {/* 1. Urban Blocks / Manzanas (Lima District layout) */}
          <g className="manzanas-urbanas" opacity="0.9">
            {/* Sector 1: Norte (Cercado norte / Rímac) */}
            <rect x="40" y="30" width="140" height="90" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="200" y="30" width="160" height="90" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="380" y="30" width="170" height="90" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="570" y="30" width="180" height="90" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

            {/* Sector 2: Centro Histórico / Damero */}
            <rect x="40" y="150" width="140" height="110" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="200" y="150" width="160" height="110" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="380" y="150" width="170" height="110" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="570" y="150" width="180" height="110" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

            {/* Sector 3: Centro Sur */}
            <rect x="40" y="290" width="140" height="120" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="200" y="290" width="160" height="120" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="380" y="290" width="170" height="120" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="570" y="290" width="180" height="120" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

            {/* Sector 4: Sur (Avenidas troncales) */}
            <rect x="40" y="440" width="140" height="130" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="200" y="440" width="160" height="130" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="380" y="440" width="170" height="130" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="570" y="440" width="180" height="130" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          </g>

          {/* 2. Parques y Zonas Verdes Despejadas (Zonas de refugio) */}
          <g className="areas-verdes">
            {/* Parque de la Muralla / Alameda */}
            <rect x="380" y="40" width="150" height="70" rx="6" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
            <text x="455" y="75" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="bold">Parque de la Muralla</text>

            {/* Plaza Mayor de Lima (Zona de seguridad abierta) */}
            <rect x="220" y="165" width="120" height="80" rx="6" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
            <text x="280" y="210" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="bold">Plaza Mayor</text>

            {/* Parque Universitario / Losa */}
            <rect x="400" y="305" width="130" height="90" rx="6" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
            <text x="465" y="355" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="bold">Parque Universitario</text>

            {/* Campo Deportivo Sur */}
            <rect x="60" y="455" width="100" height="100" rx="6" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
            <text x="110" y="510" textAnchor="middle" fill="#166534" fontSize="9" fontWeight="bold">Losa Deportiva</text>
          </g>

          {/* 3. Red Vial (Avenidas principales y corredores anchos) */}
          <g className="red-vial">
            {/* Avenidas Horizontales */}
            <line x1="0" y1="135" x2={SVG_WIDTH} y2="135" stroke="#ffffff" strokeWidth="18" />
            <line x1="0" y1="135" x2={SVG_WIDTH} y2="135" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" />
            <text x="20" y="132" fill="#64748b" fontSize="8" fontWeight="600">JR. CONDE DE SUPERUNDA</text>

            <line x1="0" y1="275" x2={SVG_WIDTH} y2="275" stroke="#ffffff" strokeWidth="22" />
            <line x1="0" y1="275" x2={SVG_WIDTH} y2="275" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4" />
            <text x="20" y="271" fill="#64748b" fontSize="9" fontWeight="bold">AV. EMBER-NICOLÁS DE PIÉROLA (COLMENA)</text>

            <line x1="0" y1="425" x2={SVG_WIDTH} y2="425" stroke="#ffffff" strokeWidth="20" />
            <line x1="0" y1="425" x2={SVG_WIDTH} y2="425" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4" />
            <text x="20" y="421" fill="#64748b" fontSize="8" fontWeight="600">AV. GRAU / EXPANSIÓN</text>

            {/* Avenidas Verticales */}
            <line x1="190" y1="0" x2="190" y2={SVG_HEIGHT} stroke="#ffffff" strokeWidth="20" />
            <line x1="190" y1="0" x2="190" y2={SVG_HEIGHT} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4" />
            <text x="187" y="580" fill="#64748b" fontSize="9" fontWeight="bold" transform="rotate(-90, 187, 580)">AV. TACNA</text>

            <line x1="370" y1="0" x2="370" y2={SVG_HEIGHT} stroke="#ffffff" strokeWidth="22" />
            <line x1="370" y1="0" x2="370" y2={SVG_HEIGHT} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4" />
            <text x="367" y="580" fill="#64748b" fontSize="9" fontWeight="bold" transform="rotate(-90, 367, 580)">JR. DE LA UNIÓN</text>

            <line x1="560" y1="0" x2="560" y2={SVG_HEIGHT} stroke="#ffffff" strokeWidth="24" />
            <line x1="560" y1="0" x2="560" y2={SVG_HEIGHT} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4" />
            <text x="557" y="580" fill="#64748b" fontSize="9" fontWeight="bold" transform="rotate(-90, 557, 580)">AV. ABANCAY</text>
          </g>

          {/* 4. Rutas de Evacuación Seguras Peatonales (INDECI / NTP 399.010-1) */}
          {mostrarRutasEvacuacion && (
            <g className="rutas-evacuacion" opacity="0.85">
              {/* Ruta Norte hacia Plaza Mayor */}
              <path
                d="M 190 275 L 190 210 L 220 210"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeDasharray="6 4"
                markerEnd="url(#evac-arrow)"
              />
              {/* Ruta Este hacia Parque de la Muralla */}
              <path
                d="M 370 135 L 370 75 L 380 75"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeDasharray="6 4"
                markerEnd="url(#evac-arrow)"
              />
              {/* Ruta Sur hacia Parque Universitario */}
              <path
                d="M 370 425 L 370 355 L 400 355"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeDasharray="6 4"
                markerEnd="url(#evac-arrow)"
              />
            </g>
          )}

          {/* 5. Safe Zones Layer (Círculos INDECI y Puntos Familiares) */}
          <SafeZonesOverlay
            puntos={puntos}
            bounds={bounds}
            svgWidth={SVG_WIDTH}
            svgHeight={SVG_HEIGHT}
            puntoSeleccionadoId={puntoSeleccionadoId}
            onSelectPunto={onSelectPunto}
          />

          {/* 6. User GPS Location Marker with Pulsating Dot & Accuracy Halo */}
          <g
            transform={`translate(${userSvg.x}, ${userSvg.y})`}
            data-testid="user-gps-marker"
          >
            {/* Accuracy uncertainty radius circle */}
            <circle
              r={accuracyRadiusPx}
              fill="#3b82f6"
              fillOpacity="0.18"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Pulsating animated outer wave */}
            <circle
              r="22"
              fill="#3b82f6"
              fillOpacity="0.4"
              data-testid="user-gps-pulse"
            >
              <animate
                attributeName="r"
                values="14;28;14"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Solid GPS Core */}
            <circle
              r="9"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
            />
            <circle r="3" fill="#ffffff" />

            {/* Tooltip badge */}
            <g transform="translate(0, -20)">
              <rect
                x="-42"
                y="-12"
                width="84"
                height="16"
                rx="4"
                fill="#1e293b"
                fillOpacity="0.9"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                Tu Posición
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
