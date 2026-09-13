import { test, expect } from '@playwright/test';

const vehicle = (id, lat, lng) => ({
  vehicleId: id, carNumber: `fixture-car-${id}`, powerOn: true, lat, lng, angle: 0,
});
const summary = { totalVehicles: 2, powerOnVehicles: 2, powerOffVehicles: 0 };
const track = vehicles => ({ vehicles,
  pageInfo: { currentPage: 0, totalPages: 1, totalElements: vehicles.length, size: 10 },
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('token', 'dashboard-fixture-token'));
});

test('selecting a vehicle settles and the next poll follows its updated position', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  let moved = false;
  await page.route('**/api/vehicles/dashboard', route => route.fulfill({ json: summary }));
  await page.route('**/api/vehicles/track?**', route => route.fulfill({ json: track([
    vehicle(1, 37.5, 127), vehicle(2, moved ? 37.7 : 37.6, 127.1),
  ]) }));
  await page.goto('/tests/browser/dashboard-fixture.html');
  await expect(page.getByTestId('dashboard-map-center')).toHaveText('37.5,127');
  await page.getByText('fixture-car-2', { exact: true }).click();
  await expect(page.getByTestId('dashboard-map-center')).toHaveText('37.6,127.1');
  moved = true;
  await page.clock.fastForward(10000);
  await expect(page.getByTestId('dashboard-map-center')).toHaveText('37.7,127.1');
  expect(errors).toEqual([]);
});

test('a temporary summary and track error recovers on the next successful poll', async ({ page }) => {
  await page.clock.install();
  let failed = true;
  await page.route('**/api/vehicles/dashboard', route => failed
    ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ json: summary }));
  await page.route('**/api/vehicles/track?**', route => failed
    ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ json: track([vehicle(1, 37.5, 127)]) }));
  await page.goto('/tests/browser/dashboard-fixture.html');
  await expect(page.getByText('데이터를 불러오지 못했습니다.')).toBeVisible();
  failed = false;
  await page.clock.fastForward(10000);
  await expect(page.getByRole('heading', { name: '운영 현황', exact: true })).toBeVisible();
  await expect(page.getByText('fixture-car-1', { exact: true })).toBeVisible();
  await expect(page.getByText('데이터를 불러오지 못했습니다.')).toHaveCount(0);
  await expect(page.getByText('차량 목록을 불러오지 못했습니다.')).toHaveCount(0);
});
