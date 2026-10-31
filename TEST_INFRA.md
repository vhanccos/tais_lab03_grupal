# SismoListo Test Infrastructure & 4-Tier E2E Methodology

## 1. Test Philosophy: Opaque-Box & Requirement-Driven

The test suite for **SismoListo & Multi-Hazard Disaster Resilience** is designed according to strict **opaque-box** (black-box) and **requirement-driven** testing principles.

- **Authoritative Derivation**: Test cases, expected values, formulas, and operational workflows are derived strictly from:
  1. `ORIGINAL_REQUEST.md` (System specifications, R1 through R5, Acceptance Criteria).
  2. `PROJECT.md` (Architecture, 25-feature inventory, module interface contracts).
  3. Official Technical Regulations & Guides:
     - **INDECI**: *Plan Familiar de Emergencia: La Seguridad Empieza en Casa* (IUCAO methodology, 8 kg backpack weight limit, 4.5m safety circle, Combo de Supervivencia).
     - **MTC**: Resolución Ministerial N° 045-2020-MTC/01.03 (119 Emergency Voice Messaging protocol: `1191` for recording, `1192` for listening).
     - **SENAMHI**: Sistema de Alertas Hidrometeorológicas (Verde, Amarillo, Naranja, Rojo) and *Avisos de Activación de Quebradas*.
     - **ANA / INGEMMET**: Flujos de detritos (huaicos), fajas marginales, and perpendicular (90°) evacuation.
- **Opaque-Box Independence**: Tests interact with the system strictly through:
  - User-facing DOM interactions (`@testing-library/react`, accessible roles, ARIA attributes, semantic inputs, and buttons).
  - Public interface contracts (`storageAdapter`, pure domain calculators, validator functions).
  - Web standard APIs (`localStorage`, `navigator.geolocation`, Web Audio API, `tel:` URIs).
  No test monkeypatches private state or relies on fragile internal implementation details.
- **Zero-Tolerance on Facade Testing**: Every test exercises real logic, validates mathematical invariants, checks state transitions, verifies persistence round-trips, and asserts true user-observable outcomes.

---

## 2. 4-Tier Testing Methodology

The E2E testing framework is structured across four progressive testing tiers:

```
+-----------------------------------------------------------------------+
|  Tier 4: Real-World Disaster Scenarios (Holistic E2E Workflows)        |
|  - Lima Mw 8.0 Megathrust Earthquake & Tsunami Evacuation             |
|  - Sudden Chosica Quebrada Activation & 90° Ascent                    |
|  - 72h Multi-Day Potable Water Cutoff & Bleach Disinfection            |
+-----------------------------------------------------------------------+
                                  ▲
+-----------------------------------------------------------------------+
|  Tier 3: Pairwise Combinatorial & Cross-Feature Integration           |
|  - Concurrent State Toggles & Storage Resilience                      |
|  - Emergency Dialer Linking with Family Roles                         |
|  - Multi-hazard Coordination (Sismos Safe Zones + Huaicos Cota Alta)   |
|  - Storage Adapter Quota Fallback under Rapid Cross-Module Mutations  |
+-----------------------------------------------------------------------+
                                  ▲
+-----------------------------------------------------------------------+
|  Tier 2: Boundary Value Analysis (BVA) & Robustness                   |
|  - Empty strings, whitespace, max string lengths (>120 chars)         |
|  - Invalid phone formats (alphanumeric, non-9-digit, non-9-prefix)    |
|  - Extreme numeric inputs (0L, negative water volume, floating point) |
|  - Progress bounds invariants: strictly integer [0, 100]% on 0 items  |
|  - JSON corruption auto-recovery and localStorage quota exhaustion    |
+-----------------------------------------------------------------------+
                                  ▲
+-----------------------------------------------------------------------+
|  Tier 1: Category-Partition (Happy-Path Equivalence Classes)          |
|  - Feature-by-feature verification (>= 5 test cases per feature)      |
|  - Mochila CRUD & Caja de Reserva (72h+)                              |
|  - Plan Familiar CRUD & INDECI Roles                                  |
|  - Zonas Seguras & Puntos de Encuentro                                |
|  - National Speed Dial (105, 116, 106, 115) & 119 Voice Mailbox       |
|  - Hardware Utilities: Steady Torch, SOS Morse Strobe, Rescue Whistle |
|  - Huaicos: SENAMHI alerts, natural signs, 90° guide, water potabiliz.|
+-----------------------------------------------------------------------+
```

