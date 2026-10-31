import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CajaReservaView } from '../../src/components/mochila/CajaReservaView';

describe('CajaReservaView Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar la vista de Caja de Reserva con progreso inicial en 0%', () => {
    render(<CajaReservaView />);
    expect(screen.getByTestId('caja-reserva-progress')).toHaveTextContent('0%');
    expect(screen.getByText('Caja de Reserva (72h+)')).toBeInTheDocument();
    expect(screen.getByText('Agua y Alimentos a Granel')).toBeInTheDocument();
  });

  it('debe permitir alternar el estado de un artículo de la Caja de Reserva', () => {
    render(<CajaReservaView />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    const firstCheckbox = checkboxes[0];
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    const progressText = screen.getByTestId('caja-reserva-progress').textContent;
    const pct = parseInt(progressText?.replace('%', '') || '0', 10);
    expect(pct).toBeGreaterThan(0);
  });

  it('debe permitir agregar un artículo personalizado a la Caja de Reserva', () => {
    render(<CajaReservaView />);

    const btnAbrirModal = screen.getByTestId('btn-add-caja-item');
    fireEvent.click(btnAbrirModal);

    const inputNombre = screen.getByTestId('input-caja-nombre');
    const inputCantidad = screen.getByTestId('input-caja-cantidad');
    const btnGuardar = screen.getByTestId('btn-guardar-caja');

    fireEvent.change(inputNombre, { target: { value: 'Bidón 10L Agua Ozono' } });
    fireEvent.change(inputCantidad, { target: { value: '1 bidón' } });
    fireEvent.click(btnGuardar);

    expect(screen.getByText('Bidón 10L Agua Ozono')).toBeInTheDocument();
    expect(screen.getByText('Personalizado')).toBeInTheDocument();
  });
});
