import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DISTRITOS_PERU, TILE_BOUNDS_UNSA, getTileCount, clearAllTiles } from '../../src/core/offlineMapManager';
import { LeafletMapView } from '../../src/components/mapa/LeafletMapView';
import { MapaView } from '../../src/components/mapa/MapaView';
import { DEFAULT_LAYER_FILTERS } from '../../src/components/mapa/SvgMapCanvas';

describe('Offline Maps with Leaflet & Prepackaged UNSA Tiles', () => {
  it('DISTRITOS_PERU contiene exclusivamente el distrito único: Arequipa - Campus UNSA Ingenierías / Cercado', () => {
    expect(DISTRITOS_PERU.length).toBe(1);
    const unsa = DISTRITOS_PERU[0];
    expect(unsa.id).toBe('arequipa-unsa');
    expect(unsa.nombre).toBe('Arequipa - Campus UNSA Ingenierías / Cercado');
    expect(unsa.center).toEqual([-16.40643, -71.52533]);
    expect(unsa.zoomMin).toBe(14);
    expect(unsa.zoomMax).toBe(18);

    expect(TILE_BOUNDS_UNSA.south).toBe(-16.4150);
    expect(TILE_BOUNDS_UNSA.west).toBe(-71.5350);
  });

  it('permite consultar la cantidad de tiles y limpiar el almacenamiento localforage si se requiere', async () => {
    const count = await getTileCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);

    await clearAllTiles();
    const countAfter = await getTileCount();
    expect(countAfter).toBe(0);
  });

  it('renderiza LeafletMapView como motor único con insignia de 100% Precargado Offline', () => {
    render(
      <LeafletMapView
        userCoords={{ lat: -16.40643, lng: -71.52533 }}
        accuracy={15}
        heading={45}
        puntos={[
          {
            id: 'pt-unsa',
            nombre: 'Pabellón Ing. de Sistemas UNSA',
            tipo: 'externo',
            descripcion: 'Círculo verde de seguridad INDECI',
            coordenadas: { lat: -16.40643, lng: -71.52533 }
          }
        ]}
        filtrosCapas={DEFAULT_LAYER_FILTERS}
      />
    );

    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.getByTestId('leaflet-container')).toBeInTheDocument();
    expect(screen.getByText('100% Precargado Offline')).toBeInTheDocument();
    expect(screen.getByText(/Sin peticiones de red externas/i)).toBeInTheDocument();
  });

  it('MapaView monta directamente el motor único LeafletMapView sin necesidad de navegación previa', () => {
    render(<MapaView />);

    expect(screen.getByTestId('mapa-view')).toBeInTheDocument();
    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.queryByTestId('btn-motor-svg')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-motor-osm')).not.toBeInTheDocument();
  });
});
