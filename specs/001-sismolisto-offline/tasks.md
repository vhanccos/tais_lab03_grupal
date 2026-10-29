# Tasks: Sistema de Preparación ante Sismos (SismoListo Offline)

**Input**: Design documents from `/specs/001-sismolisto-offline/`
**Prerequisites**: [plan.md](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/plan.md), [spec.md](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/spec.md), [data-model.md](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/data-model.md), [contracts/](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/contracts/), [quickstart.md](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/quickstart.md)

**Tests**: Test-first (TDD) para algoritmos nucleares, invariantes de progreso [0, 100]%, validación del protocolo 119 y tolerancia a corrupción de persistencia offline.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- File paths are explicitly stated for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, toolchain setup, and base development environment

- [ ] T001 Initialize React 19 + TypeScript + Vite project configuration in package.json and vite.config.ts
- [ ] T002 [P] Configure Tailwind CSS / responsive styling tooling and base styles in src/index.css and tailwind.config.js
- [ ] T003 [P] Configure Vitest, React Testing Library, and fast-check for Property-Based Testing (PBT) in vitest.config.ts and tests/setup.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entity types, default emergency catalog, and resilient local storage adapter that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define TypeScript domain interfaces and type definitions (CategoriaId, ArticuloMochila, IntegranteFamiliar, PlanFamiliar, AppState) in src/storage/stateTypes.ts per data-model.md
- [ ] T005 [P] Create official INDECI default emergency catalog with 6 categories (primeros_auxilios, alimentos, agua, herramientas, abrigo, documentos) and ~30 items in src/core/defaultCatalog.ts
- [ ] T006 Write unit tests for local storage serialization, quota handling, and auto-recovery from corrupted JSON in tests/unit/storageAdapter.test.ts
- [ ] T006b [P] Write property-based test (fast-check) verifying serialization round-trip for any valid AppState in tests/property/storageRoundTrip.pbt.test.ts
- [ ] T007 Implement resilient IStorageAdapter on localStorage with versioned schema ("sismolisto_app_state_v1"), in-memory fallback, and safe defaults in src/storage/storageAdapter.ts
- [ ] T008 [P] Implement responsive shell, accessibility layout, and tab navigation (Mochila vs. Plan Familiar) in src/components/common/Header.tsx and src/components/common/NavigationTabs.tsx

**Checkpoint**: Foundation ready - domain types, default catalog, storage adapter, and layout shell available. User story implementation can now begin.

---

## Phase 3: User Story 1 - Gestión y Verificación de Mochila de Emergencia (Priority: P1) 🎯 MVP

**Goal**: Permitir al usuario interactuar con el checklist de 6 categorías de emergencia, visualizando reactiva e instantáneamente el porcentaje de preparación total (0% a 100%) y por categoría, con persistencia local inmediata.

**Independent Test**: Marcar y desmarcar artículos en cualquier categoría; verificar que el cálculo de preparación general se actualiza instantáneamente en [0, 100]%, que una lista vacía o desmarcada da 0% sin errores de división por cero o NaN, y que el estado persiste al recargar la app.

### Tests for User Story 1 ⚠️

- [ ] T009 [P] [US1] Write unit tests for calculatePreparationProgress checking invariant 0% when empty, bounds [0, 100]%, integer rounding, and category breakdown in tests/unit/progressCalculator.test.ts
- [ ] T009b [P] [US1] Write property-based tests (fast-check) verifying the progress invariant is strictly bounded in [0, 100]% without NaN for any random list of N items in tests/property/progressInvariants.pbt.test.ts
- [ ] T010 [P] [US1] Write component tests for checklist interactions, item toggling, and progress bar reactivity in tests/unit/ChecklistMochila.test.tsx

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement pure invariant calculation function calculatePreparationProgress(articulos) in src/core/progressCalculator.ts per mochila-contract.md
- [ ] T012 [P] [US1] Implement progress bar component displaying general preparation percentage and category progress in src/components/mochila/ProgressBar.tsx
- [ ] T013 [P] [US1] Implement individual checklist item component with checkbox, recommended quantity, and accessibility tags in src/components/mochila/ChecklistItem.tsx
- [ ] T014 [US1] Implement category accordion/section component grouping items by the 6 INDECI categories in src/components/mochila/CategoriaAccordion.tsx (depends on T013)
- [ ] T015 [US1] Implement useMochila custom hook orchestrating toggleItem, resetToDefault, and reactive storage sync in src/hooks/useMochila.ts (depends on T007, T011)
- [ ] T016 [US1] Integrate checklist, category sections, progress bar, and reset action into main mochila view in src/components/mochila/ChecklistMochila.tsx (depends on T012, T014, T015)

