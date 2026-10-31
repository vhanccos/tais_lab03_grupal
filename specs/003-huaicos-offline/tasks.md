# Tasks: Gestión Offline de Riesgo ante Huaicos e Inundaciones (Feature 003)

**Input**: Design documents from `/specs/003-huaicos-offline/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md)  
**Tests**: Automated Vitest suite in `tests/unit/huaicos.test.tsx` verifying state, checklist progression, alert transitions, water disinfection calculations, and offline persistence.

---

## Phase 1: Setup & Domain Modeling (Pure Core)

**Purpose**: Define data types, official INDECI/SENAMHI default catalogs, and pure calculation algorithms with invariant guarantees.

- [X] T001 Define TypeScript data models (`NivelAlertaHuaico`, `TipoSenalTemprana`, `CategoriaHuaicoId`, `ItemHuaicoChecklist`, `SenalTemprana`, `PlanEvacuacionHuaico`, `HuaicosState`, `MetricaProgresoHuaico`) in `src/core/huaicosDomain.ts`.
- [X] T002 Implement official INDECI rain-season default checklist items (~14 items across 4 categories: home protection, waterproof documents, 72h provisions, community evacuation) in `src/core/huaicosDomain.ts`.
- [X] T003 Implement official SENAMHI alert levels catalog (Verde, Amarillo, Naranja, Rojo) with operational directives and color schemes in `src/core/huaicosDomain.ts`.
- [X] T004 Implement 6 natural early warning signs catalog (estruendo, turbidez/olor, represamiento, comportamiento animal, microsismos, grietas) in `src/core/huaicosDomain.ts`.
- [X] T005 Implement pure calculation functions: `calcularProgresoHuaicos(articulos)` with invariant `[0, 100]%` and `calcularPotabilizacionAgua(litros)` in `src/core/huaicosDomain.ts`.

---

## Phase 2: State Management & Offline Hook

**Purpose**: Reactive state hook with synchronous `localStorage` persistence and memory fallback.

- [X] T006 Implement `useHuaicos` custom hook in `src/hooks/useHuaicos.ts` managing `HuaicosState` with key `sismolisto_huaicos_state_v1`.
- [X] T007 Implement atomic actions in `useHuaicos.ts`: `toggleItem(id)`, `toggleSenal(id)`, `setNivelAlerta(nivel)`, `savePlanEvacuacion(plan)`, `resetToDefault()`.
- [X] T008 Implement defensive recovery in `useHuaicos.ts`: auto-recovery from corrupted JSON and memory fallback upon storage quota exceptions.

---

## Phase 3: User Story 1 - Checklist de Temporada de Lluvias (P1)

**Purpose**: Interactive checklist for home protection, sandbags, drainage, waterproof document preservation, and 72h supplies.

- [X] T009 [US1] Implement `src/components/huaicos/ChecklistTemporadaLluvias.tsx` featuring 4 categories, visual progress bar, item toggling, and category sub-counters.

---

## Phase 4: User Story 2 - Semáforo de Alertas y Matriz de Señales (P2)

**Purpose**: Interactive SENAMHI alert level selector and sensory early warning matrix.

- [X] T010 [US2] Implement `src/components/huaicos/SemaforoAlertas.tsx` with 4 interactive levels (Verde, Amarillo, Naranja, Rojo), real-time directives, and operational guidance.
- [X] T011 [US2] Implement `src/components/huaicos/MatrizSenalesTempranas.tsx` displaying the 6 natural signs, reaction times, imminent hazard indicator for damming/roar, and sensory checkmarks.

---

## Phase 5: User Story 3 - Guía de Evacuación Perpendicular 90° (P3)

**Purpose**: Visual evacuation guide teaching the 90° ascent rule and safe high ground registration.

- [X] T012 [US3] Implement `src/components/huaicos/GuiaEvacuacionPerpendicular.tsx` illustrating the 90° perpendicular climb, severe water-depth warnings (15cm, 30cm, 60cm), prohibition against running downstream, and high-ground contact form with native `tel:` dialing.

---

## Phase 6: User Story 4 - Potabilización de Agua y Salud Post-Huaico (P4)

**Purpose**: Disinfection calculator and post-disaster sanitary prevention.

- [X] T013 [US4] Implement `src/components/huaicos/CalculadorPotabilizacion.tsx` with quick volume presets (1L, 5L, 20L, 100L), manual volume input, bleach drops calculator (2 drops 5% bleach/L), 30-minute rest timer guidance, and Aquatabs alternatives.

---

## Phase 7: Main View Coordinator & Navigation Integration

**Purpose**: Assemble the complete feature into `HuaicosView` and wire into application tabs.

- [X] T014 Implement `src/components/huaicos/HuaicosView.tsx` coordinating sections (Semáforo & Señales, Evacuación 90°, Checklist Temporada, Potabilización & Salud) with sub-navigation or clean responsive layout.
- [X] T015 Update `src/components/common/NavigationTabs.tsx` to support the `'huaicos'` tab with badge and accessible tab switching.
- [X] T016 Update `src/App.tsx` to include the `'huaicos'` tab in state and render `HuaicosView`.

---

## Phase 8: Automated Verification & Documentation

**Purpose**: Comprehensive automated testing and build validation.

- [X] T017 Implement unit and integration tests in `tests/unit/huaicos.test.tsx` verifying:
  - Domain invariants (0% on empty, 100% on complete, integer bounds [0, 100]%)
  - Potabilization formula calculations
  - Alert transitions and directive rendering
  - Early warning signs toggles and imminent threat detection
  - Checklist item toggling and progress reactivity
  - Offline storage persistence and auto-recovery from corrupted JSON
- [X] T018 Execute `npm test` and `npm run build` to confirm 0 errors and 100% pass rate.
- [X] T019 Record implementation commit `feat(huaicos): implement 003 offline mudslides and flood management module`.
