# Quickstart & Validation Guide: SismoListo Offline

**Feature**: `001-sismolisto-offline`
**Date**: 2026-10-29

Esta guía describe los escenarios ejecutables de validación para verificar que la aplicación SismoListo opera 100% offline, con reactividad en el checklist, persistencia inmediata y soporte para el protocolo 119.

---

## 1. Requisitos Previos y Entorno

- **Node.js**: v20+ (verificado v26.12 instalada).
- **Navegador**: Cualquier navegador moderno con soporte para `localStorage` y PWA (Chrome, Chromium, Firefox, Safari).
- **Simulación Offline**: Herramientas de desarrollo del navegador con emulación de "Offline" / Desconectado.

---

## 2. Escenarios de Validación Paso a Paso

### Escenario 1: Checklist de Mochila de Emergencia y Cálculo Invariante
1. **Acción**: Abrir la aplicación en modo incógnito (sin datos previos).
2. **Resultado esperado**:
   - Se muestran las 6 categorías predeterminadas (Primeros Auxilios, Alimentos no perecibles, Agua, Herramientas, Abrigo, Documentos).
   - Todos los ítems están inicialmente desmarcados.
   - El progreso global y por categoría muestra `0%`.
3. **Acción**: Marcar la mitad de los ítems de la categoría "Agua".
4. **Resultado esperado**:
   - El porcentaje de la categoría sube a `50%`.
   - El porcentaje global de la mochila se actualiza en menos de 100 ms de forma reactiva.
5. **Acción**: Marcar el 100% de todos los artículos de todas las categorías.
6. **Resultado esperado**:
   - El porcentaje global alcanza exactamente `100%`.
   - No se producen valores superiores a 100 ni errores de coma flotante (ej. 99.999%).

---

### Escenario 2: Plan Familiar y Validación de Roles
1. **Acción**: Navegar a la pestaña "Plan Familiar".
2. **Acción**: Intentar guardar un familiar con el campo de nombre vacío o con espacios `"   "`.
3. **Resultado esperado**:
   - La aplicación bloquea la acción y resalta el campo como requerido.
4. **Acción**: Ingresar "María Gómez" con el rol "Encargada de la linterna y botiquín" y guardar.
5. **Resultado esperado**:
   - Aparece inmediatamente en la lista de integrantes del hogar.
6. **Acción**: Rellenar Punto de Encuentro Interno ("Bajo el marco de la puerta este") y Externo ("Cancha de fútbol del barrio").
7. **Resultado esperado**:
   - Los datos quedan almacenados sin necesidad de presionar ningún botón remoto.

---

### Escenario 3: Protocolo Telefónico Nacional 119
1. **Acción**: En la sección de emergencia, ingresar el número celular familiar `"987123456"`.
2. **Resultado esperado**:
   - Los botones de acción rápida se habilitan.
3. **Acción**: Hacer clic en "Grabar Mensaje 119".
4. **Resultado esperado**:
   - El sistema invoca el marcador nativo del dispositivo con el URI `tel:1191987123456`.
5. **Acción**: Hacer clic en "Escuchar Mensaje 119".
6. **Resultado esperado**:
   - El sistema invoca el marcador nativo del dispositivo con el URI `tel:1192987123456`.
7. **Acción**: Ingresar un número inválido (ej. `"12345"`).
8. **Resultado esperado**:
   - Los enlaces de marcación se deshabilitan y se muestra una advertencia de formato (requiere 9 dígitos).

---

### Escenario 4: Persistencia Offline Estricta y Casos Borde
1. **Acción**: En las herramientas de desarrollador, activar el modo **Offline** en la pestaña de red (Network).
2. **Acción**: Recargar la página (`F5` o `Ctrl+R`).
3. **Resultado esperado**:
   - La aplicación carga instantáneamente sin pantallas de error ni peticiones fallidas a servidores externos.
4. **Acción**: Modificar casillas de la mochila y datos familiares.
5. **Acción**: Simular cierre abrupto cerrando la pestaña o recargando forzadamente.
6. **Resultado esperado**:
   - Al volver a abrir la aplicación, todos los estados y datos ingresados se encuentran intactos.
7. **Acción (Resiliencia ante corrupción)**:
   - Abrir la consola e inyectar un valor corrupto: `localStorage.setItem('sismolisto_app_state_v1', 'corrupt_data{{')`.
   - Recargar la página.
8. **Resultado esperado**:
   - La aplicación detecta el estado corrupto, inicializa de forma segura el catálogo predeterminado de INDECI y permanece 100% funcional sin congelarse.
