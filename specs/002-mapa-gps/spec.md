# Feature Specification: Mapa Vectorial SVG Offline y Geolocalización GPS (002-mapa-gps)

**Feature Branch**: `002-mapa-gps`  
**Created**: 2026-10-31  
**Status**: Ready for Implementation  
**Doctrinal Framework**: INDECI, IGP, CENSIS, SINAGERD, NTP 399.010-1 (Señales de Seguridad)  

---

## Executive Summary

Durante un sismo de gran magnitud o un desastre natural en Lima y el litoral peruano, las redes de datos móviles (4G/5G) colapsan inmediatamente debido a la saturación de tráfico y la interrupción del suministro eléctrico en las estaciones base celulares. Las aplicaciones cartográficas tradicionales que dependen de la descarga en tiempo real de teselas rasterizadas (Google Maps, Mapbox, OpenStreetMap tiles) se vuelven completamente inoperativas, dejando a los ciudadanos sin referencia espacial para evacuar.

La funcionalidad `002-mapa-gps` dota a SismoListo de un motor cartográfico 100% offline basado en gráficos vectoriales SVG interactivos combinados con la API de geolocalización satelital nativa del dispositivo (`navigator.geolocation`). Sin consumir un solo byte de red, el mapa proyecta con precisión matemática esférica el entorno urbano, calles principales, manzanas distritales, zonas seguras externas, círculos de seguridad INDECI de 4.5 metros (color verde `#22c55e`), y los puntos de encuentro familiares configurados en el Plan Familiar. Además, provee un radar de proximidad con cálculo instantáneo de distancia Haversine y rumbo azimutal $[0^\circ, 360^\circ)$ que orienta visualmente al usuario hacia la zona de seguridad más cercana.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mapa Vectorial SVG 100% Offline con Pan y Zoom (Priority: P1)

Como ciudadano afectado por un sismo sin conexión a internet ni datos móviles, quiero visualizar un mapa vectorial interactivo y responsivo de mi entorno urbano con calles, manzanas y zonas despejadas, para orientarme y planificar mi ruta de evacuación inmediata.

**Why this priority**: Es el núcleo visual del módulo. Sin un lienzo cartográfico independiente de servidores externos, es imposible georreferenciar las zonas seguras durante el apagón de telecomunicaciones.

**Independent Test**: Puede probarse desconectando la red (o en modo avión), accediendo a la pestaña "Mapa", y manipulando los controles de ampliación (+) y reducción (-) de zoom o arrastre de encuadre. El lienzo SVG debe re-renderizarse de forma fluida a 60 FPS sin emitir solicitudes de red (`fetch` o `XMLHttpRequest`).

**Acceptance Scenarios**:
1. **Given** el dispositivo en modo avión (offline total), **When** el usuario abre la pestaña "Mapa", **Then** visualiza de inmediato un mapa vectorial SVG nítido con el plano base (manzanas, avenidas principales y áreas verdes).
2. **Given** el mapa vectorial desplegado, **When** el usuario presiona los controles de zoom (`+` o `-`), **Then** la vista `viewBox` del SVG escala suavemente manteniendo la nitidez vectorial y acotando el factor de zoom en límites seguros $[0.5\times, 3.0\times]$.
3. **Given** un mapa con zoom aplicado, **When** el usuario presiona el botón de recentrado, **Then** la vista regresa de manera instantánea a los límites predeterminados del cuadrante urbano.

---

### User Story 2 - Geolocalización GPS y Marcador de Posición en Tiempo Real (Priority: P1)

Como usuario en proceso de evacuación, quiero que la aplicación detecte y muestre mi posición GPS física en tiempo real sobre el plano vectorial con un marcador pulsante y un halo de precisión, para conocer exactamente dónde me encuentro respecto a las vías y zonas seguras.

**Why this priority**: La orientación durante el caos posterior a un sismo es crítica; un indicador visible de la propia ubicación reduce el pánico y agiliza la toma de decisiones.

**Independent Test**: Puede probarse emitiendo coordenadas satelitales mediante el API de geolocalización (o mock de prueba) con diferentes valores de latitud, longitud y precisión en metros. El marcador azul pulsante debe proyectarse en el punto $(X, Y)$ correspondiente dentro del SVG con un círculo de incertidumbre proporcional.

**Acceptance Scenarios**:
1. **Given** permisos de geolocalización concedidos, **When** el satélite GPS fija la posición (ej. $-12.046374, -77.042793$, precisión 15m), **Then** el mapa despliega un punto azul pulsante en la coordenada proyectada acompañado de un anillo de precisión semitransparente.
2. **Given** un usuario bajo techo o en ambiente subterráneo sin señal GPS (`POSITION_UNAVAILABLE`), **When** la API reporta el fallo o timeout, **Then** la aplicación no se bloquea, muestra una insignia informativa ("Sin señal GPS - Ubicación aproximada") y centra la visualización en el punto de encuentro familiar predeterminado.
3. **Given** un usuario que deniega los permisos de geolocalización (`PERMISSION_DENIED`), **When** se inicia el mapa, **Then** el sistema presenta un aviso claro con botón de reintento y permite la navegación manual e inspección de puntos sin restricciones.