**Checkpoint**: At this point, User Story 1 (Mochila de Emergencia) is fully functional and delivers a viable standalone MVP.

---

## Phase 4: User Story 2 - Plan Familiar de Emergencia y Contacto 119 (Priority: P2)

**Goal**: Permitir el registro de integrantes del hogar (hasta 20) con roles específicos ante sismos, definición de puntos de encuentro interno/externo y marcación directa nativa del protocolo nacional 119 (grabar tel:1191{numero} y escuchar tel:1192{numero}).

**Independent Test**: Registrar un familiar con rol, verificar que campos en blanco se rechazan, registrar zonas seguras interna y externa, ingresar un celular clave de 9 dígitos y comprobar que los enlaces rápidos de marcación hacia `tel:1191{numero}` y `tel:1192{numero}` se activan con el número correcto.

### Tests for User Story 2 ⚠️

- [ ] T017 [P] [US2] Write unit tests for phoneValidator and URI generation (tel:1191{numero}, tel:1192{numero}, regex /^9\d{8}$/) covering valid formats and invalid edge cases (less/more than 9 digits, non-numeric strings, numbers not starting with 9) in tests/unit/phoneValidator.test.ts
- [ ] T018 [P] [US2] Write unit and validation tests for family members management (empty name validation, max 20 constraint, role assignment) in tests/unit/PlanFamiliar.test.tsx

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement phone number validator and 119 URI generator (generate119Uris) validating exactly 9 digits in src/core/phoneValidator.ts per plan-familiar-contract.md
- [ ] T020 [P] [US2] Implement form and list components for adding, editing, and removing family members (with whitespace trim validation and max 20 limit) in src/components/planFamiliar/FormIntegrante.tsx and src/components/planFamiliar/ListaIntegrantes.tsx
- [ ] T021 [P] [US2] Implement internal and external safe meeting point form component in src/components/planFamiliar/ZonasSeguras.tsx
- [ ] T022 [P] [US2] Implement 119 emergency speed dial and instructions card component with tel: action buttons in src/components/planFamiliar/AccesoRapido119.tsx (depends on T019)
- [ ] T023 [US2] Implement usePlanFamiliar custom hook managing family members CRUD, safe meeting points, and key phone number persistence in src/hooks/usePlanFamiliar.ts (depends on T007)
- [ ] T024 [US2] Integrate family members list, safe points, and 119 speed dial into main family plan view in src/components/planFamiliar/PlanFamiliarView.tsx (depends on T020, T021, T022, T023)

**Checkpoint**: At this point, User Stories 1 AND 2 are fully functional and operate independently.

---

## Phase 5: User Story 3 - Persistencia Estricta Offline y Disponibilidad Inmediata (Priority: P3)

**Goal**: Garantizar que el 100% de la aplicación opere de forma continua y autónoma sin conexión a internet (modo avión), sin autenticación requerida, con carga instantánea y persistencia inmediata en cada mutación.

**Independent Test**: Poner el navegador en modo Offline en devtools, reiniciar la pestaña/app, modificar datos de la mochila y plan familiar, cerrar abruptamente la ventana y constatar que al volver a abrir todo el estado se mantiene íntegro sin errores de red.

