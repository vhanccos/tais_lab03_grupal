import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DISTRITOS_PERU,
  TILE_BOUNDS_UNSA,
  hasLocalTile,
  getLocalTileUrl,
  getTileCount,
  clearAllTiles
} from '../../src/core/offlineMapManager';
import { LeafletMapView } from '../../src/components/mapa/LeafletMapView';
import { MapaView } from '../../src/components/mapa/MapaView';
import { DEFAULT_LAYER_FILTERS } from '../../src/components/mapa/SvgMapCanvas';

describe('Offline OpenStreetMap Tile Engine (UNSA / Arequipa)', () => {
  it('DISTRITOS_PERU contiene el distrito predeterminado de Arequipa Campus UNSA Ingenierías', () => {
    expect(DISTRITOS_PERU.length).toBe(1);
    const unsa = DISTRITOS_PERU[0];
    expect(unsa.id).toBe('arequipa-unsa');
    expect(unsa.isDefault).toBe(true);
    expect(unsa.center).toEqual([-16.40643, -71.52533]);
  });

  it('TILE_BOUNDS_UNSA delimita la cobertura física exacta de las teselas locales', () => {
    expect(TILE_BOUNDS_UNSA.south).toBeLessThan(TILE_BOUNDS_UNSA.north);
    expect(TILE_BOUNDS_UNSA.west).toBeLessThan(TILE_BOUNDS_UNSA.east);
    expect(TILE_BOUNDS_UNSA.zoomMin).toBe(14);
    expect(TILE_BOUNDS_UNSA.zoomMax).toBe(18);
  });

  it('hasLocalTile y getLocalTileUrl identifican correctamente las teselas precargadas locales', () => {
    // Teselas existentes en el campus (ej. zoom 14, 15, 16)
    expect(hasLocalTile(14, 4936, 8948)).toBe(true);
    expect(getLocalTileUrl(14, 4936, 8948)).toBe('/tiles/14/4936/8948.png');

    // Tesela inexistente (fuera del área de cobertura)
    expect(hasLocalTile(14, 0, 0)).toBe(false);
    expect(getLocalTileUrl(14, 0, 0)).toBeNull();
  });

  it('getTileCount reporta las 169 teselas precargadas y clearAllTiles funciona sin error', async () => {
    const count = await getTileCount();
    expect(count).toBe(169);

    await clearAllTiles();
  });

  it('LeafletMapView monta directamente el motor con 0 peticiones externas', () => {
    render(
      <LeafletMapView
        userCoords={{ lat: -16.40643, lng: -71.52533 }}
        accuracy={15}
        heading={90}
        puntos={[
          {
            id: 'pt-1',
            nombre: 'Patio de Ingenierías',
            tipo: 'externo',
            descripcion: 'Círculo INDECI',
            coordenadas: { lat: -16.40643, lng: -71.52533 }
          }
        ]}
        filtrosCapas={DEFAULT_LAYER_FILTERS}
      />
    );

    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.getByTestId('leaflet-container')).toBeInTheDocument();
    expect(screen.getByText(/OpenStreetMap 100% Offline/i)).toBeInTheDocument();
    expect(screen.getByText(/0 peticiones externas/i)).toBeInTheDocument();
  });

  it('MapaView monta directamente el motor Leaflet sin llamadas de red no autorizadas', () => {
    render(<MapaView />);

    expect(screen.getByTestId('mapa-view')).toBeInTheDocument();
    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.getByText(/0 peticiones externas/i)).toBeInTheDocument();
  });
});
