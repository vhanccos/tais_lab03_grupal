# Data Model: SismoListo Offline

**Feature**: `001-sismolisto-offline`
**Date**: 2026-10-29

Este documento describe las entidades de datos, esquemas de tipos, reglas de validación y estados locales de la aplicación SismoListo.

---

## 1. Entidades Principales

### 1.1 `CategoriaMochila` (Enumeración / Tipos)
Identifica unívocamente las 6 categorías requeridas según INDECI:
- `primeros_auxilios`: Botiquín y primeros auxilios (alcohol, gasas, vendas, medicamentos básicos).
- `alimentos`: Alimentos no perecibles (conservas enlatadas, barras energéticas).
- `agua`: Agua embotellada no gasificada.
- `herramientas`: Linterna, radio a pilas, silbato, baterías de repuesto, navaja multiusos.
- `abrigo`: Mantas térmicas, ropa de abrigo, impermeables.
- `documentos`: Copias de DNI, libreta de contactos, duplicado de llaves, dinero en efectivo en monedas.

### 1.2 `ArticuloMochila`
Representa un artículo del checklist de la mochila de emergencia.

| Campo | Tipo | Requerido | Descripción / Validación |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sí | Identificador único (UUID o slug predeterminado, ej. `agua-botella-2l`). |
| `categoriaId` | `CategoriaId` | Sí | Pertenece a una de las 6 categorías válidas. |
| `nombre` | `string` | Sí | Nombre descriptivo del artículo (ej. "Linterna y pilas de repuesto"). Longitud: 2-100 caracteres. |
| `completado` | `boolean` | Sí | Estado del checkbox interactivo (`true` = empacado, `false` = pendiente). |
| `esPredeterminado` | `boolean` | Sí | `true` para los ítems recomendados de fábrica por INDECI. |
| `cantidadRecomendada` | `string` | No | Texto opcional indicando cantidad sugerida (ej. "2 litros por persona"). |

### 1.3 `IntegranteFamiliar`
Representa a una persona del núcleo familiar u hogar.

| Campo | Tipo | Requerido | Descripción / Validación |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sí | Identificador único generado localmente. |
| `nombreCompleto` | `string` | Sí | Nombre no vacío tras `trim()`. Longitud: 2-80 caracteres. |
| `rolSismo` | `string` | Sí | Función asignada (ej. "Encargado de la mochila de emergencia", "Apoyo a adulto mayor", "Corte de gas/luz"). Longitud: 3-100 caracteres. |
| `notas` | `string` | No | Observaciones médicas o tareas secundarias. Longitud máx: 200 caracteres. |

### 1.4 `PlanFamiliar`
Estructura global de organización y evacuación del hogar.

| Campo | Tipo | Requerido | Descripción / Validación |
| :--- | :--- | :--- | :--- |
| `puntoEncuentroInterno` | `string` | Sí | Zona segura dentro de la vivienda (ej. "Columna principal del pasadizo"). |
| `puntoEncuentroExterno` | `string` | Sí | Zona de reunión comunitaria (ej. "Parque Ramón Castilla, zona central"). |
| `numeroFamiliarClave` | `string` | Sí | Número de celular para el servicio 119. Exactamente 9 dígitos numéricos: `/^9\d{8}$/`. |
| `integrantes` | `IntegranteFamiliar[]` | Sí | Lista de integrantes registrados (mínimo 0, máximo 20). |
| `fechaActualizacion` | `string` (ISO 8601) | Sí | Timestamp de la última modificación local. |

### 1.5 `MetricaProgreso`
Resultado del cálculo reactivo de preparación.

| Campo | Tipo | Rango | Descripción |
| :--- | :--- | :--- | :--- |
| `porcentajeTotal` | `number` | `[0, 100]` | Porcentaje entero global de preparación. Si total ítems = 0, es 0. |
| `totalArticulos` | `number` | `>= 0` | Conteo total de artículos registrados. |
| `articulosCompletados` | `number` | `>= 0` | Conteo de artículos marcados con `completado == true`. |
| `desgloseCategorias` | `Record<CategoriaId, { total: number, completados: number, porcentaje: number }>` | N/A | Métricas detalladas por cada una de las 6 categorías. |

---

## 2. Esquema de Persistencia Local (`localStorage`)

Clave principal: `sismolisto_app_state_v1`

Estructura serializada:
```json
{
  "version": 1,
  "ultimaModificacion": "2026-10-29T15:00:00.000Z",
  "mochila": {
    "articulos": [
      {
        "id": "item-1",
        "categoriaId": "primeros_auxilios",
        "nombre": "Botiquín básico (alcohol, gasas, vendas)",
        "completado": true,
        "esPredeterminado": true,
        "cantidadRecomendada": "1 kit"
      }
    ]
  },
  "planFamiliar": {
    "puntoEncuentroInterno": "Pasadizo junto a columna este",
    "puntoEncuentroExterno": "Parque Los Próceres - Zona 3",
    "numeroFamiliarClave": "987654321",
    "integrantes": [
      {
        "id": "fam-1",
        "nombreCompleto": "Carlos Perez",
        "rolSismo": "Llevar la mochila de emergencia y apagar llave de gas",
        "notas": ""
      }
    ],
    "fechaActualizacion": "2026-10-29T15:00:00.000Z"
  }
}
```

---

## 3. Invariantes y Reglas de Negocio

1. **Invariante de Progreso**:
   $$\text{porcentajeTotal} \in [0, 100] \subset \mathbb{Z}$$
   - Nunca debe devolver `NaN`, `Infinity` ni valores negativos.
   - Si $\text{totalArticulos} = 0$, el porcentaje es forzado estrictamente a $0$.
2. **Capacidad Familiar**:
   - $\text{longitud(integrantes)} \le 20$.
3. **Validación Telefónica 119**:
   - `numeroFamiliarClave` debe cumplir la expresión regular `/^9\d{8}$/` para habilitar los botones de acción rápida telefónica `tel:1191{numero}` y `tel:1192{numero}`.
4. **Recuperación Automática de Datos**:
   - En caso de lectura corrupta o inexistente en `localStorage`, se inicializa el estado con los artículos predeterminados de INDECI y un plan familiar inicializable en blanco.
