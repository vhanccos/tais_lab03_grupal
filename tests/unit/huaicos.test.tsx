import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calcularProgresoHuaicos,
  calcularPotabilizacionAgua,
  validarTelefonoPeru,
  DEFAULT_ITEMS_HUAICOS,
  DEFAULT_SENALES_TEMPRANAS,
  ItemHuaicoChecklist
} from '../../src/core/huaicosDomain';
import { useHuaicos, HUAICOS_STORAGE_KEY, _resetHuaicosMemoryFallbackForTesting } from '../../src/hooks/useHuaicos';
import { SemaforoAlertas } from '../../src/components/huaicos/SemaforoAlertas';
import { MatrizSenalesTempranas } from '../../src/components/huaicos/MatrizSenalesTempranas';
import { GuiaEvacuacionPerpendicular } from '../../src/components/huaicos/GuiaEvacuacionPerpendicular';
import { ChecklistTemporadaLluvias } from '../../src/components/huaicos/ChecklistTemporadaLluvias';
import { CalculadorPotabilizacion } from '../../src/components/huaicos/CalculadorPotabilizacion';
import App from '../../src/App';

describe('Feature 003: Huaicos Offline Domain & Calculation Algorithms', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetHuaicosMemoryFallbackForTesting();
  });
  it('calcularProgresoHuaicos debe retornar 0% invariante cuando la lista es vacía', () => {
    const progreso = calcularProgresoHuaicos([]);
    expect(progreso.porcentajeTotal).toBe(0);
    expect(progreso.totalArticulos).toBe(0);
    expect(progreso.articulosCompletados).toBe(0);
    expect(progreso.desglose.proteccion_hogar.porcentaje).toBe(0);
  });

  it('calcularProgresoHuaicos debe acotar el resultado estrictamente a [0, 100]%', () => {
    const items: ItemHuaicoChecklist[] = [
      {
        id: '1',
        categoriaId: 'proteccion_hogar',
        titulo: 'Sacos',
        descripcion: 'desc',
        completado: true,
        esCritico: true
      },
      {
        id: '2',
        categoriaId: 'proteccion_hogar',
        titulo: 'Techos',
        descripcion: 'desc',
        completado: false,
        esCritico: false
      }
    ];

    const progreso = calcularProgresoHuaicos(items);
    expect(progreso.porcentajeTotal).toBe(50);
    expect(progreso.desglose.proteccion_hogar.porcentaje).toBe(50);
    expect(progreso.desglose.documentos_impermeables.porcentaje).toBe(0);
  });

  it('calcularProgresoHuaicos debe dar 100% cuando todos los ítems están completados', () => {
    const items = DEFAULT_ITEMS_HUAICOS.map(it => ({ ...it, completado: true }));
    const progreso = calcularProgresoHuaicos(items);
    expect(progreso.porcentajeTotal).toBe(100);
    expect(progreso.articulosCompletados).toBe(items.length);
  });

  it('calcularPotabilizacionAgua debe aplicar la fórmula oficial INDECI (2 gotas lejía 5% / L)', () => {
    const res1 = calcularPotabilizacionAgua(1);
    expect(res1.esValido).toBe(true);
    expect(res1.gotasLejia).toBe(2);
    expect(res1.minutosReposo).toBe(30);

    const res5 = calcularPotabilizacionAgua(5);
    expect(res5.esValido).toBe(true);
    expect(res5.gotasLejia).toBe(10);
    expect(res5.pastillasSugeridas).toBe(1);

    const res20 = calcularPotabilizacionAgua(20);
    expect(res20.esValido).toBe(true);
    expect(res20.gotasLejia).toBe(40);
    expect(res20.pastillasSugeridas).toBe(4);
  });

  it('calcularPotabilizacionAgua debe manejar valores inválidos y no arrojar NaN', () => {
    const res0 = calcularPotabilizacionAgua(0);
    expect(res0.esValido).toBe(false);
    expect(res0.gotasLejia).toBe(0);
    expect(res0.advertencia).toBeDefined();

    const resNeg = calcularPotabilizacionAgua(-5);
    expect(resNeg.esValido).toBe(false);
    expect(resNeg.gotasLejia).toBe(0);

    const resNaN = calcularPotabilizacionAgua(NaN);
    expect(resNaN.esValido).toBe(false);
    expect(resNaN.gotasLejia).toBe(0);
  });

  it('validarTelefonoPeru debe validar teléfonos celulares peruanos de 9 dígitos', () => {
    expect(validarTelefonoPeru('987654321')).toBe(true);
    expect(validarTelefonoPeru('912345678')).toBe(true);
    expect(validarTelefonoPeru('887654321')).toBe(false); // No empieza con 9
    expect(validarTelefonoPeru('98765432')).toBe(false); // 8 dígitos
    expect(validarTelefonoPeru('9876543210')).toBe(false); // 10 dígitos
    expect(validarTelefonoPeru('98765abc1')).toBe(false); // Letras
    expect(validarTelefonoPeru('')).toBe(false);
  });
});

