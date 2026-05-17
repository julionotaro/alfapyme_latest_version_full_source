# Template Platform Architecture

## Tesis del producto
Alfa-Pyme no debe quedarse como una app rígida para gestorías. La dirección correcta es una **base de automatización operativa para oficinas** que pueda ofrecer **templates preconfigurados por vertical** y luego ser ajustada por cada cliente.

La vertical de gestoría se mantiene como **semilla realista** para validar el diseño sin caer en teoría vacía.

---

## Estructura madre

### 1. Inputs
Canales por donde entra la información.

Ejemplos:
- web upload
- email
- WhatsApp
- backoffice manual
- CSV/Excel
- API
- sincronización de Drive/portal externo

### 2. Procesamiento
Pipeline reusable que transforma input en una decisión o acción operativa.

Bloques recurrentes:
- normalización
- ingesta documental / lectura de datos
- clasificación
- extracción de campos
- validación
- reglas de negocio
- escalado a revisión humana
- preparación de salida

### 3. Outputs
Canales y acciones donde el sistema entrega resultados.

Ejemplos:
- dashboard operativo
- email
- WhatsApp
- export CSV/PDF
- alertas internas
- tareas / colas / lotes
- integración con terceros

---

## Capas de configuración que debe soportar el producto

### A. Núcleo reusable
No depende de un rubro concreto.

Debe contener:
- contratos de inputs
- pipeline de procesamiento
- motor de reglas
- eventos / historial / trazabilidad
- contratos de outputs

### B. Template por vertical
Especializa el núcleo para un tipo de negocio.

Ejemplos:
- gestoría
- logística
- inmobiliaria
- estudio contable

Debe definir:
- entidades principales
- canales de entrada típicos
- etapas de procesamiento
- salidas habituales
- reglas base del vertical

### C. Configuración por oficina/empresa
Personaliza el template de vertical para un cliente concreto.

Debe permitir:
- activar/desactivar canales
- definir tipos de casos/procesos
- ajustar reglas
- ajustar mensajes y salidas
- configurar revisiones humanas

---

## Traducción al repo actual

### Ya encaminado
- `src/lib/ingestion/*` → capa de entrada reusable
- `src/domain/tyrion/*` → motor inicial de clasificación/validación documental
- `src/services/output.js` → base de salidas operativas
- checklist + history + viewer → piezas del cockpit operativo

### Ajuste de enfoque necesario
La lógica actual no debe seguir modelándose como “solo gestoría DGT”.

Debe ir moviéndose a:
- `template`
- `entities`
- `input channels`
- `processing stages`
- `output channels`

---

## Primera decisión de producto recomendada

### Vertical semilla
**Gestoría / DGT**

Motivos:
- caso real
- acceso a conocimiento del rubro
- documentación y procesos tangibles
- buena presión sobre input documental, validación y output administrativo

### Siguientes verticales conceptuales de contraste
- logística
- inmobiliaria
- estudio contable

No para construirlas ya, sino para que el diseño actual no quede preso del primer vertical.

---

## Regla de oro para siguientes refactors
Cada módulo nuevo debería poder responder explícitamente:

1. **Qué input resuelve**
2. **Qué parte del procesamiento resuelve**
3. **Qué output habilita**
4. **Qué parte es reusable**
5. **Qué parte pertenece al template del vertical**
6. **Qué parte pertenece a la configuración del cliente**

Si no puede responder eso, probablemente está demasiado acoplado.
