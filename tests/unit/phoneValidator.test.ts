import { describe, it, expect } from 'vitest';
import { generate119Uris, validatePhoneNumber } from '../../src/core/phoneValidator';

describe('phoneValidator & 119 URIs', () => {
  it('debe validar números peruanos de exactamente 9 dígitos que empiezan en 9', () => {
    expect(validatePhoneNumber('987654321')).toBe(true);
    expect(validatePhoneNumber('912345678')).toBe(true);
  });

  it('debe invalidar números con cantidad de dígitos distinta de 9 o caracteres no numéricos', () => {
    expect(validatePhoneNumber('')).toBe(false);
    expect(validatePhoneNumber('123456789')).toBe(false); // no empieza en 9
    expect(validatePhoneNumber('98765432')).toBe(false);  // 8 dígitos
    expect(validatePhoneNumber('9876543210')).toBe(false); // 10 dígitos
    expect(validatePhoneNumber('98765abcd')).toBe(false);
  });

  it('debe generar URIs correctos para grabar (1191) y escuchar (1192) cuando el número es válido', () => {
    const uris = generate119Uris('987654321');
    expect(uris.esNumeroValido).toBe(true);
    expect(uris.grabarMensajeUri).toBe('tel:1191987654321');
    expect(uris.escucharMensajeUri).toBe('tel:1192987654321');
  });

  it('debe devolver URIs vacíos y esNumeroValido false cuando el número es inválido', () => {
    const uris = generate119Uris('12345');
    expect(uris.esNumeroValido).toBe(false);
    expect(uris.grabarMensajeUri).toBe('');
    expect(uris.escucharMensajeUri).toBe('');
  });
});
