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
- integración profunda con checklist persistente en la UI/DB
- edición/configuración administrativa de plantillas por cliente

## Siguiente paso recomendado
Conectar esta capa templatable con:
- checklist persistente derivado desde plantilla
- transición automática controlada con auditoría
- futura configuración por cliente acotada sobre plantillas base, sin abrir complejidad excesiva
