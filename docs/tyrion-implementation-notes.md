# Tyrion Implementation Notes

## Qué ya se convirtió en estructura técnica
Se incorporó una capa inicial reusable en `src/domain/tyrion/`:

- `document-types.js`
- `requirement-templates.js`
- `tramite-requirements.js`
- `workflow-templates.js`
- `mock-classifier.js`
- `validation-rules.js`
- `index.js`

## Qué resuelve esta primera versión
1. separa la clasificación mock del servicio de documentos
2. modela requisitos mínimos por trámite mediante plantillas por vertical
3. define estados objetivo de Tyrion
4. define transición de workflow desacoplada de la UI
5. permite evaluar un expediente con:
   - faltantes obligatorios
   - documentos de baja confianza
   - decisión automática preliminar

## Qué NO resuelve todavía
- OCR real
- extracción por campos
- validaciones cruzadas profundas
- coherencia entre documentos
- validaciones fiscales/DGT reales
- edición/configuración administrativa de plantillas por cliente

## Estado actual de la unificación UI + Tyrion + DB
- el frontend ya no depende solo de una proyección efímera del checklist
- al abrir un caso, `reconcileChecklistTemplate(...)` materializa en `case_document_checklist` los ítems requeridos/recomendados derivados de la plantilla activa
- la ruta preferente ahora es una RPC SQL (`reconcile_case_checklist`) para que la reconciliación quede controlada también desde Supabase y no solo desde el cliente
- si esa RPC todavía no está aplicada en el entorno, el frontend cae de forma compatible a una reconciliación cliente temporal
- si entra documentación nueva, la reconciliación actualiza `status`, `validation_status` y `document_id` del ítem persistido correspondiente
- luego la UI sigue proyectando sobre esa base persistida para conservar compatibilidad con extras/manuales fuera de plantilla
- se registra auditoría con `checklist_template_reconciled`

## Siguiente paso recomendado
Conectar esta capa templatable con:
- checklist persistente derivado desde plantilla
- transición automática controlada con auditoría
- futura configuración por cliente acotada sobre plantillas base, sin abrir complejidad excesiva
