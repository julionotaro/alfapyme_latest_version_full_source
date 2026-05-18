# Catálogo documental · Transferencia DGT

## Objetivo
Dar nombre y reglas reales a los documentos más frecuentes de transferencia para evitar que caigan como `documento_trafico` genérico.

## Documentos modelados en v0.6.1+
- `modelo_620`
- `modelo_621`
- `tasa_dgt_1_5`
- `tasa_dgt_4_1`
- `tasa_dgt_4_4`
- `contrato_factura`
- `permiso_circulacion`
- `ficha_tecnica`
- `dni_comprador`
- `dni_vendedor`

## Regla de canonicalización
Algunos documentos se clasifican de forma específica, pero para checklist/validación siguen contando como una familia más amplia:
- `modelo_620` -> `justificante_pago`
- `modelo_621` -> `justificante_pago`
- `tasa_dgt_1_5` -> `justificante_pago`
- `tasa_dgt_4_1` -> `justificante_pago`
- `tasa_dgt_4_4` -> `justificante_pago`

## Señales fuertes actuales
### Modelo 620
- `modelo 620`
- `impuesto sobre transmisiones patrimoniales`
- `autoliquidación`
- `transmitente`
- `adquirente`

### Tasa DGT 1.5
- `ministerio del interior`
- `dirección general de tráfico`
- `tasa 1.5`
- `cambio de titularidad`
- `número de tasa`
- `nrc`

### Ficha técnica
- `ficha técnica`
- `tarjeta itv`
- `bastidor`
- `marca`
- `modelo`

## Resultado esperado
Con estas reglas el sistema ya no debería tratar un 620 o una tasa 1.5 como simple documento de tráfico genérico. Debe reconocerlos como soportes fiscales/administrativos específicos y dejar esa semántica disponible para la inferencia posterior de trámite.
