import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const windowsChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || (existsSync(windowsChrome) ? windowsChrome : undefined);
const nodeCommand = `"${process.execPath}"`;
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
  timeout: 35000,
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: { executablePath }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [ { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } }, { name: 'tablet', use: { viewport: { width: 820, height: 1180 } } }, { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } } ],
  webServer: [
    { command: `${nodeCommand} node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4173`, url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 60000 },
    { command: `${nodeCommand} --experimental-strip-types scripts/qa-server.ts`, url: 'http://127.0.0.1:4180', reuseExistingServer: !process.env.CI, timeout: 60000 },
  ],
});
