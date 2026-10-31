# Comprehensive Disaster Scenario Research Dossier: Earthquakes & Huaicos in Peru

**Scope**: Authoritative research foundation for SismoListo (`001-sismolisto-offline`), Vector SVG Map & GPS Navigation (`002-mapa-gps`), and Offline Mudslide Management (`003-huaicos-offline`).  
**Institutional Reference Standards**: Sistema Nacional de Gestión del Riesgo de Desastres (SINAGERD - Ley N° 29664), INDECI (Instituto Nacional de Defensa Civil), IGP (Instituto Geofísico del Perú / CENSIS), SENAMHI (Servicio Nacional de Meteorología e Hidrología), ANA (Autoridad Nacional del Agua), CENEPRED, MTC, MINSA (SAMU), CGBVP (Bomberos), PNP.  
**Date**: October 2026  

---

## 1. Executive Summary & Legal-Institutional Architecture (SINAGERD)

Peru is situated in one of the most hazardous geodynamic and hydrometeorological environments on Earth:
1. **Seismic Hazard**: The oceanic Nazca Plate subducts beneath the continental South American Plate at ~6 to 7 cm/year along the Peru-Chile Trench, accumulating extreme elastic strain (e.g. the Lima megathrust seismic gap unruptured since October 28, 1746, capable of generating an $M_w \ge 8.5$ megathrust earthquake and devastating tsunamis).
2. **Hydrometeorological & Alluvial Hazard**: The steep western slopes of the Andes descend into narrow coastal ravines (*quebradas*). During seasonal rains and El Niño / El Niño Costero episodes, sudden torrential precipitation triggers devastating debris flows (*huaicos* / *aluviones*).

Under **Ley N° 29664**, disaster management is governed by SINAGERD through specialized entities:
- **INDECI**: Reactive risk management—preparedness, civil defense response, humanitarian aid, and rehabilitation.
- **IGP / CENSIS**: National geophysical and seismological monitoring; deployment of SASPe (Sistema de Alerta Sísmica Peruano).
- **SENAMHI**: National meteorological and hydrological authority issuing rainfall alerts, river discharge thresholds, and short-term *Avisos de Activación de Quebradas*.
- **ANA (MIDAGRI)**: Water resource governance, demarcation of intangible *fajas marginales* (15–50 m buffer along streams), and dynamic debris-flow retention barriers.
- **CENEPRED**: Prospective and corrective risk assessment and territorial prevention.
- **MTC**: Telecommunications regulation, including the 119 Emergency Voice Messaging protocol and SISMATE cell broadcast early warnings.

---

## 2. Part I: Earthquake Preparedness, Evacuation & Response Protocols

### 2.1 The Official Protocol: "Ubícate, Evacúa, Comunícate"

INDECI divides public seismic response into three sequential, non-overlapping operational stages:

#### Phase 1: Durante el Sismo — "UBÍCATE" (Self-Protection & Internal Safe Zones)
- **Immediate Action**: Maintain composure; avoid running, pushing, or precipitous exit during active ground motion. Severe injuries and fatalities in urban areas are predominantly caused by falling masonry, shattering glass facades, collapsing parapets, and tripping on stairs.
- **Internal Safe Zone Positioning**: Move swiftly to designated **Zonas Seguras Internas**:
  - Beside reinforced concrete columns (*columnas de concreto armado*).
  - Beside reinforced shear walls (*placas estructurales*).
  - Under the intersection of load-bearing concrete beams and columns.
- **Disallowed Actions**:
  - Never use elevators (power failure, counterweight derailment, cable snapping).
  - Avoid windows, exterior glass panels, mirrors, unanchored bookcases, and hanging light fixtures.
  - "Drop, Cover, and Hold On" under heavy, structural desks or tables; if unavailable, curl into a fetal protective posture beside an interior structural column protecting head and neck with arms.

#### Phase 2: Post-Sismo — "EVACÚA" (Safe Egress & External Assembly)
- **Trigger**: Primary ground shaking ceases or dampens enough to permit controlled, orderly movement.
- **Actions**:
  - Grab the **Mochila para Emergencias** placed beside the exit door.
  - Follow official green evacuation paths (NTP 399.010-1 arrows) toward **Zonas Seguras Externas**.
  - Evacuate via stairs calmly holding handrails; assist priority vulnerable family members (infants, elderly, persons with disabilities, pets).
  - Open doors immediately during or right after the tremor to prevent jamming caused by building frame deflection.
  - Cut the main gas valve (*llave de paso de gas*) and trip the main electrical circuit breaker (*llave térmica general*) to prevent fires from cracked pipes or severed live wiring.

