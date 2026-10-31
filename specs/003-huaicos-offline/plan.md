# Implementation Plan: Gestión Offline de Riesgo ante Huaicos e Inundaciones (Feature 003)

**Branch**: `003-huaicos-offline` | **Date**: 2026-10-31 | **Spec**: [specs/003-huaicos-offline/spec.md](spec.md)

## Summary

Desarrollo e integración del módulo **Huaicos Offline** para SismoListo, un subsistema resiliente y autónomo concebido para operar con cero dependencia de conectividad de red ni servidores externos. El módulo proporciona a los ciudadanos de cuencas y quebradas andinas las herramientas críticas de respuesta ante flujos de detritos (huaicos) e inundaciones repentinas:
1. **Semáforo de Alertas SENAMHI**: Selector interactivo de nivel de peligro (Verde, Amarillo, Naranja, Rojo) con protocolos y directivas de evacuación.
2. **Matriz de Señales Naturales Tempranas**: Reconocimiento de los 6 signos físicos de alarma (estruendo, agua turbia con lodo, represamiento/cese súbito de flujo, estampida de animales, microsismos en el lecho rocoso, grietas en taludes).
3. **Guía de Evacuación Perpendicular (Regla de los 90°)**: Instrucciones de ascenso a laderas estables, prohibición de correr aguas abajo o cruzar caudales de lodo, y registro de cota alta con enlace telefónico nativo `tel:`.
4. **Checklist Estacional de Temporada de Lluvias**: 4 categorías esenciales (Protección del Hogar con sacos de arena en tresbolillo y canaletas, Documentos Impermeables en Ziploc, Suministros de Reserva para 72 horas y Evacuación Comunitaria) con cálculo reactivo acotado a `[0, 100]%`.
5. **Calculador Offline de Potabilización de Agua**: Dosificación exacta según fórmula oficial de INDECI (2 gotas de hipoclorito de sodio al 5% por litro de agua; reposo de 30 min) y alternativas con pastillas potabilizadoras.

---

## Technical Context

- **Language / Runtime**: TypeScript 5.x / React 19 / ES2022
- **Styling**: Tailwind CSS con patrones móviles responsivos y accesibilidad visual
- **Storage Layer**: Adaptador local resiliente sobre `localStorage` con clave `sismolisto_huaicos_state_v1`, respaldo en memoria ante excepciones de cuota y auto-recuperación ante JSON corrupto
- **Testing Engine**: Vitest 3.x, React Testing Library y jsdom
- **Performance Budget**:
  - Tiempo de render inicial < 50 ms en frío
  - Recálculo de progreso y dosificación < 10 ms
  - Guardado en almacenamiento local < 5 ms por interacción
- **Target Platform**: PWA Offline en navegadores móviles/desktop y aplicaciones empaquetadas Capacitor

---

## Constitution Check

| Principio | Cumplimiento | Justificación |
| :--- | :---: | :--- |
| **I. Library-First & Módulos Puros** | Cumple | Las entidades, catálogos por defecto y funciones de cálculo matemático de progreso y dosificación residen en `src/core/huaicosDomain.ts` de forma 100% pura y testeable. |
| **II. Interfaz Clara & Tipado Fuerte** | Cumple | Todos los tipos (`NivelAlertaHuaico`, `TipoSenalTemprana`, `ItemHuaicoChecklist`, `HuaicosState`) están fuertemente tipados con TypeScript estricto. |
| **III. Test-First & Cobertura Integral** | Cumple | Suite completa en `tests/unit/huaicos.test.tsx` verificando cálculo de progreso, dosificación de agua, transiciones de alerta, persistencia y auto-recuperación. |
| **IV. Resiliencia & Auto-Recuperación** | Cumple | El hook `useHuaicos` intercepta cualquier fallo de lectura en `localStorage` restaurando el catálogo oficial predeterminado de INDECI sin romper la UI. |
| **V. Simplicidad & Cero Dependencia Externa** | Cumple | Sin llamadas a APIs de terceros, mapas remotos ni bibliotecas pesadas; cálculos puramente locales. |

---

## Architecture & Module Breakdown

### 1. Dominio Puro (`src/core/huaicosDomain.ts`)
- **Modelos de datos**:
  - `NivelAlertaHuaico`: `'verde' | 'amarillo' | 'naranja' | 'rojo'`
  - `TipoSenalTemprana`: `'estruendo' | 'turbidez_olor' | 'represamiento_caudal' | 'comportamiento_animal' | 'vibracion_suelo' | 'grietas_talud'`
  - `CategoriaHuaicoId`: `'proteccion_hogar' | 'documentos_impermeables' | 'suministros_reserva' | 'evacuacion_comunitaria'`
  - `ItemHuaicoChecklist`, `SenalTemprana`, `PlanEvacuacionHuaico`, `HuaicosState`, `MetricaProgresoHuaico`
