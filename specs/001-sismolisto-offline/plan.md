# Implementation Plan: SismoListo Offline

**Branch**: `001-sismolisto-offline` | **Date**: 2026-10-29 | **Spec**: [specs/001-sismolisto-offline/spec.md](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/spec.md)

**Input**: Feature specification from `/specs/001-sismolisto-offline/spec.md` incorporando las correcciones del último commit (`4bc940b`): protocolo oficial de marcación 119 (`tel:1191{numero}` y `tel:1192{numero}`) e invariantes de cálculo reactivo [0, 100]%.

## Summary

Desarrollo de la aplicación **SismoListo Offline**, un sistema resiliente ante emergencias sísmicas concebido para operar sin conexión a internet ni requerimientos de autenticación. La solución comprende dos módulos nucleares:
1. **Mochila de Emergencia**: Checklist interactivo categorizado (6 categorías INDECI) con cálculo reactivo inmediato de porcentaje de preparación acotado estrictamente a `[0, 100]%`.
2. **Plan Familiar de Emergencia**: Gestión de integrantes del hogar (hasta 20), asignación de roles sísmicos, puntos de encuentro interno/externo y marcación directa nativa del protocolo nacional 119 para grabar (`tel:1191{numero}`) o escuchar (`tel:1192{numero}`) mensajes de voz.

La persistencia es local e instantánea mediante un adaptador sobre `localStorage` con serialización JSON, tolerancia a fallos y auto-recuperación ante datos corruptos.

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2022

**Primary Dependencies**: React 19, Vite, Tailwind CSS (o CSS responsive utilitario sin dependencias externas pesadas)

**Storage**: `localStorage` (HTML5 Web Storage API) con adaptador resiliente y fallback en memoria

**Testing**: Vitest + React Testing Library + Fast-Check (pruebas unitarias, pruebas de integración y Property-Based Testing para invariantes matemáticos y round-trip de persistencia)

**Target Platform**: Navegadores Web Móviles / Desktop y Progressive Web App (PWA) instalable

**Project Type**: Single-Page Application (SPA) / PWA offline-first

**Performance Goals**:
- Cálculo reactivo del porcentaje de preparación en < 50 ms
- Persistencia síncrona en < 10 ms tras interacción
- Carga completa de la interfaz en < 1 segundo en modo offline

**Constraints**:
- 100% offline (cero llamadas de red durante la ejecución)
- Cero bibliotecas de telemetría o analíticas externas
- Tamaño de bundle ligero (< 500 KB gzip)
- Soporte estricto de URI schemes `tel:` nativos del dispositivo

**Scale/Scope**:
- Hasta 20 integrantes familiares por hogar
- 6 categorías de mochila predeterminadas con ~30 artículos esenciales oficiales INDECI
- Espacio ocupado en almacenamiento local < 50 KB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento | Justificación |
| :--- | :---: | :--- |
| **I. Library-First / Módulos Desacoplados** | Cumple | La lógica de cálculo (`calculatePreparationProgress`) y el adaptador de almacenamiento (`StorageAdapter`) se implementan como módulos puros independientes de la UI. |
| **II. Interfaz Clara & Formatos Estándar** | Cumple | Tipos e interfaces fuertemente tipados en TypeScript; esquema de persistencia estandarizado en JSON versionado (`v1`). |
| **III. Test-First & Invariantes Verificables** | Cumple | Casos de prueba rigurosos para la función de progreso (evitar división por cero / NaN, asegurar límites [0, 100]), validación telefónica y recuperación de fallos. |
| **IV. Resiliencia & Tolerancia a Fallos** | Cumple | Recuperación automática ante corrupción de datos locales restaurando el catálogo oficial de INDECI. |
| **V. Simplicidad & YAGNI** | Cumple | Sin frameworks pesados ni dependencias de backend innecesarias; almacenamiento local directo y ágil. |

## Project Structure

### Documentation (this feature)

```text
specs/001-sismolisto-offline/
├── spec.md              # Especificación funcional validada
├── plan.md              # Este plan de implementación arquitectónica
├── research.md          # Fase 0: Decisiones de almacenamiento, PWA y protocolo 119
├── data-model.md        # Fase 1: Entidades, esquemas de tipos e invariantes
├── quickstart.md        # Fase 1: Guía y escenarios de validación ejecutable
├── contracts/           # Fase 1: Contratos de interfaces
│   ├── mochila-contract.md
│   ├── plan-familiar-contract.md
│   └── storage-adapter-contract.md
└── checklists/
    └── requirements.md  # Checklist de calidad de especificación
```

### Source Code (repository root)

```text
src/
├── core/                       # Lógica pura de dominio y algoritmos independientes
│   ├── progressCalculator.ts   # Cálculo reactivo invariante [0, 100]%
│   ├── phoneValidator.ts       # Validación y formateo URI del protocolo 119
│   └── defaultCatalog.ts       # Artículos predeterminados oficiales INDECI (6 categorías)
├── storage/                    # Adaptador de persistencia y serialización
│   ├── storageAdapter.ts       # Contrato e implementación sobre localStorage
│   └── stateTypes.ts           # Interfaces de estado global y serialización
├── components/                 # Componentes de presentación UI accesibles
│   ├── mochila/                # Checklist interactivo, categorías y barra de progreso
│   │   ├── ChecklistMochila.tsx
│   │   ├── CategoriaAccordion.tsx
│   │   └── ProgressBar.tsx
│   ├── planFamiliar/           # Lista de integrantes, roles, zonas seguras y 119
│   │   ├── FormIntegrante.tsx
│   │   ├── ListaIntegrantes.tsx
│   │   ├── ZonasSeguras.tsx
│   │   └── AccesoRapido119.tsx
│   └── common/                 # Header, pestañas de navegación y modales informativos
├── hooks/                      # Custom hooks reactivos para sincronización de estado
│   ├── useMochila.ts
│   └── usePlanFamiliar.ts
├── App.tsx                     # Orquestador principal y vista responsive
└── main.tsx                    # Punto de entrada y registro del Service Worker offline

tests/
├── unit/
│   ├── progressCalculator.test.ts # Pruebas unitarias de cálculo y casos de borde
│   ├── phoneValidator.test.ts     # Pruebas de validación y URIs tel:1191 y tel:1192
│   └── storageAdapter.test.ts     # Pruebas de persistencia, corrupción y auto-recuperación
├── property/                      # Pruebas basadas en propiedades (Property-Based Testing con fast-check)
│   ├── progressInvariants.pbt.test.ts # Propiedad 1: Invariante matemático del progreso acotado rígidamente a [0, 100]% y sin NaN
│   └── storageRoundTrip.pbt.test.ts   # Propiedad 2: Round-trip de serialización/deserialización para cualquier estado válido
└── integration/
    └── sismolistoFlow.test.tsx    # Prueba de interacción extremo a extremo (marcado + plan)
```

**Structure Decision**: Arquitectura modular desacoplada basada en Clean Architecture simplificada para frontend (núcleo de dominio puro sin dependencias externas, adaptadores de almacenamiento y capa de componentes React reactiva).

## Complexity Tracking

*No se detectan violaciones a los principios de diseño ni complejidades injustificadas. La arquitectura adopta la solución más simple y robusta posible.*
