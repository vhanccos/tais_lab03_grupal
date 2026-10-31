import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';

// Storage & Hooks
import { StorageAdapter, STORAGE_KEY } from '../../src/storage/storageAdapter';
import { useMochila } from '../../src/hooks/useMochila';
import { usePlanFamiliar } from '../../src/hooks/usePlanFamiliar';
import { useHuaicos, HUAICOS_STORAGE_KEY, _resetHuaicosMemoryFallbackForTesting } from '../../src/hooks/useHuaicos';
import { createDefaultState } from '../../src/storage/storageAdapter';
import { createDefaultHuaicosState } from '../../src/core/huaicosDomain';
import { DEFAULT_LIMA_CENTER } from '../../src/core/geoMath';
import { DEFAULT_PUNTOS_ENCUENTRO } from '../../src/core/defaultMeetingPoints';

// Navigation & Radar
import { useGeolocation } from '../../src/hooks/useGeolocation';
import { NearestPointRadar } from '../../src/components/mapa/NearestPointRadar';

// Hardware & Audio
import { RescueAudioWhistle } from '../../src/core/audioWhistle';
import { useFlashlight } from '../../src/hooks/useHardware';

// Components
import App from '../../src/App';
import { HuaicosView } from '../../src/components/huaicos/HuaicosView';

