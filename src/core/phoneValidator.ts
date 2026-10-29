export interface Enlaces119 {
  grabarMensajeUri: string;
  escucharMensajeUri: string;
  esNumeroValido: boolean;
}

const PERU_MOBILE_REGEX = /^9\d{8}$/;

export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  return PERU_MOBILE_REGEX.test(phone.trim());
}

export function generate119Uris(numeroCelular: string): Enlaces119 {
  const cleanPhone = (numeroCelular || '').trim();
  const isValid = validatePhoneNumber(cleanPhone);

  if (!isValid) {
    return {
      grabarMensajeUri: '',
      escucharMensajeUri: '',
      esNumeroValido: false
    };
  }

  return {
    grabarMensajeUri: `tel:1191${cleanPhone}`,
    escucharMensajeUri: `tel:1192${cleanPhone}`,
    esNumeroValido: true
  };
}
