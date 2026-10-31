import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useMochila } from '../../src/hooks/useMochila';
import { useCajaReserva } from '../../src/hooks/useCajaReserva';
import { usePlanFamiliar } from '../../src/hooks/usePlanFamiliar';
import { useFlashlight, useWhistle } from '../../src/hooks/useHardware';
import { useHuaicos, HUAICOS_STORAGE_KEY } from '../../src/hooks/useHuaicos';
import { STORAGE_KEY, createDefaultState } from '../../src/storage/storageAdapter';
import { CONTACTOS_EMERGENCIA_PERU } from '../../src/core/emergencyContacts';
import { generate119Uris } from '../../src/core/phoneValidator';
import {
  calcularPotabilizacionAgua,
  createDefaultHuaicosState,
  INFORMACION_ALERTAS
} from '../../src/core/huaicosDomain';

class MockAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sawtooth',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn()
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn()
    };
  }
  resume = vi.fn().mockResolvedValue(undefined);
}

describe('Tier 4: Real-World Disaster Workflow Scenarios', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createDefaultState()));
    localStorage.setItem(HUAICOS_STORAGE_KEY, JSON.stringify(createDefaultHuaicosState()));
    vi.clearAllMocks();
    vi.useFakeTimers();

    if (typeof window !== 'undefined') {
      window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // Disaster Scenario 1: Megathrust Mw 8.0 Earthquake in Lima & Callao
  // =========================================================================
  describe('Disaster Scenario 1: Megathrust Mw 8.0 Earthquake in Lima / Callao ("Ubícate, Evacúa, Comunícate")', () => {
    it('Flujo completo de supervivencia ante terremoto: preparación previa -> sismo -> evacuación -> telecomunicaciones 119 -> rescate acústico', async () => {
      // ---------------------------------------------------------------------
      // FASE PREVIA: Preparación del Hogar (IUCAO INDECI)
      // ---------------------------------------------------------------------
      const { result: mochilaHook } = renderHook(() => useMochila());
      const { result: planHook } = renderHook(() => usePlanFamiliar());
      const { result: flashlightHook } = renderHook(() => useFlashlight());
      const { result: whistleHook } = renderHook(() => useWhistle());

      // 1. Asignar roles operativos en el Plan Familiar
      act(() => {
        planHook.current.addIntegrante({
          nombreCompleto: 'Carlos Quispe',
          rolSismo: 'Cargar la Mochila de Emergencia',
          notas: 'Mochila colocada al lado de la puerta principal'
        });
        planHook.current.addIntegrante({
          nombreCompleto: 'Ana Quispe',
          rolSismo: 'Corte de Llave de Gas y Energía Eléctrica'
        });
        planHook.current.addIntegrante({
          nombreCompleto: 'Rosa Quispe (Abuela)',
          rolSismo: 'Evacuación prioritaria asistida'
        });
        planHook.current.saveNumeroClave('987654321');
        planHook.current.savePuntosEncuentro(
          'Junto a la columna de concreto del pasillo central (piso 2)',
          'Parque de la Reserva - Círculo Verde INDECI de 4.5m'
        );
      });

      expect(planHook.current.plan.integrantes.length).toBe(3);
      expect(planHook.current.plan.puntoEncuentroInterno).toContain('columna de concreto');

      // 2. Revisar y marcar artículos críticos de la Mochila de Emergencia
      act(() => {
        // Marcar botiquín, agua embotellada, linterna, radio y mantas
        for (let i = 0; i < 6; i++) {
          mochilaHook.current.toggleItem(mochilaHook.current.articulos[i].id);
        }
      });
      expect(mochilaHook.current.progress.porcentajeTotal).toBeGreaterThan(0);

      // ---------------------------------------------------------------------
      // FASE 1: DURANTE EL SISMO — "UBÍCATE"
      // ---------------------------------------------------------------------
      // La familia se ubica junto a la columna de concreto armado interior.
      const zonaInterna = planHook.current.plan.puntosEncuentro!.find(p => p.tipo === 'interno');
      expect(zonaInterna?.descripcion).toContain('columna de concreto');

      // ---------------------------------------------------------------------
      // FASE 2: POST-SISMO — "EVACÚA"
      // ---------------------------------------------------------------------
      // Cesa el temblor. Carlos toma la mochila, Ana corta el gas y evacúan por escaleras.
      // Llegan al Círculo Verde de Seguridad de 4.5m en el parque exterior.
      const zonaExterna = planHook.current.plan.puntosEncuentro!.find(p => p.tipo === 'externo');
      expect(zonaExterna?.descripcion).toContain('Parque');

      // ---------------------------------------------------------------------
      // FASE 3: POST-EVACUACIÓN — "COMUNÍCATE"
      // ---------------------------------------------------------------------
      // Red celular colapsada para llamadas de voz. Uso estricto del Servicio 119.
      const uris119 = generate119Uris(planHook.current.plan.numeroFamiliarClave);
      expect(uris119.esNumeroValido).toBe(true);
      expect(uris119.grabarMensajeUri).toBe('tel:1191987654321');
      expect(uris119.escucharMensajeUri).toBe('tel:1192987654321');

      // ---------------------------------------------------------------------
      // FASE 4: EMERGENCIA CRÍTICA — INCENDIO Y COLAPSO VECINAL
      // ---------------------------------------------------------------------
      // Se detecta fuga de gas con amago de incendio y persona atrapada.
      // Marcación directa a Bomberos 116 y SAMU 106.
      const bomberos = CONTACTOS_EMERGENCIA_PERU.find(c => c.numero === '116');
      const samu = CONTACTOS_EMERGENCIA_PERU.find(c => c.numero === '106');
      expect(bomberos?.uri).toBe('tel:116');
      expect(samu?.uri).toBe('tel:106');

      // ---------------------------------------------------------------------
      // FASE 5: NOCHE / APAGÓN TOTAL Y RESCATE ACÚSTICO
      // ---------------------------------------------------------------------
      // Corte general del fluido eléctrico. Activar linterna en modo continuo.
      await act(async () => {
        await flashlightHook.current.toggleSteady();
      });
      expect(flashlightHook.current.isOn).toBe(true);

      // Activar silbato de rescate bajo la "Regla de Tres" internacional
      act(() => {
        whistleHook.current.startRuleOfThree();
      });
      expect(whistleHook.current.mode).toBe('rule_of_three');

      // Cambiar linterna a modo estroboscópico SOS
      await act(async () => {
        await flashlightHook.current.toggleSos();
      });
      expect(flashlightHook.current.mode).toBe('sos');

      // Detener silbato al ser contactados por los brigadistas de INDECI
      act(() => {
        whistleHook.current.stop();
      });
      expect(whistleHook.current.mode).toBe('off');
    });
  });

  // =========================================================================
  // Disaster Scenario 2: Sudden Chosica Quebrada Activation (Huaico Emergency)
  // =========================================================================
  describe('Disaster Scenario 2: Sudden Chosica Quebrada Activation & 90° Ascent', () => {
    it('Flujo integral ante huaico repentino: aviso SENAMHI -> estruendo natural -> alerta roja -> evacuación perpendicular a cota alta', () => {
      const { result: huaicosHook } = renderHook(() => useHuaicos());

      // 1. Temporada de lluvias: SENAMHI emite Nivel Amarillo
      act(() => {
        huaicosHook.current.setNivelAlerta('amarillo');
      });
      expect(huaicosHook.current.state.nivelAlertaActual).toBe('amarillo');

      // 2. Tormenta intensa en cabecera de cuenca: se incrementa a Naranja
      act(() => {
        huaicosHook.current.setNivelAlerta('naranja');
      });
      expect(huaicosHook.current.state.nivelAlertaActual).toBe('naranja');

      // 3. Señales sensoriales naturales en tiempo real:
      // Se escucha estruendo sordo (bolones chocando) y se seca repentinamente el riachuelo (represamiento)
      act(() => {
        huaicosHook.current.toggleSenal('estruendo');
        huaicosHook.current.toggleSenal('represamiento_caudal');
      });

      const senalesActivas = huaicosHook.current.state.senalesTempranas.filter(s => s.reconocida);
      expect(senalesActivas.length).toBe(2);
      expect(senalesActivas.every(s => s.esPeligroMortal)).toBe(true);

      // 4. Escalación inmediata a Nivel Rojo (Peligro Extremo):
      // Tiempo de reacción: < 60 segundos
      act(() => {
        huaicosHook.current.setNivelAlerta('rojo');
      });
      expect(huaicosHook.current.state.nivelAlertaActual).toBe('rojo');
      const directivaRoja = INFORMACION_ALERTAS.rojo.directivaOperativa;
      expect(directivaRoja).toContain('EVACUACIÓN FORZOSA');

      // 5. Aplicación estricta de la Regla del Ángulo Recto (90°):
      // NUNCA correr aguas abajo; subir hacia las laderas rocosas
      act(() => {
        huaicosHook.current.savePlanEvacuacion({
          puntoEncuentroCotaAlta: 'Plataforma Superior Cerro Quirio - Cota +75m',
          descripcionRutaPerpendicular: 'Subir por la escalera comunal perpendicular hacia la ladera este rocosa',
          contactoReferenciaNombre: 'COER Lima Este / Chosica',
          contactoReferenciaTelefono: '998877665',
          viviendaEnRiesgoAbanico: true
        });
      });

      expect(huaicosHook.current.state.planEvacuacion.puntoEncuentroCotaAlta).toContain('Cerro Quirio');
      expect(huaicosHook.current.state.planEvacuacion.viviendaEnRiesgoAbanico).toBe(true);
    });
  });

  // =========================================================================
  // Disaster Scenario 3: 72-Hour Post-Disaster Potable Water Outage
  // =========================================================================
  describe('Disaster Scenario 3: 72-Hour Potable Water Cutoff & Bleach Disinfection', () => {
    it('Flujo de supervivencia hídrica: paralización de planta de tratamiento -> activación Caja de Reserva -> desinfección oficial con lejía', () => {
      const { result: cajaHook } = renderHook(() => useCajaReserva());

      // 1. Suspensión total del servicio de agua por turbidez extrema en río
      // Recuperar provisiones de la Caja de Reserva (días 2 a 4)
      const bidonAgua = cajaHook.current.articulos.find(a => a.nombre.includes('Agua'));
      expect(bidonAgua).toBeDefined();

      act(() => {
        cajaHook.current.toggleItem(bidonAgua!.id);
      });
      expect(cajaHook.current.progreso.completados).toBeGreaterThanOrEqual(1);

      // 2. Desinfección de agua turbia recolectada de cisterna de emergencia:
      // Familia de 5 integrantes durante 3 días:
      // Norma INDECI: 4 litros / persona / día -> 5 personas * 4 L * 3 días = 60 Litros
      const litrosRequeridos = 5 * 4 * 3;
      const dosificacion = calcularPotabilizacionAgua(litrosRequeridos);

      expect(dosificacion.esValido).toBe(true);
      expect(dosificacion.litros).toBe(60);
      // 2 gotas de lejía al 5% por litro -> 60 * 2 = 120 gotas
      expect(dosificacion.gotasLejia).toBe(120);
      // Tiempo obligatorio de reposo antes de consumir: 30 minutos
      expect(dosificacion.minutosReposo).toBe(30);

      // Pastillas potabilizadoras equivalentes
      expect(dosificacion.pastillasSugeridas).toBe(12);

      // 3. Simulación del tiempo de reposo de 30 minutos (1,800,000 ms)
      let tiempoCumplido = false;
      setTimeout(() => {
        tiempoCumplido = true;
      }, 30 * 60 * 1000);

      expect(tiempoCumplido).toBe(false);
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });
      expect(tiempoCumplido).toBe(true);
    });
  });
});
