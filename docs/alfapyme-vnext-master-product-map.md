# Alfa-Pyme vNext · Mapa maestro de producto

## 0. Propósito de este documento
Este documento define la arquitectura maestra de pantallas, navegación, funcionamiento y prioridades de producto para Alfa-Pyme en su siguiente etapa.

No busca describir solo una UI bonita. Busca ordenar un sistema operativo real para gestión documental y supervisión administrativa asistida por IA.

La referencia correcta no es un “panel técnico con módulos”, sino una plataforma operativa distinguida, clara y sobria, donde el usuario humano actúa como supervisor del flujo y no como peón atrapado en formularios y clics.

---

## 1. Verdad base del producto

### 1.1 Qué es Alfa-Pyme realmente
Alfa-Pyme no debe entenderse como:
- un OCR con interfaz
- una app cerrada de gestoría
- un visor documental con checklist
- una suma de pantallas técnicas

Alfa-Pyme debe entenderse como:
> una plataforma de automatización operativa para expedientes documentales, donde la IA clasifica, extrae, contrasta, propone y prepara; y el humano supervisa, desbloquea y decide cuando corresponde.

### 1.2 Qué problema resuelve
Hoy una oficina administrativa pierde tiempo en:
- recibir documentos desordenados por múltiples canales
- entender qué trámite corresponde
- revisar si faltan documentos
- detectar incoherencias manualmente
- preparar salida hacia otro sistema o respuesta externa

Alfa-Pyme debe convertir eso en un flujo claro:
1. entra documentación
2. el sistema la interpreta
3. el sistema organiza el expediente
4. el sistema detecta conflictos
5. el humano interviene solo donde hay excepción real
6. el sistema prepara la salida adecuada

### 1.3 Principio rector de diseño
La app no debe organizarse por “herramientas internas”.
Debe organizarse por:
- estado del trabajo
- nivel de intervención humana
- punto del flujo

---

## 2. Estado real actual del producto

## 2.1 Lo que sí existe ya
- ingreso de documentos
- clasificación inicial documental
- extracción base de campos
- distinción inicial entre transferencia estándar y sucesión
- cruces documentales bloqueantes iniciales
- salida estructurada de conflictos lista para UI
- lógica de checklist
- modos de salida modelados
- canales de salida modelados
- base funcional de salidas CSV/Copilot/mensajería todavía incompleta

## 2.2 Lo que todavía no debe fingirse como cerrado
- salida end-to-end totalmente operativa en todos los modos/canales
- arquitectura visual madura de producto
- validación profunda de todos los tipos de trámite
- integraciones finales completamente estables
- automatizaciones de producción cerradas

### 2.3 Regla de honestidad de producto
La interfaz nunca debe presentar como “completamente automatizado” algo que hoy solo está:
- preparado
- modelado
- previsto
- parcialmente validado

Esto afecta especialmente a:
- salidas
- canales
- integraciones
- automatizaciones

---

## 3. Arquitectura maestra de navegación

La navegación debe expresar una plataforma de producto, no un laboratorio.

## 3.1 Navegación principal propuesta
1. **Inicio**
2. **Bandeja operativa**
3. **Documentos**
4. **Validación IA**
5. **Salidas**
6. **Copilot**
7. **Historial**
8. **Analytics**
9. **Configuración**

## 3.2 Racional de esta estructura
- **Inicio**: visión global del sistema
- **Bandeja operativa**: gestión viva de expedientes
- **Documentos**: exploración documental y entrada
- **Validación IA**: supervisión de conflictos, incoherencias y baja confianza
- **Salidas**: preparación y control de outputs
- **Copilot**: ejecución humana asistida de ciertos outputs
- **Historial**: trazabilidad y auditoría
- **Analytics**: métricas de volumen, atascos, tiempos, ratios
- **Configuración**: templates, canales, integraciones, automatizaciones

