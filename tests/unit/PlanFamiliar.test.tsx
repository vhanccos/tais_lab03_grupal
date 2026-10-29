import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { PlanFamiliarView } from '../../src/components/planFamiliar/PlanFamiliarView';

describe('PlanFamiliarView Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe registrar un familiar y asignarle su rol ante sismos', () => {
    render(<PlanFamiliarView />);

    const inputNombre = screen.getByTestId('input-nombre-familiar');
    const inputRol = screen.getByTestId('input-rol-familiar');
    const btnGuardar = screen.getByTestId('btn-guardar-familiar');

    fireEvent.change(inputNombre, { target: { value: 'Carlos Mendoza' } });
    fireEvent.change(inputRol, { target: { value: 'Llevar la mochila de emergencia' } });
    fireEvent.click(btnGuardar);

    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText('Llevar la mochila de emergencia')).toBeInTheDocument();
  });

  it('debe rechazar nombres vacíos mostrando mensaje de error', () => {
    render(<PlanFamiliarView />);

    const inputNombre = screen.getByTestId('input-nombre-familiar');
    const btnGuardar = screen.getByTestId('btn-guardar-familiar');

    fireEvent.change(inputNombre, { target: { value: '   ' } });
    fireEvent.click(btnGuardar);

    expect(screen.getByTestId('form-integrante-error')).toBeInTheDocument();
  });

  it('debe habilitar las acciones 119 al escribir un celular clave de 9 dígitos', () => {
    render(<PlanFamiliarView />);

    const inputCel = screen.getByTestId('input-celular-119');
    fireEvent.change(inputCel, { target: { value: '987654321' } });

    const btnGrabar = screen.getByTestId('btn-grabar-119');
    expect(btnGrabar).toHaveAttribute('href', 'tel:1191987654321');

    const btnEscuchar = screen.getByTestId('btn-escuchar-119');
    expect(btnEscuchar).toHaveAttribute('href', 'tel:1192987654321');
  });
});
