import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('token', 'fixture-token'));
  await page.route('**/api/trip-log/1', route => route.fulfill({ json: {
    vehicleResponse: { carNumber: 'fixture', mileage: 0, powerOn: true },
    currentDrivingInfo: { latitude: 37, longitude: 127, tripMeter: 0, speed: 0 },
    tripLogBriefInfos: [],
  } }));
});

test('EOF is visible; retry replaces historical points and uses latest token', async ({ page }) => {
  const requests = [];
  await page.route('**/api/trip-log/current/stream/1', route => {
    requests.push(route.request());
    return route.fulfill({ contentType: 'text/event-stream', body:
      'event: past_gps_chunk_stream\ndata: {"coordinatesInfo":[{"lat":37,"lng":127}]}\n\n' });
  });
  await page.goto('/tests/browser/fixture.html');
  await expect(page.getByRole('status')).toContainText('끊겼습니다');
  await expect(page.getByTestId('map-point-count')).toHaveText('1');
  await page.evaluate(() => localStorage.setItem('token', 'updated-fixture-token'));
  await page.getByRole('button', { name: '다시 연결' }).click();
  await expect.poll(() => requests.length).toBe(2);
  await expect(page.getByRole('status')).toContainText('끊겼습니다');
  await expect(page.getByTestId('map-point-count')).toHaveText('1');
  expect(requests[1].headers().authorization).toBe('Bearer updated-fixture-token');
  expect(requests[1].url()).not.toContain('token');
});

for (const status of [401, 403, 404]) {
  test(`HTTP ${status} shows recovery guidance without retry`, async ({ page }) => {
    await page.route('**/api/trip-log/current/stream/1', route => route.fulfill({ status }));
    await page.goto('/tests/browser/fixture.html');
    await expect(page.getByRole('status')).toContainText(status === 401 ? '다시 로그인' : '조회할 수 없습니다');
    await expect(page.getByRole('button', { name: '다시 연결' })).toHaveCount(0);
  });
}

test('network failure exposes an explicit retry', async ({ page }) => {
  await page.route('**/api/trip-log/current/stream/1', route => route.abort('connectionreset'));
  await page.goto('/tests/browser/fixture.html');
  await expect(page.getByRole('button', { name: '다시 연결' })).toBeVisible();
});
