# Punto 4 · Mapa de implementación técnica

Fecha: 2026-05-16
Vertical prioritaria: Gestoría

## Estado del punto 4
- **Definición funcional:** 88%
- **Diseño técnico:** 74%
- **Implementación real:** 31%
- **Validación end-to-end:** 12%

Lectura honesta:
- la idea ya está bastante bien aterrizada
- la interfaz y tablas base de output existen
- falta convertirlas en un sistema realmente gobernado por reglas universales + estrategia por trámite

---

## 1. Objetivo técnico del punto 4

Convertir la capa de outputs en un subsistema operativo capaz de:

1. decidir **cuándo** un caso puede salir
2. decidir **cómo** debe salir
3. decidir **por qué canal** debe salir
4. agrupar salidas por lote cuando corresponda
5. asistir al humano cuando el destino requiera intervención guiada
6. dejar trazabilidad, retry y bloqueo claro en caso de fallo

---

## 2. Capas técnicas a implementar

### Capa A · Policy / estrategia de salida
Responsabilidad:
- definir para cada tipo de trámite:
  - `output_mode`
  - `output_channel`
  - `destination_system`
  - `grouping_strategy`
  - condiciones mínimas para salir

Estado: **35%**

Falta:
- consolidar estrategia local en código reusable
- separar defaults universales de overrides por oficina

### Capa B · Readiness evaluator
Responsabilidad:
- decidir si un caso está realmente listo para output

Debe validar:
- estado interno compatible
- documentos mínimos
- bloqueos activos
- escalados humanos pendientes
- integridad de datos requeridos por el modo de salida

Estado: **15%**

Falta:
- helper técnico centralizado
- reglas por modo (`csv_batch`, `copilot_guided`, `message_body`, `attachment_package`)

### Capa C · Output router
Responsabilidad:
- tomar casos `ready_for_output`
- elegir estrategia efectiva
- crear items en cola de salida

Estado: **28%**

Ya existe:
- cola de salida visible
- tablas y vista iniciales

Falta:
- resolver estrategia desde reglas universales + vertical + oficina
- decidir automáticamente batch/sesión/mensaje

### Capa D · Executors por modo
Responsabilidad:
- materializar la salida

Executors prioritarios:
1. `csv_batch`
2. `copilot_guided`
3. `message_body` / `attachment_package`

Estado: **26%**

Ya existe:
- export CSV básico
- vistas de batches/sesiones/jobs

Falta:
- estructurar ejecutores como piezas separadas
- completar sesión copilot real
- preparar payload de mensajería/mail

### Capa E · Observabilidad y retry
Responsabilidad:
- dejar trazabilidad
- permitir reintentos
- no perder contexto del caso

Estado: **46%**

Ya existe:
- jobs
- retry de fallidos

Falta:
- clasificar errores por tipo
- definir bloqueos recuperables vs no recuperables

---

## 3. Orden de implementación recomendado

### Fase 4.1 · Estrategia de salida y matriz por trámite
Entregable:
- catálogo claro de `trámite -> modo -> canal`

Estado: **65%**

### Fase 4.2 · Evaluador de readiness
Entregable:
- función única que diga si un caso puede salir o no, y por qué

Estado: **10%**

### Fase 4.3 · Router de output
Entregable:
- creación consistente de queue items / batches / sesiones

Estado: **25%**

### Fase 4.4 · Executor CSV serio
Entregable:
- lotes exportables de forma reproducible y trazable

Estado: **42%**

### Fase 4.5 · Executor Copilot
Entregable:
- sesiones de trabajo guiado para carga campo a campo

Estado: **18%**

### Fase 4.6 · Executors de mensajería/mail
Entregable:
- payload listo para email / Telegram / WhatsApp

Estado: **14%**

---

## 4. Piezas del código implicadas

### Ya existentes
- `src/services/output.js`
- `src/views/OutputView.jsx`
- tablas Supabase de output (`output_queue`, `output_batches`, `output_sessions`, `output_jobs`, `output_strategies`)

### A crear o endurecer ahora
- `src/domain/templates/output-strategies.js`
- `src/domain/outputs/readiness.js`
- `src/domain/outputs/router.js`
- `src/domain/outputs/executors/csv.js`
- `src/domain/outputs/executors/copilot.js`
- `src/domain/outputs/executors/messaging.js`

---

## 5. Riesgo principal

El mayor riesgo no es técnico sino de diseño:

> dejar la capa de outputs atada a gestoría y a DGT en vez de construir un motor reusable con prioridad actual en gestoría.

Por eso la estrategia debe vivir en configuración/template, no hardcodeada dentro del flujo principal.

---

## 6. Definición de “punto 4 finalizado”

El punto 4 se considerará realmente cerrado cuando exista evidencia de que:

1. un caso puede evaluarse automáticamente para salida
2. el sistema decide su modo/canal de entrega
3. los casos CSV se agrupan por lote
4. los casos Copilot crean sesión operativa usable
5. los casos de mensajería/mail generan salida preparada
6. los fallos quedan trazados con retry o bloqueo claro
7. todo eso funciona sin romper la lógica universal de estados
