import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HerramientasEmergencia } from '../../src/components/utilities/HerramientasEmergencia';

describe('HerramientasEmergencia Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debe renderizar los controles de Linterna, Silbato y Cámara', () => {
    render(<HerramientasEmergencia />);

    expect(screen.getByText('Linterna y Destello SOS')).toBeInTheDocument();
    expect(screen.getByText('Silbato de Rescate Acústico')).toBeInTheDocument();
    expect(screen.getByText('Registro Fotográfico de Daños Estructurales')).toBeInTheDocument();

    expect(screen.getByTestId('btn-torch-steady')).toBeInTheDocument();
    expect(screen.getByTestId('btn-torch-sos')).toBeInTheDocument();
    expect(screen.getByTestId('btn-whistle-continuous')).toBeInTheDocument();
    expect(screen.getByTestId('btn-whistle-rule-of-three')).toBeInTheDocument();
    expect(screen.getByTestId('btn-capture-photo')).toBeInTheDocument();
  });

  it('debe activar la pantalla blanca al presionar Activar Pantalla Blanca', () => {
    render(<HerramientasEmergencia />);

    const btnScreenTorch = screen.getByTestId('btn-screen-torch');
    fireEvent.click(btnScreenTorch);

    const overlay = screen.getByTestId('screen-torch-overlay');
    expect(overlay).toBeInTheDocument();
    expect(screen.getByText('Luz de Pantalla Activa')).toBeInTheDocument();

    // Click to dismiss
    fireEvent.click(overlay);
    expect(screen.queryByTestId('screen-torch-overlay')).not.toBeInTheDocument();
  });
});
