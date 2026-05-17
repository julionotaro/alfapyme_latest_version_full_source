# Progreso operativo · Sprint 1 a 3

Fecha base: 2026-05-15

## Estado resumido

### Sprint 1 · Módulo documental
Estado: **muy avanzado**

Logros reales:
- OCR usable sobre PDF embebido, PDF escaneado e imagen
- pipeline modular de ingesta separado en `src/lib/ingestion/*`
- laboratorio de validación real en navegador headless
- fixtures realistas de varias tandas
- heurísticas post-OCR para DNI y matrículas

Límite honesto actual:
- todavía hay ruido OCR en campos finos (fechas, referencias, algunos bastidores), pero el módulo ya no está bloqueado y puede sostener un MVP serio.

### Sprint 2 · Vertical gestoría
Estado: **en avance útil**

Logros reales:
- validaciones cruzadas entre documentos
- checklist persistido y reconciliado
- motivos operativos visibles para `human_validation`
- viewer y panel con más contexto de ingesta y bloqueos

Pendiente principal:
- cerrar mejor el flujo punta a punta de gestoría hasta salida operativa completa.

### Sprint 3 · Núcleo reusable
Estado: **encarrilado**

Logros reales:
- separación explícita de templates de negocio
- stages reusable/documentados
- blueprint conceptual por vertical
- arquitectura base `inputs -> processing -> outputs` ya aterrizada en documentación y dominio

Pendiente principal:
- seguir moviendo piezas del flujo actual para que dependan menos de gestoría como vertical implícita.

---

## Artefactos clave añadidos en esta etapa

### Ingesta y validación
- `src/lib/ingestion/file-kinds.js`
- `src/lib/ingestion/browser-extractors.js`
- `src/lib/ingestion/pipeline.js`
- `scripts/validate_ingestion_pipeline.mjs`
- `scripts/generate_realistic_fixtures.py`
- `scripts/run_ingestion_lab_playwright.mjs`

### Arquitectura reusable
- `src/domain/templates/business-templates.js`
- `src/domain/templates/workflow-stages.js`
- `src/domain/templates/case-blueprints.js`
- `docs/template-platform-architecture.md`

### Evidencia y operación
- `fixtures_realistic/*`
- `fixtures_realistic_round2/*`
- `ingestion-lab.html`
- `src/ingestion-lab.js`

---

## Lectura estratégica

La decisión correcta fue **no reiniciar el proyecto desde cero** y tampoco seguir parcheando a ciegas la ruta anterior.

Se rescató:
- el cerebro documental
- la lógica de validación
- la integración operativa útil

Y se reencauzó:
- la ingesta
- el OCR
- la validación reproducible
- la separación reusable del sistema

---

## Siguiente objetivo natural tras Sprint 1-3
1. completar la vertical gestoría hasta salida operativa creíble
2. mover outputs reales antes de formalizar templates más profundos
3. ejecutar gran prueba end-to-end
