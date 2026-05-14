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
  {
    slug: 'baja_temporal_ok',
    meta: { caseType: 'baja_temporal', expectedDecision: 'ready_for_output' },
    docs: {
      'permiso_circulacion.txt': `PERMISO DE CIRCULACION\nTitular: Ana Ruiz Castro\nMatricula: 5678DEF\nBastidor: VSSZZZ6JZ9R123456`,
      'dni.txt': `DNI\nNombre: Ana Ruiz Castro\nDNI: 45678901H`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nTasa baja temporal\nImporte: 8.67\nFecha: 14/05/2026\nReferencia: BT-001`,
    },
  },
  {
    slug: 'baja_definitiva_ok',
    meta: { caseType: 'baja_definitiva', expectedDecision: 'ready_for_output' },
    docs: {
      'certificado_cat.txt': `CERTIFICADO CAT\nCentro Autorizado de Tratamiento\nVehiculo: PEUGEOT 308\nMatricula: 6789GHI\nBastidor: VF34C9HZC12345678\nTitular: Sonia Martin Vega\nBaja definitiva autorizada`,
      'permiso_circulacion.txt': `PERMISO DE CIRCULACION\nTitular: Sonia Martin Vega\nMatricula: 6789GHI\nBastidor: VF34C9HZC12345678`,
    },
  },
  {
    slug: 'notificacion_venta_ok',
    meta: { caseType: 'notificacion_venta', expectedDecision: 'ready_for_output' },
    docs: {
      'contrato_compraventa.txt': `CONTRATO DE COMPRAVENTA\nVendedor: Pedro Lara Sanz\nComprador: Elena Mora Ruiz\nMatricula: 7890JKL\nPrecio: 5900.00\nFecha: 14/05/2026`,
      'dni_vendedor.txt': `DNI VENDEDOR\nNombre: Pedro Lara Sanz\nDNI: 56789012P`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nTasa notificacion venta\nImporte: 8.67\nFecha: 14/05/2026\nReferencia: NV-001`,
    },
  },
  {
    slug: 'aceptacion_venta_ok',
    meta: { caseType: 'aceptacion_venta', expectedDecision: 'ready_for_output' },
    docs: {
      'contrato_compraventa.txt': `CONTRATO DE COMPRAVENTA\nVendedor: Pedro Lara Sanz\nComprador: Elena Mora Ruiz\nMatricula: 7890JKL\nPrecio: 5900.00\nFecha: 14/05/2026`,
      'dni_comprador.txt': `DNI COMPRADOR\nNombre: Elena Mora Ruiz\nDNI: 67890123T`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nTasa aceptacion venta\nImporte: 55.15\nFecha: 14/05/2026\nReferencia: AV-001`,
    },
  },
  {
    slug: 'matriculacion_importacion_ok',
    meta: { caseType: 'matriculacion_importacion', expectedDecision: 'ready_for_output' },
    docs: {
      'documentacion_extranjera.txt': `REGISTRATION CERTIFICATE\nOwner: Julia Serra Vila\nMatricula: AB123CD\nBastidor: WVWZZZ1KZAW000111\nCountry: Germany`,
      'coc_ficha_reducida.txt': `CERTIFICADO DE CONFORMIDAD COC\nMarca: VOLKSWAGEN\nModelo: GOLF\nBastidor: WVWZZZ1KZAW000111\nHomologacion europea`,
      'dua_importacion.txt': `DOCUMENTO UNICO ADMINISTRATIVO\nDUA\nMRN: 26ESIMPORT0001\nImportacion vehiculo\nBastidor: WVWZZZ1KZAW000111`,
      'empadronamiento.txt': `PADRON MUNICIPAL\nNombre: Julia Serra Vila\nDomicilio: Calle Mayor 12 Madrid\nMunicipio: Madrid`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nIEDMT\nImporte: 1250.00\nFecha: 14/05/2026\nReferencia: MAT-001`,
    },
  },
  {
    slug: 'matriculacion_incompleta',
    meta: { caseType: 'matriculacion', expectedDecision: 'human_validation' },
    docs: {
      'documentacion_extranjera.txt': `REGISTRATION CERTIFICATE\nOwner: Lucas Pardo Rey\nMatricula: CD456EF\nBastidor: VF1RFB00665432109\nCountry: France`,
      'coc_ficha_reducida.txt': `FICHA REDUCIDA\nMarca: RENAULT\nModelo: Clio\nBastidor: VF1RFB00665432109`,
      'justificante_pago.txt': `JUSTIFICANTE DE PAGO\nIEDMT\nImporte: 980.00\nFecha: 14/05/2026\nReferencia: MAT-002`,
    },
  },
]

async function main() {
  await fs.rm(outDir, { recursive: true, force: true })
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
        expectedDecision: item.meta.expectedDecision,
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
