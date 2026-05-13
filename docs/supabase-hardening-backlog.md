# Supabase Hardening Backlog

## Prioridad 1 — Inventario real
- [ ] listar esquema completo consumido por el frontend
- [ ] identificar relación exacta entre `users`, `organizations` y `organization_members`
- [ ] confirmar qué RPCs existen realmente además de las referidas por frontend
- [ ] documentar bucket `case-documents` y convención de paths

## Prioridad 2 — Seguridad multiempresa
- [ ] diseñar RLS por `organization_id` para `cases`
- [ ] diseñar RLS por `organization_id` para `documents`
- [ ] diseñar RLS por `organization_id` para `case_document_checklist`
- [ ] diseñar RLS por `organization_id` para `audit_logs`
- [ ] diseñar RLS por `organization_id` para tablas de output
- [ ] diseñar policies de storage por organización/caso

## Prioridad 3 — Mutaciones controladas
- [ ] sustituir updates genéricos de checklist por acción explícita
- [ ] sustituir updates genéricos de output jobs por transición controlada
- [ ] sustituir update libre de `output_session_cases` por acciones operativas canónicas
- [ ] revisar si `updateCaseStatus` debe pasar por RPC con auditoría integrada

## Prioridad 4 — Output serio
- [ ] mover generación CSV a backend/RPC/job
- [ ] usar `exported_files` como registro operativo real
- [ ] registrar quién exportó, cuándo, desde qué batch y organización
- [ ] validar consistencia entre `output_batches`, `output_batch_cases` y `output_jobs`

## Prioridad 5 — Separación demo vs producción
- [ ] marcar policies demo actuales como temporales
- [ ] definir checklist de paso a producción
- [ ] distinguir datos mock de datos reales en documentos y output

## Señales de bloqueo
No cerrar seguridad sin antes conocer:
- modelo auth real
- memberships reales
- tenant boundary real
- flujos que deben seguir disponibles para demo
