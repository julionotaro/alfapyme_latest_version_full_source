# Tyrion DGT Operational Matrix

## Propósito
Traducir la visión del proyecto y la guía `DGT Procedimiento.txt` a una matriz operativa que permita diseñar a Tyrion como motor documental real, con límites claros entre decisión automática y validación humana.

---

## 1. Mapa de trámites

### A. Matriculaciones
- A1. Matriculación ordinaria
- A2. Matriculación por importación
- A3. Matriculación temporal (placas verdes)
- A4. Rematriculación

### B. Cambios de titularidad
- B1. Transferencia de vehículo
- B2. Notificación de venta
- B3. Aceptación de venta

### C. Documentación del vehículo
- C1. Duplicado del permiso de circulación
- C2. Duplicado de ficha técnica electrónica
- C3. Cambio de domicilio fiscal
- C4. Autorización provisional de circulación

### D. Bajas
- D1. Baja temporal
- D2. Baja definitiva
- D3. Baja por exportación
- D4. Baja por tránsito comunitario

### E. Informes
- E1. Informe reducido
- E2. Informe completo
- E3. Consulta de cargas y precintos

### F. Distintivos
- F1. Distintivo ambiental
- F2. Certificado de características

### G. Internacionales
- G1. Permiso internacional de conducción
- G2. Matriculación por cambio de residencia

---

## 2. Requisitos por trámite (mínimo operativo)

> Nota: esto refleja el mínimo útil para triage documental inicial. No sustituye todavía la validación normativa final ni la firma/colegio/DGT.

| Trámite | Requisitos documentales mínimos | Validaciones automáticas mínimas |
|---|---|---|
| A1 Matriculación ordinaria | NIVE, factura, IVTM, IEDMT, tasa 1.1 | identidad solicitante, fiscalidad, homologación básica, tasa asociada |
| A2 Matriculación importación | documentación extranjera, COC o ficha reducida, ITV, DUA si aplica, IVTM, IEDMT | homologación, consistencia importación, fiscalidad, ITV |
| A3 Matrícula temporal | documentación disponible del vehículo + tasa 1.4 | identidad, existencia documental mínima, tasa |
| A4 Rematriculación | permiso, ficha técnica, tasa 1.2 | identidad/titularidad, consistencia permiso-ficha |
| B1 Transferencia | contrato, permiso, ficha técnica, IVTM, ITP, tasa 1.5 | identidad, titularidad, ITV, impuestos, cargas/precintos |
| B2 Notificación de venta | contrato, tasa 4.1 | identidad, coherencia contractual, tasa |
| B3 Aceptación de venta | contrato, IVTM, ITP, tasa 1.5 | identidad, fiscalidad, coherencia contractual |
| C1 Duplicado permiso | DNI, declaración de extravío, tasa 4.4 | identidad, tasa |
| C2 Duplicado ficha técnica | permiso, ITV | consistencia permiso, ITV vigente |
| C3 Cambio domicilio fiscal | DNI, justificante de domicilio | identidad, coherencia domicilio |
| C4 Autorización provisional | documentación del trámite principal, tasa 4.1 | depende del trámite principal + tasa |
| D1 Baja temporal | permiso, tasa 4.1 | titularidad, estado del vehículo, tasa |
| D2 Baja definitiva | certificado CAT | autenticidad/legibilidad CAT, titularidad/vehículo |
| D3 Baja exportación | documentación de exportación | identidad, soporte exportación, estado vehículo |
| D4 Baja tránsito comunitario | justificante de traslado | identidad, soporte de traslado |
| E1 Informe reducido | matrícula, tasa 4.1 | matrícula válida, tasa |
| E2 Informe completo | matrícula, tasa 4.1 | matrícula válida, tasa |
| E3 Consulta cargas/precintos | matrícula | matrícula válida |
| F1 Distintivo ambiental | matrícula | matrícula válida, elegibilidad ambiental si aplica |
| F2 Certificado características | permiso, ficha técnica | consistencia permiso-ficha |
| G1 Permiso internacional | DNI, permiso español, foto, tasa 4.5 | identidad, permiso vigente, tasa |
| G2 Matriculación cambio residencia | documentación extranjera, empadronamiento, ITV, exención IEDMT | identidad, residencia, fiscalidad, homologación/ITV |

---

## 3. Validaciones mínimas por expediente

Estas validaciones deben existir como capa transversal antes de declarar un expediente `ready_for_output`.

### Validaciones generales
1. **Legibilidad documental**
   - archivo visible
   - páginas completas
   - resolución suficiente
