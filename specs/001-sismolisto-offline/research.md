# Research & Architectural Decisions: SismoListo Offline

**Feature**: `001-sismolisto-offline`
**Date**: 2026-10-29

## 1. Persistencia y Almacenamiento Local Offline

- **Decision**: Uso de almacenamiento local del navegador (`localStorage` con fallback defensivo en memoria) gestionado a través de un adaptador de almacenamiento desacoplado (`StorageAdapter`), serializando en formato JSON con validación y versión de esquema.
- **Rationale**:
  - Garantiza funcionamiento 100% offline sin necesidad de servidores, procesos en segundo plano, tokens ni dependencias de red externa.
  - Ofrece persistencia instantánea y síncrona en cada mutación de usuario (< 5 ms), protegiendo contra cierres abruptos de la aplicación y reinicios del dispositivo.
  - Capacidad suficiente: el catálogo completo y los datos familiares requieren menos de 50 KB (el límite estándar de `localStorage` es 5 MB).
  - Si el almacenamiento está corrupto o deshabilitado, el sistema ejecuta recuperación automática restituyendo el catálogo oficial sin detener la app.
- **Alternatives considered**:
  - *IndexedDB*: Excelente para grandes volúmenes de datos binarios, pero innecesariamente complejo y asíncrono para el tamaño de datos requerido (< 50 KB). Puede fallar en modos privados de ciertos navegadores.
  - *SQLite / WebAssembly*: Introduce peso innecesario al bundle (> 1 MB) y complejidad innecesaria para un checklist y plan familiar.

## 2. Pila Tecnológica del Frontend y Reactividad

- **Decision**: Aplicación web moderna basada en **TypeScript**, **React** (v19) y **Vite**, complementada con arquitectura PWA (Progressive Web App con Service Worker para caché offline de assets) y estilos CSS puros accesibles / responsive (Tailwind CSS o CSS Modules).
- **Rationale**:
  - Reactividad instantánea y predecible para el cálculo del porcentaje de preparación [0, 100]% al marcar casillas.
  - TypeScript provee tipado estático estricto para entidades, garantizando invariantes (ej. evitar divisiones por cero o desbordamientos).
  - Al empaquetarse como PWA, puede instalarse en el dispositivo móvil como una app nativa sin requerir tiendas de aplicaciones ni conectividad.
- **Alternatives considered**:
  - *Vanilla JS / HTML*: Ligero pero más propenso a inconsistencias reactivas al gestionar múltiples componentes sincronizados (progreso global vs. categorías).
  - *Framework nativo móvil (Flutter / React Native)*: Requiere emuladores móviles y cadenas de compilación pesadas; una PWA en TypeScript/React cubre 100% de los requisitos con portabilidad inmediata y capacidad de marcación telefónica (`tel:`).

## 3. Protocolo de Marcación de Emergencia 119 y Validación Telefónica

- **Decision**: Implementación de enlaces nativos de telecomunicaciones `tel:1191{numero}` y `tel:1192{numero}`, activando el marcador del sistema operativo sin depender de APIs de red.
- **Rationale**:
  - El servicio de mensajería de voz ante sismos 119 (estándar en Perú) funciona mediante la red telefónica celular incluso con datos móviles caídos o saturados.
  - Formato oficial:
    - Grabar mensaje: `119` + `1` + `Número de 9 dígitos` -> `tel:1191{numero}`.
    - Escuchar mensaje: `119` + `2` + `Número de 9 dígitos` -> `tel:1192{numero}`.
  - El número de celular clave debe ser validado estrictamente como 9 dígitos numéricos (formato peruano estándar que empieza con 9: `/^9\d{8}$/`).
- **Alternatives considered**:
  - *Llamada genérica a 119*: Menos conveniente porque obliga al usuario estresado a recordar la marcación del dígito de opción y el número familiar. La marcación directa ahorra tiempo vital en una emergencia.

## 4. Cálculo Invariante del Porcentaje de Preparación

- **Decision**: Algoritmo puro y desacoplado `calculatePreparationProgress(items: ArticuloMochila[]): ProgressMetric`.
- **Rationale**:
  - Formula: $\text{progreso} = \text{total} == 0 ? 0 : \text{Math.round}((\text{completados} / \text{total}) * 100)$.
  - Acotado rígidamente: `Math.max(0, Math.min(100, valor))`.
  - Desglose por categoría disponible reactivamente con la misma invariante matemática, impidiendo división por cero o `NaN`.
- **Alternatives considered**:
  - *Pesos diferenciados por ítem*: Aunque realista (ej. agua > documentos), agrega complejidad arbitraria para el usuario y no fue solicitado en la especificación. Se utiliza peso equitativo unitario por artículo.

## 5. Resiliencia y Casos Borde

- **Decision**:
  - *Auto-guardado reactivo*: Cada interacción en un formulario o casilla dispara una actualización atómica inmediata.
  - *Recuperación ante corrupción*: Bloque `try / catch` en la deserialización. Si falla la integridad del JSON o campos clave, se carga el catálogo predeterminado de emergencia basado en INDECI y se preserva cualquier entidad recuperable.
  - *Validación en tiempo real*: Bloqueo de adición de integrantes con nombres vacíos o espacios en blanco (`trim().length > 0`), limitando la lista a 20 integrantes para proteger rendimiento y UI.
