# Alfa-Pyme · Especificación oficial de Inputs, Estados y Outputs

Fecha: 2026-05-16

## 1. Principio rector

Alfa-Pyme no debe modelarse como una app cerrada de gestoría ni como un sistema documental aislado.

Debe modelarse como una **base universal de automatización operativa** para oficinas y negocios con trabajo repetitivo, estructurada en tres capas:

1. **Inputs**
2. **Procesamiento / lógica**
3. **Outputs**

La vertical (gestoría, logística, inmobiliaria, contable, etc.) define ejemplos concretos, pero la lógica interna debe ser reusable.

---

## 2. Modelo universal de Inputs

### 2.1 Regla general
Un input no debe clasificarse primero por canal ni por tipo de archivo, sino por **intención operativa** y por la **entidad del sistema que impacta**.

### 2.2 Canales de entrada
Canal = por dónde entra la comunicación o el archivo.

Canales base:
- `manual_upload`
- `email`
- `telegram`
- `whatsapp`
- `api_future`

Notas:
- `manual_upload` significa carga tradicional por adjunto/subida manual de archivos.
- API queda prevista, pero no priorizada en esta fase.

### 2.3 Intenciones operativas universales
Todo input debe resolverse en una de estas categorías:

#### `create_work`
Abre una nueva unidad de trabajo.

Ejemplos:
- nuevo expediente
- nuevo pedido
- nuevo lead
- nuevo lote documental

#### `update_work`
Actualiza una unidad de trabajo existente.

Ejemplos:
- documento faltante
- corrección
- aclaración
- respuesta del cliente

#### `request_information`
Es una consulta o pedido de información.

Ejemplos:
- estado del trámite
- qué falta
- reenvío de datos

#### `request_action`
Solicita ejecutar una acción operativa.

Ejemplos:
- exportar CSV
- preparar salida
- reenviar documentación
- reintentar un envío

#### `report_incident`
Reporta una incidencia o excepción.

Ejemplos:
- conflicto documental
- fallo de carga
- error de sistema
- rechazo del destino

#### `duplicate_or_noise`
Input duplicado, irrelevante o sin acción útil.

Ejemplos:
- reenvío sin novedad
- documento repetido
- spam/ruido

### 2.4 Entidades universales afectadas
Después de detectar la intención, el sistema debe resolver la entidad afectada.

Entidades base:
- `case`
- `batch`
- `document`
- `task`
- `incident`
- `conversation`
- `customer`

Cada vertical puede sumar entidades específicas (`order`, `route`, `lead`, etc.), pero sin romper el patrón.

### 2.5 Resultado del Input Router
Todo input debe producir una resolución explícita:

- `create_new`
- `attach_to_existing`
- `answer_only`
- `create_task`
- `create_or_update_incident`
- `ignore_or_merge_duplicate`
- `escalate_human`

---

## 3. Modelo universal de estados

### 3.1 Principio rector
Todo trabajo debe estar **siempre en un estado**.

Los usuarios pueden ver los estados con su jerga local, pero internamente el sistema debe correr sobre una **máquina de estados universal**.

Esto permite:
- reutilización entre verticales
- reglas consistentes
- automatización real
- adaptación visual/comercial por oficina

### 3.2 Estados universales internos

#### `received`
El input fue recibido y registrado.

#### `triaged`
El sistema ya clasificó intención, entidad y contexto.

#### `processing`
El sistema está ejecutando lógica activa sobre el caso.

#### `waiting_input`
Falta información, documento o respuesta externa.

#### `waiting_human`
Hace falta intervención humana concreta.

#### `ready_for_output`
El caso ya puede pasar al modo/canal de salida definido.

#### `delivering`
La salida se está procesando o entregando.

#### `completed`
El trabajo se completó con éxito.

#### `failed`
Falló y no pudo resolverse automáticamente.

#### `blocked`
No puede avanzar por una condición impeditiva clara.

### 3.3 Reglas universales de transición

#### Desde `received`
- a `triaged`

#### Desde `triaged`
- a `processing`
- a `waiting_input`
- a `waiting_human`
- a `blocked`

#### Desde `processing`
- a `ready_for_output`
- a `waiting_input`
- a `waiting_human`
- a `failed`
- a `blocked`

#### Desde `waiting_input`
- a `triaged`
- a `processing`
- a `blocked`

#### Desde `waiting_human`
- a `processing`
- a `ready_for_output`
- a `blocked`

#### Desde `ready_for_output`
- a `delivering`
- a `blocked`

#### Desde `delivering`
- a `completed`
- a `failed`
- a `waiting_human`

### 3.4 Regla de jerga local
Cada oficina puede mapear esos estados a nombres propios.