### Tests for User Story 3 ⚠️

- [ ] T025 [P] [US3] Write integration test simulating offline lifecycle, abrupt unload, and full reload with zero network calls in tests/integration/offlineLifecycle.test.tsx

### Implementation for User Story 3

- [ ] T026 [P] [US3] Configure Service Worker / offline caching manifest using vite-plugin-pwa to cache all static application assets in vite.config.ts and src/sw.ts
- [ ] T027 [US3] Connect useMochila and usePlanFamiliar hooks to top-level App orchestrator ensuring zero remote auth checks and immediate local hydration in src/App.tsx (depends on T015, T023)
- [ ] T028 [US3] Implement application offline status indicator and promptless local-first UX in src/components/common/OfflineBadge.tsx

**Checkpoint**: All 3 user stories are complete and the app operates 100% offline.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, edge cases handling, accessibility validation, and quickstart scenario execution

- [ ] T029 [P] Verify edge case handling for rapid consecutive clicks, oversized strings, and empty categories without UI overflow in src/components/mochila/ChecklistMochila.tsx and src/components/planFamiliar/PlanFamiliarView.tsx
- [ ] T030 Execute end-to-end validation scenarios documented in specs/001-sismolisto-offline/quickstart.md
- [ ] T031 [P] Add PWA web app manifest icons and metadata (theme-color, standalone display, emergency app name) in public/manifest.json and index.html

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1: Setup
    │
    ▼
Phase 2: Foundational (T004 - T008) ⚠️ BLOCKS ALL STORIES
    │
    ├────────────────────────────────────────┬────────────────────────────────────────┐
    ▼                                        ▼                                        ▼
Phase 3: US1 (Mochila - P1) 🎯       Phase 4: US2 (Plan & 119 - P2)          Phase 5: US3 (Offline - P3)
    │                                        │                                        │
    └────────────────────────────────────────┴────────────────────────────────────────┘
                                             │
                                             ▼
                             Phase 6: Polish & Validation
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational (Phase 2). Can be deployed immediately as standalone MVP.
- **User Story 2 (P2)**: Depends on Foundational (Phase 2). Integrates alongside US1 in navigation tabs.
- **User Story 3 (P3)**: Depends on Phase 2, integrates state hooks from US1 and US2 into `App.tsx` and adds PWA service worker caching.

---

## Parallel Opportunities

- **Phase 1 Setup**: `T002` (Tailwind) and `T003` (Vitest) can run in parallel.
- **Phase 2 Foundational**: `T005` (Catalog), `T006` (Storage tests), and `T008` (Layout shell) can run in parallel after `T004`.
- **Phase 3 (US1)**: `T009` (Progress tests), `T010` (Checklist tests), `T011` (Calculator logic), `T012` (ProgressBar), and `T013` (ChecklistItem) can be developed concurrently.
- **Phase 4 (US2)**: `T017` (119 tests), `T018` (Family tests), `T019` (Phone validator), `T020` (Member form/list), `T021` (Zonas seguras), and `T022` (Acceso 119) can run in parallel.

---

## Implementation Strategy (MVP First)

1. **Paso 1**: Completar Fase 1 (Setup) y Fase 2 (Foundational).
2. **Paso 2**: Implementar Fase 3 (User Story 1 - Mochila de Emergencia).
3. **Paso 3**: **Validar MVP**: Probar checklist interactivo y cálculo [0, 100]% de forma aislada.
4. **Paso 4**: Implementar Fase 4 (User Story 2 - Plan Familiar & Protocolo 119).
5. **Paso 5**: Implementar Fase 5 (User Story 3 - PWA Service Worker & ciclo de vida offline).
6. **Paso 6**: Ejecutar escenarios de [quickstart.md](file:///home/vlad/tmp/taislab/lab03/specs/001-sismolisto-offline/quickstart.md) y pulir UI.
