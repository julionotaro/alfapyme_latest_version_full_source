# Alfa-Pyme Ops Cockpit MVP — v0.8.1

> **Versión de trabajo actual: v0.8.1 · rama principal sincronizada para GitHub/Vercel**

MVP operacional para gestorías orientado a expedientes documentales, validación humana y preparación de salidas hacia distintos canales.

## Stack
- React 19
- Vite 8
- Supabase (DB + Storage + RPC)
- Despliegue previsto en Vercel

## Objetivo del MVP
Validar un cockpit operativo donde un expediente pase por:
1. recepción documental
2. inferencia automática de trámite
3. validación humana con corrección editable
4. preparación de salida
5. historial operativo

## Navegación actual del cockpit
- Inicio
- Bandeja operativa
- Documentos / Entrada
- Validación IA
- Salidas
- Historial
- Configuración

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
- rediseño base del cockpit siguiendo estructura visual de referencia
- inferencia de `case_type` a partir del conjunto documental cargado
- persistencia de matrícula inferida cuando el expediente aún no la tiene
- Validación IA editable con guardado de correcciones humanas
- Bandeja operativa reforzada para mostrar qué entendió la IA, qué falta y qué hacer ahora
- limpieza de datos operativos demo sin tocar estrategia/configuración

### Límites actuales
- hay simulación en partes de clasificación/OCR/confianza
- faltan integraciones reales del execution engine
- las policies SQL incluidas siguen siendo demasiado abiertas para producción
- la Bandeja operativa ya es más útil, pero aún admite una segunda pasada visual para quedar calcada al patrón objetivo
- el cockpit y los lotes están pensados para validación operativa, no todavía para operación final endurecida

## Prioridades recomendadas
1. convertir los mocks documentales en lógica real
2. cerrar execution engine de batches, sesiones y retries
3. endurecer seguridad y policies de Supabase
4. conectar despliegue y observabilidad de entorno
5. incorporar documentación funcional continua desde el PDF maestro