describe('Feature 003: useHuaicos Hook & Offline Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetHuaicosMemoryFallbackForTesting();
  });

  it('debe inicializarse con el catálogo oficial predeterminado', () => {
    const { result } = renderHook(() => useHuaicos());
    expect(result.current.state.nivelAlertaActual).toBe('verde');
    expect(result.current.state.articulos.length).toBeGreaterThanOrEqual(14);
    expect(result.current.state.senalesTempranas.length).toBe(6);
    expect(result.current.metricas.porcentajeTotal).toBe(0);
  });

  it('debe alternar atómicamente el estado de un artículo y persistir en localStorage', () => {
    const { result } = renderHook(() => useHuaicos());
    const firstItemId = result.current.state.articulos[0].id;

    act(() => {
      result.current.toggleItem(firstItemId);
    });

    expect(result.current.state.articulos[0].completado).toBe(true);
    expect(result.current.metricas.porcentajeTotal).toBeGreaterThan(0);

    // Verificar en localStorage
    const raw = localStorage.getItem(HUAICOS_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.articulos[0].completado).toBe(true);
  });

  it('debe cambiar el nivel de alerta y persistir', () => {
    const { result } = renderHook(() => useHuaicos());

    act(() => {
      result.current.setNivelAlerta('rojo');
    });

    expect(result.current.state.nivelAlertaActual).toBe('rojo');
    const raw = localStorage.getItem(HUAICOS_STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.nivelAlertaActual).toBe('rojo');
  });

  it('debe guardar el plan de evacuación correctamente', () => {
    const { result } = renderHook(() => useHuaicos());

    act(() => {
      result.current.savePlanEvacuacion({
        puntoEncuentroCotaAlta: 'Cerro Mirador Cota +70m',
        contactoReferenciaTelefono: '999888111'
      });
    });

    expect(result.current.state.planEvacuacion.puntoEncuentroCotaAlta).toBe('Cerro Mirador Cota +70m');
    expect(result.current.state.planEvacuacion.contactoReferenciaTelefono).toBe('999888111');
  });

  it('debe recuperarse ante JSON corrupto en localStorage', () => {
    localStorage.setItem(HUAICOS_STORAGE_KEY, '{ invalid_json');
    const { result } = renderHook(() => useHuaicos());
    expect(result.current.state.nivelAlertaActual).toBe('verde');
    expect(result.current.state.articulos.length).toBeGreaterThanOrEqual(14);
  });
});

