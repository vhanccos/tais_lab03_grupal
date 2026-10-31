import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calcularDistanciaHaversine,
  calcularRumboAzimut,
  formatDistance,
  projectGeoToSvg,
  findNearestSafeZone,
  DEFAULT_LIMA_BOUNDS,
  DEFAULT_LIMA_CENTER
} from '../../src/core/geoMath';
import { useGeolocation } from '../../src/hooks/useGeolocation';
import { SvgMapCanvas } from '../../src/components/mapa/SvgMapCanvas';
import { SafeZonesOverlay } from '../../src/components/mapa/SafeZonesOverlay';
import { NearestPointRadar } from '../../src/components/mapa/NearestPointRadar';
import { MapaView } from '../../src/components/mapa/MapaView';
import { App } from '../../src/App';
import { PuntoEncuentro } from '../../src/storage/stateTypes';

describe('Feature 002: Mathematical Geolocation & Projection (geoMath)', () => {
  describe('calcularDistanciaHaversine', () => {
    it('debe retornar exactamente 0 metros cuando las coordenadas son idénticas', () => {
      const coord = { lat: -12.046374, lng: -77.042793 };
      const d = calcularDistanciaHaversine(coord, coord);
      expect(d).toBe(0);
    });

    it('debe calcular con precisión la distancia conocida entre Plaza Mayor y Campo de Marte en Lima (~2.5 km)', () => {
      const plazaMayor = { lat: -12.046374, lng: -77.042793 };
      const campoMarte = { lat: -12.069167, lng: -77.041667 };
      const d = calcularDistanciaHaversine(plazaMayor, campoMarte);

      // Distancia teórica aproximada ~2535 metros
      expect(d).toBeGreaterThan(2450);
      expect(d).toBeLessThan(2600);
    });

    it('debe calcular 1 grado de latitud en el ecuador con tolerancia esférica estándar (~111.19 km)', () => {
      const c1 = { lat: 0, lng: 0 };
      const c2 = { lat: 1, lng: 0 };
      const d = calcularDistanciaHaversine(c1, c2);

      // 1 grado en circunferencia de 6371km es 6371000 * 2 * pi / 360 = ~111,195 m
      expect(Math.abs(d - 111195)).toBeLessThan(100);
    });

    it('debe ser conmutativa (distancia de A a B igual a distancia de B a A)', () => {
      const p1 = { lat: -12.05, lng: -77.05 };
      const p2 = { lat: -12.10, lng: -77.02 };
      expect(calcularDistanciaHaversine(p1, p2)).toBeCloseTo(calcularDistanciaHaversine(p2, p1), 5);
    });
  });

  describe('calcularRumboAzimut', () => {
    it('debe retornar 0 grados cuando origen y destino son idénticos', () => {
      const pt = { lat: -12.046, lng: -77.042 };
      expect(calcularRumboAzimut(pt, pt)).toBe(0);
    });

    it('debe calcular correctamente los 4 cuadrantes cardinales (Norte 0°, Este 90°, Sur 180°, Oeste 270°)', () => {
      const origen = { lat: 0, lng: 0 };

      // Norte directo: incremento en latitud
      const norte = { lat: 1, lng: 0 };
      expect(calcularRumboAzimut(origen, norte)).toBe(0);

      // Este directo: incremento en longitud
      const este = { lat: 0, lng: 1 };
      expect(calcularRumboAzimut(origen, este)).toBe(90);

      // Sur directo: decremento en latitud
      const sur = { lat: -1, lng: 0 };
      expect(calcularRumboAzimut(origen, sur)).toBe(180);

      // Oeste directo: decremento en longitud
      const oeste = { lat: 0, lng: -1 };
      expect(calcularRumboAzimut(origen, oeste)).toBe(270);
    });

    it('debe calcular ángulos intercardinales correctamente (Noreste ~45°, Sureste ~135°)', () => {
      const origen = { lat: 0, lng: 0 };
      const noreste = { lat: 1, lng: 1 };
      const rumboNE = calcularRumboAzimut(origen, noreste);
      expect(rumboNE).toBeGreaterThan(44);
      expect(rumboNE).toBeLessThan(46);

      const sureste = { lat: -1, lng: 1 };
      const rumboSE = calcularRumboAzimut(origen, sureste);
      expect(rumboSE).toBeGreaterThan(134);
      expect(rumboSE).toBeLessThan(136);
    });
  });

  describe('formatDistance', () => {
    it('debe formatear distancias menores a 1000m en metros', () => {
      expect(formatDistance(0)).toBe('0 m');
      expect(formatDistance(-10)).toBe('0 m');
      expect(formatDistance(NaN)).toBe('0 m');
      expect(formatDistance(45.2)).toBe('45 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('debe formatear distancias de 1000m o más en kilómetros', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1250)).toBe('1.3 km');
      expect(formatDistance(9940)).toBe('9.9 km');
      expect(formatDistance(15200)).toBe('15 km');
    });
  });

  describe('projectGeoToSvg', () => {
    const bounds = {
      minLat: -12.10,
      maxLat: -12.00,
      minLng: -77.10,
      maxLng: -77.00
    };
    const W = 800;
    const H = 600;

    it('debe proyectar el centro geográfico en el centro del plano SVG (400, 300)', () => {
      const centerCoord = { lat: -12.05, lng: -77.05 };
      const pt = projectGeoToSvg(centerCoord, bounds, W, H);
      expect(pt.x).toBeCloseTo(400, 1);
      expect(pt.y).toBeCloseTo(300, 1);
    });

    it('debe proyectar el extremo noroeste (minLng, maxLat) en la esquina superior izquierda (0, 0)', () => {
      const nwCoord = { lat: -12.00, lng: -77.10 };
      const pt = projectGeoToSvg(nwCoord, bounds, W, H);
      expect(pt.x).toBeCloseTo(0, 1);
      expect(pt.y).toBeCloseTo(0, 1);
    });

    it('debe proyectar el extremo sureste (maxLng, minLat) en la esquina inferior derecha (800, 600)', () => {
      const seCoord = { lat: -12.10, lng: -77.00 };
      const pt = projectGeoToSvg(seCoord, bounds, W, H);
      expect(pt.x).toBeCloseTo(800, 1);
      expect(pt.y).toBeCloseTo(600, 1);
    });
  });

  describe('findNearestSafeZone', () => {
    const testPoints: PuntoEncuentro[] = [
      {
        id: 'p1',
        nombre: 'Punto Lejano',
        tipo: 'comunitario',
        descripcion: 'Lejos',
        coordenadas: { lat: -12.10, lng: -77.10 }
      },
      {
        id: 'p2',
        nombre: 'Punto Cercano',
        tipo: 'externo',
        descripcion: 'Cerca',
        coordenadas: { lat: -12.0464, lng: -77.0428 }
      },
      {
        id: 'p3-sin-coords',
        nombre: 'Punto sin coords',
        tipo: 'interno',
        descripcion: 'Sin coords'
      }
    ];

    it('debe identificar correctamente el punto con menor distancia y retornar info completa', () => {
      const user = { lat: -12.0463, lng: -77.0427 };
      const result = findNearestSafeZone(user, testPoints);

      expect(result).not.toBeNull();
      expect(result?.punto.id).toBe('p2');
      expect(result?.distanciaMetros).toBeLessThan(50);
      expect(typeof result?.rumboGrados).toBe('number');
      expect(result?.distanciaFormateada).toContain('m');
    });

    it('debe retornar null si la lista de puntos está vacía o sin coordenadas válidas', () => {
      expect(findNearestSafeZone({ lat: 0, lng: 0 }, [])).toBeNull();
      expect(
        findNearestSafeZone({ lat: 0, lng: 0 }, [
          { id: '1', nombre: 'X', tipo: 'interno', descripcion: 'Y' }
        ])
      ).toBeNull();
    });
  });
});

describe('Feature 002: Geolocation Hook (useGeolocation)', () => {
  let originalGeolocation: any;

  beforeEach(() => {
    originalGeolocation = navigator.geolocation;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true
    });
  });

  it('debe capturar exitosamente la posición satelital vía watchPosition', () => {
    let watchSuccessCallback: any;

    const mockGeolocation = {
      watchPosition: vi.fn((success) => {
        watchSuccessCallback = success;
        return 99;
      }),
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn()
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      watchSuccessCallback({
        coords: {
          latitude: -12.048,
          longitude: -77.043,
          accuracy: 12,
          altitude: 150,
          heading: 90,
          speed: 1.5
        },
        timestamp: 1600000000
      });
    });

    expect(result.current.coords.lat).toBe(-12.048);
    expect(result.current.coords.lng).toBe(-77.043);
    expect(result.current.accuracy).toBe(12);
    expect(result.current.cargando).toBe(false);
    expect(result.current.esUbicacionSimulada).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe activar coordenadas de respaldo de Lima y modo simulado ante PERMISSION_DENIED (código 1)', () => {
    let watchErrorCallback: any;

    const mockGeolocation = {
      watchPosition: vi.fn((_success, error) => {
        watchErrorCallback = error;
        return 101;
      }),
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn()
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      watchErrorCallback({
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation'
      });
    });

    expect(result.current.coords.lat).toBe(DEFAULT_LIMA_CENTER.lat);
    expect(result.current.coords.lng).toBe(DEFAULT_LIMA_CENTER.lng);
    expect(result.current.esUbicacionSimulada).toBe(true);
    expect(result.current.cargando).toBe(false);
    expect(result.current.error).toContain('denegado');
  });

  it('debe activar modo simulado ante POSITION_UNAVAILABLE (código 2)', () => {
    let watchErrorCallback: any;

    const mockGeolocation = {
      watchPosition: vi.fn((_success, error) => {
        watchErrorCallback = error;
        return 102;
      }),
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn()
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      watchErrorCallback({
        code: 2, // POSITION_UNAVAILABLE
        message: 'No GPS satellites'
      });
    });

    expect(result.current.esUbicacionSimulada).toBe(true);
    expect(result.current.error).toContain('no disponible');
  });

  it('debe manejar graciosamente la ausencia de navigator.geolocation en entornos restringidos', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.coords.lat).toBe(DEFAULT_LIMA_CENTER.lat);
    expect(result.current.esUbicacionSimulada).toBe(true);
    expect(result.current.error).toContain('no soportada');
  });
});

