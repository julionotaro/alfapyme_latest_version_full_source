# Architecture Notes

## Lectura del contexto maestro
El PDF `Alfapyme Master Context V1.pdf` marca una dirección clara:
- pensar en entidades documentales, no solo archivos
- convertir Tyrion en motor de triage documental
- priorizar demo operacional visible antes de profundizar solo backend
- mantener output engine y trazabilidad como piezas de primer nivel

## Gap actual entre visión y repo
### Ya visible en el repo
- cockpit operativo básico
- checklist documental
- viewer básico
- output queue / batches / sessions / jobs
- historial por expediente
- integración inicial con Supabase

### Todavía incompleto
- clasificación documental real
- OCR/extracción real
- execution engine real
- copilot plenamente operativo
- seguridad de Supabase endurecida
- separación más profunda entre dominio, UI y estados complejos

## Riesgos técnicos
1. `src/services/core.js` concentra demasiada lógica y mezcla UI assumptions con acceso a datos.
2. Las policies SQL demo no sirven para producción.
3. El flujo de output sigue siendo más demostrativo que transaccional.
4. La clasificación por filename sigue siendo un placeholder.

## Siguiente refactor lógico
- dividir `core.js` por dominios (`cases`, `documents`, `output`, `history`)
- incorporar tipado o validación de esquemas
- introducir estado compartido o hooks por módulo
- formalizar un roadmap de integración real con Supabase Storage + RPC + OCR/IA
