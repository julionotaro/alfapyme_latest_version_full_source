// tests/example.test.js
import { test, expect } from '@playwright/test';

test('visual ingestion test', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Adjust URL as needed
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('visual-ingestion.png');
});