- **Catálogo Oficial Predeterminado**:
  - 14 ítems oficiales de preparación estacional (sacos de arena, fijación de calaminas, limpieza de cunetas, doble Ziploc para DNI/títulos, efectivo fraccionado, 4L agua/persona/día, lejía 5%, botas de jebe, linterna impermeable, silbato).
  - 6 señales naturales tempranas con sus tiempos críticos y acciones.
  - Constantes de alertas SENAMHI (descripción, color, directivas prioritarias).
- **Funciones Puras de Algoritmo**:
  - `calcularProgresoHuaicos(articulos: ItemHuaicoChecklist[]): MetricaProgresoHuaico`: Garantiza invariante entero `[0, 100]%` y desglose por categorías; retorna 0% si la lista está vacía.
  - `calcularPotabilizacionAgua(litros: number)`: Retorna gotas de lejía al 5% (`Math.ceil(litros * 2)`), pastillas sugeridas (`Math.ceil(litros / 5)` o 1 por cada 20 L para bidones) y tiempo de reposo oficial de 30 minutos.
  - `validarTelefonoPeru(numero: string): boolean`: Valida expresión regular `/^9\d{8}$/`.

### 2. Estado y Persistencia Reactiva (`src/hooks/useHuaicos.ts`)
- Gestiona el estado reactivo `HuaicosState`.
- Persistencia local inmediata con clave `sismolisto_huaicos_state_v1`.
- Respaldo defensivo en memoria para tolerar modos privados o fallos de cuota.
- Exposición de acciones atómicas:
  - `toggleItem(id: string): void`
  - `toggleSenal(id: TipoSenalTemprana): void`
  - `setNivelAlerta(nivel: NivelAlertaHuaico): void`
  - `savePlanEvacuacion(plan: Partial<PlanEvacuacionHuaico>): void`
  - `resetToDefault(): void`
  - `metricas`: Cálculo memoizado de progreso.

### 3. Componentes de Presentación e Interacción (`src/components/huaicos/`)
- `SemaforoAlertas.tsx`: Selector interactivo de alerta (Verde, Amarillo, Naranja, Rojo) con tarjeta visual de advertencia, tiempo de reacción y directiva operativa oficial SENAMHI/COEN.
- `MatrizSenalesTempranas.tsx`: Rejilla interactiva de las 6 señales naturales con contador de signos detectados, tiempo límite de evacuación e indicación de alarma inminente ante represamiento o estruendo.
- `GuiaEvacuacionPerpendicular.tsx`: Diagrama visual esquemático con la "Regla de los 90°", tarjetas de advertencias de seguridad física (15cm derriba, 30cm arrastra autos, 60cm camiones; prohibición de correr aguas abajo) y formulario de cota alta con enlace `tel:`.
- `ChecklistTemporadaLluvias.tsx`: Acordeón interactivo categorizado con barra de progreso reactiva, medidor porcentual y checkboxes accesibles.
- `CalculadorPotabilizacion.tsx`: Herramienta interactiva con selector de volumen predeterminado (1L, 5L, 20L, 100L) y entrada numérica manual con dosificación de lejía al 5% (2 gotas/L) y protocolo de reposo de 30 min.
- `HuaicosView.tsx`: Vista coordinadora integral con pestañas internas secundarias o navegación por secciones limpias ("Alertas y Señales", "Evacuación 90°", "Checklist Estacional", "Agua y Salud").

### 4. Integración con el Sistema Principal
- Actualización de `src/components/common/NavigationTabs.tsx` para incorporar la pestaña `"huaicos"`, icono alusivo (ej. `Waves` o `ShieldAlert` de Lucide) y badge de progreso de preparación.
- Actualización de `src/App.tsx` para coordinar el cambio de vista hacia `HuaicosView`.

---

## Data Model & Schema Contract

```typescript
export interface HuaicosState {
  version: number;
  ultimaModificacion: string;
  nivelAlertaActual: NivelAlertaHuaico;
  articulos: ItemHuaicoChecklist[];
  senalesTempranas: SenalTemprana[];
  planEvacuacion: PlanEvacuacionHuaico;
}
```

- **Clave Storage**: `sismolisto_huaicos_state_v1`
- **Restauración Defensiva**: Si `JSON.parse` falla o el objeto carece de campos obligatorios, se inicializa con `createDefaultHuaicosState()`.

---

## Verification Strategy

1. **Unit Tests (`tests/unit/huaicos.test.tsx`)**:
   - Invariantes matemáticas: `calcularProgresoHuaicos` con lista vacía (0%), 1 ítem completado, todos completados (100%), límites discretos `[0, 100]`.
   - Dosificación de potabilización: 1 L -> 2 gotas, 5 L -> 10 gotas, 20 L -> 40 gotas, 0 L o negativos -> 0 gotas.
   - Transiciones de estado de alerta y actualización de directivas en `SemaforoAlertas`.
   - Marcado de señales naturales e indicador de peligro inminente en `MatrizSenalesTempranas`.
   - Persistencia local y auto-recuperación ante JSON corrupto en `useHuaicos`.
2. **Build Verification**:
   - `npm test` debe completar con 100% de tests aprobados.
   - `npm run build` debe generar el bundle de producción sin advertencias ni errores TypeScript.
