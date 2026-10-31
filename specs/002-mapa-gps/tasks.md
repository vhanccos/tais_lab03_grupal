# Actionable Tasks: Feature 002 Offline SVG Map & GPS

**Branch**: `002-mapa-gps`  
**Document**: `specs/002-mapa-gps/tasks.md`  
**Target Milestone**: Milestone 2  

---

## Phase 1: Core Mathematical Utilities (`src/core/geoMath.ts`)

- [x] **T01**: Implement `calcularDistanciaHaversine(coord1, coord2)` returning metric distance via spherical trigonometry ($R = 6,371,000\text{ m}$).
- [x] **T02**: Implement `calcularRumboAzimut(origen, destino)` calculating forward azimuth in degrees normalized to $[0^\circ, 360^\circ)$.
- [x] **T03**: Implement `projectGeoToSvg(coord, bounds, svgWidth, svgHeight)` mapping latitude and longitude to SVG $(X, Y)$ plane.
- [x] **T04**: Implement `formatDistance(meters)` generating human-readable distance strings (e.g., `"45 m"`, `"1.2 km"`).

---

## Phase 2: Geolocation Hook (`src/hooks/useGeolocation.ts`)

- [x] **T05**: Implement `useGeolocation()` hook wrapping `navigator.geolocation.watchPosition` with fallback coordinates for Lima Metropolitan area.
- [x] **T06**: Implement error handling for `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, and `TIMEOUT` with simulated location fallback mode.

---

## Phase 3: Offline Vector SVG Map Components (`src/components/mapa/`)

- [x] **T07**: Implement `SvgMapCanvas.tsx` rendering responsive vector SVG canvas with urban blocks, streets, evacuation routes, pan/zoom transforms, and user position marker with accuracy halo.
- [x] **T08**: Implement `SafeZonesOverlay.tsx` rendering INDECI 4.5m safety circles (`#22c55e`), parks, and user-defined meeting points from `PlanFamiliar`.
- [x] **T09**: Implement `NearestPointRadar.tsx` proximity card displaying instant distance to closest safe zone and animated directional bearing arrow.
- [x] **T10**: Implement `MapaView.tsx` coordinator view integrating status banner, zoom/pan controls, map canvas, proximity radar, and interactive safe zones list.

---

## Phase 4: Application Integration & Navigation

- [x] **T11**: Update `src/components/common/NavigationTabs.tsx` to include dedicated `'mapa'` tab with Map icon and test attributes.
- [x] **T12**: Update `src/App.tsx` to wire `MapaView` when `activeTab === 'mapa'`.

---

## Phase 5: Testing & Verification

- [x] **T13**: Create unit and integration tests in `tests/unit/mapaSvg.test.tsx` verifying:
  - Haversine distance accuracy, boundary conditions, and identical coordinates.
  - Bearing azimuth calculations across all 4 quadrants ($0^\circ, 90^\circ, 180^\circ, 270^\circ$).
  - Distance formatting thresholds.
  - Coordinate projection geometry onto SVG canvas.
  - Component rendering for `SvgMapCanvas`, `SafeZonesOverlay`, `NearestPointRadar`, and `MapaView`.
  - Geolocation hook error handling and fallbacks.
- [x] **T14**: Execute `npm test` verifying 100% pass rate across all project test suites.
- [x] **T15**: Execute `npm run build` verifying clean TypeScript compilation (`tsc`) and Vite bundling.