Ejemplo:
- `waiting_input` → “Pendiente cliente”
- `waiting_human` → “En revisión gestor”
- `ready_for_output` → “Listo para cargar en SAGE”

Pero internamente la lógica sigue siendo universal.

### 3.5 Regla de automatización
El sistema debe mover estados automáticamente siempre que:
- tenga evidencia suficiente
- no exista conflicto relevante
- no se requiera validación humana

Si no puede avanzar con seguridad:
- debe escalar
- bloquear
- o esperar input

Nunca debe inventar cierre exitoso por comodidad.

---

## 4. Modelo universal de Outputs

### 4.1 Principio rector
El sistema no debe limitarse a analizar documentos o datos.
Debe **resolver trabajo** y entregar una salida utilizable.

El operador humano debe intervenir solo en momentos específicos, no convertirse en un ejecutor mecánico del sistema.

### 4.2 Distinción crítica

#### Canal de comunicación / entrega
Por dónde sale la información.

Canales base:
- `dashboard`
- `email`
- `telegram`
- `whatsapp`
- `file_export`
- `api_future`

#### Modo de entrega
Cómo se materializa la salida.

Modos base:
- `csv_batch`
- `copilot_guided`
- `message_body`
- `attachment_package`
- `rpa_payload`
- `api_push_future`

### 4.3 Regla universal de output
Cada tipo de trabajo debe tener definido:

1. **modo de entrega**
2. **canal de entrega**

Esa relación debe ser configurable por vertical y por oficina.

### 4.4 Prioridades actuales fijadas

#### Prioridad 1
`csv_batch`

Uso principal:
- carga masiva en sistemas como SAGE

Regla:
- los trámites cuyo modo de salida sea CSV deben exportarse por lote

#### Prioridad 2
`copilot_guided`

Uso principal:
- sistemas que obligan a carga campo por campo
- asistencia al operador en procesos guiados

#### Prioridad 3
`message_body` / `attachment_package`

Uso principal:
- responder a gestores autorizados
- enviar información solicitada
- enviar adjuntos o información en cuerpo del mensaje

Canales típicos:
- `email`
- `telegram`
- `whatsapp`

### 4.5 Reglas universales de output

#### Regla 1
No puede existir output sin caso en estado compatible.

#### Regla 2
Un caso no debe pasar a `delivering` si sigue en conflicto documental relevante.

#### Regla 3
Los outputs deben dejar trazabilidad:
- qué caso los originó
- con qué modo
- con qué canal
- cuándo
- con qué resultado

#### Regla 4
Los fallos de entrega no deben destruir el estado del caso ni su evidencia.

#### Regla 5
Si un output falla, debe poder:
- reintentarse
- escalarse
- bloquearse con motivo

---

## 5. Relación universal entre inputs, estados y outputs

### 5.1 Flujo general
1. entra un input por un canal
2. el router detecta intención
3. se resuelve entidad afectada
4. se crea/actualiza/consulta/actúa
5. el trabajo transita estados universales
6. cuando corresponde, se prepara output
7. el output sale por modo + canal definidos

### 5.2 Reglas de decisión clave
El sistema debe decidir siempre:

1. ¿Qué intención operativa expresa este input?
2. ¿Sobre qué entidad impacta?
3. ¿Debe crear, actualizar, responder o escalar?
4. ¿En qué estado debe quedar el trabajo?
5. ¿Cuál es el modo de entrega correcto?
6. ¿Cuál es el canal correcto?

---

## 6. Regla de adaptación por vertical y oficina

### 6.1 Universal
La lógica interna es estable.

### 6.2 Vertical
Define:
- entidades principales
- modos de salida típicos
- canales habituales
- reglas operativas base

### 6.3 Oficina/cliente
Define:
- jerga visible de estados
- canal prioritario
- modo de entrega por trámite/proceso
- qué pasos son automáticos o supervisados

---

## 7. Criterio de diseño para próximos desarrollos
Toda nueva pieza del sistema debe poder responder:

1. ¿Qué intención operativa procesa?
2. ¿Qué entidad afecta?
3. ¿Qué estado modifica?
4. ¿Qué output habilita?
5. ¿Qué parte es universal?
6. ¿Qué parte depende del vertical?
7. ¿Qué parte depende de la oficina concreta?

Si no puede responder eso, probablemente está demasiado acoplada.

---

## 8. Consecuencia de producto
Alfa-Pyme no debe concebirse como un sistema que solo “lee documentos”.

Debe concebirse como un sistema que:
- recibe inputs,
- entiende intención,
- mueve trabajo entre estados,
- automatiza tareas,
- prepara salidas,
- y deja al humano como supervisor/interventor en puntos concretos.