### Tier 1: Category-Partition (Equivalence Classes)
Each functional feature is partitioned into input domains and equivalence classes. Representatives from each valid partition are tested systematically to verify the primary specification:
- CRUD lifecycle of backpack items (custom additions, quantity adjustments, deletion, default protection).
- Caja de Reserva (72h+) extended provisions (bulk water, canned goods, hygiene).
- Family member registry and operational disaster role assignment.
- Structured meeting points (internal, external, community, safe zones).
- Direct national speed dialer hub (`tel:105`, `tel:116`, `tel:106`, `tel:115`, `tel:100`).
- MTC 119 voice recording (`tel:1191...`) and playback (`tel:1192...`).
- Hardware utility abstractions: steady light, SOS Morse strobe pattern, audio rescue whistle beacon.
- Huaicos module: SENAMHI 4 alert levels, 6 early warning signs, 90° perpendicular climb guide, water chlorination calculator.

### Tier 2: Boundary Value Analysis (BVA)
Tests focus on limits, invalid combinations, and edge anomalies:
- Input sanitization: whitespace trimming, blank string rejection, extreme length truncation.
- Phone validation: rejecting numbers with length $\ne 9$, numbers not starting with `9`, symbols, letters.
- Volume math: negative liters, zero liters, extreme volumes ($10^6$ L), fractional volumes.
- Preparation metric bounds: mathematically strictly bounded in $[0, 100]\%$, zero items yielding $0\%$ without NaN or division by zero.
- Storage resilience: handling malformed JSON payloads and QuotaExceededError transparently.

### Tier 3: Pairwise Combinatorial & Cross-Feature Integration
Applies combinatorial testing across orthogonal system features:
- Mochila state mutations paired with concurrent Family Plan updates under shared storage.
- Emergency dialer auto-wiring target numbers from registered family key contacts.
- Huaicos alert level escalations synchronized with safe meeting points on high ground.
- Multi-tab storage synchronization via `window.dispatchEvent(new StorageEvent(...))`.

### Tier 4: Real-World Disaster Scenarios
Simulates realistic, multi-step disaster narratives modeled after historical Peruvian crises:
1. **Scenario 1: Megathrust Mw 8.0 Earthquake in Lima / Callao**:
   - Initial shock $\rightarrow$ Immediate placement in internal safe columns.
   - Tremor subsides $\rightarrow$ Evacuation with 8 kg emergency backpack.
   - Structural fire / trapped victim $\rightarrow$ Instant dial to Bomberos 116 & SAMU 106.
   - Telecom congestion $\rightarrow$ Use of 119 voice mailbox.
   - Dark/debris entrapment $\rightarrow$ Flashlight SOS Morse beacon and 3000 Hz acoustic whistle.
2. **Scenario 2: Sudden Chosica / Huaycoloro Quebrada Activation**:
   - Upstream sensory detection (subterranean roar, dark muddy foam, river stoppage).
   - SENAMHI Red Alert activation.
   - Immediate 90° perpendicular ascent to designated high-ground meeting point.
   - Refusal to cross active 15 cm+ mudflow or run downstream.
3. **Scenario 3: 72-Hour Post-Alluvial Water Infrastructure Collapse**:
   - River water turbidity forces Sedapal water treatment shutdown.
   - Retrieval of Caja de Reserva (bulk water and food).
   - Safe disinfection calculation: 2 drops 5% bleach per 1 L water, 30 minutes sedimentation and sterilization.

---

## 3. Feature Inventory Matrix (Mapping to Test Tiers)

The table below maps all 25 features defined in `PROJECT.md` to their corresponding test coverage tiers:

