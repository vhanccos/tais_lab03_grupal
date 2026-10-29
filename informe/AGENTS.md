# Guía de Compilación y Edición del Informe Técnico (Typst)

Este documento contiene las instrucciones técnicas para que agentes inteligentes y desarrolladores puedan compilar, editar y mantener el informe técnico institucional en Typst.

---

## 1. Prerrequisitos y Dependencias

- **Typst CLI:** Versión `0.11.0` o superior instalada en el entorno (verificar con `typst --version`).
- **Fuentes del Sistema:** Se utiliza `Liberation Sans` (disponible por defecto en entornos Linux/Ubuntu).
- **Paquetes Typst (descarga automática en primera compilación):**
  - `@preview/codly:1.3.0` (resaltado de sintaxis para bloques de código).
  - `@preview/codly-languages:0.1.6` (definiciones de lenguajes para codly).

---

## 2. Estructura de Archivos

```text
informe/
├── AGENTS.md                  # Este documento de instrucciones
├── INFORME_LAB03_SPEC_KIT.typ # Archivo fuente principal de Typst
├── INFORME_LAB03_SPEC_KIT.pdf # Salida compilada (7 páginas)
└── screenshots/               # Artefactos visuales embebidos (Spec 001)
    ├── caratula.pdf                       # Carátula oficial de primera página
    ├── 001-setup_specify_init.png         # Setup / Inicialización Spec Kit
    ├── 001-fase1_specify_prompt.png      # Fase 1: Prompt en /speckit-specify
    ├── 001-fase1_specify_resultado.png   # Fase 1: Síntesis de especificación
    ├── 001-fase1_spec_requirements.png    # Fase 1: spec.md y requerimientos
    ├── 001-fase2_plan_prompt.png         # Fase 2: Ejecución de /speckit-plan
    ├── 001-fase2_plan_tasks_tree.png     # Fase 2: plan.md, tasks.md y árbol
    ├── 001-fase3_implement_tree.png       # Fase 3: Archivos implementados
    ├── 001-fase3_ui_sismolisto.png        # Fase 3: Interfaz Mochila y Plan
    └── 001-fase4_vitest_results.png       # Fase 4: Resultados de Vitest (PBT)
```

---

## 3. Comandos de Compilación

### Compilación Estándar
Desde el directorio `informe/`:
```bash
typst compile INFORME_LAB03_SPEC_KIT.typ INFORME_LAB03_SPEC_KIT.pdf
```

Desde la raíz del repositorio (`lab03/`):
```bash
typst compile informe/INFORME_LAB03_SPEC_KIT.typ informe/INFORME_LAB03_SPEC_KIT.pdf
```

### Modo Observador (Live Reload / Watch)
Útil para editar y visualizar cambios en tiempo real al guardar:
```bash
typst watch informe/INFORME_LAB03_SPEC_KIT.typ informe/INFORME_LAB03_SPEC_KIT.pdf
```

---

## 4. Pautas de Edición y Diagramación

Al modificar el documento `INFORME_LAB03_SPEC_KIT.typ`, seguir las siguientes directrices para preservar la consistencia visual y el límite estricto de páginas:

1. **Balance de Páginas:**
   - El documento está calibrado para ocupar exactamente **7 páginas** (página 1: carátula sin encabezado/pie; páginas 2 a 7: contenido técnico numerado del 1 al 6).
   - Evitar saltos de línea excesivos o imágenes con anchos mayores a `88%` para no desplazar las referencias a una página 8 huérfana.

2. **Rutas de Imágenes y Carátula:**
   - Todas las imágenes se cargan de forma relativa a la raíz de compilación: `screenshots/{archivo}.png` o `screenshots/caratula.pdf`.
   - Si se añade una nueva captura, guardarla en `informe/screenshots/` y referenciarla con su extensión correspondiente.

3. **Escape de Caracteres en Texto:**
   - En Typst, los guiones bajos `_` activan cursiva si no están dentro de código en línea. En URLs o texto plano deben escaparse con barra invertida (`\_`), por ejemplo: `tais\_lab03\_grupal`.
   - En fórmulas matemáticas, variables con nombres de varias letras deben ir como texto (`$italic("loadState")(S)$`) o entre comillas para evitar errores de sintaxis.

4. **Encabezado y Pie de Página Institucionales:**
   - El encabezado superior muestra `TAIS • LAB 03` (izquierda) y `SDD • GITHUB SPEC KIT` (derecha).
   - El pie de página muestra `GRUPO B1` (izquierda) y `Página X` (derecha, calculado como `p - 1` para no numerar la portada).
