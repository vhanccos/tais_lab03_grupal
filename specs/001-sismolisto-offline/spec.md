# Feature Specification: Sistema de Preparación ante Sismos (SismoListo Offline)

**Feature Branch**: `001-sismolisto-offline`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Crea la especificación funcional completa para la aplicación SismoListo: un sistema de preparación ante sismos enfocado en operar 100% offline (sin conexión a internet). La app debe contar con: 1. Módulo de Mochila de Emergencia: Checklist interactivo categorizado (primeros auxilios, alimentos no perecibles, agua, herramientas, abrigo y documentos) con cálculo reactivo de porcentaje de preparación (0% a 100%). 2. Módulo de Plan Familiar de Emergencia: Registro de integrantes, asignación de roles ante sismos, puntos de encuentro interno/externo y número de contacto de emergencia nacional (119 para mensajes de voz). 3. Persistencia estricta offline: Todos los datos deben guardarse localmente en el dispositivo de forma instantánea sin requerir login ni conexión remota. Redacta historias de usuario con criterios de aceptación claros en formato Given/When/Then y define casos borde (cierre abrupto de la app, reinicio del dispositivo, campos vacíos)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestión y Verificación de Mochila de Emergencia (Priority: P1)

Como ciudadano expuesto a riesgos sísmicos, quiero registrar y verificar interactivamente los artículos esenciales de mi mochila de emergencia por categorías, para conocer en tiempo real mi porcentaje de preparación y estar listo ante una evacuación sin depender de conexión a internet.

**Why this priority**: Es la funcionalidad nuclear de supervivencia inmediata tras un sismo. Brinda retroalimentación visual clara y accionable de qué elementos faltan antes de una emergencia.

**Independent Test**: Puede probarse de manera aislada interactuando con los elementos de cada categoría de la mochila; al marcar o desmarcar ítems, el indicador de preparación se actualiza instantáneamente de 0% a 100% y el estado persiste al reabrir la app.

**Acceptance Scenarios**:

1. **Given** que el usuario ingresa por primera vez al módulo de Mochila de Emergencia, **When** visualiza la pantalla principal del checklist, **Then** debe ver las 6 categorías predeterminadas (primeros auxilios, alimentos no perecibles, agua, herramientas, abrigo y documentos) con sus artículos estándar desmarcados y el indicador de preparación general en 0%.
2. **Given** un checklist de mochila con ítems pendientes, **When** el usuario marca un ítem como completado, **Then** el porcentaje de preparación total debe recalcularse reactiva e instantáneamente incrementando su valor proporcional hacia el 100%.
3. **Given** que todos los artículos requeridos en todas las categorías han sido marcados, **When** el usuario revisa el indicador de preparación, **Then** el sistema debe mostrar un 100% de preparación completada con una indicación visual de mochila lista.
4. **Given** que el usuario ha marcado y desmarcado varios ítems, **When** sale de la pantalla o minimiza la aplicación y regresa inmediatamente, **Then** los estados de cada casilla de verificación se mantienen idénticos a como los dejó.

---

### User Story 2 - Plan Familiar de Emergencia y Contacto 119 (Priority: P2)

Como jefe de familia o miembro del hogar, quiero registrar los integrantes de mi familia, asignarles roles específicos de respuesta ante el sismo, definir puntos de encuentro seguro (interno y externo) y tener a la mano el protocolo del número de emergencia nacional 119, para coordinar una evacuación ordenada y saber cómo comunicarme post-sismo.

**Why this priority**: Establece la organización humana previa y posterior a la evacuación; saber quién hace qué y a dónde ir previene el pánico familiar durante y después del sismo.

**Independent Test**: Puede probarse registrando un familiar, asignando un rol (ej. "llevar la mochila", "cortar la llave de gas"), guardando los puntos de encuentro y visualizando las instrucciones y acceso directo al número de emergencia 119.

**Acceptance Scenarios**:

1. **Given** que el usuario accede al Módulo de Plan Familiar, **When** ingresa el nombre de un integrante y selecciona o escribe un rol asignado ante sismos, **Then** el integrante queda registrado en la lista familiar del hogar de forma inmediata.
2. **Given** un integrante previamente registrado, **When** el usuario edita su información o decide eliminarlo de la lista familiar, **Then** la lista se actualiza al instante reflejando la modificación o baja.
3. **Given** el formulario de zonas seguras, **When** el usuario define y guarda el "Punto de Encuentro Interno" (zona segura dentro de la vivienda) y el "Punto de Encuentro Externo" (zona segura comunitaria o parque), **Then** ambos puntos quedan almacenados y visibles en el resumen del plan familiar.
4. **Given** la sección de emergencias del Plan Familiar, **When** el usuario ingresa su "Número de Celular Familiar Clave" (9 dígitos), **Then** el sistema presenta dos acciones rápidas de marcación preconfigurada mediante la app de teléfono nativa: "Grabar Mensaje 119" hacia `tel:1191{numero}` y "Escuchar Mensaje 119" hacia `tel:1192{numero}`, junto con las instrucciones oficiales de operación del servicio ante colapso de redes móviles.

