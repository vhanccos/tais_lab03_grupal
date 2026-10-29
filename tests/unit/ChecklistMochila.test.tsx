import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChecklistMochila } from '../../src/components/mochila/ChecklistMochila';

describe('ChecklistMochila Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar el checklist con el progreso inicial en 0%', () => {
    render(<ChecklistMochila />);
    expect(screen.getByTestId('progress-percentage-display')).toHaveTextContent('0%');
    expect(screen.getByText('Primeros Auxilios')).toBeInTheDocument();
  });

  it('debe actualizar reactivamente el porcentaje al marcar un elemento', () => {
    render(<ChecklistMochila />);
    
    // Primeros auxilios está abierta por defecto
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    // El porcentaje debe ser mayor a 0%
    const progressText = screen.getByTestId('progress-percentage-display').textContent;
    const pct = parseInt(progressText?.replace('%', '') || '0', 10);
    expect(pct).toBeGreaterThan(0);
  });
});