describe('Feature 003: UI Components', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetHuaicosMemoryFallbackForTesting();
  });

  it('SemaforoAlertas debe permitir cambiar niveles y desplegar directivas de evacuación', () => {
    const onCambiar = vi.fn();

    const { rerender } = render(
      <SemaforoAlertas nivelActual="verde" onCambiarNivel={onCambiar} />
    );

    expect(screen.getByTestId('alerta-titulo')).toHaveTextContent(/Nivel Verde/i);

    // Cambiar a Rojo
    const btnRojo = screen.getByTestId('btn-alerta-rojo');
    fireEvent.click(btnRojo);
    expect(onCambiar).toHaveBeenCalledWith('rojo');

    rerender(<SemaforoAlertas nivelActual="rojo" onCambiarNivel={onCambiar} />);
    expect(screen.getByTestId('alerta-titulo')).toHaveTextContent(/Nivel Rojo/i);
    expect(screen.getByTestId('alerta-directiva')).toHaveTextContent(/EVACUACIÓN FORZOSA INMEDIATA/i);
  });

  it('MatrizSenalesTempranas debe mostrar las 6 señales y alertar peligro mortal inminente', () => {
    const senales = JSON.parse(JSON.stringify(DEFAULT_SENALES_TEMPRANAS));
    const onToggle = vi.fn();

    const { rerender } = render(
      <MatrizSenalesTempranas senales={senales} onToggleSenal={onToggle} />
    );

    // No debe haber banner de peligro inminente inicialmente
    expect(screen.queryByTestId('banner-peligro-inminente')).toBeNull();

    // Clic en la señal de estruendo
    const estruendoCard = screen.getByTestId('senal-card-estruendo');
    fireEvent.click(estruendoCard);
    expect(onToggle).toHaveBeenCalledWith('estruendo');

    // Simular que estruendo está marcada
    senales[0].reconocida = true;
    rerender(<MatrizSenalesTempranas senales={senales} onToggleSenal={onToggle} />);

    // Ahora debe verse el banner de peligro mortal inminente
    expect(screen.getByTestId('banner-peligro-inminente')).toBeInTheDocument();
    expect(screen.getByTestId('contador-senales-activas')).toHaveTextContent('1 detectadas');
  });

  it('GuiaEvacuacionPerpendicular debe validar campos, guardar cota alta y generar enlaces tel:', () => {
    const plan = {
      puntoEncuentroCotaAlta: '',
      descripcionRutaPerpendicular: '',
      contactoReferenciaNombre: '',
      contactoReferenciaTelefono: '',
      viviendaEnRiesgoAbanico: false,
      fechaActualizacion: ''
    };
    const onGuardar = vi.fn();

    render(<GuiaEvacuacionPerpendicular plan={plan} onGuardarPlan={onGuardar} />);

    // Verificar enlaces tel: de emergencias
    expect(screen.getByTestId('btn-tel-115')).toHaveAttribute('href', 'tel:115');
    expect(screen.getByTestId('btn-tel-116')).toHaveAttribute('href', 'tel:116');
    expect(screen.getByTestId('btn-tel-106')).toHaveAttribute('href', 'tel:106');
    expect(screen.getByTestId('btn-tel-105')).toHaveAttribute('href', 'tel:105');

    // Intentar guardar con campos vacíos -> error de validación
    fireEvent.click(screen.getByTestId('btn-guardar-plan'));
    expect(screen.getByTestId('error-validacion')).toHaveTextContent(/Debe ingresar el nombre/i);
    expect(onGuardar).not.toHaveBeenCalled();

    // Llenar punto alto válido y teléfono
    fireEvent.change(screen.getByTestId('input-punto-alto'), {
      target: { value: 'Loma Alta Cota +80m' }
    });
    fireEvent.change(screen.getByTestId('input-contacto-telefono'), {
      target: { value: '987654321' }
    });
    fireEvent.change(screen.getByTestId('input-contacto-nombre'), {
      target: { value: 'Hermano Juan' }
    });

    fireEvent.click(screen.getByTestId('btn-guardar-plan'));
    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({
        puntoEncuentroCotaAlta: 'Loma Alta Cota +80m',
        contactoReferenciaTelefono: '987654321',
        contactoReferenciaNombre: 'Hermano Juan'
      })
    );

    // Debe mostrar botón llamar a contacto con tel:987654321
    expect(screen.getByTestId('btn-llamar-contacto')).toHaveAttribute('href', 'tel:987654321');
  });

  it('ChecklistTemporadaLluvias debe responder a toggles y mostrar progreso reactivo', () => {
    const articulos = JSON.parse(JSON.stringify(DEFAULT_ITEMS_HUAICOS));
    const metricas = calcularProgresoHuaicos(articulos);
    const onToggle = vi.fn();
    const onReset = vi.fn();

    render(
      <ChecklistTemporadaLluvias
        articulos={articulos}
        metricas={metricas}
        onToggleItem={onToggle}
        onReset={onReset}
      />
    );

    expect(screen.getByTestId('progreso-huaicos-porcentaje')).toHaveTextContent('0%');

    // Toggle de primer ítem
    const firstItem = screen.getByTestId(`item-checklist-${articulos[0].id}`);
    fireEvent.click(firstItem);
    expect(onToggle).toHaveBeenCalledWith(articulos[0].id);

    // Reset button
    fireEvent.click(screen.getByTestId('btn-reset-huaicos'));
    expect(onReset).toHaveBeenCalled();
  });

  it('CalculadorPotabilizacion debe calcular correctamente y responder a presets e inputs', () => {
    render(<CalculadorPotabilizacion />);

    // Por defecto inicia en 5 L
    expect(screen.getByTestId('gotas-lejia-resultado')).toHaveTextContent('10');

    // Clic en preset 1L
    fireEvent.click(screen.getByTestId('preset-1l'));
    expect(screen.getByTestId('gotas-lejia-resultado')).toHaveTextContent('2');

    // Clic en preset 20L
    fireEvent.click(screen.getByTestId('preset-20l'));
    expect(screen.getByTestId('gotas-lejia-resultado')).toHaveTextContent('40');
    expect(screen.getByTestId('pastillas-resultado')).toHaveTextContent('4');

    // Ingresar volumen inválido
    const input = screen.getByTestId('input-litros-agua');
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.getByTestId('advertencia-volumen-invalido')).toBeInTheDocument();
  });
});

describe('Feature 003: Integration in Full Application', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetHuaicosMemoryFallbackForTesting();
  });

  it('debe navegar a la pestaña de Huaicos y permitir interacción completa', () => {
    render(<App />);

    // Click en la pestaña Huaicos
    const tabHuaicos = screen.getByTestId('tab-huaicos');
    expect(tabHuaicos).toBeInTheDocument();
    fireEvent.click(tabHuaicos);

    // Verifica que se monta HuaicosView
    expect(screen.getByTestId('huaicos-view')).toBeInTheDocument();

    // Subtabs de navegación interna
    expect(screen.getByTestId('subtab-alertas')).toBeInTheDocument();
    expect(screen.getByTestId('subtab-evacuacion')).toBeInTheDocument();
    expect(screen.getByTestId('subtab-checklist')).toBeInTheDocument();
    expect(screen.getByTestId('subtab-agua')).toBeInTheDocument();

    // Navegar a Evacuación 90°
    fireEvent.click(screen.getByTestId('subtab-evacuacion'));
    expect(screen.getByTestId('guia-evacuacion')).toBeInTheDocument();

    // Navegar a Checklist Temporada
    fireEvent.click(screen.getByTestId('subtab-checklist'));
    expect(screen.getByTestId('checklist-huaicos')).toBeInTheDocument();

    // Navegar a Agua y Salud
    fireEvent.click(screen.getByTestId('subtab-agua'));
    expect(screen.getByTestId('calculador-potabilizacion')).toBeInTheDocument();
  });
});