---

### User Story 3 - Capa Vectorial de Zonas Seguras y Círculos INDECI (Priority: P2)

Como familia evacuada en la vía pública, quiero identificar en el mapa los círculos de seguridad oficiales de INDECI (diámetro 4.5m), parques y los puntos de encuentro personalizados registrados en mi Plan Familiar, para reunirme con mis familiares en un lugar libre del peligro de caída de vidrios, cables o colapso de muros.

**Why this priority**: Los círculos de seguridad INDECI en exteriores son la norma técnica nacional para proteger a la población en la fase "Después" del sismo.

**Independent Test**: Puede probarse verificando que los puntos de encuentro predeterminados y aquellos agregados por el usuario desde el Plan Familiar aparezcan renderizados como símbolos vectoriales diferenciados (verde para círculos INDECI, azul/ámbar para puntos comunitarios y familiares) y que al tocarlos desplieguen su información de seguridad.

**Acceptance Scenarios**:
1. **Given** los puntos de encuentro del Plan Familiar (predeterminados o personalizados), **When** se renderiza el mapa, **Then** cada punto con coordenadas válidas se dibuja como un marcador interactivo con icono distintivo según su tipo (`interno`, `externo`, `comunitario`, `seguro`).
2. **Given** un círculo de seguridad externo INDECI, **When** el usuario hace clic o tap sobre su marcador, **Then** se resalta el punto y se despliega una tarjeta flotante con su nombre, descripción de seguridad y coordenadas.
3. **Given** que el usuario agregó un nuevo punto de reunión personalizado en el Plan Familiar, **When** regresa a la pestaña Mapa, **Then** el nuevo punto aparece proyectado de forma inmediata en el lienzo vectorial.

---

### User Story 4 - Radar de Proximidad Haversine y Rumbo Azimutal a Zona Segura (Priority: P2)

Como persona desorientada tras el movimiento telúrico, quiero una tarjeta de radar que me indique la distancia métrica exacta (en metros o kilómetros) y una flecha con el rumbo direccional (azimut) hacia la zona segura más cercana, para caminar directamente hacia ella sin dudar.

**Why this priority**: Ante el corte de fluido eléctrico nocturno o polvo denso por derrumbes, una flecha de rumbo y distancia métrica objetiva guía al usuario hacia la seguridad más rápido que interpretar un mapa complejo.

**Independent Test**: Puede probarse alimentando coordenadas GPS conocidas y calculando la distancia Haversine y el ángulo azimutal $[0^\circ, 360^\circ)$ respecto a los puntos seguros registrados. La tarjeta debe reportar el punto más cercano, la distancia formateada (ej. `45 m` o `1.2 km`) y rotar la flecha direccional en el ángulo calculado.

**Acceptance Scenarios**:
1. **Given** una posición GPS actual y múltiples zonas seguras registradas, **When** se evalúa el radar, **Then** identifica automáticamente la zona segura con menor distancia Haversine.
2. **Given** la zona segura más cercana identificada, **When** se calcula el ángulo azimutal, **Then** una flecha SVG rota exactamente en el rumbo calculado indicando la dirección de avance.
3. **Given** que el usuario se encuentra a menos de 5 metros de la zona segura ($\text{distancia} < 5\text{ m}$), **When** se actualiza la tarjeta, **Then** el radar destaca un mensaje positivo: "¡Has llegado a la Zona Segura!".
4. **Given** coordenadas idénticas entre origen y destino, **When** se invoca `calcularDistanciaHaversine`, **Then** retorna exactamente `0` metros y el azimut se resuelve limpiamente en `0^\circ`.

---

## Edge Cases

- **Coordenadas Idénticas**: Si la posición del usuario coincide exactamente con la del punto seguro ($\Delta \text{lat} = 0, \Delta \text{lng} = 0$), la función Haversine devuelve de forma determinista `0` metros y el azimut `0^\circ` sin incurrir en indeterminaciones matemáticas tipo `0/0` o `atan2(0, 0)` no controladas.
- **Puntos fuera de los límites del mapa proyectado**: Si un punto geográfico se ubica fuera del bounding box configurado, el motor `projectGeoToSvg` aplica recorte defensivo (*clamping*) o lo proyecta en el margen perimetral sin desbordar el contenedor SVG.
- **Dispositivo sin soporte de Geolocation API**: Si `navigator.geolocation` es indefinido (navegador muy antiguo o entorno restringido), el hook entra limpiamente en estado de error soportado y activa las coordenadas de respaldo urbanas predeterminadas de Lima.
- **Denegación de permisos o modo incógnito**: Manejo explícito de los códigos de error del W3C Geolocation API (`1: PERMISSION_DENIED`, `2: POSITION_UNAVAILABLE`, `3: TIMEOUT`).
- **Puntos de encuentro sin coordenadas geográficas explícitas**: Si un punto del Plan Familiar carece de `coordenadas` numéricas, el sistema utiliza sus `svgCoords` de reserva o calcula una proyección central para evitar que desaparezca del plano.
- **Zoom y paneo excesivo**: Los factores de escala del SVG están acotados rígidamente entre $[0.5\times, 3.0\times]$ para evitar que el usuario pierda de vista el área de evacuación o provoque artefactos visuales.