#### Phase 3: Post-Evacuación — "COMUNÍCATE" (Congestion-Free Telecommunications)
- **Anti-Congestion Rule**: **Do NOT place conventional cellular voice calls**. Voice channels collapse immediately post-earthquake due to Erlang capacity saturation and base-station battery/grid failure.
- **Protocol**: Prioritize SMS text messaging and the national **Servicio 119 de Mensajería de Voz**. Maintain radio monitoring on battery/dynamo AM/FM receivers for official INDECI / COEN bulletins.

---

### 2.2 The INDECI Family Emergency Plan Methodology: "I - U - E - A - O"

Official INDECI guidance (*"La Seguridad Empieza en Casa"*) establishes five foundational steps:

| Step | Action | Practical Application in Household Disaster Planning |
|:---:|:---|:---|
| **I** | **Identificamos** | Identify all household members, specific vulnerabilities (infants, elderly, chronic illness, pets), internal hazards (unanchored furniture, gas lines, overhead storage), and external hazards (power cables, unstable neighbor walls). |
| **U** | **Ubicamos** | Locate internal safe zones (columns, load-bearing walls), external safe zones (parks, sports fields, INDECI safety circles), and family meeting points. |
| **E** | **Elaboramos** | Create the family evacuation map, prepare the Survival Combo (Mochila de Emergencia + Caja de Reserva), and establish emergency contacts. |
| **A** | **Asignamos** | Assign clear operational roles: Backpack Carrier, Gas/Power Shutoff Operator, Elderly/Infant Guide, Pet Handler. |
| **O** | **Organizamos** | Organize household evacuation drills, participate actively in National Multi-hazard Drills (*Simulacros Nacionales Multipeligro*), and coordinate with neighborhood civil defense committees. |

---

### 2.3 Emergency Communications: Telephony Standards & Emergency Speed-Dial Hub

#### 2.3.1 Servicio Nacional 119 (MTC / INDECI Voice Messaging)
The 119 service is a nationwide, high-availability, zero-rated (free of charge) asynchronous voice mailbox system implemented across all telecom carriers (Claro, Movistar, Entel, Bitel). It buffers 60-second voice recordings directly on carrier server nodes, eliminating live continuous circuit requirements.

**Technical Dialing Specifications**:
- **Record Voice Message for a Mobile Number**:
  - Dialing syntax: `119` + `1` + `9XXXXXXXX` (9-digit mobile number)
  - Native URI: `tel:11919XXXXXXXX`
  - Function: Caller records a 60-second status/location message for the target recipient.
- **Listen to Voice Messages for a Mobile Number**:
  - Dialing syntax: `119` + `2` + `9XXXXXXXX`
  - Native URI: `tel:11929XXXXXXXX`
  - Function: Anyone calling this number retrieves all stored voice messages for that mobile line.
- **Fixed-Line Syntaxes**:
  - Record: `119` + `1` + `[Cod. Dept]` + `[Num Fijo]` (e.g., Lima `01`: `tel:119101XXXXXXX`).
  - Retrieve: `119` + `2` + `[Cod. Dept]` + `[Num Fijo]`.

#### 2.3.2 National 3-Digit Emergency Speed-Dial Hub
In acute trauma, structural fire, entrapment, or crime during disaster chaos, victims require instant single-tap phone dialer redirection:

| Number | Authority | Full Title & Operational Role | Native Dial URI |
|:---:|:---|:---|:---|
| **105** | **PNP** | Policía Nacional del Perú: Public order, rescue coordination, perimeter safety | `tel:105` |
| **116** | **CGBVP** | Bomberos Voluntarios del Perú: Urban search & rescue (USAR), fires, entrapment | `tel:116` |
| **106** | **SAMU** | Sistema de Atención Móvil de Urgencia (MINSA): Ambulance triage, severe trauma | `tel:106` |
| **115** | **Defensa Civil** | INDECI / COEN: Disaster situation reports, humanitarian assistance, shelters | `tel:115` |
| **100** | **Línea 100** | MIMP: Protection of vulnerable children, women, elderly, shelter safety | `tel:100` |
| **110** | **PNP Carreteras** | Policía de Carreteras: Interprovincial highway status, landslides on routes | `tel:110` |
| **113** | **Infosalud** | MINSA: 24/7 medical orientation, psychological post-disaster crisis support | `tel:113` |

