# Subagent Workplan

## Objetivo
Permitir desarrollo paralelo sin degradar la arquitectura del MVP.

## Subagente A — Frontend/domain split
### Misión
Romper `src/services/core.js` y dejar frontera limpia entre UI y dominio.

### Entregables
- servicios separados por dominio
- hooks de lectura/escritura por módulo
- cero regresión de build

### Riesgos
- duplicar queries
- romper contratos entre vistas y servicios

---

## Subagente B — Supabase/schema/security
### Misión
Mapear el contrato real entre frontend y base de datos.

### Entregables
- inventario de tablas/RPCs consumidas por frontend
- lista de campos obligatorios
- propuesta de policies por `organization_id`
- separación demo vs producción

### Riesgos
- asumir esquema inexistente
- endurecer policies antes de entender el flujo operativo

---

## Subagente C — Motor documental / Tyrion
### Misión
Definir la transición de clasificación mock a clasificación real.

### Entregables
- contrato de entrada documental
- contrato de clasificación
- contrato de OCR/extracción
- tabla de validaciones cruzadas por trámite

### Riesgos
- sobre-diseñar IA sin cerrar primero los contratos del dominio

---

## Subagente D — Output engine
### Misión
Llevar batches, jobs, retries y sesiones de demo a operación seria.

### Entregables
- estados canónicos de output
- diagrama de transitions
- estrategia para CSV server-side
- definición de orquestación batch/session/job

### Riesgos
- mezclar UI de cockpit con orquestación backend

---

## Orden recomendado de ejecución
1. A — Frontend/domain split
2. B — Supabase/schema/security
3. D — Output engine
4. C — Motor documental

## Regla de supervisión
Ningún subagente debe introducir features nuevas grandes sin:
- build verde
- contrato de datos explícito
- nota de impacto en arquitectura
