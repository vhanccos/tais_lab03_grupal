import React from 'react';
import { PuntoEncuentro } from '../../storage/stateTypes';
import { BoundsGeo, projectGeoToSvg } from '../../core/geoMath';

interface SafeZonesOverlayProps {
  puntos: PuntoEncuentro[];
  bounds: BoundsGeo;
  svgWidth: number;
  svgHeight: number;
  puntoSeleccionadoId?: string | null;
  onSelectPunto?: (punto: PuntoEncuentro) => void;
}

export const SafeZonesOverlay: React.FC<SafeZonesOverlayProps> = ({
  puntos,
  bounds,
  svgWidth,
  svgHeight,
  puntoSeleccionadoId,
  onSelectPunto
}) => {
  return (
    <g className="safe-zones-overlay" data-testid="safe-zones-overlay">
      {puntos.map(punto => {
        let x = svgWidth / 2;
        let y = svgHeight / 2;

        if (punto.coordenadas && typeof punto.coordenadas.lat === 'number') {
          const pt = projectGeoToSvg(punto.coordenadas, bounds, svgWidth, svgHeight);
          x = pt.x;
          y = pt.y;
        } else if (punto.svgCoords) {
          x = punto.svgCoords.x;
          y = punto.svgCoords.y;
        }

        const isSelected = puntoSeleccionadoId === punto.id;
        const isExterno = punto.tipo === 'externo';
        const isInterno = punto.tipo === 'interno';
        const isComunitario = punto.tipo === 'comunitario';

        // Styling based on INDECI standard color codes
        // Verde (#22c55e) for external safety circles (círculos de seguridad 4.5m)
        // Azul (#0284c7) for community rendezvous points
        // Ámbar (#f59e0b) for internal structural shear wall safe zones
        const baseColor = isExterno
          ? '#22c55e'
          : isInterno
          ? '#f59e0b'
          : isComunitario
          ? '#0284c7'
          : '#10b981';

        const strokeColor = isExterno
          ? '#15803d'
          : isInterno
          ? '#b45309'
          : isComunitario
          ? '#0369a1'
          : '#047857';

        return (
          <g
            key={punto.id}
            transform={`translate(${x}, ${y})`}
            className="cursor-pointer transition-transform duration-200 hover:scale-110"
            onClick={() => onSelectPunto?.(punto)}
            data-testid={`marker-punto-${punto.id}`}
            role="button"
            tabIndex={0}
            aria-label={`${punto.nombre} - ${punto.tipo}`}
          >
            {/* Selection highlight ring */}
            {isSelected && (
              <circle
                r="30"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="4 3"
                className="animate-spin"
                style={{ transformOrigin: 'center' }}
              />
            )}

            {/* External INDECI Safety Circle (4.5m diameter to scale, marked with 'S') */}
            {isExterno ? (
              <>
                {/* Outer halo */}
                <circle
                  r="24"
                  fill="#22c55e"
                  fillOpacity="0.25"
                  className="animate-pulse"
                />
                {/* Solid 4.5m INDECI circle */}
                <circle
                  r="18"
                  fill={baseColor}
                  stroke={strokeColor}
                  strokeWidth="2.5"
                />
                {/* White concentric safety boundary */}
                <circle
                  r="13"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                {/* INDECI 'S' emblem (Seguridad) */}
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  S
                </text>
              </>
            ) : isInterno ? (
              <>
                {/* Internal structural safe point: column / shear wall symbol */}
                <circle
                  r="16"
                  fill={baseColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                <rect
                  x="-6"
                  y="-6"
                  width="12"
                  height="12"
                  fill="#ffffff"
                  rx="1"
                />
                <rect
                  x="-3"
                  y="-3"
                  width="6"
                  height="6"
                  fill={baseColor}
                  rx="0.5"
                />
              </>
            ) : (
              <>
                {/* Community rendezvous point / park */}
                <circle
                  r="18"
                  fill={baseColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                <polygon
                  points="0,-8 7,7 -7,7"
                  fill="#ffffff"
                />
              </>
            )}

            {/* Label banner */}
            <g transform="translate(0, 26)">
              <rect
                x="-55"
                y="-10"
                width="110"
                height="18"
                rx="4"
                fill="#0f172a"
                fillOpacity="0.85"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {punto.nombre.length > 16 ? `${punto.nombre.slice(0, 15)}…` : punto.nombre}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
