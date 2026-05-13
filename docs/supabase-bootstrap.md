# Supabase Bootstrap Alfa-Pyme

Este proyecto no arranca sobre una base vacía con solo `ops_incremental.sql`.

## Orden correcto

### 1) Schema base
Ejecutar:
- `supabase/schema_base.sql`

Crea las tablas mínimas del MVP:
- `cases`
- `documents`
- `case_document_checklist`
- `audit_logs`
- `output_queue`
- `output_batches`
- `output_batch_cases`
- `output_sessions`
- `output_session_cases`
- `output_jobs`
- `output_strategies`

También crea RPCs base:
- `sync_document_to_checklist(uuid)`
- `process_output_queue()`

### 2) Incremental funcional
Ejecutar:
- `supabase/ops_incremental.sql`

Añade:
- `exported_files`
- `retry_after`, `last_error` en `output_jobs`
- RPC `retry_failed_jobs()`
- RPC `reconcile_case_checklist(uuid, jsonb)`

### 3) Storage
Ejecutar:
- `supabase/storage_setup.sql`

Esto:
- crea el bucket `case-documents` si no existe
- crea policy demo para leer/escribir objetos en ese bucket

### 4) Seed demo mínimo
Ejecutar:
- `supabase/seed_demo.sql`

Esto deja:
- un caso demo `EXP-0001`
- una estrategia demo de output para `transferencia`

## Verificación mínima esperada
Después de ejecutar los 4 archivos:
1. la app lista al menos el caso `EXP-0001`
2. al abrir el caso, Tyrion proyecta/reconcilia checklist
3. la subida documental ya puede escribir en `case-documents`
4. el historial operativo puede registrar eventos

## Nota honesta
Las policies actuales son deliberadamente abiertas para fase MVP/demo.
No son las definitivas para multiempresa ni producción.
