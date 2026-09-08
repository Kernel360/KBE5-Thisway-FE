import { test, expect } from '@playwright/test';

const trip = { id: 1, vehicleId: 1, carNumber: 'fixture', startTime: '2020-01-01T10:00:00',
  endTime: '2020-01-01T11:00:00', tripMeter: null, distanceStatus: 'MISSING_ON', address: '' };
const current = { startTime: trip.startTime, latitude: 37.5, longitude: 127,
  startOdometer: 1000, tripMeter: null, speed: 0 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('token', 'fixture-token'));
});

test('vehicle summary shows unknown trip distance, then subtracts start odometer from SSE', async ({ page }) => {
  await page.route('**/api/trip-log/1', route => route.fulfill({ json: {
    vehicleResponse: { carNumber: 'fixture', mileage: 1000, powerOn: true },
    currentDrivingInfo: current, tripLogBriefInfos: [trip],
  } }));
  let release;
  const received = new Promise(resolve => { release = resolve; });
  await page.route('**/api/trip-log/current/stream/1', async route => {
    await received;
    await route.fulfill({ contentType: 'text/event-stream', body:
      'event: vehicle_detail_gps_stream\ndata: {"totalTripMeter":1500,"speed":0,"coordinatesInfo":[{"lat":37.5,"lng":127}]}\n\n' });
  });
  await page.goto('/tests/browser/fixture.html');
  await expect(page.getByText('확인 불가', { exact: true })).toHaveCount(2);
  release();
  await expect(page.getByText('0.5 km', { exact: true })).toBeVisible();
  await expect(page.getByText('확인 불가', { exact: true })).toHaveCount(1);
  await expect(page.getByText('1.5 km', { exact: true })).toHaveCount(0);
});

test('GPS alone cannot turn OFF into ON; polling uses server-confirmed state', async ({ page }) => {
  await page.clock.install();
  let calls = 0;
  await page.route('**/api/trip-log/1', route => {
    calls += 1;
    return route.fulfill({ json: {
      vehicleResponse: { carNumber: 'fixture', mileage: 1000, powerOn: calls > 1 },
      currentDrivingInfo: calls > 1 ? current : null, tripLogBriefInfos: [],
    } });
  });
  let release;
  const received = new Promise(resolve => { release = resolve; });
  await page.route('**/api/trip-log/current/stream/1', async route => {
    await received;
    await route.fulfill({ contentType: 'text/event-stream', body:
      'event: vehicle_detail_gps_stream\ndata: {"totalTripMeter":1500,"coordinatesInfo":[{"lat":37.5,"lng":127}]}\n\n' });
  });
  await page.goto('/tests/browser/fixture.html');
  await expect(page.getByText('미운행', { exact: true })).toBeVisible();
  release();
  await expect(page.getByRole('status')).toContainText('끊겼습니다');
  await expect(page.getByText('미운행', { exact: true })).toBeVisible();
  await page.clock.fastForward(60000);
  await expect(page.getByText('운행중', { exact: true })).toBeVisible();
});

test('history distinguishes missing distance from a measured zero', async ({ page }) => {
  await page.route('**/api/trip-log?**', route => route.fulfill({ json: {
    tripLogs: [trip, { ...trip, id: 2, tripMeter: 0, distanceStatus: 'KNOWN' }],
    totalPages: 1, totalElements: 2, currentPage: 0, size: 10,
  } }));
  await page.goto('/tests/browser/trip-history-fixture.html');
  await expect(page.getByText('확인 불가', { exact: true })).toBeVisible();
  await expect(page.getByText('0.0 km', { exact: true })).toBeVisible();
});
