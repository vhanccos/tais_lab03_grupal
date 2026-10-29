# Contratos de Interfaz: Módulo Mochila de Emergencia

**Feature**: `001-sismolisto-offline`
**Type**: Frontend Module Interface Contract

Este contrato define las funciones de cálculo, validación y mutación para el checklist interactivo de la mochila de emergencia.

## 1. Tipos y Enums

```typescript
export type CategoriaId = 
  | 'primeros_auxilios'
  | 'alimentos'
  | 'agua'
  | 'herramientas'
  | 'abrigo'
  | 'documentos';

export interface ArticuloMochila {
  id: string;
  categoriaId: CategoriaId;
  nombre: string;
  completado: boolean;
  esPredeterminado: boolean;
  cantidadRecomendada?: string;
}

export interface DetalleCategoria {
  categoriaId: CategoriaId;
  total: number;
  completados: number;
  porcentaje: number; // [0, 100]
}

export interface MetricaProgreso {
  porcentajeTotal: number; // Entero en [0, 100]
  totalArticulos: number;
  articulosCompletados: number;
  desglose: Record<CategoriaId, DetalleCategoria>;
}
```

## 2. Contrato del Algoritmo de Cálculo Reactivo

### `calculatePreparationProgress(articulos: ArticuloMochila[]): MetricaProgreso`

- **Entrada**: Arreglo de artículos de la mochila.
- **Salida**: Objeto `MetricaProgreso` con el progreso general y por categoría.
- **Invariantes Garantizadas**:
  - Si `articulos.length === 0`, `porcentajeTotal` es estrictamente `0`.
  - El resultado de `porcentajeTotal` siempre es un entero acotado: `0 <= porcentajeTotal <= 100`.
  - No arroja excepciones ante arreglos vacíos o con datos inesperados.

## 3. Acciones de Usuario (Mutaciones de Estado)

### `toggleItem(itemId: string): void`
- Invierte el valor booleano `completado` del artículo correspondiente.
- Dispara recálculo reactivo síncrono y persistencia local inmediata en menos de 5 ms.

### `resetToDefault(): void`
- Restablece el catálogo completo de artículos recomendados por INDECI con todas las casillas desmarcadas (`completado: false`).
- Recalcula el progreso inmediatamente a `0%`.
