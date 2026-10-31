import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DirectorioEmergencia } from '../../src/components/planFamiliar/DirectorioEmergencia';
import { CONTACTOS_EMERGENCIA_PERU } from '../../src/core/emergencyContacts';

describe('DirectorioEmergencia Component', () => {
  it('debe renderizar todos los números oficiales de emergencia de Perú con enlaces tel:', () => {
    render(<DirectorioEmergencia />);

    for (const contacto of CONTACTOS_EMERGENCIA_PERU) {
      const link = screen.getByTestId(`tel-${contacto.numero}`);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `tel:${contacto.numero}`);
      expect(screen.getByText(contacto.nombre)).toBeInTheDocument();
    }
  });

  it('debe contener enlaces de alta prioridad para Bomberos (116) y SAMU (106)', () => {
    render(<DirectorioEmergencia />);

    const linkBomberos = screen.getByTestId('tel-116');
    expect(linkBomberos).toHaveAttribute('href', 'tel:116');

    const linkSamu = screen.getByTestId('tel-106');
    expect(linkSamu).toHaveAttribute('href', 'tel:106');

    const linkPnp = screen.getByTestId('tel-105');
    expect(linkPnp).toHaveAttribute('href', 'tel:105');
  });
});
