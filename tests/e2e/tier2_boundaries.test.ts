import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useMochila } from '../../src/hooks/useMochila';
import { useCajaReserva } from '../../src/hooks/useCajaReserva';
import { usePlanFamiliar } from '../../src/hooks/usePlanFamiliar';
import { useHuaicos, HUAICOS_STORAGE_KEY } from '../../src/hooks/useHuaicos';
import { StorageAdapter, STORAGE_KEY, createDefaultState } from '../../src/storage/storageAdapter';
import { validatePhoneNumber, generate119Uris } from '../../src/core/phoneValidator';
import {
  calcularPotabilizacionAgua,
  calcularProgresoHuaicos,
  validarTelefonoPeru,
  createDefaultHuaicosState
} from '../../src/core/huaicosDomain';
import { calculatePreparationProgress } from '../../src/core/progressCalculator';

describe('Tier 2: Boundary Value Analysis (BVA) & Robustness Testing', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createDefaultState()));
    localStorage.setItem(HUAICOS_STORAGE_KEY, JSON.stringify(createDefaultHuaicosState()));
    vi.clearAllMocks();
  });

  // =========================================================================
  // BVA Category 1: Empty Strings and Whitespace Input Handling
  // =========================================================================
  describe('BVA 1: Empty and Whitespace Inputs', () => {
    it('1.1 useMochila.addItem debe rechazar nombres vacíos o de puros espacios', () => {
      const { result } = renderHook(() => useMochila());
      const initialCount = result.current.articulos.length;

      act(() => {
        const resEmpty = result.current.addItem({ nombre: '', categoriaId: 'primeros_auxilios' });
        expect(resEmpty.success).toBe(false);
        expect(resEmpty.error).toBeDefined();

        const resSpaces = result.current.addItem({ nombre: '     ', categoriaId: 'primeros_auxilios' });
        expect(resSpaces.success).toBe(false);
        expect(resSpaces.error).toBeDefined();
      });

      expect(result.current.articulos.length).toBe(initialCount);
    });

    it('1.2 useMochila.updateItem debe rechazar actualizar a un nombre vacío o espacios', () => {
      const { result } = renderHook(() => useMochila());
      const targetId = result.current.articulos[0].id;

      act(() => {
        const resEmpty = result.current.updateItem(targetId, { nombre: '' });
        expect(resEmpty.success).toBe(false);
        expect(resEmpty.error).toContain('vacío');

        const resSpaces = result.current.updateItem(targetId, { nombre: '   \t  ' });
        expect(resSpaces.success).toBe(false);
      });
    });

    it('1.3 usePlanFamiliar.addIntegrante debe rechazar nombres o roles vacíos', () => {
      const { result } = renderHook(() => usePlanFamiliar());

      act(() => {
        const res1 = result.current.addIntegrante({ nombreCompleto: '', rolSismo: 'Rol' });
        expect(res1.success).toBe(false);

        const res2 = result.current.addIntegrante({ nombreCompleto: '   ', rolSismo: 'Rol' });
        expect(res2.success).toBe(false);

        const res3 = result.current.addIntegrante({ nombreCompleto: 'Juan Pérez', rolSismo: '' });
        expect(res3.success).toBe(false);

        const res4 = result.current.addIntegrante({ nombreCompleto: 'Juan Pérez', rolSismo: '   ' });
        expect(res4.success).toBe(false);
      });

      expect(result.current.plan.integrantes.length).toBe(0);
    });

    it('1.4 usePlanFamiliar.addPuntoEncuentro debe rechazar nombres o descripciones vacías', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      const initialCount = result.current.plan.puntosEncuentro!.length;

      act(() => {
        const res1 = result.current.addPuntoEncuentro({
          nombre: '',
          descripcion: 'Descripción válida',
          tipo: 'interno'
        });
        expect(res1.success).toBe(false);

        const res2 = result.current.addPuntoEncuentro({
          nombre: 'Punto válido',
          descripcion: '   ',
          tipo: 'externo'
        });
        expect(res2.success).toBe(false);
      });

      expect(result.current.plan.puntosEncuentro!.length).toBe(initialCount);
    });

    it('1.5 useCajaReserva.addItem debe rechazar artículos con nombres en blanco', () => {
      const { result } = renderHook(() => useCajaReserva());
      const initialCount = result.current.articulos.length;

      act(() => {
        const res = result.current.addItem({ nombre: '    ', categoriaId: 'agua_alimentos' });
        expect(res.success).toBe(false);
      });

      expect(result.current.articulos.length).toBe(initialCount);
    });
  });

  // =========================================================================
  // BVA Category 2: Quota Limits and Boundary Thresholds
  // =========================================================================
  describe('BVA 2: Quota Limits and Family Member Capacity Bounds', () => {
    it('2.1 Debe permitir registrar exactamente hasta 20 integrantes familiares', () => {
      const { result } = renderHook(() => usePlanFamiliar());

      for (let i = 1; i <= 20; i++) {
        act(() => {
          const res = result.current.addIntegrante({
            nombreCompleto: `Familiar Integrante #${i}`,
            rolSismo: `Rol Asignado #${i}`
          });
          expect(res.success).toBe(true);
        });
      }

      expect(result.current.plan.integrantes.length).toBe(20);

      // Attempting to add 21st member must fail strictly
      act(() => {
        const resOver = result.current.addIntegrante({
          nombreCompleto: 'Familiar Excedente 21',
          rolSismo: 'Rol 21'
        });
        expect(resOver.success).toBe(false);
        expect(resOver.error).toContain('Límite máximo de 20');
      });

      expect(result.current.plan.integrantes.length).toBe(20);
    });
  });

  // =========================================================================
  // BVA Category 3: Extreme String Lengths and Sanitization
  // =========================================================================
  describe('BVA 3: Extreme String Lengths & Trimming', () => {
    it('3.1 Debe recortar automáticamente espacios al inicio y final (trim)', () => {
      const { result } = renderHook(() => useMochila());

      act(() => {
        result.current.addItem({
          nombre: '    Manta térmica aluminizada extra    ',
          categoriaId: 'abrigo',
          cantidadRecomendada: '   3 unidades   '
        });
      });

      const added = result.current.articulos.find(a => a.nombre === 'Manta térmica aluminizada extra');
      expect(added).toBeDefined();
      expect(added?.nombre).toBe('Manta térmica aluminizada extra');
      expect(added?.cantidadRecomendada).toBe('3 unidades');
    });

    it('3.2 Debe tolerar cadenas largas (>500 caracteres) sin desbordar el almacenamiento', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      const longNote = 'A'.repeat(500);

      act(() => {
        const res = result.current.addIntegrante({
          nombreCompleto: 'Familiar con nota extensa',
          rolSismo: 'Observador',
          notas: longNote
        });
        expect(res.success).toBe(true);
      });

      const member = result.current.plan.integrantes.find(m => m.nombreCompleto === 'Familiar con nota extensa');
      expect(member?.notas?.length).toBe(500);

      // Storage round trip
      const storage = new StorageAdapter();
      const loaded = storage.loadState();
      expect(loaded.planFamiliar.integrantes[0].notas).toBe(longNote);
    });
  });

  // =========================================================================
  // BVA Category 4: Peruvian Mobile Phone Validation Boundaries
  // =========================================================================
  describe('BVA 4: Phone Validation Boundaries (/^9\\d{8}$/)', () => {
    it('4.1 Longitud estricta: debe rechazar cadenas de 8 o 10 dígitos', () => {
      // 8 digits (one less)
      expect(validatePhoneNumber('98765432')).toBe(false);
      // 10 digits (one more)
      expect(validatePhoneNumber('9876543210')).toBe(false);
      // 9 digits (exact valid boundary)
      expect(validatePhoneNumber('987654321')).toBe(true);
    });

    it('4.2 Prefijo nacional: debe rechazar números que no inicien con el dígito 9', () => {
      expect(validatePhoneNumber('887654321')).toBe(false);
      expect(validatePhoneNumber('187654321')).toBe(false);
      expect(validatePhoneNumber('087654321')).toBe(false);
      expect(validatePhoneNumber('787654321')).toBe(false);
      expect(validatePhoneNumber('900000000')).toBe(true); // lower bound valid
      expect(validatePhoneNumber('999999999')).toBe(true); // upper bound valid
    });

    it('4.3 Caracteres no numéricos, símbolos y espacios internos deben ser rechazados', () => {
      expect(validatePhoneNumber('98765abcd')).toBe(false);
      expect(validatePhoneNumber('987-654-321')).toBe(false);
      expect(validatePhoneNumber('987 654 321')).toBe(false);
      expect(validatePhoneNumber('+51987654321')).toBe(false);
      expect(validatePhoneNumber('98765@321')).toBe(false);
      expect(validarTelefonoPeru('')).toBe(false);
      expect(validarTelefonoPeru(null as unknown as string)).toBe(false);
      expect(validarTelefonoPeru(undefined as unknown as string)).toBe(false);
    });

    it('4.4 generate119Uris ante entradas inválidas debe retornar URIs vacías y esNumeroValido: false', () => {
      const invalidUris = generate119Uris('12345');
      expect(invalidUris.esNumeroValido).toBe(false);
      expect(invalidUris.grabarMensajeUri).toBe('');
      expect(invalidUris.escucharMensajeUri).toBe('');
    });
  });

  // =========================================================================
  // BVA Category 5: Water Potabilization Math & Negative Volumes
  // =========================================================================
  describe('BVA 5: Water Disinfection Numeric Boundaries', () => {
    it('5.1 Volumen cero: debe retornar 0 gotas y advertencia amigable', () => {
      const res = calcularPotabilizacionAgua(0);
      expect(res.esValido).toBe(false);
      expect(res.gotasLejia).toBe(0);
      expect(res.litros).toBe(0);
      expect(res.advertencia).toBeDefined();
    });

    it('5.2 Volúmenes negativos: deben ser rechazados sin arrojar NaN ni números negativos', () => {
      const resNeg = calcularPotabilizacionAgua(-15);
      expect(resNeg.esValido).toBe(false);
      expect(resNeg.gotasLejia).toBe(0);

      const resSmallNeg = calcularPotabilizacionAgua(-0.001);
      expect(resSmallNeg.esValido).toBe(false);
      expect(resSmallNeg.gotasLejia).toBe(0);
    });

    it('5.3 Entradas no numéricas (NaN, null, undefined) deben manejarse con seguridad', () => {
      expect(calcularPotabilizacionAgua(NaN).esValido).toBe(false);
      expect(calcularPotabilizacionAgua(null as unknown as number).esValido).toBe(false);
      expect(calcularPotabilizacionAgua(undefined as unknown as number).esValido).toBe(false);
      expect(calcularPotabilizacionAgua('20' as unknown as number).esValido).toBe(false);
    });

    it('5.4 Fracciones de litro: debe redondear hacia arriba (Math.ceil) para asegurar desinfección', () => {
      // 0.25 litros -> 0.25 * 2 = 0.5 -> Ceil = 1 gota mínima
      const res = calcularPotabilizacionAgua(0.25);
      expect(res.esValido).toBe(true);
      expect(res.gotasLejia).toBe(1);

      // 1.5 litros -> 1.5 * 2 = 3 gotas exactas
      const res1_5 = calcularPotabilizacionAgua(1.5);
      expect(res1_5.esValido).toBe(true);
      expect(res1_5.gotasLejia).toBe(3);
    });

    it('5.5 Límite superior extremo (10,000 litros): debe acotarse y no desbordar', () => {
      const resBig = calcularPotabilizacionAgua(10000);
      expect(resBig.esValido).toBe(true);
      expect(resBig.gotasLejia).toBe(20000);

      // Over 10000 is clamped to 10000
      const resHuge = calcularPotabilizacionAgua(1000000);
      expect(resHuge.litros).toBe(10000);
      expect(resHuge.gotasLejia).toBe(20000);
    });
  });

  // =========================================================================
  // BVA Category 6: Progress Invariant Bounds [0, 100]% & Division by Zero
  // =========================================================================
  describe('BVA 6: Progress Invariants and Zero-Item Bounds', () => {
    it('6.1 calcularProgresoHuaicos([]) con 0 ítems debe ser estrictamente 0% sin NaN', () => {
      const metricas = calcularProgresoHuaicos([]);
      expect(metricas.porcentajeTotal).toBe(0);
      expect(metricas.totalArticulos).toBe(0);
      expect(metricas.articulosCompletados).toBe(0);
      expect(Number.isNaN(metricas.porcentajeTotal)).toBe(false);
      expect(Number.isFinite(metricas.porcentajeTotal)).toBe(true);
    });

    it('6.2 calculatePreparationProgress([]) con 0 ítems debe ser estrictamente 0%', () => {
      const metricas = calculatePreparationProgress([]);
      expect(metricas.porcentajeTotal).toBe(0);
      expect(metricas.totalArticulos).toBe(0);
      expect(metricas.articulosCompletados).toBe(0);
      expect(Number.isNaN(metricas.porcentajeTotal)).toBe(false);
    });

    it('6.3 Invariante de acotamiento: el porcentaje total jamás debe ser < 0 ni > 100', () => {
      // All checked items
      const { result } = renderHook(() => useMochila());
      const allChecked = result.current.articulos.map(a => ({ ...a, completado: true }));
      const metricAll = calculatePreparationProgress(allChecked);
      expect(metricAll.porcentajeTotal).toBe(100);

      // Empty checklist
      const noneChecked = result.current.articulos.map(a => ({ ...a, completado: false }));
      const metricNone = calculatePreparationProgress(noneChecked);
      expect(metricNone.porcentajeTotal).toBe(0);
    });
  });

  // =========================================================================
  // BVA Category 7: LocalStorage Corruption and Quota Exhaustion
  // =========================================================================
  describe('BVA 7: Storage Resilience to JSON Corruption & Quota Limits', () => {
    it('7.1 StorageAdapter debe auto-recuperarse si el JSON en storage está corrupto', () => {
      localStorage.setItem(STORAGE_KEY, '{ invalid json syntax !!! @@');
      const storage = new StorageAdapter();

      // Must not throw uncaught error and must restore valid state
      const state = storage.loadState();
      expect(state).toBeDefined();
      expect(state.mochila.articulos.length).toBeGreaterThanOrEqual(18);
      expect(state.planFamiliar).toBeDefined();
    });

    it('7.2 useHuaicos debe auto-recuperarse si sismolisto_huaicos_state_v1 está corrupto', () => {
      localStorage.setItem(HUAICOS_STORAGE_KEY, '{"version": 1, "articulos": [ CORRUPTED');
      const { result } = renderHook(() => useHuaicos());

      expect(result.current.state).toBeDefined();
      expect(result.current.state.articulos.length).toBeGreaterThanOrEqual(14);
      expect(result.current.state.nivelAlertaActual).toBe('verde');
    });

    it('7.3 QuotaExceededError en guardado debe activar respaldo en memoria sin romper la app', () => {
      const storage = new StorageAdapter();
      const defaultState = createDefaultState();

      // Mock setItem throwing QuotaExceededError directly on localStorage
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const saveResult = storage.saveState(defaultState);
      expect(saveResult).toBe(false);

      // Verify that subsequent loadState returns the in-memory fallback
      const loaded = storage.loadState();
      expect(loaded).toBeDefined();
      expect(loaded.mochila.articulos.length).toBe(defaultState.mochila.articulos.length);

      setItemSpy.mockRestore();
    });
  });
});