---

### User Story 3 - Persistencia Estricta Offline y Disponibilidad Inmediata (Priority: P3)

Como persona en una zona de desastre o sin cobertura de red móvil/Wi-Fi, quiero abrir la aplicación y consultar o modificar toda mi información sin necesidad de iniciar sesión, sin pantallas de carga bloqueantes y con guardado local persistente, para tener certeza de acceso crítico en cualquier momento.

**Why this priority**: Asegura la resiliencia operativa y el acceso sin fricción. En situaciones de catástrofe las redes colapsan, por lo que la app no debe depender de servicios externos.

**Independent Test**: Puede probarse colocando el dispositivo en modo avión (sin datos móviles ni Wi-Fi), completando listas y planes, forzando detenciones del sistema y verificando que el 100% de las funciones y datos persisten sin latencia ni errores de conectividad.

**Acceptance Scenarios**:

1. **Given** que el dispositivo no tiene conexión a internet (modo avión activado), **When** el usuario abre la aplicación por primera vez o de forma recurrente, **Then** la aplicación carga inmediatamente sin solicitar inicio de sesión, credenciales ni sincronización remota.
2. **Given** que el usuario realiza cualquier cambio (marcar un ítem, agregar un familiar, editar un punto de encuentro), **When** el usuario finaliza la edición, **Then** la información se guarda automáticamente y de forma síncrona/inmediata en el almacenamiento local del dispositivo.
3. **Given** que el usuario utiliza la aplicación durante un sismo o corte de energía, **When** no hay red disponible en ningún momento, **Then** no debe presentarse ninguna advertencia bloqueante ni degradación de funcionalidad.

---

### Edge Cases

- **Cierre abrupto de la aplicación**: Si el usuario sufre un apagado repentino del dispositivo o la app es terminada por el sistema operativo mientras marca casillas o escribe texto, los datos confirmados hasta la última interacción deben permanecer íntegros sin corromper la base de datos local.
- **Reinicio del dispositivo**: Al reiniciar completamente el dispositivo e iniciar nuevamente la aplicación sin conexión, toda la configuración previa de la mochila de emergencia, lista de familiares, roles y puntos de encuentro debe restaurarse exactamente como estaba antes del reinicio.
- **Campos vacíos o incompletos**: Si el usuario intenta agregar un integrante familiar sin nombre o con solo espacios en blanco, el sistema debe bloquear el registro mostrando un mensaje contextual no intrusivo y mantener el foco en el campo requerido sin cerrar la pantalla.
- **Nombres o textos excesivamente largos**: Si el usuario ingresa descripciones de puntos de encuentro o nombres de familiares extensos, la interfaz debe truncar o ajustar el texto en múltiples líneas sin desbordar los componentes visuales ni degradar el cálculo de preparación.
- **Acciones concurrentes rápidas (marcado múltiple)**: Si el usuario pulsa consecutivamente y con alta velocidad múltiples casillas del checklist, el cálculo reactivo del porcentaje debe procesar cada cambio de estado sin desfases ni lecturas inconsistentes (desincronización entre checkbox y porcentaje).
- **Lista de mochila vacía o catálogo modificado**: Si la mochila no contiene artículos (total de ítems = 0) o todos sus elementos están desmarcados, el progreso calculado DEBE ser estrictamente 0% sin incurrir en división por cero, valores `NaN` ni errores de desbordamiento. Para cualquier combinación con total de ítems > 0, el progreso DEBE ser un número entero acotado exactamente en el intervalo discreto [0, 100].
- **Cero pérdida ante fallas locales**: Si ocurre un fallo inesperado o corrupción en el almacenamiento local, el sistema DEBE restablecer automáticamente el catálogo predeterminado oficial de INDECI garantizando que la aplicación continúe operativa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer un catálogo interactivo de mochila de emergencia dividido en exactamente 6 categorías principales: Primeros Auxilios, Alimentos No Perecibles, Agua, Herramientas, Abrigo y Documentos.
- **FR-002**: El sistema DEBE calcular reactivamente el porcentaje general de preparación de la mochila en una escala continua o entera de 0% a 100%, actualizándose inmediatamente tras cualquier cambio en el estado de marcado de un artículo. Si el total de artículos es 0, el progreso DEBE ser 0% de forma invariable.
- **FR-003**: El sistema DEBE permitir visualizar el progreso tanto a nivel general (porcentaje global del 0% al 100%) como el desglose de avance de cada una de las 6 categorías.
- **FR-004**: El sistema DEBE permitir registrar integrantes del hogar con su nombre completo y su rol específico asignado ante una emergencia sísmica, admitiendo un máximo de hasta 20 integrantes por plan familiar.
- **FR-005**: El sistema DEBE permitir modificar, reasignar roles y eliminar integrantes registrados en el plan familiar.
- **FR-006**: El sistema DEBE permitir el registro y visualización de dos ubicaciones críticas de encuentro: Punto de Encuentro Interno (dentro de la vivienda o edificio) y Punto de Encuentro Externo (en la comunidad, calle o parque seguro).
- **FR-007**: El sistema DEBE registrar un "Número de Celular Familiar Clave" (9 dígitos numéricos) y proporcionar dos botones de acción rápida compatibles con el protocolo oficial del servicio 119 de mensajería de voz: "Grabar Mensaje 119" (hacia `tel:1191{numero}`) y "Escuchar Mensaje 119" (hacia `tel:1192{numero}`), activando el marcador nativo del dispositivo.
- **FR-008**: El sistema DEBE operar con una política 100% offline, garantizando que ninguna funcionalidad, pantalla o botón dependa de internet, llamadas a servidores remotos ni inicio de sesión (cero autenticación externa requerida).
- **FR-009**: El sistema DEBE persistir de forma instantánea y local todos los estados de ítems, datos familiares y puntos de encuentro ante cada evento de modificación del usuario.
- **FR-010**: El sistema DEBE validar las entradas de texto del usuario, impidiendo registros en blanco o con solo espacios para nombres y roles familiares.

