import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useMochila } from '../../src/hooks/useMochila';
import { useCajaReserva } from '../../src/hooks/useCajaReserva';
import { usePlanFamiliar } from '../../src/hooks/usePlanFamiliar';
import { useHuaicos, HUAICOS_STORAGE_KEY } from '../../src/hooks/useHuaicos';
import { StorageAdapter, STORAGE_KEY, createDefaultState } from '../../src/storage/storageAdapter';
import { CONTACTOS_EMERGENCIA_PERU } from '../../src/core/emergencyContacts';
import { generate119Uris } from '../../src/core/phoneValidator';
import {
  calcularPotabilizacionAgua,
  createDefaultHuaicosState,
  INFORMACION_ALERTAS
} from '../../src/core/huaicosDomain';

describe('Tier 3: Pairwise Combinatorial & Cross-Feature Integration Testing', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createDefaultState()));
    localStorage.setItem(HUAICOS_STORAGE_KEY, JSON.stringify(createDefaultHuaicosState()));
    vi.clearAllMocks();
  });

  // =========================================================================
  // Pairwise 1: Backpack Mutations x Family Plan Mutations (Shared AppState)
  // =========================================================================
  describe('Pair 1: Mochila Mutations x Plan Familiar Updates (Shared Storage Resilience)', () => {
    it('1.1 Mutaciones concurrentes en Mochila y Plan Familiar no deben sobreescribir ni perder datos mutuamente', () => {
      const { result: mochilaHook } = renderHook(() => useMochila());
      const { result: planHook } = renderHook(() => usePlanFamiliar());
      const { result: cajaHook } = renderHook(() => useCajaReserva());

      // Concurrent actions across 3 independent domain hooks sharing the same AppState
      act(() => {
        mochilaHook.current.addItem({
          nombre: 'Linterna dínamo recargable',
          categoriaId: 'herramientas'
        });
        mochilaHook.current.toggleItem(mochilaHook.current.articulos[0].id);

        planHook.current.addIntegrante({
          nombreCompleto: 'Patricia Ramos',
          rolSismo: 'Encargada de Llave de Gas'
        });
        planHook.current.saveNumeroClave('987654321');

        cajaHook.current.addItem({
          nombre: 'Bidón 10L Agua',
          categoriaId: 'agua_alimentos'
        });
      });

      // Reload fresh state from storage adapter to confirm zero state loss
      const storage = new StorageAdapter();
      const freshState = storage.loadState();

      // Assert Backpack integrity
      expect(freshState.mochila.articulos.some(a => a.nombre === 'Linterna dínamo recargable')).toBe(true);
      expect(freshState.mochila.articulos[0].completado).toBe(true);

      // Assert Family Plan integrity
      expect(freshState.planFamiliar.integrantes.some(i => i.nombreCompleto === 'Patricia Ramos')).toBe(true);
      expect(freshState.planFamiliar.numeroFamiliarClave).toBe('987654321');

      // Assert Caja de Reserva integrity
      expect(freshState.cajaReserva!.articulos.some(c => c.nombre === 'Bidón 10L Agua')).toBe(true);
    });

    it('1.2 Eliminación en Plan Familiar no afecta progreso ni ítems de Mochila', () => {
      const { result: mochilaHook } = renderHook(() => useMochila());
      const { result: planHook } = renderHook(() => usePlanFamiliar());

      // Toggle items in mochila to 20%
      act(() => {
        mochilaHook.current.toggleItem(mochilaHook.current.articulos[0].id);
        mochilaHook.current.toggleItem(mochilaHook.current.articulos[1].id);
      });
      const progressBefore = mochilaHook.current.progress.porcentajeTotal;
      expect(progressBefore).toBeGreaterThan(0);

      // Add then remove a family member
      let famId = '';
      act(() => {
        const res = planHook.current.addIntegrante({
          nombreCompleto: 'Persona Temporal',
          rolSismo: 'Guía'
        });
        famId = (res.item as { id: string }).id;
      });
      expect(planHook.current.plan.integrantes.length).toBe(1);

      act(() => {
        planHook.current.removeIntegrante(famId);
      });
      expect(planHook.current.plan.integrantes.length).toBe(0);

      // Mochila progress must remain unaffected
      expect(mochilaHook.current.progress.porcentajeTotal).toBe(progressBefore);
      expect(mochilaHook.current.articulos[0].completado).toBe(true);
    });
  });

  // =========================================================================
  // Pairwise 2: Emergency Speed Dial x Family Roles & Key Contact Linking
  // =========================================================================
  describe('Pair 2: Emergency Speed Dial x Family Roles & Dialer Linking', () => {
    it('2.1 Registro de número celular clave vincula automáticamente los enlaces 119 del plan familiar', () => {
      const { result: planHook } = renderHook(() => usePlanFamiliar());
      const celular = '955443322';

      act(() => {
        planHook.current.saveNumeroClave(celular);
      });

      const uris = generate119Uris(planHook.current.plan.numeroFamiliarClave);
      expect(uris.esNumeroValido).toBe(true);
      expect(uris.grabarMensajeUri).toBe(`tel:1191${celular}`);
      expect(uris.escucharMensajeUri).toBe(`tel:1192${celular}`);

      // Pairwise connection: Bomberos (116) and SAMU (106) exist concurrently in the emergency directory
      const bomberos = CONTACTOS_EMERGENCIA_PERU.find(c => c.numero === '116');
      const samu = CONTACTOS_EMERGENCIA_PERU.find(c => c.numero === '106');
      expect(bomberos?.uri).toBe('tel:116');
      expect(samu?.uri).toBe('tel:106');
    });

    it('2.2 Roles familiares específicos mapean operativamente a autoridades de socorro', () => {
      const { result: planHook } = renderHook(() => usePlanFamiliar());

      act(() => {
        // Familiar encargado de incendio / fuga de gas
        planHook.current.addIntegrante({
          nombreCompleto: 'Manuel Delgado',
          rolSismo: 'Corte de Gas y Prevención de Incendios',
          notas: 'Llamar a Bomberos 116 de inmediato ante olor a gas'
        });
        // Familiar encargado de heridos
        planHook.current.addIntegrante({
          nombreCompleto: 'Clara Delgado',
          rolSismo: 'Primeros Auxilios y Triage Familiar',
          notas: 'Llamar a SAMU 106 si hay contusiones o fracturas'
        });
      });

      const gasOperator = planHook.current.plan.integrantes.find(i => i.rolSismo.includes('Gas'));
      const triageOperator = planHook.current.plan.integrantes.find(i => i.rolSismo.includes('Primeros Auxilios'));

      expect(gasOperator?.notas).toContain('116');
      expect(triageOperator?.notas).toContain('106');

      // The emergency contacts list matches these numbers exactly
      expect(CONTACTOS_EMERGENCIA_PERU.some(c => c.numero === '116')).toBe(true);
      expect(CONTACTOS_EMERGENCIA_PERU.some(c => c.numero === '106')).toBe(true);
    });
  });

  // =========================================================================
  // Pairwise 3: Huaicos Alerts x Safe Meeting Points on High Ground
  // =========================================================================
  describe('Pair 3: SENAMHI Alert Levels x High Ground Evacuation Points', () => {
    it('3.1 Alerta Roja hidrometeorológica sincronizada con punto de encuentro en cota alta fuera del abanico aluvial', () => {
      const { result: huaicosHook } = renderHook(() => useHuaicos());
      const { result: planHook } = renderHook(() => usePlanFamiliar());

      // Set red alert
      act(() => {
        huaicosHook.current.setNivelAlerta('rojo');
        huaicosHook.current.toggleSenal('estruendo');
        huaicosHook.current.toggleSenal('represamiento_caudal');
      });

      expect(huaicosHook.current.state.nivelAlertaActual).toBe('rojo');
      const directiva = INFORMACION_ALERTAS.rojo.directivaOperativa;
      expect(directiva).toContain('ZONAS ALTAS');

      // Register high-ground meeting point in huaicos plan
      act(() => {
        huaicosHook.current.savePlanEvacuacion({
          puntoEncuentroCotaAlta: 'Cerro La Libertad - Cota +80m',
          descripcionRutaPerpendicular: 'Subir 90° por la ladera rocosa este',
          viviendaEnRiesgoAbanico: true,
          contactoReferenciaNombre: 'Serenazgo Lurigancho-Chosica',
          contactoReferenciaTelefono: '911223344'
        });
      });

      // Synchronize into Plan Familiar meeting points as safe community zone
      act(() => {
        planHook.current.addPuntoEncuentro({
          nombre: 'Refugio en Cota Alta - Cerro La Libertad',
          tipo: 'seguro',
          descripcion: 'Punto seguro asignado ante riesgo de huaico e inundación',
          coordenadas: { lat: -11.935, lng: -76.705 }
        });
      });

      const ptoSeguro = planHook.current.plan.puntosEncuentro!.find(p => p.nombre.includes('Cota Alta'));
      expect(ptoSeguro).toBeDefined();
      expect(ptoSeguro?.tipo).toBe('seguro');
      expect(huaicosHook.current.state.planEvacuacion.viviendaEnRiesgoAbanico).toBe(true);
    });
  });

  // =========================================================================
  // Pairwise 4: Cross-Tab Storage Event Synchronization
  // =========================================================================
  describe('Pair 4: Multi-Tab Storage Event Synchronization', () => {
    it('4.1 Disparo de evento storage externo actualiza reactivamente el estado de useMochila', () => {
      const { result } = renderHook(() => useMochila());
      expect(result.current.articulos[0].completado).toBe(false);

      // Simulate external tab update
      const storage = new StorageAdapter();
      const updatedState = storage.loadState();
      updatedState.mochila.articulos[0].completado = true;
      storage.saveState(updatedState);

      // Dispatch native window storage event
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: JSON.stringify(updatedState)
          })
        );
      });

      expect(result.current.articulos[0].completado).toBe(true);
      expect(result.current.progress.porcentajeTotal).toBeGreaterThan(0);
    });

    it('4.2 Disparo de evento storage externo sincroniza el nivel de alerta de useHuaicos', () => {
      const { result } = renderHook(() => useHuaicos());
      expect(result.current.state.nivelAlertaActual).toBe('verde');

      // Simulate external alert escalation to Naranja
      const freshHuaicosState = createDefaultHuaicosState();
      freshHuaicosState.nivelAlertaActual = 'naranja';

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: HUAICOS_STORAGE_KEY,
            newValue: JSON.stringify(freshHuaicosState)
          })
        );
      });

      expect(result.current.state.nivelAlertaActual).toBe('naranja');
    });
  });

  // =========================================================================
  // Pairwise 5: Survival Combo Interplay (Mochila + Caja de Reserva + Cloro)
  // =========================================================================
  describe('Pair 5: Survival Combo Interplay (Mochila 24h + Caja 72h + Water Chlorination)', () => {
    it('5.1 Preparación integral: mochila 24h completa, caja 72h completa y cálculo de agua para 4 personas por 3 días', () => {
      const { result: mochilaHook } = renderHook(() => useMochila());
      const { result: cajaHook } = renderHook(() => useCajaReserva());

      // Complete all items in Mochila
      act(() => {
        for (const item of mochilaHook.current.articulos) {
          if (!item.completado) {
            mochilaHook.current.toggleItem(item.id);
          }
        }
      });
      expect(mochilaHook.current.progress.porcentajeTotal).toBe(100);

      // Complete all items in Caja de Reserva
      act(() => {
        for (const item of cajaHook.current.articulos) {
          if (!item.completado) {
            cajaHook.current.toggleItem(item.id);
          }
        }
      });
      expect(cajaHook.current.progreso.porcentajeTotal).toBe(100);

      // Water calculation for 4 persons for 3 days:
      // Minimum 4 L per person per day = 16 L/day x 3 days = 48 Liters total
      const totalLitros = 4 * 4 * 3; // 48L
      const calculo = calcularPotabilizacionAgua(totalLitros);

      expect(calculo.esValido).toBe(true);
      expect(calculo.litros).toBe(48);
      // 2 drops of 5% bleach per liter -> 48 * 2 = 96 drops
      expect(calculo.gotasLejia).toBe(96);
      expect(calculo.minutosReposo).toBe(30);
    });
  });
});