---

### 2.4 Survival Provisioning: The "Combo de la Supervivencia"

INDECI specifies a two-tier survival strategy to sustain human life across distinct disaster horizons:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMBO DE LA SUPERVIVENCIA                             │
├───────────────────────────────────────────┬─────────────────────────────────┤
│    TIER 1: MOCHILA PARA EMERGENCIAS       │    TIER 2: CAJA DE RESERVA      │
│         Horizon: 0 to 24–48 Hours         │       Horizon: 24 to 72+ Hours  │
│         Carried during evacuation         │       Stored in safe indoor hub │
│         Weight limit: Maximum 8 kg        │       Corrugated box / Plastic  │
└───────────────────────────────────────────┴─────────────────────────────────┘
```

#### 2.4.1 Mochila para Emergencias (Hours 0 to 24–48)
- **Deployment**: Grabbed instantly during egress; kept strictly next to the primary exit door.
- **Ergonomics**: Backpack format (keeps both hands free for stair climbing, children, or flashlights). Maximum **8 kg** for two adults.
- **6 Mandatory INDECI Categories**:
  1. **Primeros Auxilios**: Sterile gauze, bandages, micropore adhesive tape, antiseptic chlorhexidine/alcohol, nitrile gloves, surgical scissors, burn cream, individual chronic prescription medications (at least 7 days).
  2. **Alimentos no perecibles**: Easy-open canned tuna/sardines/chicken, high-density energy bars, water/soda crackers, chocolate bars (high caloric density), vacuum-sealed dried fruits/nuts.
  3. **Agua embotellada**: Minimum 4 x 500 mL (2.0 L total non-carbonated pure water) + chlorine dropper or water purification tablets.
  4. **Herramientas y Comunicación**: High-lumen LED flashlight, battery or dynamo AM/FM radio, pealess emergency whistle (100+ dB), spare batteries (AA/AAA in waterproof bag), multipurpose pocket knife, heavy-duty duct tape (*cinta multipropósito*), waterproof matches/lighter.
  5. **Abrigo y Protección**: Aluminized thermal emergency blankets (mylar space blankets), lightweight rain poncho/windbreaker, heavy leather work gloves, spare change of dry clothing (socks, underwear).
  6. **Documentos y Dinero**: Waterproof pouch with physical photocopies of national identity documents (DNI), family emergency contact list, duplicate house/car keys, cash in small bills (S/ 10, S/ 20) and coins (ATMs and POS terminals fail during blackouts).
- **Special Household Modules**:
  - *Infant/Baby*: Powdered formula, nursing bottles, disposable diapers, baby wipes, rash ointment.
  - *Geriatric*: Adult incontinence pads, spare eyeglasses, walking stick, chronic medicines with written dosage schedules.
  - *Pets*: Dry kibble, collapsible silicone bowl, sturdy leash and muzzle, identification collar.

#### 2.4.2 Caja de Reserva (Hours 24 to 72+)
- **Deployment**: Kept in a dry, protected safe zone inside the home. Accessed after initial tremors cease, structural safety is verified, or for perimeter self-reliance while awaiting external civil defense relief.
- **Container**: Sturdy corrugated cardboard box or hermetic plastic container with latches.
- **Essential Provisions**:
  - **Bulk Water**: 2.5 L to 5.0 L containers (minimum 3.0 L to 4.0 L per person per day for drinking, basic hygiene, and cooking).
  - **Bulk Non-Perishable Food**: Dehydrated beans, rice, pasta, instant soups, evaporated milk, canned meats/fruits, sugar, instant coffee, hard candy.
  - **Extended Hygiene**: Bar soaps, toilet paper multipack, toothpaste, toothbrushes, sanitary pads, heavy-duty 50L trash bags.
  - **Shelter & Kitchen Utensils**: Heavy plastic tarps (*plásticos de polietileno* for roof/ground waterproofing), small cooking pot, disposable plates and cutlery, thermos, wool blankets or polar fleeces.

---

### 2.5 Safe Zones & Spatial Evacuation Criteria

#### 2.5.1 Zonas Seguras Internas
- Must be positioned along primary structural load-bearing elements designed to resist lateral seismic shear:
  - Reinforced concrete columns (*columnas de concreto armado*).
  - Concrete shear walls (*placas estructurales*).
  - Junctions between main load-bearing beams and columns.
- **Safety clearance**: Minimum 2.0 meters away from glass windows, exterior facade panels, unanchored bookcases, mirrors, and lightweight partition walls (*muros de tabiquería*).

#### 2.5.2 Zonas Seguras Externas & Círculos de Seguridad
- **Selection Criteria**:
  - Wide open spaces: Municipal parks, public plazas, sports courts (*losas deportivas*), large open parking facilities.
  - Distance formula from building facade: $\text{Distance} \ge 0.5 \times \text{Building Height}$ to remain outside the danger zone of shattering glass and falling facade masonry.
  - Absolute avoidance of high-voltage transmission lines, electrical transformers, unreinforced masonry perimeter walls, and decaying trees.
- **Círculos de Seguridad (INDECI Safety Circles)**:
  - Official ground markings in green (`#22c55e`) with white or yellow border.
  - Standard diameter: **4.5 meters**, designed to safely gather clusters of 15 to 20 people in organized groups away from traffic.

