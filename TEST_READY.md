# TEST_READY — SismoListo & Multi-Hazard Disaster Resilience Test Suite

Este documento certifica que la infraestructura y la suite de pruebas E2E y de regresión opaca (opaque-box) están completamente implementadas, verificadas y listas para su ejecución continua en el proyecto **SismoListo & Resiliencia Multi-Peligro** (Módulos 001, 002 y 003).

---

## 1. Comandos de Ejecución de Pruebas

Para ejecutar la suite de pruebas completa:
```bash
npm test
```

Para ejecutar exclusivamente la suite End-to-End (E2E) de 4 niveles:
```bash
npx vitest run tests/e2e/
```

Para ejecutar pruebas individuales por nivel:
```bash
npx vitest run tests/e2e/tier1_features.test.ts
npx vitest run tests/e2e/tier2_boundaries.test.ts
npx vitest run tests/e2e/tier3_crossfeature.test.ts
npx vitest run tests/e2e/tier4_realworld.test.ts
```

Para verificar tipos y compilación estricta de TypeScript:
```bash
npx tsc --noEmit
```

Para compilar el artefacto de producción (Vite + PWA Service Worker):
```bash
npm run build
```

---

## 2. Desglose por Niveles de Prueba (4 Tiers)

La suite E2E en `tests/e2e/` implementa una arquitectura rigurosa en 4 niveles basada en los estándares oficiales de **INDECI, SENAMHI e IGP**:

| Nivel | Archivo de Prueba | Metodología | Casos de Prueba | Estado |
|---|---|---|---|---|
| **Tier 1** | `tests/e2e/tier1_features.test.ts` | **Category-Partition**: Representantes de clases de equivalencia funcionales en ruta feliz (happy path) para las 25 funcionalidades normadas. | 32 pruebas | ✅ PASS |
| **Tier 2** | `tests/e2e/tier2_boundaries.test.ts` | **Boundary Value Analysis (BVA)**: Casos límite, cadenas vacías, espacios en blanco, cuotas de almacenamiento, números negativos, rangos acotados $[0, 100]\%$ y resistencia a corrupción de JSON. | 23 pruebas | ✅ PASS |
| **Tier 3** | `tests/e2e/tier3_crossfeature.test.ts` | **Pairwise Combinatorial**: Interacción simultánea entre almacenamiento local, conmutación de estado entre pestañas, sincronización de roles con directorio SOS y alertas de huaicos con rutas de evacuación. | 8 pruebas | ✅ PASS |
| **Tier 4** | `tests/e2e/tier4_realworld.test.ts` | **Real-World Disaster Workflows**: Simulaciones realistas de desastres naturales en el Perú (Sismo Mw 8.0 en Lima, Activación de Quebradas en Chosica y Escasez de Agua Potable por 72 horas). | 3 pruebas | ✅ PASS |

**Total Suite E2E**: **66 pruebas** (4 archivos), 100% aprobadas en ~4.8s.  
**Total Suite Global de Pruebas**: **115 pruebas** (18 archivos, incluyendo pruebas unitarias, integración y property-based testing PBT con `fast-check`), 100% aprobadas en ~14.3s.

---

## 3. Matriz de Verificación de Funcionalidades (25 Features Checklist)

Todas las funcionalidades normadas por `ORIGINAL_REQUEST.md` y `PROJECT.md` cuentan con cobertura opaca directa:

