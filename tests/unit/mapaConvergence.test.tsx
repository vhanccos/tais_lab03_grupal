import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  computeAdaptiveBounds,
  unprojectSvgToGeo,
  projectGeoToSvg,
  DEFAULT_LIMA_BOUNDS
} from '../../src/core/geoMath';
import { SvgMapCanvas, DEFAULT_LAYER_FILTERS } from '../../src/components/mapa/SvgMapCanvas';
import { MapaView } from '../../src/components/mapa/MapaView';
import { PuntoEncuentro } from '../../src/storage/stateTypes';

describe('Feature 002 Convergence: Dynamic Geofencing, Tap-to-Add, Direct Corridor & Heading', () => {
  it('T016: computeAdaptiveBounds expands bounding box to enclose remote coordinates with padding', () => {
    const userPos = { lat: -12.120, lng: -77.030 }; // Miraflores
    const points: PuntoEncuentro[] = [
      {
        id: 'pto-sur',
        nombre: 'Zona Sur',
        tipo: 'externo',
        descripcion: 'Parque Kennedy',
        coordenadas: { lat: -12.122, lng: -77.028 }
      }
    ];

    const bounds = computeAdaptiveBounds(userPos, points, 0.2);

    expect(bounds.minLat).toBeLessThan(-12.122);
    expect(bounds.maxLat).toBeGreaterThan(-12.120);
    expect(bounds.minLng).toBeLessThan(-77.030);
    expect(bounds.maxLng).toBeGreaterThan(-77.028);
  });

  it('T016: unprojectSvgToGeo correctly inverses projectGeoToSvg', () => {
    const bounds = DEFAULT_LIMA_BOUNDS;
    const originGeo = { lat: -12.046374, lng: -77.042793 };

    const svgPt = projectGeoToSvg(originGeo, bounds, 800, 600);
    const roundtripGeo = unprojectSvgToGeo(svgPt, bounds, 800, 600);

    expect(roundtripGeo.lat).toBeCloseTo(originGeo.lat, 5);
    expect(roundtripGeo.lng).toBeCloseTo(originGeo.lng, 5);
  });

  it('T018 & T019: SvgMapCanvas renders direct escape corridor and compass heading beam', () => {
    const userCoords = { lat: -12.046374, lng: -77.042793 };
    const nearestPoint: PuntoEncuentro = {
      id: 'pto-cercano',
      nombre: 'Punto Cercano INDECI',
      tipo: 'externo',
      descripcion: 'Refugio más cercano',
      coordenadas: { lat: -12.048, lng: -77.045 }
    };

    render(
      <SvgMapCanvas
        userCoords={userCoords}
        puntos={[nearestPoint]}
        heading={135}
        puntoMasCercano={nearestPoint}
        filtrosCapas={{ ...DEFAULT_LAYER_FILTERS, corredorDirecto: true }}
      />
    );

    // Verify direct escape corridor line exists
    expect(screen.getByTestId('direct-escape-corridor')).toBeInTheDocument();

    // Verify compass heading cone is rendered with 135° rotation
    const headingGroup = screen.getByTestId('user-compass-heading');
    expect(headingGroup).toBeInTheDocument();
    expect(headingGroup).toHaveAttribute('transform', 'rotate(135)');
  });

  it('T020: Layers filter menu toggles layer elements visibility', () => {
    render(<MapaView />);

    // Toggle menu
    const btnCapas = screen.getByTestId('btn-toggle-layers-menu');
    fireEvent.click(btnCapas);

    expect(screen.getByTestId('layers-filter-menu')).toBeInTheDocument();
    expect(screen.getByText('Círculos INDECI (4.5m)')).toBeInTheDocument();
    expect(screen.getByText('Corredor Directo de Escape')).toBeInTheDocument();
  });

  it('T017: Tap on SvgMapCanvas triggers Tap-to-Add modal with geographic coordinates', () => {
    render(<MapaView />);

    const svgCanvas = screen.getByTestId('svg-map-canvas');

    // Simulate clicking on the canvas
    fireEvent.mouseDown(svgCanvas, { clientX: 400, clientY: 300 });
    fireEvent.mouseUp(svgCanvas, { clientX: 400, clientY: 300 });

    // Modal should appear
    const modal = screen.getByTestId('modal-tap-punto');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Agregar Punto Seguro en Coordenada')).toBeInTheDocument();
    expect(modal).toHaveTextContent(/Lat:/);
    expect(modal).toHaveTextContent(/Lng:/);
  });
});
