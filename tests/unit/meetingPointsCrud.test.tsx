import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ZonasSeguras } from '../../src/components/planFamiliar/ZonasSeguras';
import { PuntoEncuentro } from '../../src/storage/stateTypes';

describe('ZonasSeguras CRUD Component', () => {
  const defaultPuntos: PuntoEncuentro[] = [
    {
      id: 'p-1',
      nombre: 'Punto Interno Sala',
      tipo: 'interno',
      descripcion: 'Junto a columna de concreto',
      esPredeterminado: true
    },
    {
      id: 'p-2',
      nombre: 'Círculo Verde Parque',
      tipo: 'externo',
      descripcion: 'Círculo de seguridad INDECI en parque',
      coordenadas: { lat: -12.0463, lng: -77.0427 },
      esPredeterminado: true
    }
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('debe mostrar los puntos de encuentro estructurados y soportar backward compatibility', () => {
    render(
      <ZonasSeguras
        puntoInterno="Columna sala"
        puntoExterno="Parque central"
        onSave={() => {}}
        puntosEncuentro={defaultPuntos}
      />
    );

    expect(screen.getByTestId('input-punto-interno')).toHaveValue('Columna sala');
    expect(screen.getByTestId('input-punto-externo')).toHaveValue('Parque central');
    expect(screen.getByText('Punto Interno Sala')).toBeInTheDocument();
    expect(screen.getByText('Círculo Verde Parque')).toBeInTheDocument();
  });

  it('debe permitir abrir modal y agregar un nuevo punto de encuentro con coordenadas', () => {
    let nuevoPuntoAgregado: any = null;
    const handleAdd = (data: any) => {
      nuevoPuntoAgregado = data;
      return { success: true };
    };

    render(
      <ZonasSeguras
        puntoInterno="Columna sala"
        puntoExterno="Parque central"
        onSave={() => {}}
        puntosEncuentro={defaultPuntos}
        onAddPunto={handleAdd}
      />
    );

    const btnNuevoPunto = screen.getByTestId('btn-add-punto');
    fireEvent.click(btnNuevoPunto);

    const inputNombre = screen.getByTestId('input-punto-nombre');
    const inputDesc = screen.getByTestId('input-punto-descripcion');
    const inputLat = screen.getByTestId('input-punto-lat');
    const inputLng = screen.getByTestId('input-punto-lng');
    const btnGuardar = screen.getByTestId('btn-guardar-punto-modal');

    fireEvent.change(inputNombre, { target: { value: 'Losa Deportiva Los Olivos' } });
    fireEvent.change(inputDesc, { target: { value: 'Campo de fútbol abierto sin tendido eléctrico' } });
    fireEvent.change(inputLat, { target: { value: '-12.0012' } });
    fireEvent.change(inputLng, { target: { value: '-77.0543' } });

    fireEvent.click(btnGuardar);

    expect(nuevoPuntoAgregado).toBeDefined();
    expect(nuevoPuntoAgregado.nombre).toBe('Losa Deportiva Los Olivos');
    expect(nuevoPuntoAgregado.coordenadas.lat).toBe(-12.0012);
    expect(nuevoPuntoAgregado.coordenadas.lng).toBe(-77.0543);
  });
});
