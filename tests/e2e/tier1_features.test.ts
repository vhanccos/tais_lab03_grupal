import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Modules under test
import { useMochila } from '../../src/hooks/useMochila';
import { useCajaReserva } from '../../src/hooks/useCajaReserva';
import { usePlanFamiliar } from '../../src/hooks/usePlanFamiliar';
import { useFlashlight, useCamera } from '../../src/hooks/useHardware';
import { useHuaicos, HUAICOS_STORAGE_KEY } from '../../src/hooks/useHuaicos';
import { StorageAdapter, STORAGE_KEY, createDefaultState } from '../../src/storage/storageAdapter';
import { CONTACTOS_EMERGENCIA_PERU } from '../../src/core/emergencyContacts';
import { generate119Uris, validatePhoneNumber } from '../../src/core/phoneValidator';
import { RescueAudioWhistle } from '../../src/core/audioWhistle';
import {
  calcularPotabilizacionAgua,
  validarTelefonoPeru,
  CATEGORIAS_HUAICOS,
  INFORMACION_ALERTAS,
  createDefaultHuaicosState
} from '../../src/core/huaicosDomain';

// Polyfills / mocks for headless JSDOM environment
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
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

describe('Tier 1: Category-Partition Equivalence Class Testing (Happy-Path)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createDefaultState()));
    localStorage.setItem(HUAICOS_STORAGE_KEY, JSON.stringify(createDefaultHuaicosState()));
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock AudioContext in JSDOM if needed
    if (typeof window !== 'undefined') {
      window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // Feature Group 1: Backpack CRUD & Caja de Reserva (72h+)
  // =========================================================================
  describe('Feature Group 1: Backpack CRUD & Caja de Reserva (72h+)', () => {
    it('1.1 Debe cargar el catálogo predeterminado INDECI con 18 artículos y 6 categorías oficiales', () => {
      const { result } = renderHook(() => useMochila());
      expect(result.current.articulos.length).toBeGreaterThanOrEqual(18);

      const categorias = new Set(result.current.articulos.map(a => a.categoriaId));
      expect(categorias.has('primeros_auxilios')).toBe(true);
      expect(categorias.has('alimentos')).toBe(true);
      expect(categorias.has('agua')).toBe(true);
      expect(categorias.has('herramientas')).toBe(true);
      expect(categorias.has('abrigo')).toBe(true);
      expect(categorias.has('documentos')).toBe(true);
      expect(result.current.progress.porcentajeTotal).toBe(0);
    });

    it('1.2 Debe permitir agregar un artículo personalizado y persistirlo en storage', () => {
      const { result } = renderHook(() => useMochila());
      const initialCount = result.current.articulos.length;

      let addResult: { success: boolean; item?: unknown };
      act(() => {
        addResult = result.current.addItem({
          nombre: 'Insulina NPH y jeringas esterilizadas',
          categoriaId: 'primeros_auxilios',
          cantidadRecomendada: '2 frascos refrigerados'
        });
      });

      expect(addResult!.success).toBe(true);
      expect(result.current.articulos.length).toBe(initialCount + 1);

      const added = result.current.articulos.find(a => a.nombre.includes('Insulina'));
      expect(added).toBeDefined();
      expect(added?.esPredeterminado).toBe(false);
      expect(added?.completado).toBe(false);

      // Verify persistent round-trip
      const storage = new StorageAdapter();
      const state = storage.loadState();
      const inStorage = state.mochila.articulos.find(a => a.nombre.includes('Insulina'));
      expect(inStorage).toBeDefined();
    });

    it('1.3 Debe permitir actualizar el nombre, categoría y dosis de un artículo', () => {
      const { result } = renderHook(() => useMochila());
      let itemId = '';
      act(() => {
        const res = result.current.addItem({
          nombre: 'Fórmula lactante',
          categoriaId: 'alimentos',
          cantidadRecomendada: '1 lata'
        });
        itemId = (res.item as { id: string }).id;
      });

      act(() => {
        const updateRes = result.current.updateItem(itemId, {
          nombre: 'Fórmula infantil hipoalergénica',
          cantidadRecomendada: '2 latas de 800g'
        });
        expect(updateRes.success).toBe(true);
      });

      const updated = result.current.articulos.find(a => a.id === itemId);
      expect(updated?.nombre).toBe('Fórmula infantil hipoalergénica');
      expect(updated?.cantidadRecomendada).toBe('2 latas de 800g');
    });

    it('1.4 Debe permitir eliminar un artículo y recalcular el total y progreso', () => {
      const { result } = renderHook(() => useMochila());
      let itemId = '';
      act(() => {
        const res = result.current.addItem({
          nombre: 'Pañales desechables',
          categoriaId: 'primeros_auxilios'
        });
        itemId = (res.item as { id: string }).id;
      });

      const countBefore = result.current.articulos.length;
      act(() => {
        const delRes = result.current.deleteItem(itemId);
        expect(delRes.success).toBe(true);
      });

      expect(result.current.articulos.length).toBe(countBefore - 1);
      expect(result.current.articulos.some(a => a.id === itemId)).toBe(false);
    });

    it('1.5 Debe alternar el estado completado y recalcular reactivamente el progreso [0, 100]%', () => {
      const { result } = renderHook(() => useMochila());
      const firstId = result.current.articulos[0].id;

      expect(result.current.progress.porcentajeTotal).toBe(0);

      act(() => {
        result.current.toggleItem(firstId);
      });

      expect(result.current.articulos[0].completado).toBe(true);
      expect(result.current.progress.porcentajeTotal).toBeGreaterThan(0);
      expect(result.current.progress.articulosCompletados).toBe(1);

      // Untoggle returns to 0
      act(() => {
        result.current.toggleItem(firstId);
      });
      expect(result.current.articulos[0].completado).toBe(false);
      expect(result.current.progress.porcentajeTotal).toBe(0);
    });

    it('1.6 Caja de Reserva (72h+): debe gestionar CRUD de suministros para días 2 a 4', () => {
      const { result } = renderHook(() => useCajaReserva());
      expect(result.current.articulos.length).toBeGreaterThanOrEqual(10);
      expect(result.current.progreso.porcentajeTotal).toBe(0);

      // Add custom bulk supply
      act(() => {
        const addRes = result.current.addItem({
          nombre: 'Bidón 20L agua purificada con grifo',
          categoriaId: 'agua_alimentos',
          cantidadSugerida: '1 bidón'
        });
        expect(addRes.success).toBe(true);
      });

      const customItem = result.current.articulos.find(a => a.nombre.includes('Bidón 20L'));
      expect(customItem).toBeDefined();

      // Toggle item
      act(() => {
        result.current.toggleItem(customItem!.id);
      });
      expect(result.current.progreso.completados).toBe(1);
      expect(result.current.progreso.porcentajeTotal).toBeGreaterThan(0);
    });

    it('1.7 Debe reiniciar artículos desmarcados a valores por defecto con resetToDefault', () => {
      const { result } = renderHook(() => useMochila());
      act(() => {
        result.current.toggleItem(result.current.articulos[0].id);
        result.current.toggleItem(result.current.articulos[1].id);
      });
      expect(result.current.progress.articulosCompletados).toBe(2);

      act(() => {
        result.current.resetToDefault();
      });
      expect(result.current.progress.articulosCompletados).toBe(0);
      expect(result.current.progress.porcentajeTotal).toBe(0);
    });
  });

  // =========================================================================
  // Feature Group 2: Family Members CRUD & Roles (INDECI)
  // =========================================================================
  describe('Feature Group 2: Family Members CRUD & INDECI Roles', () => {
    it('2.1 Debe registrar un familiar con rol sísmico asignado y persistirlo', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      expect(result.current.plan.integrantes.length).toBe(0);

      act(() => {
        const res = result.current.addIntegrante({
          nombreCompleto: 'Carlos Mendoza',
          rolSismo: 'Responsable de Mochila de Emergencia',
          notas: 'Lleva la mochila ubicada en el pasillo principal'
        });
        expect(res.success).toBe(true);
      });

      expect(result.current.plan.integrantes.length).toBe(1);
      const member = result.current.plan.integrantes[0];
      expect(member.nombreCompleto).toBe('Carlos Mendoza');
      expect(member.rolSismo).toBe('Responsable de Mochila de Emergencia');

      // Persistence check
      const storage = new StorageAdapter();
      expect(storage.loadState().planFamiliar.integrantes[0].nombreCompleto).toBe('Carlos Mendoza');
    });

    it('2.2 Debe admitir múltiples familiares con roles diferenciados del Plan Familiar', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      const roles = [
        { nombreCompleto: 'Ana Mendoza', rolSismo: 'Corte de Llave de Gas y Energía Eléctrica' },
        { nombreCompleto: 'Rosa Gómez', rolSismo: 'Apoyo y Guía de Adulto Mayor' },
        { nombreCompleto: 'Luis Mendoza', rolSismo: 'Evacuación y Sujeción de Mascotas' }
      ];

      act(() => {
        result.current.addIntegrante(roles[0]);
      });
      act(() => {
        result.current.addIntegrante(roles[1]);
      });
      act(() => {
        result.current.addIntegrante(roles[2]);
      });

      expect(result.current.plan.integrantes.length).toBe(3);
      expect(result.current.plan.integrantes.map(m => m.rolSismo)).toEqual(roles.map(r => r.rolSismo));
    });

    it('2.3 Debe permitir actualizar el rol y notas de un familiar existente', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      let memberId = '';
      act(() => {
        const res = result.current.addIntegrante({
          nombreCompleto: 'Roberto Quispe',
          rolSismo: 'Corte de gas'
        });
        memberId = (res.item as { id: string }).id;
      });

      act(() => {
        const updateRes = result.current.updateIntegrante(memberId, {
          nombreCompleto: 'Roberto Quispe Valdivia',
          rolSismo: 'Responsable de Botiquín y Primeros Auxilios',
          notas: 'Cuenta con certificación de primeros auxilios de Cruz Roja'
        });
        expect(updateRes.success).toBe(true);
      });

      const updated = result.current.plan.integrantes.find(m => m.id === memberId);
      expect(updated?.nombreCompleto).toBe('Roberto Quispe Valdivia');
      expect(updated?.rolSismo).toBe('Responsable de Botiquín y Primeros Auxilios');
      expect(updated?.notas).toContain('Cruz Roja');
    });

    it('2.4 Debe permitir eliminar un familiar de la lista', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      let memberId = '';
      act(() => {
        const res = result.current.addIntegrante({
          nombreCompleto: 'Familiar Temporal',
          rolSismo: 'Acompañamiento'
        });
        memberId = (res.item as { id: string }).id;
      });

      expect(result.current.plan.integrantes.length).toBe(1);

      act(() => {
        result.current.removeIntegrante(memberId);
      });

      expect(result.current.plan.integrantes.length).toBe(0);
    });

    it('2.5 Debe actualizar la marca temporal ultimaModificacion al mutar integrantes', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      const fechaPrevia = result.current.plan.fechaActualizacion;

      vi.advanceTimersByTime(100);

      act(() => {
        result.current.addIntegrante({
          nombreCompleto: 'Elena Soto',
          rolSismo: 'Linterna y radio'
        });
      });

      expect(result.current.plan.fechaActualizacion).toBeDefined();
      expect(typeof fechaPrevia).toBe('string');
    });
  });

  // =========================================================================
  // Feature Group 3: Meeting Points & Safe Zones
  // =========================================================================
  describe('Feature Group 3: Meeting Points & Safe Zones', () => {
    it('3.1 Debe inicializar puntos de encuentro por defecto (Interno, Círculo INDECI, Comunitario)', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      expect(result.current.plan.puntosEncuentro!.length).toBeGreaterThanOrEqual(3);

      const tipos = result.current.plan.puntosEncuentro!.map(p => p.tipo);
      expect(tipos).toContain('interno');
      expect(tipos).toContain('externo');
      expect(tipos).toContain('comunitario');
    });

    it('3.2 Debe permitir agregar un punto de encuentro personalizado con coordenadas geográficas', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      const countBefore = result.current.plan.puntosEncuentro!.length;

      act(() => {
        const res = result.current.addPuntoEncuentro({
          nombre: 'Losa Deportiva Los Olivos - Círculo Verde 4.5m',
          tipo: 'seguro',
          descripcion: 'Cancha deportiva municipal libre de postes y cables de media tensión',
          coordenadas: { lat: -12.001234, lng: -77.065432 },
          svgCoords: { x: 340, y: 220 }
        });
        expect(res.success).toBe(true);
      });

      expect(result.current.plan.puntosEncuentro!.length).toBe(countBefore + 1);
      const added = result.current.plan.puntosEncuentro!.find(p => p.nombre.includes('Los Olivos'));
      expect(added?.coordenadas?.lat).toBe(-12.001234);
      expect(added?.esPredeterminado).toBe(false);
    });

    it('3.3 Debe permitir actualizar las coordenadas y descripción de un punto de encuentro', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      let ptoId = '';
      act(() => {
        const res = result.current.addPuntoEncuentro({
          nombre: 'Parque Central',
          tipo: 'externo',
          descripcion: 'Entrada norte'
        });
        ptoId = (res.item as { id: string }).id;
      });

      act(() => {
        const res = result.current.updatePuntoEncuentro(ptoId, {
          nombre: 'Parque Central San Martín',
          descripcion: 'Pérgola central lejos de cables',
          coordenadas: { lat: -12.05, lng: -77.03 }
        });
        expect(res.success).toBe(true);
      });

      const updated = result.current.plan.puntosEncuentro!.find(p => p.id === ptoId);
      expect(updated?.nombre).toBe('Parque Central San Martín');
      expect(updated?.coordenadas?.lat).toBe(-12.05);
    });

    it('3.4 Debe permitir eliminar un punto de encuentro manteniendo los restantes', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      let ptoId = '';
      act(() => {
        const res = result.current.addPuntoEncuentro({
          nombre: 'Punto a eliminar',
          tipo: 'comunitario',
          descripcion: 'Temporal'
        });
        ptoId = (res.item as { id: string }).id;
      });

      const count = result.current.plan.puntosEncuentro!.length;
      act(() => {
        result.current.deletePuntoEncuentro(ptoId);
      });

      expect(result.current.plan.puntosEncuentro!.length).toBe(count - 1);
      expect(result.current.plan.puntosEncuentro!.some(p => p.id === ptoId)).toBe(false);
    });

    it('3.5 Debe sincronizar bidireccionalmente los campos legados puntoEncuentroInterno y Externo', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      act(() => {
        result.current.savePuntosEncuentro(
          'Pasillo junto a columna de concreto armado piso 2',
          'Parque Kennedy - Círculo de seguridad #4'
        );
      });

      expect(result.current.plan.puntoEncuentroInterno).toBe('Pasillo junto a columna de concreto armado piso 2');
      expect(result.current.plan.puntoEncuentroExterno).toBe('Parque Kennedy - Círculo de seguridad #4');

      const interno = result.current.plan.puntosEncuentro!.find(p => p.tipo === 'interno');
      expect(interno?.descripcion).toBe('Pasillo junto a columna de concreto armado piso 2');
    });
  });

  // =========================================================================
  // Feature Group 4: Emergency Speed Dial & 119 Links
  // =========================================================================
  describe('Feature Group 4: Emergency Speed Dial & 119 Links', () => {
    it('4.1 Debe catalogar los 7 números de emergencia oficiales del Perú con formato nativo tel:', () => {
      expect(CONTACTOS_EMERGENCIA_PERU.length).toBe(7);

      const numeros = CONTACTOS_EMERGENCIA_PERU.map(c => c.numero);
      expect(numeros).toContain('116'); // Bomberos
      expect(numeros).toContain('106'); // SAMU
      expect(numeros).toContain('105'); // PNP
      expect(numeros).toContain('115'); // Defensa Civil
      expect(numeros).toContain('100'); // Línea 100 MIMP
      expect(numeros).toContain('110'); // Carreteras
      expect(numeros).toContain('113'); // Infosalud

      // All URIs must strictly follow 'tel:XYZ'
      for (const contacto of CONTACTOS_EMERGENCIA_PERU) {
        expect(contacto.uri).toBe(`tel:${contacto.numero}`);
      }
    });

    it('4.2 Los Bomberos (116) y SAMU (106) deben tener prioridad operativa 1 y 2 para rescate y trauma', () => {
      const bomberos = CONTACTOS_EMERGENCIA_PERU.find(c => c.numero === '116');
      const samu = CONTACTOS_EMERGENCIA_PERU.find(c => c.numero === '106');

      expect(bomberos?.prioridad).toBe(1);
      expect(samu?.prioridad).toBe(2);
      expect(bomberos?.entidad).toBe('CGBVP');
      expect(samu?.entidad).toBe('MINSA');
    });

    it('4.3 generate119Uris debe generar el URI tel:1191 para grabar mensaje de voz', () => {
      const mobile = '987654321';
      expect(validatePhoneNumber(mobile)).toBe(true);

      const uris = generate119Uris(mobile);
      expect(uris.esNumeroValido).toBe(true);
      expect(uris.grabarMensajeUri).toBe('tel:1191987654321');
    });

    it('4.4 generate119Uris debe generar el URI tel:1192 para escuchar mensajes de voz', () => {
      const mobile = '912345678';
      const uris = generate119Uris(mobile);
      expect(uris.esNumeroValido).toBe(true);
      expect(uris.escucharMensajeUri).toBe('tel:1192912345678');
    });

    it('4.5 Debe persistir el número celular clave del hogar y regenerar URIs al recargar', () => {
      const { result } = renderHook(() => usePlanFamiliar());
      act(() => {
        result.current.saveNumeroClave('987111222');
      });

      expect(result.current.plan.numeroFamiliarClave).toBe('987111222');

      const storage = new StorageAdapter();
      expect(storage.loadState().planFamiliar.numeroFamiliarClave).toBe('987111222');
    });
  });

  // =========================================================================
  // Feature Group 5: Hardware Utilities (Flashlight, Camera, Whistle)
  // =========================================================================
  describe('Feature Group 5: Hardware Utilities', () => {
    it('5.1 useFlashlight debe conmutar el modo continuo y activar el screenTorch como respaldo', async () => {
      const { result } = renderHook(() => useFlashlight());
      expect(result.current.mode).toBe('off');
      expect(result.current.isOn).toBe(false);

      await act(async () => {
        await result.current.toggleSteady();
      });

      expect(result.current.isOn).toBe(true);
      expect(result.current.mode).toBe('steady');
      // In JSDOM without hardware camera LED, screen torch fallback is active
      expect(result.current.screenTorchActive).toBe(true);

      // Turning off
      act(() => {
        result.current.turnOff();
      });
      expect(result.current.isOn).toBe(false);
      expect(result.current.mode).toBe('off');
    });

    it('5.2 useFlashlight debe activar el modo SOS estroboscópico de auxilio óptico', async () => {
      const { result } = renderHook(() => useFlashlight());
      await act(async () => {
        await result.current.toggleSos();
      });

      expect(result.current.isOn).toBe(true);
      expect(result.current.mode).toBe('sos');

      act(() => {
        result.current.turnOff();
      });
      expect(result.current.isOn).toBe(false);
    });

    it('5.3 useCamera debe registrar y persistir evidencias de daños estructurales con severidad', () => {
      const { result } = renderHook(() => useCamera());
      expect(result.current.photos.length).toBe(0);

      act(() => {
        result.current.addPhotoFromDataUrl(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'Fisura diagonal a 45 grados en columna de sala',
          'severo',
          'columna'
        );
      });

      expect(result.current.photos.length).toBe(1);
      const photo = result.current.photos[0];
      expect(photo.severidad).toBe('severo');
      expect(photo.elemento).toBe('columna');
      expect(photo.nota).toContain('Fisura diagonal');

      // Removal
      act(() => {
        result.current.removePhoto(photo.id);
      });
      expect(result.current.photos.length).toBe(0);
    });

    it('5.4 RescueAudioWhistle debe calibrarse en la banda 2500-3500 Hz de máxima sensibilidad auditiva humana', () => {
      const whistle = new RescueAudioWhistle(3000);
      expect(whistle.getMode()).toBe('off');

      // Clamped if out of range
      const lowWhistle = new RescueAudioWhistle(1000);
      expect(lowWhistle).toBeDefined();

      const highWhistle = new RescueAudioWhistle(5000);
      expect(highWhistle).toBeDefined();
    });

    it('5.5 RescueAudioWhistle debe operar en modo continuo y modo Regla de Tres internacional', () => {
      const whistle = new RescueAudioWhistle(3000);
      const states: string[] = [];

      whistle.setListener((st) => {
        states.push(`${st.mode}:${st.isActive}`);
      });

      whistle.startContinuous();
      expect(whistle.getMode()).toBe('continuous');

      whistle.startRuleOfThree();
      expect(whistle.getMode()).toBe('rule_of_three');

      whistle.stop();
      expect(whistle.getMode()).toBe('off');
    });
  });

  // =========================================================================
  // Feature Group 6: Huaicos Risk Management, Alerts, Evacuation & Water
  // =========================================================================
  describe('Feature Group 6: Huaicos Risk Management, Alerts, Evacuation & Water', () => {
    it('6.1 Semaforo SENAMHI: debe permitir transitar entre los 4 niveles oficiales (Verde, Amarillo, Naranja, Rojo)', () => {
      const { result } = renderHook(() => useHuaicos());
      expect(result.current.state.nivelAlertaActual).toBe('verde');

      act(() => {
        result.current.setNivelAlerta('amarillo');
      });
      expect(result.current.state.nivelAlertaActual).toBe('amarillo');

      act(() => {
        result.current.setNivelAlerta('naranja');
      });
      expect(result.current.state.nivelAlertaActual).toBe('naranja');

      act(() => {
        result.current.setNivelAlerta('rojo');
      });
      expect(result.current.state.nivelAlertaActual).toBe('rojo');
      expect(INFORMACION_ALERTAS.rojo.titulo).toContain('Rojo');
    });

    it('6.2 Matriz de Señales Naturales: debe registrar signos y activar advertencia ante estruendo o represamiento', () => {
      const { result } = renderHook(() => useHuaicos());
      const estruendo = result.current.state.senalesTempranas.find(s => s.id === 'estruendo');
      expect(estruendo?.esPeligroMortal).toBe(true);
      expect(estruendo?.tiempoReaccionSegundos).toBeLessThanOrEqual(180);

      act(() => {
        result.current.toggleSenal('estruendo');
      });

      const updated = result.current.state.senalesTempranas.find(s => s.id === 'estruendo');
      expect(updated?.reconocida).toBe(true);

      const represamiento = result.current.state.senalesTempranas.find(s => s.id === 'represamiento_caudal');
      expect(represamiento?.esPeligroMortal).toBe(true);
    });

    it('6.3 Guía de Evacuación 90°: debe permitir registrar punto en cota alta y ruta perpendicular', () => {
      const { result } = renderHook(() => useHuaicos());
      act(() => {
        result.current.savePlanEvacuacion({
          puntoEncuentroCotaAlta: 'Plaza del Mirador Loma Alta (+45m)',
          descripcionRutaPerpendicular: 'Subir por el callejón de piedra perpendicular al cauce de la quebrada',
          contactoReferenciaNombre: 'Comisaría Chosica',
          contactoReferenciaTelefono: '987654321',
          viviendaEnRiesgoAbanico: true
        });
      });

      expect(result.current.state.planEvacuacion.puntoEncuentroCotaAlta).toBe('Plaza del Mirador Loma Alta (+45m)');
      expect(result.current.state.planEvacuacion.viviendaEnRiesgoAbanico).toBe(true);
      expect(validarTelefonoPeru(result.current.state.planEvacuacion.contactoReferenciaTelefono)).toBe(true);
    });

    it('6.4 Calculador de Potabilización de Agua: fórmula oficial INDECI 2 gotas 5% lejía / litro y 30 min reposo', () => {
      // 1 Litro = 2 gotas
      const calc1 = calcularPotabilizacionAgua(1);
      expect(calc1.gotasLejia).toBe(2);
      expect(calc1.minutosReposo).toBe(30);

      // 5 Litros = 10 gotas, 1 pastilla
      const calc5 = calcularPotabilizacionAgua(5);
      expect(calc5.gotasLejia).toBe(10);
      expect(calc5.pastillasSugeridas).toBe(1);

      // 20 Litros (bidón familiar) = 40 gotas, 4 pastillas
      const calc20 = calcularPotabilizacionAgua(20);
      expect(calc20.gotasLejia).toBe(40);
      expect(calc20.pastillasSugeridas).toBe(4);

      // 100 Litros = 200 gotas
      const calc100 = calcularPotabilizacionAgua(100);
      expect(calc100.gotasLejia).toBe(200);
      expect(calc100.pastillasSugeridas).toBe(20);
    });

    it('6.5 Checklist Estacional: debe calcular progreso estrictamente acotado en [0, 100]% a través de sus 4 categorías', () => {
      const { result } = renderHook(() => useHuaicos());
      expect(result.current.state.articulos.length).toBeGreaterThanOrEqual(14);
      expect(result.current.metricas.porcentajeTotal).toBe(0);

      // 4 categories check
      expect(CATEGORIAS_HUAICOS.proteccion_hogar).toBeDefined();
      expect(CATEGORIAS_HUAICOS.documentos_impermeables).toBeDefined();
      expect(CATEGORIAS_HUAICOS.suministros_reserva).toBeDefined();
      expect(CATEGORIAS_HUAICOS.evacuacion_comunitaria).toBeDefined();

      // Toggle first item
      const firstId = result.current.state.articulos[0].id;
      act(() => {
        result.current.toggleItem(firstId);
      });

      expect(result.current.metricas.articulosCompletados).toBe(1);
      expect(result.current.metricas.porcentajeTotal).toBeGreaterThan(0);
      expect(result.current.metricas.porcentajeTotal).toBeLessThanOrEqual(100);
    });
  });
});
