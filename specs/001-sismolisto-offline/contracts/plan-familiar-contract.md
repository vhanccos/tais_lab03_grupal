# Contratos de Interfaz: Módulo Plan Familiar y Protocolo 119

**Feature**: `001-sismolisto-offline`
**Type**: Frontend Module Interface Contract

Este contrato define las estructuras y operaciones asociadas al registro de integrantes, roles, zonas seguras y el protocolo telefónico nacional 119.

## 1. Tipos de Datos

```typescript
export interface IntegranteFamiliar {
  id: string;
  nombreCompleto: string; // trim().length > 0
  rolSismo: string;        // trim().length > 0
  notas?: string;
}

export interface PlanFamiliar {
  puntoEncuentroInterno: string;
  puntoEncuentroExterno: string;
  numeroFamiliarClave: string; // Exactamente 9 dígitos: /^9\d{8}$/
  integrantes: IntegranteFamiliar[];
  fechaActualizacion: string; // ISO 8601
}

export interface Enlaces119 {
  grabarMensajeUri: string;   // "tel:1191{numeroFamiliarClave}"
  escucharMensajeUri: string; // "tel:1192{numeroFamiliarClave}"
  esNumeroValido: boolean;
}
```

## 2. Contrato de Acciones del Plan Familiar

### `addIntegrante(data: Omit<IntegranteFamiliar, 'id'>): { success: boolean; error?: string }`
- **Precondiciones**:
  - `data.nombreCompleto.trim().length > 0`.
  - `data.rolSismo.trim().length > 0`.
  - Número actual de integrantes `< 20`.
- **Efecto**: Agrega el integrante con un nuevo `id` único, actualiza la lista y persiste en almacenamiento local inmediatamente.

### `updateIntegrante(id: string, data: Partial<Omit<IntegranteFamiliar, 'id'>>): boolean`
- Actualiza los datos del integrante especificado y persiste localmente.

### `removeIntegrante(id: string): boolean`
- Remueve al integrante de la lista familiar y actualiza la persistencia local.

### `savePuntosEncuentro(interno: string, externo: string): void`
- Guarda las descripciones de las zonas seguras dentro y fuera del hogar.

## 3. Contrato de Generación y Validación de Enlaces 119

### `generate119Uris(numeroCelular: string): Enlaces119`
- **Validación**: Comprueba si el número cumple la expresión `/^9\d{8}$/`.
- **Resultado si es válido**:
  - `esNumeroValido: true`
  - `grabarMensajeUri: "tel:1191" + numeroCelular.trim()`
  - `escucharMensajeUri: "tel:1192" + numeroCelular.trim()`
- **Resultado si es inválido**:
  - `esNumeroValido: false`
  - `grabarMensajeUri: ""`
  - `escucharMensajeUri: ""`
