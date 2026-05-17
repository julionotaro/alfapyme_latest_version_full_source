# Gestoría · Tabla trámite → modo → canal

Fecha: 2026-05-16
Estado de definición: **78%**

## Criterio aplicado
Prioridad operativa fijada para gestoría:

1. **CSV**
2. **Copilot**
3. **Mensajería / mail**

La tabla siguiente define el **default recomendado** para la vertical gestoría.
No bloquea overrides por oficina, pero sí fija una base seria para el MVP.

---

| Trámite | Familia | Modo principal | Canal principal | Sistema destino | Agrupación | Estado definición |
|---|---|---|---|---|---|---|
| transferencia | cambios_titularidad | `csv_batch` | `file_export` | `sage` | `by_case_type` | 85% |
| notificacion_venta | cambios_titularidad | `csv_batch` | `file_export` | `sage` | `by_case_type` | 82% |
| aceptacion_venta | cambios_titularidad | `csv_batch` | `file_export` | `sage` | `by_case_type` | 80% |
| duplicado | documentacion_vehiculo | `copilot_guided` | `dashboard` | `portal_manual` | `none` | 76% |
| cambio_domicilio | documentacion_vehiculo | `copilot_guided` | `dashboard` | `portal_manual` | `none` | 78% |
| baja_temporal | bajas | `copilot_guided` | `dashboard` | `portal_manual` | `none` | 74% |
| baja_definitiva | bajas | `copilot_guided` | `dashboard` | `portal_manual` | `none` | 72% |
| matriculacion | matriculaciones | `copilot_guided` | `dashboard` | `portal_manual` | `none` | 70% |
| matriculacion_importacion | matriculaciones | `copilot_guided` | `dashboard` | `portal_manual` | `none` | 68% |

---

## Reglas complementarias de mensajería/mail

La mensajería no sustituye el modo principal del trámite. En esta fase actúa sobre todo como:

1. **respuesta operativa**
2. **entrega de información solicitada**
3. **envío de adjuntos**
4. **seguimiento / requerimiento / notificación**

### Casos típicos para `message_body`
- responder consulta de estado
- informar documentación faltante
- confirmar recepción
- comunicar incidencia o bloqueo

### Casos típicos para `attachment_package`
- enviar justificante
- reenviar documentación procesada
- adjuntar resumen o export puntual

### Canales permitidos
- `email`
- `telegram`
- `whatsapp`

Estado de definición de mensajería: **61%**

---

## Reglas por prioridad

### Prioridad 1 · CSV
Aplicar cuando:
- el destino admita carga masiva
- el trámite tenga estructura tabular suficiente
- el caso esté listo para lote

### Prioridad 2 · Copilot
Aplicar cuando:
- la carga sea campo por campo
- el humano deba ejecutar una secuencia guiada
- el sistema pueda preparar valores, checks y warnings

### Prioridad 3 · Mensajería / mail
Aplicar cuando:
- el objetivo sea informar, responder o adjuntar
- no corresponda un batch CSV
- no haga falta sesión Copilot

---

## Lectura honesta

La parte más sólida hoy es la de:
- clasificación general
- prioridad CSV
- prioridad Copilot

La parte menos cerrada todavía es:
- granularidad exacta de mensajería por tipo de trámite
- qué salidas pasarán a full-automáticas y cuáles quedarán supervisadas

Eso no impide avanzar ya en el punto 4.
