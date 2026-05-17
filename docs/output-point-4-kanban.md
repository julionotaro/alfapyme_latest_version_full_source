# Punto 4 · Kanban de outputs

Fecha: 2026-05-16
Estado global estimado del punto 4: **41%**

## DONE

### Definir marco universal de inputs / estados / outputs
Estado: **100%**
- especificación base creada
- separación universal vs vertical vs oficina fijada

### Fijar prioridades de outputs para gestoría
Estado: **100%**
- CSV
- Copilot
- mensajería/mail

### Inventariar base técnica ya existente
Estado: **100%**
- cola
- batches
- sessions
- jobs
- strategies
- OutputView

---

## IN PROGRESS

### 1. Formalizar mapa técnico del punto 4
Estado: **100%**
Resultado:
- `docs/output-point-4-implementation-map.md`

### 2. Formalizar tabla trámite → modo → canal
Estado: **100%**
Resultado:
- `docs/gestoria-output-route-matrix.md`

### 3. Crear capa de estrategia reusable en código
Estado: **35%**
Pendiente:
- archivo de estrategia base
- helpers para resolver estrategia efectiva por trámite

### 4. Diseñar evaluador de readiness de salida
Estado: **20%**
Pendiente:
- reglas mínimas por modo
- motivos de bloqueo normalizados

---

## NEXT

### 5. Implementar router de output
Estado: **25%**
Objetivo:
- generar queue items consistentes según estrategia y readiness

### 6. Endurecer executor CSV
Estado: **42%**
Objetivo:
- lote reproducible
- estado trazable
- descarga coherente con estrategia

### 7. Arrancar executor Copilot
Estado: **18%**
Objetivo:
- sesión guiada por caso
- campos preparados
- warnings visibles

### 8. Arrancar executor mensajería/mail
Estado: **14%**
Objetivo:
- payload base para `message_body` y `attachment_package`

---

## BLOCKERS / RIESGOS

### Automatismo final por trámite
Estado: **45% definido**
Notas:
- todavía no está decidido qué salidas quedarán 100% automáticas en producción
- pero sí está claro qué modos deben existir y funcionar

### Dependencia de destino externo real
Estado: **30% resuelto**
Notas:
- CSV puede validarse antes
- Copilot y mensajería requieren más superficie real o simulada

---

## Definición operativa del avance

### Punto 4 total
- **Definición:** 88%
- **Arquitectura:** 74%
- **Implementación funcional:** 31%
- **Cierre real:** 41%

Lectura honesta:
- ya no estamos en humo conceptual
- todavía falta bastante trabajo de ejecución real
- pero por fin el punto 4 ya tiene columna vertebral