## 3.3 Qué desaparece conceptualmente
Deben desaparecer como eje de navegación principal las pantallas pensadas desde el código y no desde el trabajo, como:
- “workspace” como concepto ambiguo
- “viewer” como vista principal
- pantallas que obligan a pensar en módulos internos en vez de flujo

---

## 4. Pantalla 1 · Inicio

## 4.1 Objetivo
Dar pulso operativo inmediato del sistema.

El usuario entra aquí para responder en segundos:
- qué volumen hay
- qué está atascado
- qué necesita intervención
- qué está listo para avanzar
- si el sistema está sano o no

## 4.2 Qué debe mostrar
### Bloque A — métricas principales
Tarjetas KPI compactas:
- Por validar
- En proceso
- Bloqueados
- Pendientes cliente
- Listos para salida
- Cerrados hoy

### Bloque B — resumen operacional
- expedientes más urgentes
- conflictos bloqueantes recientes
- documentos con OCR dudoso
- salidas preparadas pendientes de ejecución

### Bloque C — tabla de expedientes recientes
Columnas sugeridas:
- expediente
- cliente
- trámite
- subtipo
- origen
- estado
- conflictos
- siguiente acción

### Bloque D — actividad / eventos
- últimas cargas
- últimos bloqueos
- últimos cambios de estado
- últimas salidas ejecutadas o fallidas

## 4.3 Qué NO debe mostrar
- checklist completo de un expediente
- visor documental grande
- detalles extensos de campos
- demasiado texto descriptivo

## 4.4 Criterio de diseño
Inicio debe sentirse como una home de producto SaaS serio:
- limpio
- denso pero legible
- visualmente jerarquizado
- con números primero y detalle debajo

---

## 5. Pantalla 2 · Bandeja operativa

## 5.1 Objetivo
Ser la mesa central de trabajo diario sobre expedientes.

Aquí el usuario no “configura” ni “analiza logs”. Aquí decide sobre casos.

## 5.2 Modelo de interacción correcto
La bandeja debe ser de dos niveles:

### Nivel 1 — lista compacta de expedientes
Una lista o tabla clara con:
- ID expediente
- cliente
- trámite probable
- subtipo
- canal origen
- estado actual
- severidad
- nº de conflictos
- siguiente acción sugerida

### Nivel 2 — panel de detalle del expediente seleccionado
Sin salir de la pantalla, mostrar:
- resumen corto
- estado
- conflictos críticos
- documentos detectados
- faltantes clave
- botón principal de acción

## 5.3 Acciones clave en esta pantalla
- abrir expediente completo
- ver conflictos
- marcar para revisión
- pedir documentación
- pasar a salida
- bloquear / desbloquear

## 5.4 Regla visual crítica
La bandeja no debe volverse una sábana.
No debe exigir scroll absurdo para ver un solo caso.

Debe priorizar:
1. lista compacta
2. detalle útil
3. profundidad solo bajo demanda

---

## 6. Pantalla 3 · Documentos

## 6.1 Objetivo
Gestionar la entrada documental y la inspección básica de archivos.

## 6.2 Subfunciones
### A. Ingreso documental
- drag & drop
- subida por lote
- creación de expediente provisional
- asignación a expediente existente

### B. Preanálisis documental
- tipo detectado
- confianza
- origen de extracción
- warnings
- páginas procesadas

### C. Explorador documental
- lista de documentos por expediente
- filtros por tipo
- filtros por estado
- acceso a preview

## 6.3 Qué debe mostrar por documento
- nombre de archivo
- tipo detectado
- confianza
- rol probable
- expediente asociado
- si participa en conflicto o no

## 6.4 Regla importante
Aquí sí se puede profundizar en documento.
Pero sigue sin ser un basurero técnico de JSON a la vista por defecto.

---

## 7. Pantalla 4 · Validación IA

## 7.1 Objetivo
Convertirse en la superficie específica para revisar conflictos, incoherencias y ambigüedades del sistema.

Esta pantalla es clave en Alfa-Pyme porque la esencia del producto no es solo leer documentos, sino detectar dónde no se puede confiar ciegamente.

