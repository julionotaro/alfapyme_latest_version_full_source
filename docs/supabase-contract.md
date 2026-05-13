# Supabase Contract Audit

## Superficies consumidas por el frontend

### Tablas leídas/escritas
#### Casos y documentación
- `cases`
  - lectura completa (`select *`)
  - update de `status`, `updated_at`
- `case_document_checklist`
  - lectura completa por `case_id`
  - update libre de payload + `updated_at`
- `documents`
  - lectura completa por `case_id`
  - insert con metadatos del archivo, tipo documental, OCR simulado y payload IA mock
- `audit_logs`
  - lectura por `case_id`
  - insert de eventos operativos

#### Output engine
- `output_queue`
  - lectura con join a `cases(public_id, client_name, vehicle_plate, status)`
- `output_batches`
  - lectura completa
  - update de `status`, `executed_at`, `updated_at`
- `output_batch_cases`
  - lectura por `batch_id` con join a `cases(public_id, client_name, vehicle_plate, case_type)`
- `output_sessions`
  - lectura completa
- `output_session_cases`
  - lectura por `session_id` con join a `cases(public_id, client_name, vehicle_plate, case_type, status)`
  - update libre de payload
- `output_jobs`
  - lectura completa
  - update libre de payload + `updated_at`
- `output_strategies`
  - lectura completa
- `exported_files`
  - definido en SQL incremental, pero todavía no consumido por el frontend

### Storage
- bucket: `case-documents`
  - upload de archivos
  - signed URLs para visualización

### RPCs usadas
- `sync_document_to_checklist(p_document_id uuid)`
- `process_output_queue()`
- `retry_failed_jobs()`

---

## Campos implícitamente obligatorios por entidad

### `cases`
El frontend asume al menos:
- `id`
- `public_id`
- `client_name`
- `case_type`
- `status`
- `organization_id`
- `vehicle_plate` (en joins del output)
- `created_at`
- `updated_at`

### `documents`
El frontend asume:
- `id`
- `case_id`
- `organization_id`
- `file_name`
- `file_type`
- `storage_path`
- `document_type`
- `confidence`
- `ocr_text`
- `status`
- `created_at`

### `case_document_checklist`
- `id`
- `case_id`
- `document_label`
- `status`
- `validation_status`
- `is_blocking`
- `document_id`
- `updated_at`

### `output_batches`
- `id`
- `file_name`
- `case_type`
- `total_cases`
- `status`
- `executed_at`
- `updated_at`

### `output_session_cases`
- `id`
- `session_id`
- `status`
- `completed_at`
- relación `cases(...)`

### `output_jobs`
- `id`
- `status`
- `attempts`
- `max_attempts`
- `output_route`
- `destination_system`
- `updated_at`
- `last_error`
- `retry_after`

### `audit_logs`
- `id`
- `case_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`

---

## Riesgos detectados

### 1. Policies demo demasiado abiertas
En `ops_incremental.sql`:
- `demo_exported_files_all`
- `demo_audit_logs_all`

Ambas permiten `using(true)` y `with check(true)` para `anon` y `authenticated`.

**Problema:** cualquier cliente con credenciales válidas de frontend podría leer/escribir sin aislamiento real por organización.

---

### 2. No hay evidencia de enforcement multiempresa
Aunque `organization_id` aparece en el dominio, aquí no hay políticas mostradas que restrinjan por:
- pertenencia del usuario a organización
- coincidencia `organization_id`
- bucket path ownership

**Problema:** el modelo multiempresa existe en intención, pero no está demostrado en seguridad.

---

### 3. Updates demasiado amplios desde frontend
Ejemplos:
- `updateChecklist(id, payload)`
- `updateSessionCase(id, payload)`
- `updateOutputJob(id, payload)`

**Problema:** el frontend puede mutar más de lo debido si las policies no filtran columnas/filas con rigor.

---

### 4. CSV export desde cliente
El CSV hoy se arma en navegador y luego se marca el batch como exportado.

**Problema:**
- no hay evidencia de archivo auditable server-side
- se mezcla UX con estado operacional
- difícil de controlar por permisos y trazabilidad

---

### 5. Storage sin contrato documentado
El bucket `case-documents` se usa con paths por `caseId/...`, pero no hay contrato aquí sobre:
- ownership del archivo
- validación de `organization_id`
- acceso solo a miembros de la organización

---

## Propuesta de endurecimiento

### Fase 1 — Contrato explícito
1. documentar esquema real de todas las tablas consumidas
2. documentar RPCs con inputs/outputs
3. documentar bucket policy esperada

### Fase 2 — Seguridad por organización
1. policies RLS por `organization_id`
2. tabla/función de membresía confiable (`organization_members` o similar)
3. impedir acceso cross-tenant a rows y archivos

### Fase 3 — Mutaciones de dominio más estrictas
1. reemplazar updates libres por RPCs o updates más específicos
2. separar acciones de operador de acciones del sistema
3. restringir columnas mutables desde cliente

### Fase 4 — Output engine serio
1. generar CSV server-side
2. persistir `exported_files`
3. mover transición de batch/job a funciones controladas
4. registrar trazabilidad de exportación

---

## Recomendación inmediata
Antes de endurecer policies a ciegas, hace falta un inventario real de:
- tablas base del dominio
- claves de organización
- membresía y auth
- storage rules

Eso es lo siguiente correcto para el frente Supabase.