#### 2.5.3 Puntos de Encuentro
- **Punto de Encuentro Interno**: Pre-agreed location inside the building (e.g., column beside main entrance hall) where family members regroup before exiting if room exits are safe.
- **Punto de Encuentro Externo**: Pre-agreed neighborhood landmark (e.g., central gazebo of local park) where separated family members reunite if an earthquake strikes while members are at work, school, or transit.
- **Data Model**: Structured entity `PuntoEncuentro` with `id`, `nombre`, `tipo` (`interno` | `externo` | `comunitario` | `seguro`), `descripcion`, optional geographic coordinates `{ lat, lng }`, and SVG coordinates `{ x, y }`.

---

### 2.6 Emergency Hardware Utility Needs

During major seismic crises, electrical grid collapse and structural trapping demand device-level utility features:

#### 2.6.1 Torch / Flashlight Utility
- **Continuous Torch**: Instant LED illumination for dark stairwells and nighttime egress. Gas leaks preclude matches or lighters.
- **SOS Morse Strobe Mode**: Automated optical distress signal emitting the international Morse SOS sequence:
  $$\dots\ ---\ \dots\quad (3\text{ short}, 3\text{ long}, 3\text{ short})$$
  - Short pulse: 200 ms on, 200 ms off.
  - Long pulse: 600 ms on, 200 ms off.
  - Inter-sequence pause: 1400 ms.
- **Screen Torch Fallback**: When hardware torch API is unavailable (browser environment without permissions), displays a maximum-brightness full-screen white canvas.

#### 2.6.2 Acoustic Rescue Alarm / Digital Whistle Beacon
- **Trapped Victim Reality**: Victims pinned beneath drywall, rubble, or collapsed furniture cannot shout continuously without inhaling toxic concrete dust and dehydrating within hours.
- **Web Audio API Beacon**:
  - Pure tone synthesized locally using `AudioContext` and `OscillatorNode` (square or high-harmonic waveform at 2500 Hz to 3500 Hz—the peak sensitivity frequency of the human auditory canal).
  - **Rule of Three ("Poder del Tres") Pulse Loop**:
    - 3 piercing blasts of 1.0 second each, separated by 1.0 second silence.
    - 60 seconds of complete silence (listening window for Urban Search and Rescue / USAR canine and acoustic search sensors).
    - Continuous auto-loop with minimal battery footprint and zero network dependencies.

#### 2.6.3 Camera / Structural Damage Documentation
- **Damage Assessment**: Post-tremor verification requires recording structural distress (e.g. diagonal 45° X-cracks in shear walls indicating catastrophic shear failure vs. hairline superficial plaster cracks) for INDECI municipal inspectors.
- **Implementation**: Photo capture via HTML5 file input with camera capture (`<input type="file" accept="image/*" capture="environment">`) and Capacitor camera plugin abstraction, tagging records with timestamp and damage severity level.

---

### 2.7 Spatial & Geolocation Specifications for Feature 002 (SVG Map & GPS)

- **Vector SVG Engine**: 100% offline responsive vector canvas rendering district streets, hazard zones, safe circles, and meeting points without remote tile servers (Mapbox/Google Maps fail completely offline).
- **Mathematical Formulations**:
  - **Haversine Distance**:
    $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
    Measures metric distance in meters from current GPS coordinates to nearest safe zone or meeting point.
  - **Forward Azimuth / Bearing**:
    $$\theta = \text{atan2}\left(\sin(\Delta \lambda)\cos(\phi_2), \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta \lambda)\right)$$
    Returns directional angle $[0^\circ, 360^\circ)$ to orient a directional compass arrow pointing toward safety.

