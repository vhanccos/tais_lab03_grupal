import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../../src/App';
import { StorageAdapter } from '../../src/storage/storageAdapter';

describe('Offline Lifecycle & Full App Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe persistir cambios de mochila y plan tras un desmontaje y re-render completo (simulación de recarga / reinicio)', () => {
    const { unmount } = render(<App />);

    // 1. Marcar un artículo de mochila
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    // 2. Cambiar de pestaña al Plan Familiar
    fireEvent.click(screen.getByTestId('tab-plan'));

    // 3. Registrar un integrante
    const inputNombre = screen.getByTestId('input-nombre-familiar');
    const inputRol = screen.getByTestId('input-rol-familiar');
    const btnGuardar = screen.getByTestId('btn-guardar-familiar');

    fireEvent.change(inputNombre, { target: { value: 'Laura Sanchez' } });
    fireEvent.change(inputRol, { target: { value: 'Apoyo a abuela' } });
    fireEvent.click(btnGuardar);

    // 4. Guardar celular clave 119
    const inputCel = screen.getByTestId('input-celular-119');
    fireEvent.change(inputCel, { target: { value: '999888777' } });

    // 5. Simular cierre abrupto de la app (unmount)
    unmount();

    // 6. Verificar persistencia local en almacenamiento síncrono
    const adapter = new StorageAdapter();
    const storedState = adapter.loadState();
    expect(storedState.mochila.articulos[0].completado).toBe(true);
    expect(storedState.planFamiliar.integrantes[0].nombreCompleto).toBe('Laura Sanchez');
    expect(storedState.planFamiliar.numeroFamiliarClave).toBe('999888777');

    // 7. Volver a abrir la app (re-render)
    render(<App />);
    expect(screen.getByTestId('header-progress-text')).not.toHaveTextContent('0%');

    // Navegar a Plan Familiar y comprobar que Laura Sanchez sigue allí
    fireEvent.click(screen.getByTestId('tab-plan'));
    expect(screen.getByText('Laura Sanchez')).toBeInTheDocument();
    expect(screen.getByTestId('input-celular-119')).toHaveValue('999888777');
    expect(screen.getByTestId('btn-grabar-119')).toHaveAttribute('href', 'tel:1191999888777');
  });
});
