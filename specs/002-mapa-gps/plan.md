# Implementation Plan: Feature 002 Offline SVG Map & GPS

**Branch**: `002-mapa-gps`  
**Document**: `specs/002-mapa-gps/plan.md`  
**Target Milestone**: Milestone 2  
**Framework**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons  

---

## 1. Technical Architecture & File Structure

```text
src/
├── core/
│   ├── geoMath.ts                     # Spherical trigonometry & vector projection
│   └── defaultMeetingPoints.ts        # Preloaded safe zones with Lima coordinates
├── hooks/
│   └── useGeolocation.ts              # Geolocation watcher with offline fallback
├── components/
│   ├── mapa/
│   │   ├── SvgMapCanvas.tsx           # 100% offline responsive vector SVG canvas
│   │   ├── SafeZonesOverlay.tsx       # INDECI 4.5m circles & meeting points layer
│   │   ├── NearestPointRadar.tsx      # Proximity card, distance & bearing arrow
│   │   └── MapaView.tsx               # Main coordinator view & controls
│   └── common/
│       └── NavigationTabs.tsx         # Updated with 'mapa' tab
└── App.tsx                            # Wired with activeTab === 'mapa'

tests/
└── unit/
    └── mapaSvg.test.tsx               # Comprehensive unit & integration tests
```

---

## 2. Mathematical Formulations & Coordinate Projection

### 2.1 Haversine Distance Formula
Given two coordinates $\mathbf{c}_1 = (\phi_1, \lambda_1)$ and $\mathbf{c}_2 = (\phi_2, \lambda_2)$ in radians:
$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$
$$d = R \cdot c \quad \text{con } R = 6,371,000 \text{ metros}$$

- **Edge Case $\mathbf{c}_1 = \mathbf{c}_2$**: $a = 0$, $c = 0$, $d = 0\text{ m}$.
- **Precision**: Handles Southern/Western hemisphere coordinates (negative values in Peru, e.g. $-12.046^\circ\text{ S}$, $-77.042^\circ\text{ W}$).

### 2.2 Forward Azimuth / Bearing Calculation
Given origin $(\phi_1, \lambda_1)$ and destination $(\phi_2, \lambda_2)$ in radians:
$$y = \sin(\Delta\lambda) \cdot \cos(\phi_2)$$
$$x = \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)$$
$$\theta = \operatorname{atan2}(y, x)$$
$$\text{bearing} = \left(\theta \cdot \frac{180}{\pi} + 360\right) \pmod{360}$$

- **Cardinal directions**:
  - $0^\circ$ / $360^\circ$: Norte directo ($\Delta\phi > 0, \Delta\lambda = 0$)
  - $90^\circ$: Este directo ($\Delta\phi = 0, \Delta\lambda > 0$)
  - $180^\circ$: Sur directo ($\Delta\phi < 0, \Delta\lambda = 0$)
  - $270^\circ$: Oeste directo ($\Delta\phi = 0, \Delta\lambda < 0$)
- **Identical Points**: If $\Delta\phi = 0$ and $\Delta\lambda = 0$, defaults deterministically to $0^\circ$.

### 2.3 Geographic to SVG Coordinate Projection (`projectGeoToSvg`)
Given bounding box $\mathcal{B} = [\text{minLat}, \text{maxLat}] \times [\text{minLng}, \text{maxLng}]$ and SVG viewport dimensions $(W, H)$:
$$X = \frac{\lambda - \text{minLng}}{\text{maxLng} - \text{minLng}} \cdot W$$
$$Y = \frac{\text{maxLat} - \phi}{\text{maxLat} - \text{minLat}} \cdot H$$

*Nota técnica*: El eje $Y$ en gráficos SVG crece hacia abajo (origen superior izquierdo $(0,0)$), mientras que la latitud geográfica crece hacia el norte (arriba). La fórmula invierte la coordenada vertical restando $\phi$ de $\text{maxLat}$.

### 2.4 Distance Formatter (`formatDistance`)
$$\operatorname{formatDistance}(d) = \begin{cases}
\text{"0 m"}, & \text{si } d \le 0 \\
\operatorname{round}(d) + \text{" m"}, & \text{si } 0 < d < 1000 \\
(d / 1000)\text{.toFixed(1)} + \text{" km"}, & \text{si } d \ge 1000
\end{cases}$$

---

