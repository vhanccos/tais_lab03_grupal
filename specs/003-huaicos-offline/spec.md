# Feature Specification: Gestión Offline de Riesgo ante Huaicos e Inundaciones (Huaicos Offline)

**Feature Branch**: `003-huaicos-offline`  
**Created**: 2026-10-31  
**Status**: Ready for Implementation  
**Doctrinal Framework**: SINAGERD (Ley N° 29664), INDECI, SENAMHI, ANA, INGEMMET, CENEPRED  

## Executive Summary

Los huaicos (flujos de detritos / debris flows) son avalanchas hiperconcentradas de agua, lodo y rocas que descienden velozmente (18 a 54 km/h) por quebradas andinas y costeras tras precipitaciones extraordinarias. Al impactar zonas pobladas en abanicos aluviales, destruyen la infraestructura de servicios básicos (red eléctrica, agua potable y torres de telecomunicaciones celulares).

La funcionalidad `003-huaicos-offline` dota a la aplicación SismoListo de un módulo integral, operativo al 100% sin conexión a internet ni dependencia de servidores remotos, especializado en la mitigación, preparación y respuesta ante huaicos e inundaciones en el Perú. Provee semáforo oficial de alertas SENAMHI, catálogo de señales naturales tempranas de advertencia, guía de evacuación perpendicular a 90° con registro de cota alta, checklist familiar estacional para la temporada de lluvias (barreras de sacos de arena, impermeabilización de documentos, reserva de agua 72h) y calculadora offline de potabilización de agua según fórmula oficial de INDECI (2 gotas de lejía al 5% por litro de agua).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Checklist Estacional de Protección y Suministros para Huaicos (Priority: P1)

Como habitante de una cuenca o quebrada vulnerable a precipitaciones extremas, quiero verificar de forma interactiva las medidas preventivas de mi vivienda, la protección impermeable de documentos de identidad y los suministros de supervivencia para huaicos, para reducir la vulnerabilidad de mi hogar y contar con provisiones críticas para 72 horas ante el aislamiento o suspensión del servicio de agua potable.

**Why this priority**: Es la base de preparación material familiar previa al inicio de la temporada de lluvias o la reactivación de quebradas. Permite evitar daños estructurales y previene la pérdida total de documentos y reservas hídricas.

**Independent Test**: Puede probarse de manera aislada interactuando con los ítems del checklist agrupados en sus 4 categorías oficiales. Al marcar y desmarcar ítems, el indicador de preparación general se actualiza instantáneamente en el rango discreto `[0, 100]%` y los estados persisten al recargar o reiniciar el dispositivo en modo avión.

**Acceptance Scenarios**:
1. **Given** que el usuario accede por primera vez a la pestaña de Huaicos, **When** visualiza la sección de Checklist de Temporada de Lluvias, **Then** observa 4 categorías oficiales (`proteccion_hogar`, `documentos_impermeables`, `suministros_reserva`, `evacuacion_comunitaria`) con sus artículos oficiales desmarcados y el progreso general en 0%.
2. **Given** una lista de artículos pendientes, **When** el usuario marca un ítem (ej. "Barrera de sacos de arena colocados en tresbolillo en accesos"), **Then** el porcentaje de preparación general se recalcula instantáneamente de forma proporcional hacia el 100%.
3. **Given** que todos los artículos de todas las categorías han sido marcados, **When** el usuario consulta el indicador de progreso, **Then** el sistema muestra "100% Preparado" con una confirmación visual destacada.
4. **Given** modificaciones en las casillas de verificación, **When** el usuario minimiza, cierra o recarga la aplicación sin red, **Then** todos los estados de completitud persisten exactamente como se dejaron.

---

### User Story 2 - Semáforo de Alerta y Reconocimiento de Señales Naturales Tempranas (Priority: P2)

Como ciudadano en riesgo ante la activación inminente de quebradas, quiero consultar el nivel de alerta hidrometeorológica oficial (Verde, Amarillo, Naranja, Rojo) y contrastar las señales sensoriales de mi entorno (estruendo subterráneo, cambio de color/olor del agua, cese abrupto de caudal por represamiento), para tomar decisiones inmediatas de evacuación antes de que el lodo corte las vías de escape.

