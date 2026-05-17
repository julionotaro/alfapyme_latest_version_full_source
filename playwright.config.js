// playwright.config.js
const { defineConfig } = require('playwright-test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  retries: 1,
  reporter: [
    ['list'],
    ['json', { output: 'test-results/results.json' }]
  ],
});
