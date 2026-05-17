import { chromium } from 'playwright'
import path from 'node:path'

const fixtures = [
  'fixtures_realistic_round2/justificante_embedded_real.pdf',
  'fixtures_realistic_round2/ficha_tecnica_real.png',
  'fixtures_realistic_round2/justificante_scanned_real.pdf',
]

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/ingestion-lab.html', { waitUntil: 'networkidle' })
await page.setInputFiles('#files', fixtures.map((f) => path.resolve(f)))
await page.click('#run')
await page.waitForFunction(() => {
  const text = document.querySelector('#output')?.textContent || ''
  return text.trim().startsWith('[')
}, { timeout: 120000 })
const text = await page.locator('#output').textContent()
console.log(text)
await browser.close()
