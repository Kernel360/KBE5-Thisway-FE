import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:4179', browserName: 'chromium' },
  webServer: {
    command: 'npx vite --config tests/browser/vite.config.mjs --host 127.0.0.1 --port 4179 --strictPort',
    url: 'http://127.0.0.1:4179/tests/browser/fixture.html',
    reuseExistingServer: false,
  },
});
