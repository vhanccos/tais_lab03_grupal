import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DISTRITOS_PERU, getTileCount, clearAllTiles } from '../../src/core/offlineMapManager';
import { LeafletMapView } from '../../src/components/mapa/LeafletMapView';
import { MapaView } from '../../src/components/mapa/MapaView';
import { DEFAULT_LAYER_FILTERS } from '../../src/components/mapa/SvgMapCanvas';

describe('Offline Maps with Leaflet & IndexedDB tile caching', () => {
  it('DISTRITOS_PERU contiene las zonas críticas de Arequipa (UNSA) y Lima', () => {
    const ids = DISTRITOS_PERU.map(d => d.id);
    expect(ids).toContain('arequipa-unsa');
    expect(ids).toContain('arequipa-cercado');
    expect(ids).toContain('lima-cercado');
    expect(ids).toContain('lima-miraflores');

    const unsa = DISTRITOS_PERU.find(d => d.id === 'arequipa-unsa');
    expect(unsa?.center).toEqual([-16.40643, -71.52533]);
    expect(unsa?.zoomMin).toBeGreaterThanOrEqual(14);
    expect(unsa?.zoomMax).toBeLessThanOrEqual(19);
  });

  it('permite consultar la cantidad de tiles almacenados y limpiar el almacenamiento', async () => {
    const count = await getTileCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);

    await clearAllTiles();
    const countAfter = await getTileCount();
    expect(countAfter).toBe(0);
  });

  it('renderiza LeafletMapView con el selector de distritos y botón de descarga', () => {
    render(
      <LeafletMapView
        userCoords={{ lat: -16.40643, lng: -71.52533 }}
        accuracy={15}
        heading={45}
        puntos={[
          {
            id: 'pt-unsa',
            nombre: 'Patio de Ingenierías UNSA',
            tipo: 'externo',
            descripcion: 'Círculo verde de seguridad INDECI',
            coordenadas: { lat: -16.40643, lng: -71.52533 }
          }
        ]}
        filtrosCapas={DEFAULT_LAYER_FILTERS}
      />
    );

    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.getByTestId('select-distrito-offline')).toBeInTheDocument();
    expect(screen.getByTestId('btn-descargar-distrito')).toBeInTheDocument();
    expect(screen.getByText('Descargador de Mapas Distritales Offline')).toBeInTheDocument();
  });

  it('permite alternar entre el motor OpenStreetMap Offline y Plano Vectorial en MapaView', () => {
    render(<MapaView initialMotor="svg" />);

    // Inicia en SVG
    expect(screen.getByTestId('svg-map-canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('leaflet-map-view')).not.toBeInTheDocument();

    // Cambiar a OSM
    const btnOsm = screen.getByTestId('btn-motor-osm');
    fireEvent.click(btnOsm);

    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.queryByTestId('svg-map-canvas')).not.toBeInTheDocument();

    // Cambiar de vuelta a SVG
    const btnSvg = screen.getByTestId('btn-motor-svg');
    fireEvent.click(btnSvg);

    expect(screen.getByTestId('svg-map-canvas')).toBeInTheDocument();
  });
});
