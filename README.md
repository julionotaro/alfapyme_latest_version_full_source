# Alfa-Pyme Ops Cockpit MVP — v0.6.2

> **Versión de trabajo actual: v0.6.2 · rama principal sincronizada para GitHub/Vercel**

MVP operacional para gestorías orientado a expedientes documentales, validación humana y preparación de salidas hacia distintos canales.

## Stack
- React 19
- Vite 8
- Supabase (DB + Storage + RPC)
- Despliegue previsto en Vercel

## Objetivo del MVP
Validar un cockpit operativo donde un expediente pase por:
1. recepción documental
2. checklist y validación
3. visor documental
4. preparación de salida
5. historial operativo
6. sesiones tipo copilot

## Estructura actual
```text
src/
  components/   UI reutilizable básica
  views/        pantallas principales del cockpit
  services/     acceso a Supabase y operaciones del negocio
  lib/          clientes compartidos
  constants.js  labels y navegación
supabase/
  schema_base.sql
  ops_incremental.sql
  storage_setup.sql
  seed_demo.sql
```

## Variables de entorno
Crear `.env` a partir de `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Desarrollo local
```bash
npm install
npm run dev
```

## Build de validación
```bash
npm run build
```

## Dataset sintético para Tyrion
Se añadió un dataset de prueba reproducible para acelerar OCR/extracción/validación documental sin usar datos reales.

Generar fixtures:
```bash
npm run dataset:generate
```

Validar clasificación + extracción + decisión esperada:
```bash
npm run dataset:validate
```

Salida generada:
- `synthetic-data/manifest.json`
- `synthetic-data/transferencia_ok/*`
- `synthetic-data/transferencia_inconsistente/*`
- `synthetic-data/duplicado_ok/*`

## Base de datos
Bootstrap recomendado en este orden:
1. `supabase/schema_base.sql`
2. `supabase/ops_incremental.sql`
3. `supabase/storage_setup.sql`
4. `supabase/seed_demo.sql`

Ese flujo deja creado el schema base, el bucket `case-documents` y las RPCs base, pero ya no inserta expedientes ficticios por defecto.

Guía detallada:
- `docs/supabase-bootstrap.md`

## Estado honesto
La base frontend compila y expresa bien el flujo del negocio, pero todavía está en fase MVP.

### Último frente trabajado incluido en esta versión
- validación de ingesta documental (`ingestion:validate`)
- validación de contratos de salida (`outputs:validate`)
- endurecimiento de la capa de outputs y payloads
- fixtures realistas y utilidades de prueba para lote documental
- estructura preparada para gran prueba real con PDF e imágenes desde Vercel

### Límites actuales
- hay simulación en partes de clasificación/OCR/confianza
- faltan integraciones reales del execution engine
- las policies SQL incluidas siguen siendo demasiado abiertas para producción
- el cockpit y los lotes están pensados para validación operativa, no todavía para operación final endurecida

## Prioridades recomendadas
1. convertir los mocks documentales en lógica real
2. cerrar execution engine de batches, sesiones y retries
3. endurecer seguridad y policies de Supabase
4. conectar despliegue y observabilidad de entorno
5. incorporar documentación funcional continua desde el PDF maestro
