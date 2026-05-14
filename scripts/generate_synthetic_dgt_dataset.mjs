import fs from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('/data/.openclaw/workspace/alfapyme/synthetic-data')

const cases = [
  {
    slug: 'transferencia_ok',
    meta: { caseType: 'transferencia', expectedDecision: 'ready_for_output' },
    docs: {
      'permiso_circulacion.txt': `PERMISO DE CIRCULACION\nTitular: MARIO GOMEZ LOPEZ\nMatricula: 1234ABC\nBastidor: VF7ABCD1234567890\nMarca: SEAT\nModelo: Leon\n`,
      'ficha_tecnica.txt': `FICHA TECNICA\nMatricula: 1234ABC\nBastidor: VF7ABCD1234567890\nMarca: SEAT\nModelo: Leon\nTarjeta ITV`,
      'contrato_compraventa.txt': `CONTRATO DE COMPRAVENTA\nVendedor: Mario Gomez Lopez\nComprador: Lucia Perez Martin\nDNI vendedor: 12345678Z\nDNI comprador: 23456789X\nMatricula: 1234ABC\nPrecio: 10500.00\nFecha: 14/05/2026`,
      'dni_vendedor.txt': `DNI VENDEDOR\nNombre: Mario Gomez Lopez\nDNI: 12345678Z`,
      'dni_comprador.txt': `DNI COMPRADOR\nNombre: Lucia Perez Martin\nDNI: 23456789X`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nModelo 620\nReferencia: TRF-2026-001\nImporte: 620.00\nFecha: 14/05/2026\nMatricula: 1234ABC`,
    },
  },
  {
    slug: 'transferencia_inconsistente',
    meta: { caseType: 'transferencia', expectedDecision: 'human_validation' },
    docs: {
      'permiso_circulacion.txt': `PERMISO DE CIRCULACION\nTitular: MARIO GOMEZ LOPEZ\nMatricula: 1234ABC\nBastidor: VF7ABCD1234567890`,
      'ficha_tecnica.txt': `FICHA TECNICA\nMatricula: 9999ZZZ\nBastidor: VF7ABCD1234567890\nMarca: SEAT`,
      'contrato_compraventa.txt': `CONTRATO DE COMPRAVENTA\nVendedor: Mario Gomez Lopez\nComprador: Lucia Perez Martin\nMatricula: 1234ABC\nPrecio: 10500.00\nFecha: 14/05/2026`,
      'dni_vendedor.txt': `DNI VENDEDOR\nNombre: Mario Gomez Lopez\nDNI: 12345678Z`,
      'dni_comprador.txt': `DNI COMPRADOR\nNombre: Lucia Perez Martin\nDNI: 23456789X`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nModelo 620\nImporte: 620.00\nFecha: 14/05/2026\nMatricula: 9999ZZZ`,
    },
  },
  {
    slug: 'duplicado_ok',
    meta: { caseType: 'duplicado', expectedDecision: 'ready_for_output' },
    docs: {
      'dni.txt': `DNI\nNombre: Carlos Diaz Romero\nDNI: 34567890V`,
      'declaracion_extravio.txt': `DECLARACION DE EXTRAVIO\nDeclaro el extravio del permiso de circulacion\nTitular: Carlos Diaz Romero\nMatricula: 4567BCD`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nTasa duplicado\nImporte: 20.81\nFecha: 14/05/2026\nReferencia: DUP-001`,
    },
  },
]

async function main() {
  await fs.mkdir(outDir, { recursive: true })

  const manifest = []

  for (const item of cases) {
    const caseDir = path.join(outDir, item.slug)
    await fs.mkdir(caseDir, { recursive: true })

    for (const [fileName, content] of Object.entries(item.docs)) {
      await fs.writeFile(path.join(caseDir, fileName), content, 'utf8')
      manifest.push({
        case: item.slug,
        caseType: item.meta.caseType,
        fileName,
        path: `synthetic-data/${item.slug}/${fileName}`,
      })
    }
  }

  await fs.writeFile(
    path.join(outDir, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), cases: manifest }, null, 2),
    'utf8',
  )

  console.log(`Synthetic dataset generated in ${outDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