describe('Feature 002: SVG Map Canvas & Safe Zones Overlay Components', () => {
  const puntosPrueba: PuntoEncuentro[] = [
    {
      id: 'p-indeci',
      nombre: 'Círculo Seguridad INDECI Parque',
      tipo: 'externo',
      descripcion: 'Círculo de seguridad de 4.5m libre de cables',
      coordenadas: { lat: -12.046374, lng: -77.042793 },
      esPredeterminado: true
    },
    {
      id: 'p-interno',
      nombre: 'Columna Estructural Pasadizo',
      tipo: 'interno',
      descripcion: 'Placa de concreto armado sismorresistente',
      svgCoords: { x: 150, y: 150 },
      esPredeterminado: true
    }
  ];

  it('SvgMapCanvas debe renderizar el elemento SVG con viewBox, manzanas, calles y marcador de usuario', () => {
    render(
      <SvgMapCanvas
        userCoords={DEFAULT_LIMA_CENTER}
        accuracy={15}
        puntos={puntosPrueba}
        bounds={DEFAULT_LIMA_BOUNDS}
        zoom={1}
        pan={{ x: 0, y: 0 }}
      />
    );

    const svg = screen.getByTestId('svg-map-canvas');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 800 600');

    // Marker GPS
    expect(screen.getByTestId('user-gps-marker')).toBeInTheDocument();
    expect(screen.getByTestId('user-gps-pulse')).toBeInTheDocument();

    // Check street labels and parks
    expect(screen.getByText('Plaza Mayor')).toBeInTheDocument();
    expect(screen.getByText('JR. CONDE DE SUPERUNDA')).toBeInTheDocument();
  });

  it('SafeZonesOverlay debe renderizar los círculos de seguridad INDECI e invocar onSelectPunto al hacer clic', () => {
    const handleSelect = vi.fn();

    render(
      <svg>
        <SafeZonesOverlay
          puntos={puntosPrueba}
          bounds={DEFAULT_LIMA_BOUNDS}
          svgWidth={800}
          svgHeight={600}
          onSelectPunto={handleSelect}
        />
      </svg>
    );

    expect(screen.getByTestId('safe-zones-overlay')).toBeInTheDocument();
    const markerIndeci = screen.getByTestId('marker-punto-p-indeci');
    expect(markerIndeci).toBeInTheDocument();

    // S emblem inside circle
    expect(screen.getByText('S')).toBeInTheDocument();

    fireEvent.click(markerIndeci);
    expect(handleSelect).toHaveBeenCalledWith(puntosPrueba[0]);
  });
});