---

## 3. Part II: Huaicos & Alluvial Risk Management (Mudslides & Floods)

### 3.1 Phenomenology & Physical Mechanics of Andean Huaicos

In the Peruvian Andes, the Quechua word **huaico** (or *wayqu*, ravine) designates a devastating **debris flow** (*flujo de detritos*) or hyperconcentrated sediment flow triggered by extreme or prolonged rainfall in steep, barren mountain catchments.

#### Key Physical Parameters:
- **Composition**: Non-homogeneous slurry of water, silt, clay, gravel, organic debris (trees, logs), and giant boulders (*bolones*) exceeding 2 to 3 meters in diameter and 20 to 50 tons in weight.
- **Flow Bulk Density**: Between $1.5 \text{ and } 2.2 \text{ g/cm}^3$ (compared to $1.0 \text{ g/cm}^3$ for clear water). This elevated density yields extreme hydrostatic buoyancy and hydrodynamic drag, effortlessly floating automobiles, overturning buses, and demolishing masonry structures.
- **Propagation Velocity**: $5 \text{ to } 15 \text{ m/s}$ ($18 \text{ to } 54 \text{ km/h}$). This far exceeds the maximum uphill running sprint of a human in rugged or muddy terrain ($10\text{--}15 \text{ km/h}$).
- **Alluvial Fan Behavior (*Cono de Deyección*)**: When the debris flow exits the narrow mountain gorge and reaches the valley floor, it loses confinement, expands radially with catastrophic energy, and inundates the historical alluvial cone where informal urban sprawl often settles.

---

### 3.2 Institutional Framework & Warning Systems

#### 3.2.1 SENAMHI Hydro-Meteorological Alerts
SENAMHI classifies precipitation and landslide hazard into an authoritative 4-color hierarchy:

| Color Level | Classification | Meteorological Condition & Physical Impact | Official Action Directive |
|:---:|:---:|:---|:---|
| **Verde** | **Normal** | Atmospheric conditions within normal seasonal limits; no active ravine threat. | Normal vigilance; routine maintenance of household drainage. |
| **Amarillo** | **Moderado** | Rainfall events of moderate intensity capable of activating low-risk ravines. | Caution in flood-prone areas; inspect sandbags and clear roof gutters. |
| **Naranja** | **Fuerte / Severo** | Intense precipitation with high probability of major debris flows and river overflows. | Prepare immediate evacuation; safeguard vulnerable individuals and survival backpacks. |
| **Rojo** | **Extremo** | Torrential, unprecedented precipitation; imminent, catastrophic debris flows across multiple basins. | **Forced immediate evacuation** to high rocky ground; seek safety above alluvial zones. |

#### 3.2.2 ANA (Autoridad Nacional del Agua) Regulations
- **Faja Marginal (Ley N° 29338 & RJ N° 332-2016-ANA)**: Intangible public easement strip extending 15 to 50 meters along the banks of rivers and natural torrents. Human dwellings, construction, and agriculture are strictly prohibited.
- **Dynamic Debris-Flow Barriers**: Heavy flexible steel ring mesh nets anchored with micropiles across narrow canyon throats (e.g. Chosica ravines: Carossio, Pedregal, Quirio, Corrales). They retain giant boulders while permitting muddy water to filter through, decelerating the front.

---

### 3.3 Natural Early Warning Signs Matrix

When cellular networks, internet connections, or electronic sensors fail in severe storms, nature provides unmistakable sensory signals that save lives if acted upon in seconds:

