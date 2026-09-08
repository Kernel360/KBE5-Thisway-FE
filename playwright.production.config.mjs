import { defineConfig } from '@playwright/test';

// Run npm run build first. These tests request the real emitted chunks, not Vite source modules.
export default defineConfig({
  testDir: './tests/production',
  outputDir: './test-results/production',
  use: { baseURL: 'http://127.0.0.1:4180', browserName: 'chromium' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4180 --strictPort',
    url: 'http://127.0.0.1:4180/login',
    reuseExistingServer: false,
  },
});