## 7.2 Qué debe concentrar
- conflictos bloqueantes
- conflictos revisables
- discrepancias de identidad
- discrepancias de vehículo
- cronologías dudosas
- OCR crítico o baja legibilidad
- clasificación insuficiente

## 7.3 Vista ideal
### Tabla o cola de conflictos
Columnas:
- expediente
- conflicto
- severidad
- documentos implicados
- estado
- revisor sugerido
- acción sugerida

### Panel de detalle del conflicto
- título humano del conflicto
- resumen del problema
- valores detectados
- documentos involucrados
- recomendación de Tyrion
- acción del usuario

## 7.4 Valor estratégico
Esta pantalla convierte a Alfa-Pyme en sistema supervisor serio.
Sin ella, la IA queda como un lector de PDFs con ínfulas.

---

## 8. Pantalla 5 · Salidas

## 8.1 Objetivo
Gestionar la preparación, el estado y la ejecución de outputs.

## 8.2 Verdad operativa que la pantalla debe respetar
Hoy no todo está cerrado end-to-end.
Por tanto esta pantalla debe distinguir claramente entre:
- **salida prevista**
- **salida preparada**
- **salida lista para ejecutar**
- **salida ejecutada**
- **salida fallida**

## 8.3 Ejes conceptuales
### Modos de salida
- CSV
- Copilot
- Mensajería body + adjuntos
- API (posterior)

### Canales de salida
- descarga/manual
- email
- Telegram
- WhatsApp
- API (posterior)

## 8.4 Qué debe mostrar por expediente/lote
- modo previsto
- canal previsto
- destino
- estado de preparación
- bloqueos pendientes
- si requiere intervención humana
- artefacto generado o pendiente

## 8.5 Subáreas recomendadas
- cola de salida
- lotes CSV
- sesiones Copilot
- jobs / reintentos
- estrategias de salida

---

## 9. Pantalla 6 · Copilot

## 9.1 Objetivo
Permitir ejecución asistida humana de expedientes preparados para salida no masiva o semimanual.

## 9.2 Qué debe mostrar
- sesión activa
- lista de casos de la sesión
- expediente actual
- campos preparados
- warnings
- motivo por el que llegó a Copilot
- acción esperada del operador

## 9.3 Acciones principales
- presentado
- error
- saltar
- siguiente

## 9.4 Regla
Copilot no es otra app paralela.
Es un modo de ejecución dentro de la plataforma.
Debe sentirse conectado al estado del expediente y a su salida.

---

## 10. Pantalla 7 · Historial

## 10.1 Objetivo
Dar trazabilidad total del expediente y del sistema.

## 10.2 Qué debe permitir
- ver cambios de estado
- ver cargas documentales
- ver validaciones
- ver bloqueos y desbloqueos
- ver preparación y ejecución de salidas
- ver reintentos y errores

## 10.3 Uso correcto
No es la pantalla central de trabajo.
Es la caja negra auditable del sistema.

---

## 11. Pantalla 8 · Analytics

## 11.1 Objetivo
Convertir operación en lectura de negocio y productividad.

## 11.2 Métricas recomendadas
- expedientes por día/semana
- tiempos por estado
- conflictos por tipo
- ratio de bloqueo
- ratio de revisión humana
- ratio de expedientes listos a la primera
- tiempo hasta salida
- distribución por canal de entrada
- distribución por modo/canal de salida

## 11.3 Valor
Da lectura de dónde se atasca la operación y dónde conviene invertir mejoras.

---

## 12. Pantalla 9 · Configuración

## 12.1 Objetivo
Alojar el gobierno del sistema.

## 12.2 Qué debe agrupar
- templates de negocio
- templates de trámites
- documentos esperados
- reglas de salida
- canales de entrada
- canales de salida
- integraciones
- automatizaciones
- prioridades
- roles/revisores

## 12.3 Enfoque
No debe volverse una selva técnica ilegible.
Debe tener estructura por dominios de negocio.

---

