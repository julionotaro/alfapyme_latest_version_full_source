# Progreso operativo · Punto 4 Outputs

Fecha: 2026-05-16

## Estado resumido

### Punto 4 · Outputs operativos reales
Estado: **cerrado para MVP serio**

Logros reales:
- contrato oficial de inputs, estados y outputs documentado
- estrategia de salida por trámite definida para gestoría
- priorización real fijada: CSV → Copilot → mensajería/mail
- fallback local funcional cuando las tablas remotas de outputs estén vacías
- evaluador inicial de readiness para decidir si un caso puede salir
- router local de outputs que clasifica casos para batch CSV, sesión Copilot o jobs de mensajería
- export CSV reproducible sobre batches locales
- sesiones Copilot locales con campos preparados y seguimiento de estado
- borradores de mensajería/mail generados como jobs visibles
- build validado sin romper la app

## Qué se cerró realmente

### CSV
- lotes agrupados por `case_type + destination_system`
- generación de CSV descargable
- trazabilidad básica de export local

### Copilot
- agrupación local en sesiones por trámite/destino
- casos con campos preparados
- progreso manual por caso

### Mensajería / mail
- jobs de borrador para `message_body` y `attachment_package`
- previews visibles y retry local básico

## Límite honesto actual

Queda margen para profundizar producción real en:
- persistencia remota completa de estrategias y sesiones
- integración directa con canales reales
- payload CSV específico por software de destino
- playbooks Copilot más detallados por trámite

Pero a nivel MVP serio, el punto 4 ya dejó de ser una idea suelta y pasó a ser una capa operativa funcional y reusable.

## Artefactos clave añadidos

### Documentación
- `docs/universal-input-output-state-spec.md`
- `docs/output-point-4-implementation-map.md`
- `docs/gestoria-output-route-matrix.md`
- `docs/output-point-4-kanban.md`

### Dominio y lógica
- `src/domain/templates/output-strategies.js`
- `src/domain/outputs/readiness.js`
- `src/domain/outputs/router.js`
- `src/domain/outputs/executors/csv.js`
- `src/domain/outputs/executors/copilot.js`
- `src/domain/outputs/executors/messaging.js`

### Integración
- `src/services/output.js`
- `src/views/OutputView.jsx`
- `src/views/CopilotView.jsx`

## Porcentajes finales honestos

- **Punto 4 outputs:** **93%**
- **Vertical gestoría:** **84%**
- **Núcleo reusable:** **72%**

## Lectura estratégica

El cambio importante es que Alfa-Pyme ya no queda planteado como:
- “leo documentos y quizá exporto algo”

Sino como:
- “recibo inputs, evalúo estado, preparo salida, agrupo por modo y dejo al humano intervenir solo donde aporta valor”.