## 3. Component Design & Responsibilities

### 3.1 `useGeolocation.ts`
- Encapsulates `navigator.geolocation.watchPosition` and `getCurrentPosition`.
- Fallback coordinates: Lima Centro Histórico / Plaza Mayor ($-12.046374, -77.042793$).
- Handles states: `cargando`, `coords`, `accuracy`, `error`, `esUbicacionSimulada`.
- Graceful recovery: On permission denial or position timeout, marks `esUbicacionSimulada: true` with explanatory message and standard Lima coordinates, ensuring the map canvas is always functional.

### 3.2 `SvgMapCanvas.tsx`
- Responsive SVG container with `viewBox="0 0 800 600"`.
- Vector base layers:
  * Urban grid blocks (`<polygon>`, `<rect>`) representing Lima city blocks.
  * Road network / evacuation corridors (`<line>`, `<path>`) with directional evacuation arrows.
  * Green spaces & open areas (`<rect>`, `<circle>`) representing parks (e.g. Campo de Marte, Parque de la Muralla).
- Dynamic layers:
  * User location marker: `<circle>` with pulsing SVG animation (`<animate>`) and translucent accuracy radius.
  * Safe zones overlay (`SafeZonesOverlay`).
- Pan and Zoom state:
  * Zoom levels: $[0.5, 3.0]$ with smooth scaling transform `translate(dx, dy) scale(k)`.
  * Touch / mouse drag controls and reset button.

### 3.3 `SafeZonesOverlay.tsx`
- Renders:
  * INDECI 4.5m safety circles: `<circle r="18" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />` with an inner white cross / INDECI "S" emblem.
  * Community rendezvous zones: `<polygon points="..." fill="#38bdf8" />`.
  * User-created meeting points from `PlanFamiliar` state.
- Interactive tooltip / selection popover on click or tap: shows point name, type, description, and distance.

### 3.4 `NearestPointRadar.tsx`
- Computes Haversine distance and azimuth from current GPS coordinates to all available safe zones.
- Selects point with $\min(\text{distancia})$.
- Displays:
  * Prominent distance badge (`45 m`, `320 m`, etc.).
  * Directional SVG compass arrow rotated by `rumboGrados` degrees (`transform: rotate(${rumboGrados}deg)`).
  * Arrival indicator if $\text{distancia} < 5\text{ m}$.
  * Target point details (name, type, instructions).

### 3.5 `MapaView.tsx`
- Top status banner:
  * Online/Offline indicator + GPS signal quality badge (Satélite activo / Ubicación aproximada).
- Interactive action bar:
  * Zoom in (`+`), Zoom out (`-`), Reset view (`⟲`), Center on me (`◎`), Toggle evacuation routes.
- Main map viewport rendering `SvgMapCanvas`.
- Proximity radar card (`NearestPointRadar`).
- Collapsible list of all registered safe zones with direct distance indicators.

---

## 4. Verification & Testing Strategy

1. **Unit Tests (`tests/unit/mapaSvg.test.tsx`)**:
   - `calcularDistanciaHaversine`:
     * Distance between identical points is 0m.
     * Known Lima distance: Plaza Mayor to Campo de Marte (~3.2 km).
     * Extreme coordinates across international date line and poles.
   - `calcularRumboAzimut`:
     * Cardinal points: Due North ($0^\circ$), Due East ($90^\circ$), Due South ($180^\circ$), Due West ($270^\circ$).
     * Intercardinal angles ($45^\circ$, $135^\circ$, $225^\circ$, $315^\circ$).
   - `formatDistance`:
     * Sub-kilometer formatting (`15 m`, `950 m`).
     * Kilometer formatting (`1.0 km`, `3.5 km`).
   - `projectGeoToSvg`:
     * Coordinate projection mapping within bounding box bounds.
     * Clamping bounds verification.
   - Component rendering:
     * `SvgMapCanvas` renders SVG element with vector shapes.
     * `SafeZonesOverlay` displays INDECI circles and meeting points.
     * `NearestPointRadar` identifies closest zone and renders bearing arrow.
     * `useGeolocation` handles both successful geolocation and permission errors with fallback.
     * `MapaView` switches tabs and renders controls.

2. **Integration & Production Verification**:
   - `npm test`: all 18+ test suites pass 100%.
   - `npm run build`: `tsc` and Vite bundling with 0 errors.