## 13. Arquitectura de objetos visuales compartidos

## 13.1 Entidades visuales núcleo
Toda la plataforma debería girar alrededor de estas entidades UI:
- expediente
- documento
- conflicto
- salida
- sesión Copilot
- evento histórico

## 13.2 Componentes transversales principales
- `CaseStatusBadge`
- `ConflictCard`
- `ConflictSummaryBar`
- `DocumentChip`
- `OutputModeBadge`
- `ChannelBadge`
- `TyrionSuggestionBox`
- `CaseActionBar`
- `MetricsCard`

## 13.3 Regla de consistencia
Los mismos conceptos deben verse igual en toda la app.
No una cosa distinta en cada pantalla.

---

## 14. Principios de diseño visual

## 14.1 La información debe tener niveles
### Nivel 1
números / estado / severidad

### Nivel 2
resumen / conflicto / siguiente acción

### Nivel 3
detalle documental / campos / auditoría

## 14.2 El texto no debe suplir mala jerarquía
Menos párrafos. Más estructura visual.

## 14.3 La excepción manda
Lo crítico debe destacar.
Lo sano no debe gritar.

## 14.4 Una acción principal por contexto
No diez botones peleando.

## 14.5 El usuario no debe pensar en la arquitectura interna
Debe pensar en:
- qué pasa
- qué está mal
- qué hago ahora

---

## 15. Modelo operacional del expediente

## 15.1 Flujo ideal
1. ingreso documental
2. clasificación
3. agrupación en expediente
4. inferencia de trámite/subtipo
5. validación cruzada
6. revisión humana solo si hay excepción
7. preparación de salida
8. ejecución de salida
9. cierre / seguimiento

## 15.2 Estados macro recomendados
- recibido
- analizando
- pendiente_documentos
- bloqueado_conflicto
- revision_humana
- listo_para_salida
- en_salida
- cerrado

## 15.3 Estados visuales de severidad
- neutral
- warning
- blocking
- success

---

## 16. Priorización maestra de implementación

## Fase 1 · Reestructuración visual base
1. navegación global
2. Inicio
3. Bandeja operativa
4. detalle de expediente en bandeja

## Fase 2 · IA visible y usable
5. Validación IA
6. conflicto ↔ documento ↔ acción
7. revisión humana clara

## Fase 3 · Documentos y profundidad
8. pantalla Documentos
9. visor documental contextual
10. exploración documental por expediente

## Fase 4 · Salidas
11. Salidas
12. Copilot integrado
13. estados reales de preparación/ejecución

## Fase 5 · Gobierno y lectura estratégica
14. Historial
15. Analytics
16. Configuración

---

## 17. Relación con la base actual del proyecto

## 17.1 Qué reaprovechar
- `documents`
- `cases`
- `checklist`
- `TyrionAssessment`
- `uiConflicts`
- lógica de salidas
- base de Copilot
- historial

## 17.2 Qué rehacer conceptual o visualmente
- home actual
- workspace actual
- separación confusa entre viewer/workspace/upload
- exceso de detalle incrustado en la vista principal
- falta de una pantalla dedicada a validación IA

---

## 18. Criterio de distinción
Un producto hecho con distinción aquí no significa lujo visual vacío.
Significa:
- claridad superior
- jerarquía impecable
- fricción baja
- honestidad operativa
- potencia silenciosa

La persona debe sentir:
- el sistema entiende el trabajo
- la información está ordenada con criterio
- la IA ayuda donde debe
- no estoy atrapado en una herramienta torpe

---

## 19. Decisión final de rumbo
La app debe evolucionar desde un MVP funcional por módulos hacia una plataforma con tres capas claras:

### Capa 1 — visión del negocio y del flujo
Inicio / Analytics

### Capa 2 — operación diaria viva
Bandeja operativa / Documentos / Validación IA

### Capa 3 — ejecución y gobierno
Salidas / Copilot / Historial / Configuración

Ese es el esqueleto correcto para Alfa-Pyme vNext.