| # | Feature Description | Milestone | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------------------|:---------:|:------:|:------:|:------:|:------:|
| 1 | Full CRUD Backpack Items | M1 | X | X | X | X |
| 2 | Full CRUD Family Members & Roles | M1 | X | X | X | X |
| 3 | Full CRUD Meeting Points & Safe Zones | M1 | X | X | X | X |
| 4 | National Emergency Speed Dial Hub (105, 116, 106, 115, 100) | M1 | X | X | X | X |
| 5 | Enhanced 119 Voice Messaging URIs | M1 | X | X | X | X |
| 6 | Caja de Reserva (72h+) Checklist | M1 | X | X | X | X |
| 7 | Rescue Audio Whistle / Beacon (2500-3500 Hz Rule of Three) | M1 | X | X | - | X |
| 8 | Capacitor Setup & Hardware Stubs (Torch SOS, Camera) | M1 | X | X | - | X |
| 9 | Mobile-First UI Polish (Touch targets >44px, sticky header) | M1 | X | X | - | X |
| 10 | Consolidated Research Dossier (`research.md`) | M1 | X | - | - | X |
| 11 | Feature 002 Spec Kit Lifecycle (`specs/002-mapa-gps/`) | M2 | X | - | - | - |
| 12 | Offline Vector SVG Map Canvas | M2 | X | X | X | X |
| 13 | Geolocation & GPS Tracker (Accuracy circle, fallback) | M2 | X | X | X | X |
| 14 | Safe Zones & INDECI Circles Layer (4.5m circles) | M2 | X | X | X | X |
| 15 | Proximity Radar & Haversine Distance Calculation | M2 | X | X | X | X |
| 16 | Navigation Azimuth & Bearing Arrow | M2 | X | X | X | X |
| 17 | Feature 003 Spec Kit Lifecycle (`specs/003-huaicos-offline/`) | M3 | X | - | - | - |
| 18 | SENAMHI Alert Guide (Verde, Amarillo, Naranja, Rojo) | M3 | X | X | X | X |
| 19 | Natural Early Warning Signs Matrix (6 signs, reaction time)| M3 | X | X | X | X |
| 20 | 90° Perpendicular Evacuation Guide & River Crossing Warnings | M3 | X | X | X | X |
| 21 | Seasonal Protection & Hardening Checklists (Sandbags, Ziploc)| M3 | X | X | X | X |
| 22 | Emergency Water Disinfection Protocol (2 drops bleach/L, 30m)| M3 | X | X | X | X |
| 23 | Huaicos Storage Persistence & Bounded Progress Metrics | M3 | X | X | X | X |
| 24 | E2E Test Suite (Tiers 1-4) | M4 | X | X | X | X |
| 25 | Adversarial Coverage Hardening (Tier 5 Stress) | M4 | - | X | X | X |

---

## 4. Directory Layout & Test Organization

```
/home/vlad/tmp/taislab/lab03/
├── tests/
│   ├── setup.ts                      # Global environment setup (JSDOM, localStorage mock)
│   ├── unit/                         # Unit tests for isolated functions and components
│   │   ├── ChecklistMochila.test.tsx
│   │   ├── PlanFamiliar.test.tsx
│   │   ├── phoneValidator.test.ts
│   │   ├── progressCalculator.test.ts
│   │   ├── storageAdapter.test.ts
│   │   └── huaicos.test.tsx
│   ├── integration/                  # Cross-module component integration tests
│   │   └── offlineLifecycle.test.tsx
│   ├── property/                     # Fast-check property-based tests
│   │   ├── progressInvariants.pbt.test.ts
│   │   └── storageRoundTrip.pbt.test.ts
│   └── e2e/                          # Opaque-Box 4-Tier E2E Test Suite
│       ├── tier1_features.test.ts    # Tier 1: Category-Partition Equivalence Classes
│       ├── tier2_boundaries.test.ts  # Tier 2: Boundary Value Analysis & Edge Cases
│       ├── tier3_crossfeature.test.ts# Tier 3: Pairwise Combinations & Storage Synchronization
│       └── tier4_realworld.test.ts   # Tier 4: Realistic Disaster Scenarios (Lima Quake, Huaico, Water)
├── TEST_INFRA.md                     # Test infrastructure specification (this document)
└── TEST_READY.md                     # Suite verification and execution summary
```

---

## 5. Test Runner Invocation

The test suite is executed using **Vitest** with JSDOM:

### Run All Tests
```bash
npm test
```

### Run E2E Test Suite Only
```bash
npx vitest run tests/e2e/
```

### Run by Specific Tier
```bash
npx vitest run tests/e2e/tier1_features.test.ts
npx vitest run tests/e2e/tier2_boundaries.test.ts
npx vitest run tests/e2e/tier3_crossfeature.test.ts
npx vitest run tests/e2e/tier4_realworld.test.ts
```

### Watch Mode for Interactive Development
```bash
npm run test:watch
```
