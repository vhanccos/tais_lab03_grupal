import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  DISTRITOS_PERU,
  findDistrictByCoords,
  isDistrictDownloaded,
  markDistrictDownloaded,
  clearAllTiles
} from '../../src/core/offlineMapManager';
import { LeafletMapView } from '../../src/components/mapa/LeafletMapView';
import { MapaView } from '../../src/components/mapa/MapaView';
import { DEFAULT_LAYER_FILTERS } from '../../src/components/mapa/SvgMapCanvas';

describe('Offline Distrital Map Management (Detección GPS & Descarga On-Demand)', () => {
  it('DISTRITOS_PERU contiene las zonas configuradas de Arequipa y reconoce el distrito predeterminado (UNSA)', () => {
    expect(DISTRITOS_PERU.length).toBeGreaterThanOrEqual(4);
    const unsa = DISTRITOS_PERU.find(d => d.id === 'arequipa-unsa');
    expect(unsa).toBeDefined();
    expect(unsa?.isDefault).toBe(true);

    const plazaArmas = DISTRITOS_PERU.find(d => d.id === 'plaza-armas');
    expect(plazaArmas).toBeDefined();
    expect(plazaArmas?.tamanoAproxMB).toBeGreaterThan(0);
  });

  it('findDistrictByCoords detecta correctamente el distrito según la posición GPS', () => {
    // Coordenadas en campus UNSA Ingenierías
    const distritoUnsa = findDistrictByCoords(-16.40643, -71.52533);
    expect(distritoUnsa?.id).toBe('arequipa-unsa');

    // Coordenadas en Plaza de Armas de Arequipa
    const distritoPlaza = findDistrictByCoords(-16.39889, -71.53694);
    expect(distritoPlaza?.id).toBe('plaza-armas');

    // Coordenadas en el Océano Pacífico (fuera de cobertura)
    const distritoFuera = findDistrictByCoords(0, 0);
    expect(distritoFuera).toBeNull();
  });

  it('isDistrictDownloaded reporta el distrito base de UNSA como ya disponible y permite marcar otros', async () => {
    const unsaDescargado = await isDistrictDownloaded('arequipa-unsa');
    expect(unsaDescargado).toBe(true);

    await markDistrictDownloaded('plaza-armas');
    const plazaDescargado = await isDistrictDownloaded('plaza-armas');
    expect(plazaDescargado).toBe(true);

    await clearAllTiles();
  });

  it('muestra popup de confirmación de descarga si la ubicación detectada no está disponible', async () => {
    render(
      <LeafletMapView
        // Ubicación en Plaza de Armas (inicialmente no descargada)
        userCoords={{ lat: -16.39889, lng: -71.53694 }}
        accuracy={15}
        puntos={[]}
        filtrosCapas={DEFAULT_LAYER_FILTERS}
      />
    );

    // Debe mostrar el modal de detección de zona no descargada
    await waitFor(() => {
      const popup = screen.getByTestId('popup-deteccion-distrito');
      expect(popup).toBeInTheDocument();
      expect(screen.getByText(/Zona No Descargada Detectada/i)).toBeInTheDocument();
      expect(popup).toHaveTextContent(/Arequipa - Centro Histórico/i);
    });

    // Confirmar descarga
    const btnDescargar = screen.getByTestId('btn-confirmar-descarga-deteccion');
    fireEvent.click(btnDescargar);

    // Debe mostrar notificación de completado y cerrar el modal
    await waitFor(() => {
      expect(screen.getByTestId('banner-estado-descarga')).toBeInTheDocument();
    });
  });

  it('MapaView monta directamente el motor Leaflet sin llamadas de red no autorizadas', () => {
    render(<MapaView />);

    expect(screen.getByTestId('mapa-view')).toBeInTheDocument();
    expect(screen.getByTestId('leaflet-map-view')).toBeInTheDocument();
    expect(screen.getByText(/Sin solicitudes de red externas/i)).toBeInTheDocument();
  });
});
