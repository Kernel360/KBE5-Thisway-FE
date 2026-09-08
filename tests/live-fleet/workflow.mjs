import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const fixture = JSON.parse(await readFile(process.env.FLEET_FIXTURE_FILE, 'utf8'));
const backend = new URL(process.env.FLEET_BACKEND_URL);
assert.equal(backend.hostname, '127.0.0.1');
assert.equal(backend.protocol, 'http:');
const output = path.resolve(process.env.FLEET_EVIDENCE_OUTPUT);
await mkdir(output, { recursive: true });
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  logLevel: 'silent',
  plugins: [react(), {
    name: 'isolated-fleet-fonts',
    transformIndexHtml: html => html.replace(/\s*<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com\/[^>]*>/g, ''),
  }],
  resolve: { alias: [
    { find: /^@\/components\/(KakaoMap|DashboardKakaoMap)$/, replacement: fileURLToPath(new URL('./MapFixture.jsx', import.meta.url)) },
    { find: /^(?:@|\.\.)\/.*utils\/mapUtils$/, replacement: fileURLToPath(new URL('./map-utils.mjs', import.meta.url)) },
    { find: '@/utils/mapUtils', replacement: fileURLToPath(new URL('./map-utils.mjs', import.meta.url)) },
    { find: '@', replacement: fileURLToPath(new URL('../../src', import.meta.url)) },
  ] },
  server: { host: '127.0.0.1', port: 0, open: false,
    proxy: { '/api': { target: backend.origin, changeOrigin: true } } },
});
let browser;
const responses = [];
const externalRequests = [];
const pageErrors = [];
try {
  await server.listen();
  const address = server.httpServer.address();
  const baseURL = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
  async function login(label, account) {
    const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1100 }, timezoneId: 'Asia/Seoul' });
    // Fail closed for external network. Requests to /api are continued, never fulfilled or mocked.
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === baseURL) await route.continue();
      else { externalRequests.push(url.origin); await route.abort(); }
    });
    const page = await context.newPage();
    page.on('response', response => {
      const url = new URL(response.url());
      if (url.pathname.startsWith('/api/')) responses.push({ company: label, method: response.request().method(),
        path: url.pathname, status: response.status() });
    });
    page.on('pageerror', error => pageErrors.push(error.name));
    await page.goto('/login');
    await page.getByPlaceholder('이메일을 입력하세요').fill(account.email);
    await page.getByPlaceholder('비밀번호를 입력하세요').fill(account.password);
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await expect(page).toHaveURL(/\/company\/dashboard$/);
    await expect(page.getByRole('heading', { name: '대시보드', exact: true })).toBeVisible();
    return { context, page };
  }
  async function capture(page, name) {
    // Accounts are not part of the captured demo evidence.
    await page.screenshot({ path: path.join(output, name), fullPage: true,
      mask: [page.getByText(/browser-[ab]@example\.test/)], maskColor: '#e5e7eb', animations: 'disabled' });
  }

  const a = await login('A', fixture.a);
  await expect(a.page.getByText('1대', { exact: true }).first()).toBeVisible();
  await capture(a.page, '01-company-dashboard.png');
  await a.page.getByRole('link', { name: '차량 관리', exact: true }).click();
  await expect(a.page.getByRole('heading', { name: '차량 관리', exact: true })).toBeVisible();
  const vehicleRow = a.page.getByRole('row').filter({ hasText: fixture.a.carNumber });
  await expect(vehicleRow).toBeVisible();
  await expect(a.page.getByText(fixture.b.carNumber, { exact: true })).toHaveCount(0);
  await capture(a.page, '02-company-vehicles.png');
  await vehicleRow.getByText(fixture.a.carNumber, { exact: true }).click();
  await expect(a.page.getByRole('heading', { name: new RegExp(`차량 상세 정보.*${fixture.a.carNumber}`) })).toBeVisible();

  await a.page.getByRole('link', { name: '운행 기록', exact: true }).click();
  await expect(a.page.getByRole('heading', { name: '운행 기록', exact: true })).toBeVisible();
  await expect(a.page.getByRole('row').filter({ hasText: fixture.a.carNumber })).toContainText('0.5 km');
  await a.page.getByRole('button', { name: '상세보기', exact: true }).click();
  await expect(a.page.getByRole('heading', { name: new RegExp(`운행 기록 상세.*${fixture.a.carNumber}`) })).toBeVisible();
  await expect(a.page.getByText('02:00:00', { exact: true })).toBeVisible();
  await expect(a.page.getByText('0.5 km', { exact: true })).toBeVisible();
  await capture(a.page, '03-trip-detail.png');

  await a.page.getByRole('link', { name: '통계', exact: true }).click();
  await expect(a.page.getByRole('heading', { name: '차량 운행 통계', exact: true })).toBeVisible();
  await a.page.locator('input[type="date"]').nth(0).fill(fixture.date);
  await a.page.locator('input[type="date"]').nth(1).fill(fixture.date);
  await a.page.getByRole('button', { name: '적용', exact: true }).click();
  await expect(a.page.getByText('2시간 0분', { exact: true })).toBeVisible();
  await expect(a.page.getByText(/새 기준 집계 1\/1일/)).toBeVisible();
  await expect(a.page.getByText(/저장된 GPS 관측: 2건/)).toBeVisible();
  await expect(a.page.getByText(/최초 집계 당시 기록한 활성 차량 수/)).toBeVisible();
  await capture(a.page, '04-company-statistics.png');

  const b = await login('B', fixture.b);
  await b.page.getByRole('link', { name: '차량 관리', exact: true }).click();
  await expect(b.page.getByRole('row').filter({ hasText: fixture.b.carNumber })).toBeVisible();
  await expect(b.page.getByText(fixture.a.carNumber, { exact: true })).toHaveCount(0);
  await b.page.goto(`/company/car-detail/${fixture.a.vehicleId}`);
  await expect(b.page.getByText('차량 정보를 불러오는데 실패했습니다.')).toBeVisible();
  await expect.poll(() => responses.some(r => r.company === 'B' && r.path === `/api/trip-log/current/stream/${fixture.a.vehicleId}` && r.status === 404)).toBe(true);
  await b.page.goto(`/company/trip-detail?id=${fixture.a.tripId}`);
  await expect(b.page.getByText('운행 상세 정보를 불러오지 못했습니다.')).toBeVisible();
  await expect.poll(() => responses.some(r => r.company === 'B' && r.path === `/api/trip-log/detail/stream/${fixture.a.tripId}` && r.status === 404)).toBe(true);
  await capture(b.page, '05-foreign-trip-denied.png');
  assert.ok(responses.some(r => r.company === 'B' && r.path === `/api/trip-log/${fixture.a.vehicleId}` && r.status === 404));
  assert.ok(responses.some(r => r.company === 'B' && r.path === `/api/trip-log/detail/${fixture.a.tripId}` && r.status === 404));
  assert.equal(responses.filter(r => r.method === 'POST' && r.path === '/api/auth/login' && r.status === 200).length, 2);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(responses.filter(response => response.status >= 500), []);
  await writeFile(path.join(output, 'result.json'), JSON.stringify({
    change: 'CHANGE-045', verifiedAt: new Date().toISOString(), passed: true,
    actualApplication: 'src/main.jsx -> App.jsx', actualBackend: 'Boot + MySQL + RabbitMQ + Redis Testcontainers',
    apiResponses: responses, pageErrors, externalRequests,
    checks: ['Two real company logins', 'Company-scoped vehicle list and vehicle detail', 'Trip detail 2 hours and 500 meters',
      'Statistics 120 minutes, 2 GPS observations and initial fleet snapshot', 'Foreign vehicle/trip UI errors with actual 404 responses'],
    screenshots: ['01-company-dashboard.png', '02-company-vehicles.png', '03-trip-detail.png', '04-company-statistics.png', '05-foreign-trip-denied.png'],
    limitations: ['Map provider components/helpers and reverse geocoding are stubbed; map rendering is not verified.',
      'The external Google Fonts stylesheet is removed by the test server; local fallback fonts are used.',
      'Synthetic accounts, vehicles and locations only; no deployment or production data.', 'Independent human explanation and manual replay are not verified.'],
  }, null, 2) + '\n');
  console.log('Fleet browser workflow verified');
} finally {
  await browser?.close();
  await server.close();
}