**Why this priority**: En situaciones de desastre real, las redes de telefonía colapsan e impiden recibir mensajes del SISMATE o avisos de radio. El reconocimiento de signos naturales y la comprensión del semáforo salva vidas en los minutos previos al impacto.

**Independent Test**: Puede probarse cambiando interactivamente el selector de alerta entre Verde, Amarillo, Naranja y Rojo, y marcando señales en la matriz de señales naturales. La UI debe reflejar de inmediato las directivas de seguridad, el color temático de peligro y las advertencias de evacuación de emergencia.

**Acceptance Scenarios**:
1. **Given** el semáforo interactivo de alerta, **When** el usuario selecciona el nivel "Rojo (Peligro Extremo)", **Then** la interfaz adopta el esquema de color rojo y despliega la directiva crítica de evacuación forzosa e inmediata a zonas altas en menos de 60 segundos.
2. **Given** la matriz de señales naturales, **When** el usuario selecciona "Disminución repentina o cese súbito del flujo de agua en la quebrada en plena tormenta", **Then** el sistema presenta una advertencia de peligro mortal inminente explicando el represamiento aguas arriba y la inminencia de la ola de lodo ("surge").
3. **Given** la señal natural "Estruendo o rugido continuo semejante a un avión caza", **When** el usuario la consulta, **Then** se detalla el tiempo crítico de reacción (30 a 180 segundos) y la instrucción tajante de no recoger pertenencias y ganar altura de inmediato.

---

### User Story 3 - Guía de Evacuación Perpendicular y Punto de Encuentro en Cota Alta (Priority: P3)

Como jefe de hogar o responsable de familia, quiero disponer de una guía gráfica que enseñe la regla inquebrantable de evacuación a 90° (ascendente y perpendicular) y registrar localmente la ubicación de nuestro punto de encuentro seguro en cota alta y un contacto de enlace, para que toda la familia evacúe hacia laderas firmes y sepa dónde reunirse tras el aluvión.

**Why this priority**: El error humano más frecuente y letal durante un huaico es intentar correr aguas abajo a lo largo del cauce de la quebrada o intentar cruzar corrientes de lodo. Instruir la evacuación perpendicular y fijar un punto alto evita fatalidades.

**Independent Test**: Puede probarse registrando un punto de encuentro en cota alta y un teléfono de contacto regional, comprobando que las directivas de evacuación a 90° prohíben correr aguas abajo o cruzar caudales, y verificando que el botón de llamada enlace use el protocolo `tel:`.

**Acceptance Scenarios**:
1. **Given** la guía de evacuación de supervivencia, **When** el usuario revisa los protocolos gráficos y textuales, **Then** visualiza con alta prominencia la "Regla del Ángulo Recto (90°)": subir al cerro de manera perpendicular, la prohibición estricta de correr aguas abajo y la advertencia de que 15 cm de lodo derriban a un adulto.
2. **Given** el formulario de punto seguro en cota alta, **When** el usuario ingresa un nombre válido (ej. "Plaza de la Loma Alta - Cota +60m") y teléfono de contacto (9 dígitos), **Then** la información se guarda instantáneamente en el almacenamiento local.
3. **Given** un contacto de emergencia configurado, **When** el usuario presiona el botón de enlace telefónico, **Then** se invoca el marcador nativo del dispositivo con `tel:{numero}`.

---

### User Story 4 - Guía Sanitaria Post-Huaico y Calculador de Potabilización de Agua (Priority: P4)

Como persona en situación de aislamiento o corte prolongado de agua potable tras el paso de un huaico, quiero calcular con precisión la cantidad de lejía comercial al 5% o pastillas potabilizadoras necesarias para desinfectar cualquier volumen de agua y consultar medidas higiénicas esenciales, para evitar contraer cólera, diarreas agudas o leptospirosis por aguas turbias y fango contaminado.

**Why this priority**: La turbidez extrema provocada por los huaicos paraliza las plantas de tratamiento de agua potable durante días. El consumo de agua no tratada o el contacto con lodo contaminado es la principal causa de morbilidad post-desastre.