| Warning Signal | Sensory Manifestation | Physical / Geological Cause | Reaction Window & Immediate Protocol |
|---|---|---|---|
| **1. Subterranean Roar / Rumbling** | Deep, muffled, thunderous roar resembling low-flying jet aircraft or a freight train. | Violent friction and impacts of thousands of tons of rolling boulders against the canyon bedrock. | **Extremo (30 to 180 seconds)**: Evacuate immediately perpendicular to the ravine; do not stop to gather belongings. |
| **2. Drastic Turbidity & Odor Shift** | Stream water shifts within seconds from clear/muddy to thick, dark chocolate-colored slurry with foam, branches, and strong smell of churned earth. | Massive erosion and soil saturation in upper basin headwaters. | **Crítico (2 to 5 minutes)**: Abandon riverbanks, bridges, and dry stream beds immediately. |
| **3. Sudden Flow Stoppage (*Represamiento*)** | During active downpours, the stream or ravine water suddenly drops dramatically or dries up entirely. | Upstream rockslide or debris jam formed a temporary natural dam in a narrow choke point. | **Inminente Mortal**: When the natural dam bursts under water pressure, a catastrophic mud surge (*tsunami de lodo*) is released. Evacuate to maximum elevation immediately. |
| **4. Animal Panic Behavior** | Flocks of wild birds fly in frantic stampede down from hills; domestic dogs bark frantically toward mountain slopes and refuse to enter; cattle run uphill. | Animals perceive low-frequency infrasound (< 20 Hz) and ground micro-tremors generated by debris flows minutes before humans. | **Preventivo Inmediato**: Alert family members, assemble at exit, grab Mochila de Emergencia. |
| **5. Continuous Ground Vibration** | Fine, continuous micro-tremor felt through feet (continuous rumbling rather than oscillatory tectonic waves). | Mechanical impact waves of giant boulders bouncing off bedrock less than 500 meters upstream. | **Inminente**: The debris flow front is within striking distance. Gain vertical elevation immediately. |
| **6. Tension Cracks & Rockfall** | Fresh cracks appearing in hillsides; continuous trickling of small stones down slopes. | Saturation of slope soil, loss of internal friction, and impending mass failure. | **Precaución**: Vacate homes located at the toe or crest of unstable slopes. |

---

### 3.4 Self-Protection & Evacuation Survival Directives

#### 3.4.1 The Golden Rule: 90° Perpendicular and Ascending Evacuation
- **Right-Angle Rule (90°)**: Upon detecting early warning signs or community sirens, **always evacuate perpendicularly to the flow direction**, climbing upward into solid, bedrock hillsides.
- **FATAL MISTAKE — Running Downstream**: Attempting to outrun the flow down the ravine or along the alluvial cone guarantees being overtaken, as the slurry travels at 30 to 50 km/h and broadens unpredictably.

#### 3.4.2 Extreme Danger of Crossing Active Flows
- Hydrodynamic force thresholds:
  - **15 cm of moving water and mud**: Can easily sweep a healthy adult off their feet.
  - **30 cm of flow**: Possesses sufficient buoyancy and drag to float passenger cars.
  - **60 cm of flow**: Sweeps away pickup trucks, heavy SUVs, and small buses.
- **Strict Prohibition**: Never attempt to cross active ravines on foot or in vehicles, and avoid standing on bridges clogged with debris.

#### 3.4.3 Rapid Utility Cutoff Protocol (< 10 seconds)
Before stepping out the door, if safety permits:
1. Trip the main electrical circuit breaker (prevents electrocution when floodwaters inundate wall sockets).
2. Shut the main gas regulator valve.
3. Evacuate immediately without delaying for non-essential belongings.

---

### 3.5 Household Checklists for Huaico & Rainy Season Preparedness

#### 3.5.1 Home Hardening & Physical Protection
1. **Sandbag Deflection Barriers**:
   - Maintain 10 to 20 polypropylene sandbags filled to 2/3 capacity with coarse sand.
   - Stack bags in overlapping brick patterns (*tresbolillo*) with folded ends tucked underneath.
   - Position barriers in an inverted "V" shape or angled line to deflect incoming mud toward public drainage, never attempt to block flows head-on.
2. **Roof & Drainage Maintenance**:
   - Bi-weekly inspection and clearing of roof gutters, valleys (*limahoyas*), and drainage scuppers.
   - Secure corrugated metal roofing sheets (*calaminas*) with heavy-duty J-bolts and rubber washers to resist gusty storm winds.
   - Waterproof joints using asphaltic membranes or polyurethane sealants.
3. **Perimeter Clearance**:
   - Ensure hillside diversion ditches (*zanjas de coronación*) are clear of debris and refuse.
   - Never dispose of building rubble or garbage into dry riverbeds.

#### 3.5.2 Document & Digital Asset Preservation
1. **Hermetic Waterproof Packaging**:
   - Store official identification (DNI), property deeds, rental contracts, birth certificates, insurance cards (EsSalud/SIS), and chronic medication prescriptions.
   - Dual hermetic protection: Heavy-gauge Ziploc pouch inside a rigid waterproof container with silicone O-ring.
