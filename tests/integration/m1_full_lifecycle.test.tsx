import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../../src/App';

describe('Milestone 1 Full Integration Lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe navegar fluidamente entre Mochila, Caja 72h+, Plan Familiar y Herramientas SOS', () => {
    render(<App />);

    // Initial tab: Mochila
    expect(screen.getByText('Mochila para Emergencias')).toBeInTheDocument();

    // Navigate to Caja de Reserva (72h+)
    const tabCaja = screen.getByTestId('tab-caja');
    fireEvent.click(tabCaja);
    expect(screen.getByText('Caja de Reserva (72h+)')).toBeInTheDocument();

    // Navigate to Plan Familiar & 119
    const tabPlan = screen.getByTestId('tab-plan');
    fireEvent.click(tabPlan);
    expect(screen.getByText('Plan Familiar de Emergencia')).toBeInTheDocument();
    expect(screen.getByText('Directorio Telefónico de Emergencias Nacionales')).toBeInTheDocument();

    // Navigate to Herramientas SOS
    const tabSos = screen.getByTestId('tab-sos');
    fireEvent.click(tabSos);
    expect(screen.getByText('Herramientas SOS y Hardware')).toBeInTheDocument();
    expect(screen.getByTestId('btn-torch-steady')).toBeInTheDocument();
  });

  it('debe permitir ciclo completo de añadir y persistir un familiar con rol y un punto de encuentro', () => {
    render(<App />);

    // Ir a Plan Familiar
    fireEvent.click(screen.getByTestId('tab-plan'));

    // 1. Agregar familiar
    const inputNombre = screen.getByTestId('input-nombre-familiar');
    const inputRol = screen.getByTestId('input-rol-familiar');
    const btnGuardarFam = screen.getByTestId('btn-guardar-familiar');

    fireEvent.change(inputNombre, { target: { value: 'Beatriz Salazar' } });
    fireEvent.change(inputRol, { target: { value: 'Guía de evacuación de infantes' } });
    fireEvent.click(btnGuardarFam);

    expect(screen.getByText('Beatriz Salazar')).toBeInTheDocument();
    expect(screen.getByText('Guía de evacuación de infantes')).toBeInTheDocument();

    // 2. Guardar punto de encuentro
    const inputInterno = screen.getByTestId('input-punto-interno');
    const inputExterno = screen.getByTestId('input-punto-externo');
    const btnGuardarZonas = screen.getByTestId('btn-guardar-zonas');

    fireEvent.change(inputInterno, { target: { value: 'Columna este del comedor' } });
    fireEvent.change(inputExterno, { target: { value: 'Círculo 3 Parque Central' } });
    fireEvent.click(btnGuardarZonas);

    expect(inputInterno).toHaveValue('Columna este del comedor');
    expect(inputExterno).toHaveValue('Círculo 3 Parque Central');

    // 3. Verificar que los enlaces telefónicos 105, 116 y 106 están presentes
    expect(screen.getByTestId('tel-105')).toHaveAttribute('href', 'tel:105');
    expect(screen.getByTestId('tel-116')).toHaveAttribute('href', 'tel:116');
    expect(screen.getByTestId('tel-106')).toHaveAttribute('href', 'tel:106');
  });
});