**Independent Test**: Puede probarse ingresando diferentes volúmenes de agua (ej. 1 L, 5 L, 20 L, 200 L) en el calculador offline y comprobando que la dosificación arroja exactamente 2 gotas de lejía por litro con 30 minutos de tiempo de reposo, validando asimismo contra valores menores o iguales a cero.

**Acceptance Scenarios**:
1. **Given** el calculador de potabilización de agua, **When** el usuario ingresa un volumen de 5 litros, **Then** la herramienta calcula instantáneamente: "10 gotas de lejía tradicional (5%)" o "1 pastilla Aquatabs (para recipientes estándar)", indicando el reposo obligatorio de 30 minutos.
2. **Given** la entrada del calculador, **When** el usuario ingresa valores inválidos (0, negativos o texto no numérico), **Then** el sistema muestra 0 gotas y una advertencia amistosa solicitando un volumen positivo mayor a 0 litros.
3. **Given** la sección de salud e higiene, **When** el usuario consulta las advertencias post-huaico, **Then** se destacan las recomendaciones sobre el uso de botas de jebe de caña alta para prevenir leptospirosis y la eliminación de charcos para mitigar brotes de dengue.

---

## Edge Cases

- **Cierre abrupto o corte de batería**: Si el smartphone se apaga súbitamente por batería descargada durante una tormenta, todos los datos marcados hasta la última pulsación en el checklist o formulario persisten sin corromper el JSON en `localStorage`.
- **Reinicio completo del dispositivo sin conectividad**: Tras reiniciar el móvil en Modo Avión total, el módulo de huaicos se restaura con su nivel de alerta, progreso y datos del plan de evacuación previamente guardados.
- **Campos en blanco o espacios**: Si el usuario intenta guardar el punto de encuentro en cota alta con cadenas vacías o solo espacios en blanco (`"   "`), el sistema descarta la acción mediante `.trim()`, preservando el estado previo.
- **Textos prolongados**: Descripciones largas en las rutas de escape o puntos de encuentro no distorsionan el diseño adaptable ni rompen los contenedores flexibles.
- **Entrada numérica de agua fuera de rango**: Si se ingresa una cantidad de agua de 0 litros o un número negativo en el calculador de potabilización, el algoritmo normaliza a 0 gotas sin generar `NaN` ni valores negativos.
- **Lista de ítems vacía**: Si se consulta el progreso con 0 ítems totales, la fórmula de progreso devuelve de forma segura `0%` sin caer en indeterminaciones de división por cero.
- **Corrupción de datos locales**: Si el valor almacenado en `localStorage` bajo la clave `sismolisto_huaicos_state_v1` sufre alteraciones de sintaxis JSON, el adaptador intercepta la excepción en un bloque `try/catch` y restablece de forma automática y transparente el catálogo predeterminado de INDECI sin lanzar fallos a la pantalla.

---

## Functional Requirements