describe('Feature 002: NearestPointRadar Component', () => {
  const puntosPrueba: PuntoEncuentro[] = [
    {
      id: 'pt-1',
      nombre: 'Zona Segura Plaza San Martín',
      tipo: 'externo',
      descripcion: 'Área despejada central',
      coordenadas: { lat: -12.0515, lng: -77.0345 }
    },
    {
      id: 'pt-2',
      nombre: 'Círculo INDECI Plaza Mayor',
      tipo: 'externo',
      descripcion: 'Círculo oficial 4.5m',
      coordenadas: { lat: -12.046374, lng: -77.042793 }
    }
  ];

  it('debe calcular la zona segura más próxima y renderizar la flecha direccional', () => {
    // Usuario ubicado exactamente en Plaza Mayor
    const user = { lat: -12.046374, lng: -77.042793 };

    render(
      <NearestPointRadar
        userCoords={user}
        puntos={puntosPrueba}
      />
    );

    const radar = screen.getByTestId('nearest-point-radar');
    expect(radar).toBeInTheDocument();

    // Target point name should be Plaza Mayor
    expect(screen.getByTestId('radar-point-name')).toHaveTextContent('Círculo INDECI Plaza Mayor');

    // Distance should be 0 m
    expect(screen.getByTestId('radar-distance')).toHaveTextContent('0 m');

    // Arrival confirmation should be visible since distance < 5m
    expect(screen.getByText('Llegada confirmada')).toBeInTheDocument();
  });

  it('debe actualizar el ángulo de la flecha cuando el destino se encuentra al Este', () => {
    // Usuario al oeste de la zona segura
    const user = { lat: -12.0515, lng: -77.0400 };

    render(
      <NearestPointRadar
        userCoords={user}
        puntos={[puntosPrueba[0]]}
      />
    );

    const arrow = screen.getByTestId('radar-bearing-arrow');
    expect(arrow).toBeInTheDocument();
    // Destination is approx East (80°-100°)
    expect(arrow.getAttribute('style')).toContain('rotate');
  });
});

