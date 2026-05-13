# Gap Analysis: PDF maestro vs repo actual

## 1. Estado real por capa

### Frontend cockpit
**Estado:** funcional a nivel MVP.

Ya existe:
- workspace de casos
- carga documental
- visor documental
- salidas
- copilot
- historial

**Conclusión:** la UI ya expresa el flujo principal del negocio, pero todavía depende de servicios demasiado simplificados.

---

### Capa de servicios (`src/services/core.js`)
**Estado:** concentrada, mezclada y con lógica demo.

#### Responsabilidades mezcladas en un solo archivo
- casos
- documentos
- checklist
- storage
- output engine
- copilot sessions
- jobs / retry
- historial / audit
- generación CSV en navegador

**Problema:** esto vuelve difícil escalar el desarrollo paralelo sin colisiones y sin mezclar decisiones de dominio con detalles de UI.

#### Señales claras de MVP/demo
- clasificación documental por nombre de archivo (`detectDocType`)
- OCR simulado (`ocr_text: "OCR simulado..."`)
- confianza simulada (`0.72`, `0.88`)
- export CSV generado en el cliente
- cambios de estado de jobs con fallo simulado desde UI

**Conclusión:** la intención del producto está bien representada, pero Tyrion todavía no existe como motor documental real.

---

### Supabase / SQL
**Estado:** funcional pero incompleto y demasiado abierto.

#### Lo que sí hay
- soporte para `exported_files`
- soporte para `retry_after` y `last_error`
- RPC `retry_failed_jobs()`
- políticas demo para `exported_files` y `audit_logs`

#### Brechas críticas
- no aparece aquí el esquema completo del dominio
- policies abiertas para `anon` y `authenticated` con `using(true)` y `with check(true)`
- no se ve endurecimiento multiempresa real
- no se valida aislamiento por `organization_id`
- no hay evidencia aquí de ejecución real de batches/sesiones más allá de la estructura

**Conclusión:** la DB parece orientada a demo operativa. No está lista todavía para seguridad ni operación multi-tenant rigurosa.

---

## 2. Brechas frente a la visión del PDF

### A. Tyrion documental real
**Visión PDF:** clasificación por contenido, OCR, extracción contextual, validación cruzada.

**Repo actual:**
- clasificación por filename
- OCR simulado
- payload IA simulado
- sin validación cruzada real entre documentos

**Gap:** muy alto.

---

### B. Output engine real
**Visión PDF:** batches, grouping strategy, sesiones operativas, canales de salida, engine transaccional.

**Repo actual:**
- vistas y tablas existen
- `process_output_queue()` se invoca por RPC
- CSV se descarga desde frontend
- no hay evidencia aquí de pipeline robusto de orquestación

**Gap:** medio/alto.

---

### C. Copilot operacional real
**Visión PDF:** navegación fluida, checklist contextual, integración real con sesión y productividad operativa.

**Repo actual:**
- UI base de sesiones/casos
- acciones de estado presentes
- sin viewer integrado en el cockpit
- sin métricas operativas ni flujo profundo

**Gap:** medio.

---

### D. Historial operacional serio
**Visión PDF:** trazabilidad con más contexto operacional.

**Repo actual:**
- historial por expediente existe
- depende de `audit_logs`
- logging correcto para MVP
- falta enriquecer tipos de eventos, filtros y contexto de operador/canal/salida

**Gap:** medio.

---

### E. Multiempresa rigurosa
**Visión PDF:** aislamiento claro por organización.

**Repo actual:**
- `organization_id` aparece en operaciones clave
- pero no hay evidencia aquí de enforcement real a nivel policy

**Gap:** alto a nivel seguridad.

---

## 3. Qué sí está suficientemente bien para seguir
- stack simple y correcto
- repo compilable
- UI alineada con la visión
- Supabase como base razonable
- modelo MVP entendible para subagentes

## 4. Qué no debe hacerse ahora
- meter más features grandes encima de `core.js`
- vender la IA documental como resuelta
- dejar las policies demo como si fueran producción
- abrir desarrollo paralelo sin dividir dominios

## 5. Backlog técnico recomendado por frentes

### Frente 1 — Dominio frontend
1. dividir `src/services/core.js` en:
   - `services/cases.js`
   - `services/documents.js`
   - `services/output.js`
   - `services/history.js`
2. extraer helpers de documentos (`detectDocType`) a un módulo explícito de mocks o clasificación provisional
3. preparar hooks por vista (`useCases`, `useCaseDetails`, `useOutput`, etc.)

### Frente 2 — Supabase / seguridad
1. mapear esquema real esperado por el frontend
2. revisar policies por `organization_id`
3. distinguir claramente entorno demo vs endurecido
4. revisar RPCs existentes y faltantes (`process_output_queue`, sync checklist, etc.)

### Frente 3 — Motor documental
1. separar pipeline real vs simulado
2. definir contrato de clasificación documental
3. definir contrato de extracción OCR/contextual
4. preparar interfaz para validación cruzada documental

### Frente 4 — Output engine
1. sacar CSV del navegador y llevarlo a generación server-side o job controlado
2. definir estados de batch/job/sesión con semántica estricta
3. validar estrategia de grouping por trámite y salida
4. conectar trazabilidad con sesiones y batches

## 6. Prioridad realista
### Prioridad 1
Dividir servicios y mapear Supabase.

### Prioridad 2
Separar simulación documental de lógica real.

### Prioridad 3
Endurecer output engine y seguridad.

### Prioridad 4
Recién ahí meter subagentes de desarrollo intensivo por frentes.