### Key Entities *(include if feature involves data)*

- **ArticuloMochila**: Representa un ítem esencial de la mochila de emergencia. Atributos: identificador único, nombre del artículo, categoría (Primeros Auxilios, Alimentos No Perecibles, Agua, Herramientas, Abrigo, Documentos), estado de completado (marcado/desmarcado), es_predeterminado (booleano).
- **CategoriaMochila**: Agrupador temático de artículos. Atributos: identificador de categoría, nombre, descripción, lista de artículos asociados, porcentaje de completitud por categoría.
- **IntegranteFamiliar**: Miembro del hogar participante del plan de emergencia. Atributos: identificador único, nombre, rol asignado ante sismos (ej. responsable de mochila, encargado de evacuar mascotas, operador de corte de suministros, apoyo a adultos mayores/niños), notas adicionales.
- **PlanFamiliar**: Entidad que agrupa las definiciones de evacuación del hogar. Atributos: punto de encuentro interno (descripción/dirección), punto de encuentro externo (descripción/referencia), numero_familiar_clave (cadena de 9 dígitos para el protocolo 119), fecha de última actualización.
- **GuiaEmergencia119**: Información de referencia estática y protocolo de uso del servicio nacional de mensajería de voz post-sismo 119.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cálculo del porcentaje de preparación de la mochila se actualiza visualmente en menos de 100 milisegundos tras la interacción de marcado/desmarcado del usuario.
- **SC-002**: El 100% de las funcionalidades de la aplicación están disponibles de inmediato sin conexión a internet ni requerimiento de registro/login de usuario.
- **SC-003**: Cero pérdida de datos (0% de discrepancia) tras un cierre abrupto de la aplicación o reinicio completo del dispositivo.
- **SC-004**: Los usuarios pueden completar la configuración inicial básica de su mochila y plan familiar en menos de 3 minutos.
- **SC-005**: El acceso a las instrucciones y botón de llamada del 119 se logra en un máximo de 2 toques desde la pantalla principal de la aplicación.

## Assumptions

- Se asume que el catálogo predeterminado de artículos de la mochila de emergencia se basa en las recomendaciones estándar de las entidades de defensa civil nacional (ej. INDECI / SINAGERD en Perú) para las 6 categorías indicadas.
- Se asume que los dispositivos cuentan con capacidad de almacenamiento local suficiente (menos de 5 MB requeridos para la base de datos local y configuración).
- Se asume que la interacción con el servicio 119 aprovecha la aplicación de teléfono nativa del dispositivo mediante enlace de llamada de emergencia, funcionando según la disponibilidad de la red de telecomunicaciones del operador celular del usuario.
- La aplicación no recopila ni transmite telemetría personal fuera del dispositivo, garantizando privacidad total y cumplimiento de la política offline estricta.