---

## Functional Requirements

- **FR-001**: El sistema DEBE proveer un módulo de cartografía vectorial 100% offline (`MapaView`) accesible mediante la pestaña `'mapa'` en la barra de navegación principal.
- **FR-002**: El sistema DEBE implementar la función matemática `calcularDistanciaHaversine(coord1, coord2)` utilizando trigonometría esférica con el radio medio terrestre ($R = 6,371,000\text{ m}$), retornando la distancia en metros con precisión decimal.
- **FR-003**: El sistema DEBE implementar la función de rumbo `calcularRumboAzimut(origen, destino)` retornando un ángulo en grados normalizado estrictamente en el intervalo $[0^\circ, 360^\circ)$, donde $0^\circ$ es Norte geográfico, $90^\circ$ Este, $180^\circ$ Sur y $270^\circ$ Oeste.
- **FR-004**: El sistema DEBE implementar la función de formateo de distancias `formatDistance(metros)` que exprese valores menores a 1000 metros como `"X m"` y valores iguales o mayores a 1000 metros como `"X.X km"` (o `"X.XX km"`).
- **FR-005**: El sistema DEBE implementar la proyección de coordenadas geográficas `projectGeoToSvg(coord, bounds, svgWidth, svgHeight)` mapeando linealmente $(\text{lng}, \text{lat})$ al sistema de coordenadas ortogonales $(X, Y)$ del SVG con inversión del eje vertical $Y$.
- **FR-006**: El sistema DEBE implementar el hook reactivo `useGeolocation()` que rastree la posición física mediante `navigator.geolocation.watchPosition` con opciones de alta precisión (`enableHighAccuracy: true`).
- **FR-007**: El hook `useGeolocation` DEBE manejar de forma transparente los errores de permisos denegados, satélite no disponible o timeout, proveyendo coordenadas seguras de respaldo (*fallback*) centradas en Lima Metropolitana (Plaza Mayor / Cercado de Lima: lat $-12.046374$, lng $-77.042793$).
- **FR-008**: El componente `SvgMapCanvas` DEBE renderizar un plano vectorial responsivo libre de peticiones de red externas, conteniendo manzanas urbanas, trazado vial de evacuación, áreas verdes, zonas seguras y el marcador de posición del usuario.
- **FR-009**: El componente `SafeZonesOverlay` DEBE renderizar los círculos de seguridad oficiales de INDECI (4.5 metros a escala, color verde `#22c55e`), parques y los puntos de encuentro familiares cargados reactivamente desde el hook `usePlanFamiliar()`.
- **FR-010**: El componente `NearestPointRadar` DEBE calcular de forma continua el punto seguro más próximo a la posición actual del usuario, mostrando su nombre, distancia métrica formateada y una flecha direccional SVG orientada según el ángulo azimutal.
- **FR-011**: El componente `MapaView` DEBE incluir controles interactivos de acercar zoom (+), alejar zoom (-), recentrar y alternar visualización de capas de seguridad, además de una lista tabular de zonas seguras con sus distancias.
- **FR-012**: La aplicación DEBE integrar la pestaña `'mapa'` en `NavigationTabs.tsx` y en el enrutamiento de vistas de `App.tsx`, manteniendo la persistencia y sincronización con los demás módulos.

---

## Key Entities & Types

- **CoordenadaGeo**: `{ lat: number; lng: number }`.
- **BoundsGeo**: `{ minLat: number; maxLat: number; minLng: number; maxLng: number }`.
- **SvgPoint**: `{ x: number; y: number }`.
- **PuntoEncuentro**: Entidad compartida con `stateTypes.ts` (id, nombre, tipo, descripcion, coordenadas, svgCoords, esPredeterminado).
- **GeoLocationState**: `{ coords: CoordenadaGeo | null; accuracy: number | null; error: string | null; cargando: boolean; esUbicacionSimulada: boolean; timestamp: number | null }`.
- **PuntoCercanoInfo**: `{ punto: PuntoEncuentro; distanciaMetros: number; distanciaFormateada: string; rumboGrados: number }`.

---

## Success Criteria *(mandatory)*

- **SC-001**: El mapa vectorial SVG se renderiza al 100% de manera offline con 0 peticiones de red a servidores de mapas o CDNs externos.
- **SC-002**: Las fórmulas de Haversine y Rumbo Azimutal superan el 100% de las pruebas unitarias en límites geográficos peruanos y casos de coordenadas idénticas ($\Delta = 0$).
- **SC-003**: El radar de proximidad actualiza la distancia métrica y rotación de flecha en tiempo real (< 50ms) ante cualquier cambio de coordenadas del GPS o selección de puntos.
- **SC-004**: La suite de pruebas automatizadas en `tests/unit/mapaSvg.test.tsx` cubre renderizado SVG, cálculos matemáticos, fallbacks de geolocalización y proyección de zonas con 100% de éxito.