### Módulo 001: SismoListo Offline (Mochila, Caja de Reserva, Plan Familiar y SOS)
- [x] **F01**: Checklist Mochila de Emergencia INDECI (40 artículos base categorizados). *(Tiers 1, 2, 3, 4)*
- [x] **F02**: Persistencia Local 100% offline (`localStorage` con fallback en memoria). *(Tiers 1, 2, 3, 4)*
- [x] **F03**: Cálculo en tiempo real de porcentaje de preparación (acotado $[0, 100]\%$). *(Tiers 1, 2, 4)*
- [x] **F04**: Gestión de Artículos Personalizados (CRUD Mochila). *(Tiers 1, 2, 3)*
- [x] **F05**: Gestión de Miembros Familiares con Roles en Sismo (CRUD Plan Familiar). *(Tiers 1, 2, 3, 4)*
- [x] **F06**: Directorio de Emergencia Nacional con marcación rápida (`tel:`). *(Tiers 1, 2, 3, 4)*
- [x] **F07**: Servicio de Mensajería 119 para voz en emergencias (validación de formatos y URIs). *(Tiers 1, 2, 4)*
- [x] **F08**: Guías de Actuación INDECI ante Sismo (Antes, Durante, Después). *(Tier 1)*
- [x] **F09**: Caja de Reserva para 72 horas a 4 días (4 categorías: Alimentos, Higiene, Abrigo, Diversos). *(Tiers 1, 2, 3, 4)*
- [x] **F10**: Linterna con doble modo (Fija y Estroboscópica SOS internacional `... --- ...`). *(Tiers 1, 2, 3, 4)*
- [x] **F11**: Silbato Sonoro de Alerta SOS vía Web Audio API sintético. *(Tiers 1, 3, 4)*
- [x] **F12**: Estroboscopio de Pantalla SOS con destellos de alto contraste visual. *(Tier 1)*
- [x] **F13**: Acceso rápido a Cámara para evaluación visual de daños. *(Tiers 1, 2)*
- [x] **F14**: Puntos de Encuentro Familiar (Barrio y Zona Segura Externa). *(Tiers 1, 2, 3, 4)*

### Módulo 002: Mapa GPS & Georreferenciación Offline
- [x] **F15**: Detección de Coordenadas GPS del Punto de Encuentro (WGS84). *(Tiers 1, 2, 3, 4)*
- [x] **F16**: Almacenamiento y persistencia offline de coordenadas geográficas. *(Tiers 1, 2, 3, 4)*
- [x] **F17**: Visualización de enlaces de mapas para zonas seguras y puntos de reunión. *(Tiers 1, 3)*
- [x] **F18**: Validación de límites geográficos y coordenadas en territorio peruano. *(Tier 2)*

### Módulo 003: Huaicos Offline & Resiliencia Multi-Peligro
- [x] **F19**: Sistema de Niveles de Alerta por Lluvias e Inundaciones SENAMHI (Verde, Amarillo, Naranja, Rojo). *(Tiers 1, 2, 3, 4)*
- [x] **F20**: Señales de Alerta Temprana de Quebrada (Ruidos fuertes, agua turbia, olores barrosos). *(Tiers 1, 3, 4)*
- [x] **F21**: Evacuación en Ángulo de 90 Grados respecto al cauce de la quebrada / laderas altas. *(Tiers 1, 3, 4)*
- [x] **F22**: Calculadora de Cloración y Desinfección de Agua de Emergencia (2 gotas por litro de lejía al 5%). *(Tiers 1, 2, 3, 4)*
- [x] **F23**: Checklist Preventivo para Temporada de Lluvias (Techos, canaletas, sacos de arena). *(Tiers 1, 3, 4)*
- [x] **F24**: Guía de Regreso Seguro Post-Huaico (Inspección estructural, líneas eléctricas, desinfección de lodo). *(Tier 1)*
- [x] **F25**: Directorio de Emergencia Especializado para Huaicos (Cruz Roja 115, Defensa Civil, Bomberos 116). *(Tiers 1, 3, 4)*

---

## 4. Filosofía y Rigor de la Suite

- **Opaque-Box Puro**: Las pruebas interactúan con el software exclusivamente a través del DOM visible y las interfaces de almacenamiento (`localStorage`, Web Audio API, `MediaDevices`), sin inspeccionar variables privadas internas.
- **Tolerancia a Fallos**: Se verifican escenarios de JSON corrupto, desbordamiento de cuota de almacenamiento (`QuotaExceededError`), entradas maliciosas o vacías, y sincronización entre pestañas sin romper la ejecución de la aplicación.
- **Cumplimiento Normativo Peruano**: Todas las cantidades, fórmulas de cloración de agua, artículos de la mochila y caja de reserva, y niveles de alerta meteorológica reflejan con exactitud las directivas oficiales de INDECI y SENAMHI.
