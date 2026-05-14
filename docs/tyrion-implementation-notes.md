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
- OCR real de producción endurecido con métricas/calidad por lote
- validaciones cruzadas profundas con reglas DGT/fiscales completas
- validaciones fiscales/DGT reales
- edición/configuración administrativa de plantillas por cliente

## Mejora incorporada en la capa de inteligencia documental
- `document-intelligence.js` añade una primera capa de análisis menos dependiente del nombre exacto del PDF
- ahora Tyrion puntúa por señales textuales/documentales y extrae campos base cuando aparecen en nombre/OCR simulado:
  - matrícula
  - bastidor
  - DNI/NIE
  - comprador
  - vendedor
  - titular
  - importe
  - fecha
  - domicilio
- `uploadDocument(...)` ya guarda en `ai_payload`:
  - `document_type`
  - `confidence`
  - `extracted_fields`
  - `normalized_text`
- `evaluateExpedient(...)` ahora añade validaciones cruzadas básicas entre documentos para detectar:
  - matrículas inconsistentes
  - bastidores inconsistentes
  - discrepancias comprador/contrato
  - discrepancias vendedor/contrato
  - discrepancia titular permiso ↔ vendedor en transferencia

## Estado actual de la unificación UI + Tyrion + DB
- el frontend ya no depende solo de una proyección efímera del checklist
- al abrir un caso, `reconcileChecklistTemplate(...)` materializa en `case_document_checklist` los ítems requeridos/recomendados derivados de la plantilla activa
- la ruta preferente ahora es una RPC SQL (`reconcile_case_checklist`) para que la reconciliación quede controlada también desde Supabase y no solo desde el cliente
- si esa RPC todavía no está aplicada en el entorno, el frontend cae de forma compatible a una reconciliación cliente temporal
- si entra documentación nueva, la reconciliación actualiza `status`, `validation_status` y `document_id` del ítem persistido correspondiente
- luego la UI sigue proyectando sobre esa base persistida para conservar compatibilidad con extras/manuales fuera de plantilla
- se registra auditoría con `checklist_template_reconciled`

## Validación funcional realizada (transferencia demo)
Se validó un flujo funcional completo sobre Supabase bootstrapado desde cero con caso demo `EXP-0002`:

1. caso vacío:
   - Tyrion detectó faltantes
   - sugirió estado tipo `pending_documents`
   - bloqueó el paso a salida mientras existían obligatorios pendientes
2. caso parcialmente completo (1 documento obligatorio):
   - redujo faltantes
   - mantuvo bloqueantes restantes
   - mantuvo una sugerencia coherente con expediente incompleto
3. caso completo (4 obligatorios de `transferencia`):
   - desaparecieron bloqueantes
   - cambió la sugerencia al siguiente estado lógico
   - permitió pasar a salida

## Conclusión de esta iteración
- la lógica base de Tyrion ya reacciona al expediente y no solo a la presencia genérica de archivos
- la unificación UI + checklist + Supabase + evaluación Tyrion quedó funcional para el caso demo de `transferencia`
- el bootstrap de Supabase quedó documentado y separado en `schema_base.sql`, `ops_incremental.sql`, `storage_setup.sql` y `seed_demo.sql`

## Siguiente paso recomendado
Ruta A cerrada:
- bootstrap/documentación/prueba funcional mínima validados

Ruta B recomendada a continuación:
- ampliar producto, no solo ordenar entorno
- cubrir más trámites DGT en `requirement-templates.js`
- endurecer reglas operativas y trazabilidad para más verticales/casos

## Entrada documental real ya integrada en esta iteración
- `src/lib/document-ingestion.js` añade una capa real de lectura documental antes del análisis de Tyrion
- soporta:
  - ficheros textuales (`txt`, `md`, `csv`, `json`)
  - PDF con texto embebido (`pdf_text`)
  - PDF escaneado mediante OCR en navegador sobre hasta 3 páginas (`pdf_ocr`)
  - imágenes mediante OCR (`image_ocr`)
- `src/services/documents.js` ya registra el origen de ingesta en `ai_payload.ingestion_source`
- si la extracción falla o no devuelve texto útil, el sistema conserva fallback seguro con `buildSimulatedOcrText(...)`

## Dataset sintético y fases de avance ya habilitadas
- `scripts/generate_synthetic_dgt_dataset.mjs` genera un dataset reproducible con documentos ficticios para:
  - `transferencia_ok`
  - `transferencia_inconsistente`
  - `duplicado_ok`
- `scripts/validate_synthetic_dataset.mjs` ejecuta una validación automatizada de:
  - clasificación documental
  - extracción básica de campos
  - decisión esperada del expediente
  - inconsistencias cruzadas
- Fase 1 ya queda cubierta sobre dataset sintético para:
  - permiso de circulación
  - ficha técnica
  - contrato/factura
- Fase 2 ya queda cubierta sobre dataset sintético para:
  - DNI
  - justificante de pago
- Fase 3 queda preparada a nivel de arquitectura porque `evaluateExpedient(...)` ya admite sumar reglas más finas por trámite y validar su impacto con `npm run dataset:validate`