2. **Coherencia básica entre documentos**
   - nombres/identidad compatibles
   - matrícula consistente
   - bastidor consistente si aplica
3. **Tasas asociadas cuando proceda**
4. **ITV válida cuando proceda**
5. **Sin faltantes bloqueantes del trámite**
6. **Clasificación documental suficiente para saber qué documento es qué**

### Validaciones DGT / SITEX-REGWEB a modelar
- identidad del solicitante
- titularidad
- ITV / NIVE
- impuestos (`IVTM`, `ITP`, `IEDMT`)
- cargas y precintos
- estado del vehículo
- homologación

### Regla operativa clave
Tyrion no debe mover un expediente a salida solo porque “hay archivos subidos”. Debe hacerlo solo si el expediente supera:
- completitud documental mínima
- coherencia mínima
- validación básica del trámite

---

## 4. Puntos donde Tyrion puede decidir automáticamente

### Puede decidir
1. **clasificación preliminar de documentos**
   - DNI comprador/vendedor
   - permiso
   - ficha técnica
   - contrato/factura
   - justificantes de pago
   - mandato/autorización
   - certificado CAT
   - documentación de exportación
2. **detección de faltantes del checklist**
3. **detección de baja confianza OCR / baja legibilidad**
4. **detección de inconsistencias obvias**
   - nombre no coincide entre DNI y contrato
   - matrícula distinta entre permiso y ficha
   - documento obligatorio ausente
5. **preparación del expediente para revisión humana**
6. **avance automático a estado intermedio**
   - `received`
   - `classifying`
   - `extracting`
   - `pending_documents`
   - `human_validation`
   - `ready_for_output` solo si pasa reglas mínimas y no hay conflictos

---

## 5. Puntos donde Tyrion debe escalar a validación humana

### Debe escalar sí o sí cuando haya:
1. **documentación ilegible o incompleta**
2. **confianza baja en clasificación o extracción**
3. **inconsistencias entre documentos**
4. **casos con homologación/importación**
5. **dudas sobre titularidad, cargas o precintos**
6. **fiscalidad incompleta o ambigua**
7. **certificados o soportes especiales**
   - CAT
   - DUA
   - documentación extranjera
   - exenciones fiscales
8. **trámites donde el documento maestro del trámite principal no está claro**
9. **cualquier expediente que vaya a salida regulada sin evidencia documental suficiente**

### Regla dura
Tyrion puede asistir, priorizar y bloquear. No debe inventar certeza regulatoria donde no la hay.

---

## 6. Estados sugeridos del expediente

### Estados de máquina
- `received`
- `classifying`
- `extracting`
- `pending_documents`
- `human_validation`
- `blocked`
- `ready_for_output`
- `processing_output`
- `completed`
- `failed`

### Reglas de transición sugeridas
- `received` → `classifying`: documentos ingresados
- `classifying` → `extracting`: clasificación mínima lograda
- `extracting` → `pending_documents`: faltan obligatorios
- `extracting` → `human_validation`: conflicto o baja confianza
- `extracting` → `ready_for_output`: completitud + coherencia + reglas mínimas OK
- `ready_for_output` → `processing_output`: expediente empaquetado para salida
- `processing_output` → `completed|failed`: resultado de colegio/DGT/output

---

## 7. Qué necesita el producto para implementar esta matriz

### Capa documental
- contrato de tipos documentales real
- clasificación por contenido, no solo filename
- OCR/extracción estructurada
- score de confianza por documento y por campo

### Capa de reglas
- matriz `tramite -> requisitos`
- matriz `tramite -> validaciones`
- matriz `tramite -> campos críticos`
- matriz `tramite -> escalados humanos obligatorios`

### Capa de workflow
- motor que compute:
  - faltantes
  - conflictos
  - confianza global
  - readiness para salida

---

## 8. Backlog inmediato derivado

### Prioridad 1
Modelar en código la matriz de requisitos por trámite.

### Prioridad 2
Separar claramente:
- clasificación mock actual
- clasificación real futura

### Prioridad 3
Agregar una capa de `expedient validation` independiente de la UI.

### Prioridad 4
Hacer visible en cockpit:
- por qué Tyrion aprobó
- por qué bloqueó
- por qué escaló

---

## 9. Conclusión
Tyrion real no es solo un clasificador documental. Es un **motor de triage regulado** para expedientes DGT.

Su trabajo es:
- entender qué trámite es
- saber qué documentación exige
- validar un mínimo operativo
- decidir si puede avanzar
- o escalar a humano cuando la certeza regulatoria no alcanza