describe('Tier 5 Adversarial Gate Verification: Offline Resilience, Hardware & Sync', () => {

  beforeEach(() => {
    localStorage.clear();
    _resetHuaicosMemoryFallbackForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. STORAGE CORRUPTION RECOVERY
  // =========================================================================
  describe('1. Storage Corruption Recovery', () => {
    const corruptPayloads = [
      '{ invalid_json_syntax: true',
      '}{[',
      '',
      'null',
      'undefined',
      '42',
      '"string_value_instead_of_object"',
      '{}',
      '{"mochila": null}',
      '{"mochila": {"articulos": "not_an_array"}}',
      '{"planFamiliar": null}',
      '{"mochila": {"articulos": []}}', // missing planFamiliar
      '{"mochila": {"articulos": []}, "planFamiliar": {"puntosEncuentro": null}}'
    ];

    corruptPayloads.forEach((payload, idx) => {
      it(`1.1 StorageAdapter: debe recuperarse defensivamente sin crashear ante payload corrupto #${idx + 1} en '${STORAGE_KEY}'`, () => {
        localStorage.setItem(STORAGE_KEY, payload);

        const adapter = new StorageAdapter();
        let state: any;
        expect(() => {
          state = adapter.loadState();
        }).not.toThrow();

        expect(state).toBeDefined();
        expect(state.version).toBe(1);
        expect(Array.isArray(state.mochila.articulos)).toBe(true);
        expect(state.mochila.articulos.length).toBeGreaterThan(0);
        expect(state.planFamiliar).toBeDefined();
        expect(Array.isArray(state.planFamiliar.puntosEncuentro)).toBe(true);
      });
    });

    const corruptHuaicosPayloads = [
      '{ broken: json syntax',
      'null',
      '12345',
      '{"articulos": null}',
      '{"articulos": [], "senalesTempranas": null}',
      '{"articulos": [], "senalesTempranas": [], "planEvacuacion": null}',
      '{"articulos": [], "senalesTempranas": [], "planEvacuacion": {}, "nivelAlertaActual": null}'
    ];

    corruptHuaicosPayloads.forEach((payload, idx) => {
      it(`1.2 useHuaicos: debe recuperarse defensivamente sin crashear ante payload corrupto #${idx + 1} en '${HUAICOS_STORAGE_KEY}'`, () => {
        localStorage.setItem(HUAICOS_STORAGE_KEY, payload);

        const { result } = renderHook(() => useHuaicos());

        expect(result.current.state).toBeDefined();
        expect(Array.isArray(result.current.state.articulos)).toBe(true);
        expect(result.current.state.articulos.length).toBeGreaterThan(0);
        expect(Array.isArray(result.current.state.senalesTempranas)).toBe(true);
        expect(result.current.state.nivelAlertaActual).toBe('verde');
        expect(result.current.state.planEvacuacion).toBeDefined();
      });
    });

    it('1.3 UI Component Robustness: App y HuaicosView deben renderizar sin excepciones bajo localStorage severamente corrupto', () => {
      localStorage.setItem(STORAGE_KEY, '{ CORRUPT_STATE_CRASH_TEST');
      localStorage.setItem(HUAICOS_STORAGE_KEY, '[[[ INVALID YAML/JSON ]]]');

      expect(() => {
        const { unmount } = render(<App />);
        unmount();
      }).not.toThrow();

      expect(() => {
        const { unmount } = render(<HuaicosView />);
        unmount();
      }).not.toThrow();
    });

    it('1.4 Auto-recuperación persistente: mutaciones posteriores deben sobreescribir el estado corrupto con datos íntegros', () => {
      localStorage.setItem(STORAGE_KEY, '### CORRUPT DATA ###');
      const adapter = new StorageAdapter();
      const state = adapter.loadState();

      // Mutation
      state.planFamiliar.numeroFamiliarClave = '987111222';
      const saveSuccess = adapter.saveState(state);
      expect(saveSuccess).toBe(true);

      // Verify localStorage now contains valid JSON
      const rawAfter = localStorage.getItem(STORAGE_KEY);
      expect(rawAfter).not.toBeNull();
      const reParsed = JSON.parse(rawAfter!);
      expect(reParsed.planFamiliar.numeroFamiliarClave).toBe('987111222');
    });

    it('1.5 Resiliencia ante JSON parcial/incompleto: si planFamiliar.integrantes falta en storage, verificar si crashea la vista PlanFamiliar', () => {
      localStorage.setItem(STORAGE_KEY, '{"mochila": {"articulos": []}, "planFamiliar": {}}');
      const { fireEvent } = require('@testing-library/react');
      render(<App />);
      expect(() => {
        fireEvent.click(screen.getByTestId('tab-plan'));
      }).not.toThrow();
    });

    it('1.6 Resiliencia ante JSON huaicos parcial: si planEvacuacion es {} en storage, verificar si crashea al interactuar con el formulario', () => {
      localStorage.setItem(
        HUAICOS_STORAGE_KEY,
        '{"articulos": [], "senalesTempranas": [], "planEvacuacion": {}, "nivelAlertaActual": "verde"}'
      );
      const { fireEvent } = require('@testing-library/react');
      render(<HuaicosView />);
      fireEvent.click(screen.getByTestId('subtab-evacuacion'));
      const btnGuardar = screen.getByTestId('btn-guardar-plan');
      expect(() => {
        fireEvent.click(btnGuardar);
      }).not.toThrow();
    });
  });

  // =========================================================================
  // 2. STORAGE QUOTA EXHAUSTION
  // =========================================================================
  describe('2. Storage Quota Exhaustion (QuotaExceededError)', () => {
    it('2.1 StorageAdapter: simular QuotaExceededError en setItem y verificar fallback in-memory sin pérdidas', () => {
      const adapter = new StorageAdapter();
      const state = adapter.loadState();
      state.planFamiliar.numeroFamiliarClave = '999111333';

      // Simular fallo de cuota
      const quotaError = new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      const saveResult = adapter.saveState(state);
      expect(saveResult).toBe(false);

      // Debe leer el fallback en memoria correctamente
      const loaded = adapter.loadState();
      expect(loaded.planFamiliar.numeroFamiliarClave).toBe('999111333');

      // Segunda mutación aún bajo cuota excedida
      loaded.mochila.articulos[0].completado = true;
      adapter.saveState(loaded);

      const loadedAgain = adapter.loadState();
      expect(loadedAgain.mochila.articulos[0].completado).toBe(true);
      expect(loadedAgain.planFamiliar.numeroFamiliarClave).toBe('999111333');
    });

    it('2.2 useHuaicos: mutaciones continuas bajo fallo de cuota deben mantenerse operativas en memoria', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      const { result } = renderHook(() => useHuaicos());

      // Toggle item under quota error
      const itemId = result.current.state.articulos[0].id;
      const initialStatus = result.current.state.articulos[0].completado;

      act(() => {
        result.current.toggleItem(itemId);
      });

      expect(result.current.state.articulos[0].completado).toBe(!initialStatus);

      // Change alert level under quota error
      act(() => {
        result.current.setNivelAlerta('rojo');
      });
      expect(result.current.state.nivelAlertaActual).toBe('rojo');

      // Update evacuation route under quota error
      act(() => {
        result.current.savePlanEvacuacion({ descripcionRutaPerpendicular: 'Cerro Este 90 grados' });
      });
      expect(result.current.state.planEvacuacion.descripcionRutaPerpendicular).toBe('Cerro Este 90 grados');
    });

    it('2.3 Quota Recovery: cuando la cuota se libera, el almacenamiento debe persistir nuevamente en disco', () => {
      const adapter = new StorageAdapter();
      const state = adapter.loadState();
      state.planFamiliar.numeroFamiliarClave = '955444333';

      // 1. Quota fails
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      expect(adapter.saveState(state)).toBe(false);

      // 2. Quota is restored
      setItemSpy.mockImplementation((k) => {
        localStorage.getItem(k); // no-op mock
      });

      state.planFamiliar.puntoEncuentroInterno = 'Zona segura columna A';
      expect(adapter.saveState(state)).toBe(true);
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. GEOLOCATION ERROR FALLBACKS
  // =========================================================================
  describe('3. Geolocation Error Fallbacks (PERMISSION_DENIED, TIMEOUT)', () => {
    it('3.1 PERMISSION_DENIED (code 1): useGeolocation debe activar fallback a DEFAULT_LIMA_CENTER con mensaje explicativo', () => {
      const mockWatchPosition = vi.fn((_success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation prompt',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
        return 101;
      });

      const mockClearWatch = vi.fn();

      vi.stubGlobal('navigator', {
        geolocation: {
          watchPosition: mockWatchPosition,
          clearWatch: mockClearWatch,
          getCurrentPosition: vi.fn()
        }
      });

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.cargando).toBe(false);
      expect(result.current.esUbicacionSimulada).toBe(true);
      expect(result.current.coords.lat).toBeCloseTo(DEFAULT_LIMA_CENTER.lat);
      expect(result.current.coords.lng).toBeCloseTo(DEFAULT_LIMA_CENTER.lng);
      expect(result.current.error).toContain('Permiso de ubicación denegado');
    });

    it('3.2 TIMEOUT (code 3): useGeolocation debe activar fallback con mensaje de satélites no alcanzados', () => {
      const mockWatchPosition = vi.fn((_success, error) => {
        error({
          code: 3, // TIMEOUT
          message: 'Timeout expired',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
        return 102;
      });

      vi.stubGlobal('navigator', {
        geolocation: {
          watchPosition: mockWatchPosition,
          clearWatch: vi.fn(),
          getCurrentPosition: vi.fn()
        }
      });

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.cargando).toBe(false);
      expect(result.current.esUbicacionSimulada).toBe(true);
      expect(result.current.error).toContain('Tiempo de espera agotado buscando satélites');
      expect(result.current.coords.lat).toBeCloseTo(DEFAULT_LIMA_CENTER.lat);
    });

    it('3.3 Geolocation no soportada (navigator.geolocation undefined): fallback defensivo inmediato sin crash', () => {
      vi.stubGlobal('navigator', {});

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.cargando).toBe(false);
      expect(result.current.esUbicacionSimulada).toBe(true);
      expect(result.current.error).toContain('no soportada');
      expect(result.current.coords.lat).toBeCloseTo(DEFAULT_LIMA_CENTER.lat);
    });

    it('3.4 NearestPointRadar con coordenadas de fallback: calcula distancia y azimut a puntos de encuentro sin producir NaN', () => {
      // Coordenadas fallback (DEFAULT_LIMA_CENTER)
      const userCoords = DEFAULT_LIMA_CENTER;
      const puntos = DEFAULT_PUNTOS_ENCUENTRO;

      render(
        <NearestPointRadar
          userCoords={userCoords}
          puntos={puntos}
        />
      );

      const distanceElem = screen.getByTestId('radar-distance');
      expect(distanceElem).toBeInTheDocument();
      expect(distanceElem.textContent).not.toContain('NaN');
      expect(distanceElem.textContent).toMatch(/\d+\s*(m|km)/);

      const pointName = screen.getByTestId('radar-point-name');
      expect(pointName).toBeInTheDocument();
      expect(pointName.textContent?.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 4. WEB AUDIO API & HARDWARE STUBS
  // =========================================================================
  describe('4. Web Audio API & Hardware Stubs (SOS strobe & Whistle Cleanup)', () => {
    let mockOscillator: any;
    let mockGain: any;
    let mockAudioCtx: any;

    beforeEach(() => {
      mockOscillator = {
        type: '',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn()
      };

      mockGain = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        disconnect: vi.fn()
      };

      mockAudioCtx = {
        state: 'suspended',
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGain),
        resume: vi.fn().mockResolvedValue(undefined),
        close: vi.fn()
      };

      vi.stubGlobal('AudioContext', vi.fn(() => mockAudioCtx));
      (window as any).AudioContext = vi.fn(() => mockAudioCtx);
    });

    it('4.1 RescueAudioWhistle: creación, conexión correcta de nodos y calibración a frecuencia 3000 Hz', () => {
      const whistle = new RescueAudioWhistle(3000);
      whistle.startContinuous();

      expect(mockAudioCtx.createOscillator).toHaveBeenCalled();
      expect(mockAudioCtx.createGain).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('sawtooth');
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(3000, 0);
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioCtx.destination);
      expect(mockOscillator.start).toHaveBeenCalled();

      // Stop must cleanup nodes
      whistle.stop();
      expect(mockOscillator.stop).toHaveBeenCalled();
      expect(mockOscillator.disconnect).toHaveBeenCalled();
      expect(mockGain.disconnect).toHaveBeenCalled();
      expect(whistle.getMode()).toBe('off');
    });

    it('4.2 RescueAudioWhistle: paradas repetidas consecutivas deben ser idempotentes sin lanzar excepciones', () => {
      const whistle = new RescueAudioWhistle(3000);
      whistle.startContinuous();
      expect(() => {
        whistle.stop();
        whistle.stop();
        whistle.stop();
      }).not.toThrow();
    });

    it('4.3 RescueAudioWhistle: Regla de Tres timing con fake timers y verificación de pulsos y ventana de escucha', () => {
      vi.useFakeTimers();
      const whistle = new RescueAudioWhistle(3000);
      const modeHistory: Array<{ mode: string; active: boolean; blast?: number }> = [];

      whistle.setListener(st => {
        modeHistory.push({ mode: st.mode, active: st.isActive, blast: st.currentBlastIndex });
      });

      whistle.startRuleOfThree();

      // Blast 1 active initially
      expect(whistle.getMode()).toBe('rule_of_three');
      expect(modeHistory.some(h => h.blast === 1)).toBe(true);

      // Advance 1000ms: Blast 1 ends
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockOscillator.stop).toHaveBeenCalled();

      // Advance 1000ms: Gap 1 ends, Blast 2 starts
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(modeHistory.some(h => h.blast === 2)).toBe(true);

      // Advance 1000ms: Blast 2 ends
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Advance 1000ms: Gap 2 ends, Blast 3 starts
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(modeHistory.some(h => h.blast === 3)).toBe(true);

      // Advance 1000ms: Blast 3 ends, enters 60s listening window (blast = 0)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(modeHistory.some(h => h.blast === 0)).toBe(true);

      whistle.stop();
      expect(whistle.getMode()).toBe('off');
    });

    it('4.4 useFlashlight: SOS strobe sequence timings (... --- ...)', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useFlashlight());
      expect(result.current.mode).toBe('off');

      // Start SOS
      await act(async () => {
        result.current.toggleSos();
      });

      expect(result.current.mode).toBe('sos');
      expect(result.current.isOn).toBe(true);
      // Step 0: 200ms ON
      expect(result.current.screenTorchActive).toBe(true);

      // Advance 200ms -> Step 1: 200ms OFF
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.screenTorchActive).toBe(false);

      // Advance 200ms -> Step 2: 200ms ON
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.screenTorchActive).toBe(true);

      // Advance 200ms -> Step 3: 200ms OFF
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.screenTorchActive).toBe(false);

      // Advance 200ms -> Step 4: 200ms ON
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.screenTorchActive).toBe(true);

      // Advance 200ms -> Step 5: 200ms OFF (End of 'S')
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.screenTorchActive).toBe(false);

      // Advance 200ms -> Step 6: 600ms ON (Start of 'O')
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.screenTorchActive).toBe(true);

      // Advance 600ms -> Step 7: 200ms OFF
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.screenTorchActive).toBe(false);

      // Turn off terminates cleanly
      act(() => {
        result.current.turnOff();
      });
      expect(result.current.mode).toBe('off');
      expect(result.current.isOn).toBe(false);
      expect(result.current.screenTorchActive).toBe(false);
    });

    it('4.5 useFlashlight: desmontaje durante SOS activo limpia los timers pendientes', async () => {
      vi.useFakeTimers();
      const { result, unmount } = renderHook(() => useFlashlight());

      await act(async () => {
        result.current.toggleSos();
      });

      expect(result.current.mode).toBe('sos');

      // Unmount hook while running
      unmount();

      // Advancing timer after unmount should not throw or cause state updates
      expect(() => {
        vi.advanceTimersByTime(5000);
      }).not.toThrow();
    });
  });

  // =========================================================================
  // 5. CROSS-MODULE MULTI-TAB EVENT PROPAGATION
  // =========================================================================
  describe('5. Cross-Module Multi-Tab Event Propagation (storage window events)', () => {
    it('5.1 Multi-Tab App State: evento storage con nueva versión de sismolisto_app_state_v1 sincroniza useMochila y usePlanFamiliar', () => {
      const { result: mochilaHook } = renderHook(() => useMochila());
      const { result: planHook } = renderHook(() => usePlanFamiliar());

      expect(mochilaHook.current.articulos.length).toBeGreaterThan(0);
      expect(planHook.current.plan.numeroFamiliarClave).toBe('');

      // Simular cambio desde otra pestaña en localStorage
      const updatedState = createDefaultState();
      updatedState.planFamiliar.numeroFamiliarClave = '944333222';
      updatedState.mochila.articulos[0].completado = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));

      // Disparar StorageEvent en window
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: JSON.stringify(updatedState)
          })
        );
      });

      expect(planHook.current.plan.numeroFamiliarClave).toBe('944333222');
      expect(mochilaHook.current.articulos[0].completado).toBe(true);
    });

    it('5.2 Multi-Tab Huaicos State: evento storage con sismolisto_huaicos_state_v1 sincroniza useHuaicos', () => {
      const { result } = renderHook(() => useHuaicos());
      expect(result.current.state.nivelAlertaActual).toBe('verde');

      const updatedHuaicos = createDefaultHuaicosState();
      updatedHuaicos.nivelAlertaActual = 'naranja';
      updatedHuaicos.articulos[0].completado = true;
      localStorage.setItem(HUAICOS_STORAGE_KEY, JSON.stringify(updatedHuaicos));

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: HUAICOS_STORAGE_KEY,
            newValue: JSON.stringify(updatedHuaicos)
          })
        );
      });

      expect(result.current.state.nivelAlertaActual).toBe('naranja');
      expect(result.current.state.articulos[0].completado).toBe(true);
    });

    it('5.3 Multi-Tab Resilience: eventos storage de claves ajenas o con JSON corrupto son ignorados sin crashear', () => {
      const { result } = renderHook(() => useHuaicos());
      const initialAlert = result.current.state.nivelAlertaActual;

      // Unrelated key
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'unrelated_external_app_key',
            newValue: '{"some": "data"}'
          })
        );
      });
      expect(result.current.state.nivelAlertaActual).toBe(initialAlert);

      // Corrupt payload in storage event for huaicos key
      expect(() => {
        act(() => {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: HUAICOS_STORAGE_KEY,
              newValue: '{ invalid: json in storage event'
            })
          );
        });
      }).not.toThrow();

      // State remains safe and uncorrupted
      expect(result.current.state.nivelAlertaActual).toBe(initialAlert);
    });

    it('5.4 Event Listener Cleanup: desmontar hooks desuscribe limpiamente el listener de storage', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount: unmountMochila } = renderHook(() => useMochila());
      unmountMochila();
      expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));

      const { unmount: unmountPlan } = renderHook(() => usePlanFamiliar());
      unmountPlan();
      expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));

      const { unmount: unmountHuaicos } = renderHook(() => useHuaicos());
      unmountHuaicos();
      expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });
});