describe('Feature 002: MapaView Coordinator & Navigation Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe montar MapaView con controles de zoom, insignias de estado y lista de zonas', () => {
    render(<MapaView />);

    expect(screen.getByTestId('mapa-view')).toBeInTheDocument();
    expect(screen.getByTestId('gps-status-badge')).toBeInTheDocument();
    expect(screen.getByText('100% Offline')).toBeInTheDocument();

    // Controls
    const btnZoomIn = screen.getByTestId('btn-zoom-in');
    const btnZoomOut = screen.getByTestId('btn-zoom-out');
    const btnReset = screen.getByTestId('btn-reset-view');

    expect(btnZoomIn).toBeInTheDocument();
    expect(btnZoomOut).toBeInTheDocument();
    expect(btnReset).toBeInTheDocument();

    // Zoom interaction
    fireEvent.click(btnZoomIn);
    expect(screen.getByText('125%')).toBeInTheDocument();

    fireEvent.click(btnReset);
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Safe zones directory
    expect(screen.getByTestId('safe-zones-list')).toBeInTheDocument();
  });

  it('debe permitir navegar a la pestaña "Mapa GPS" en App.tsx', () => {
    render(<App />);

    const tabMapa = screen.getByTestId('tab-mapa');
    expect(tabMapa).toBeInTheDocument();

    fireEvent.click(tabMapa);

    expect(screen.getByTestId('mapa-view')).toBeInTheDocument();
    expect(screen.getByTestId('svg-map-canvas')).toBeInTheDocument();
  });
});
