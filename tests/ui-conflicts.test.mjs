import { buildUiConflictSummary } from '../src/domain/tyrion/index.js'

const summary = buildUiConflictSummary([
  {
    code: 'buyer_identity_match',
    severity: 'blocking',
    status: 'failed',
    detail: 'Discrepancia de adquirente: cristina dominguez gundin · DNI 39462002M / 11111111H',
  },
  {
    code: 'chronology',
    severity: 'review',
    status: 'failed',
    detail: 'Fecha defunción: 09/01/2026 · fechas expediente: 13/05/2026',
  },
])

const assertions = [
  {
    name: 'builds two ui conflict items',
    ok: summary.items.length === 2,
    detail: summary,
  },
  {
    name: 'counts blocking conflicts',
    ok: summary.blockedCount === 1,
    detail: summary,
  },
  {
    name: 'provides human title and action',
    ok: summary.items[0].title && summary.items[0].recommendedAction,
    detail: summary.items[0],
  },
]

console.log(JSON.stringify(assertions, null, 2))
if (assertions.some((item) => !item.ok)) process.exit(1)