- **FR-001**: El sistema DEBE proveer un módulo autónomo para la preparación y respuesta ante huaicos e inundaciones (`HuaicosView`), accesible de manera directa en la navegación sin autenticación ni conexión a internet.
- **FR-002**: El sistema DEBE catalogar los artículos del checklist estacional de huaicos en exactamente 4 categorías: `proteccion_hogar`, `documentos_impermeables`, `suministros_reserva`, y `evacuacion_comunitaria`.
- **FR-003**: El sistema DEBE calcular reactivamente el porcentaje de preparación estacional como un número entero acotado rígidamente en el intervalo discreto $[0, 100]$, recalculándose en menos de 50 ms ante cualquier alternancia de marcado. Si el total de ítems es 0, el progreso DEBE ser 0% de forma invariable.
- **FR-004**: El sistema DEBE soportar la selección interactiva de los 4 niveles oficiales de alerta: `verde`, `amarillo`, `naranja` y `rojo`, actualizando las directivas y códigos visuales de color según los protocolos del SENAMHI e INDECI.
- **FR-005**: El sistema DEBE desplegar una matriz interactiva de 6 señales naturales de alerta temprana (estruendo subterráneo, cambio de turbidez/olor, represamiento del caudal, comportamiento animal anómalo, vibración de terreno y grietas en taludes) detallando tiempos críticos de reacción y directivas de supervivencia.
- **FR-006**: El sistema DEBE incorporar una guía visual y textual de evacuación de supervivencia que instruya la evacuación perpendicular ascendente (Regla de los 90°) y prohíba expresamente correr aguas abajo a lo largo del cauce o cruzar corrientes de lodo.
- **FR-007**: El sistema DEBE permitir registrar y persistir localmente: 1. Nombre del punto de encuentro en cota alta, 2. Descripción de la ruta de escape perpendicular, y 3. Número de teléfono de contacto de referencia (validación de 9 dígitos).
- **FR-008**: El sistema DEBE ofrecer una calculadora offline interactiva de dosificación para potabilización de agua basada en la fórmula oficial de 2 gotas de lejía tradicional (hipoclorito de sodio al 5%) por cada 1 litro de agua con reposo mínimo de 30 minutos, admitiendo volúmenes variables en litros.
- **FR-009**: El sistema DEBE incluir enlaces de marcación rápida `tel:` hacia las centrales de emergencia nacionales peruanas: INDECI/COEN (`tel:115`), Bomberos (`tel:116`), SAMU (`tel:106`) y Policía Nacional (`tel:105`).
- **FR-010**: El sistema DEBE persistir la totalidad del estado del módulo de huaicos en el almacenamiento local del dispositivo mediante una clave de almacenamiento específica (`sismolisto_huaicos_state_v1`), manteniendo sincronización síncrona con respaldo en memoria.
- **FR-011**: El sistema DEBE validar de forma defensiva las entradas de texto del usuario, recortando espacios en blanco (`trim()`) e impidiendo el guardado de ubicaciones o nombres vacíos.
- **FR-012**: El sistema DEBE ofrecer auto-recuperación transparente: ante cualquier error o corrupción en la deserialización del JSON de huaicos, restablece el catálogo oficial predeterminado sin provocar interrupciones no controladas en la interfaz.

---

## Key Entities

- **NivelAlertaHuaico**: Tipo unión `'verde' | 'amarillo' | 'naranja' | 'rojo'`.
- **TipoSenalTemprana**: Tipo unión `'estruendo' | 'turbidez_olor' | 'represamiento_caudal' | 'comportamiento_animal' | 'vibracion_suelo' | 'grietas_talud'`.
- **CategoriaHuaicoId**: Tipo unión `'proteccion_hogar' | 'documentos_impermeables' | 'suministros_reserva' | 'evacuacion_comunitaria'`.
- **ItemHuaicoChecklist**: Representa un ítem preventivo de la temporada de lluvias (id, categoriaId, titulo, descripcion, completado, esCritico, cantidadSugerida).
- **SenalTemprana**: Estructura de señal natural (id, nombre, descripcionSensorial, causaFisica, tiempoReaccionSegundos, accionInmediata, reconocida).
- **PlanEvacuacionHuaico**: Datos del plan de escape familiar (puntoEncuentroCotaAlta, descripcionRutaPerpendicular, contactoReferenciaNombre, contactoReferenciaTelefono, viviendaEnRiesgoAbanico, fechaActualizacion).
- **HuaicosState**: Estado integral offline del módulo (version, ultimaModificacion, nivelAlertaActual, articulos, senalesTempranas, planEvacuacion).

---

## Success Criteria *(mandatory)*

- **SC-001**: El cálculo del porcentaje de preparación estacional ante huaicos se actualiza reactivamente en menos de 50 milisegundos tras cualquier interacción en las casillas de verificación.
- **SC-002**: El módulo opera al 100% en modo avión y sin conexión a internet, manteniendo sincronizados el estado de checklists, selección de alerta, matriz de señales y datos del plan de evacuación.
- **SC-003**: La calculadora de potabilización produce resultados exactos conforme a la fórmula oficial de INDECI (2 gotas de lejía al 5% por litro de agua) para cualquier volumen entero o decimal positivo ingresado por el usuario.
- **SC-004**: Los botones de llamada telefónica activan el esquema URI `tel:` nativo compatible con dispositivos móviles tanto para el contacto familiar como para las líneas de emergencia nacionales (115, 116, 106, 105).