2. **Offline Digital Backup**:
   - Encrypted waterproof USB drive or smartphone microSD card containing scanned PDFs of all documents and essential emergency contacts in plain text.
3. **Cash Reserve**:
   - Emergency cash in small banknotes and coins sealed in waterproof plastic (electronic banking, ATMs, and point-of-sale systems fail during regional power outages).

#### 3.5.3 Extended Survival Supplies for Huaico Isolation
1. **Drinking Water & Chemical Disinfection**:
   - 4.0 liters per person per day for 3 to 5 days (debris flows contaminate water treatment plants, causing multi-day utility shutdowns).
   - **Official INDECI Disinfection Dosage**:
     - **2 drops of traditional 5% household bleach (hypochlorite without fragrances or detergents) per 1 liter of clear water**.
     - Stir thoroughly and **wait 30 minutes** before drinking.
     - If water is turbid, filter through clean cloth before chlorination, or boil vigorously for 3 minutes at high altitude.
2. **Personal Protective Equipment (PPE)**:
   - High-top rubber boots (*botas de jebe*) for every household member (protects against concealed nails, glass shards, and leptospirosis infection from rodent-contaminated mud).
   - Heavy hooded rain ponchos.
   - Leather work gloves for clearing mud and debris.
3. **Rescue & Recovery Tools**:
   - Round-point shovels, small pickaxe, and hoe.
   - Waterproof LED flashlight with spare alkaline batteries or hand-crank dynamo.
   - High-frequency plastic emergency whistle (3 short blasts, 1 minute pause, repeat).
   - Portable AM/FM radio tuned to Radio Nacional (103.9 FM / 850 AM) for COEN / COER emergency broadcasts.

---

## 4. Synthesis: Feature Implementation Mapping Across Repository

| Domain | Technical Feature | Repository Location | Milestone |
|---|---|---|:---:|
| **Earthquake** | Full CRUD for Backpack Items (custom items, INDECI default protection) | `src/hooks/useMochila.ts`, `src/components/mochila/` | M1 |
| **Earthquake** | Full CRUD for Family Members (member roles, edit capability) | `src/hooks/usePlanFamiliar.ts`, `src/components/planFamiliar/` | M1 |
| **Earthquake** | Structured Safe Meeting Points (internal, external, community, coords) | `src/storage/stateTypes.ts`, `src/components/planFamiliar/` | M1 |
| **Earthquake** | National Emergency Speed-Dial Hub (105, 116, 106, 115, 100, 119) | `src/core/emergencyContacts.ts`, `src/components/planFamiliar/` | M1 |
| **Earthquake** | Caja de Reserva (72h+) Checklist Module | `src/components/mochila/CajaReservaView.tsx` | M1 |
| **Earthquake** | Web Audio API Rescue Whistle (2500–3500 Hz, Rule of Three loop) | `src/core/audioWhistle.ts`, `src/components/utilities/` | M1 |
| **Hardware** | Capacitor Config & Hardware Stubs (Torch steady/SOS, Camera damage log) | `capacitor.config.ts`, `src/hooks/useHardware.ts` | M1 |
| **Earthquake & Geo** | Offline Vector SVG Map Canvas & Safe Circles | `src/components/mapa/`, `specs/002-mapa-gps/` | M2 |
| **Earthquake & Geo** | Geolocation Tracker, Haversine Distance & Navigation Bearing | `src/core/geoUtils.ts`, `src/hooks/useGeolocation.ts` | M2 |
| **Huaicos** | SENAMHI Alert Levels & Protocols (Verde, Amarillo, Naranja, Rojo) | `src/components/huaicos/`, `specs/003-huaicos-offline/` | M3 |
| **Huaicos** | Natural Early Warning Signs Interactive Matrix | `src/components/huaicos/AlertaTemprana.tsx` | M3 |
| **Huaicos** | 90° Perpendicular Evacuation Guide & Water Disinfection Dosage | `src/components/huaicos/EvacuacionHuaico.tsx` | M3 |
| **Huaicos** | Seasonal Home & Document Hardening Checklists | `src/components/huaicos/ChecklistHuaico.tsx` | M3 |
| **Testing** | Comprehensive Automated Test Suite (Unit, Integration, PBT, E2E) | `tests/unit/`, `tests/integration/`, `tests/property/` | M1-M4 |
