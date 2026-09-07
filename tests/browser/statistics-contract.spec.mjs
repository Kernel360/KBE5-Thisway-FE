import { test, expect } from '@playwright/test';

const values = { powerOnCount: 5, averageDailyPowerCount: 5, totalDrivingTime: 300,
  averageOperationRate: 10.41667, peakHour: 9, peakHourRate: 75, lowHour: 0, lowHourRate: 25,
  hours: Array(24).fill(0), locationStats: [] };

async function openStatistics(page, payload) {
  await page.addInitScript(() => localStorage.setItem('token', `fixture.${btoa(JSON.stringify({ companyId: 1 }))}.fixture`));
  await page.route('**/api/statistics?**', route => route.fulfill({ json: payload }));
  await page.goto('/tests/browser/statistics-fixture.html');
}

test('completed-trip time, GPS observations and incomplete coverage are separate', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openStatistics(page, { ...values, quality: { formulaVersion: 2, coveredDays: 1, requestedDays: 3,
    excludedLegacyDays: 1, gpsObservationCount: 7, unclosedTripDays: 2, fleetBasis: 'INITIAL_CALCULATION_FLEET_SNAPSHOT' } });
  await expect(page.getByText('5시간 0분', { exact: true })).toBeVisible();
  await expect(page.getByText('10.4%', { exact: true })).toBeVisible();
  await expect(page.getByText(/새 기준 집계 1\/3일/)).toBeVisible();
  await expect(page.getByText(/저장된 GPS 관측: 7건/)).toBeVisible();
  await expect(page.getByText(/최초 집계 당시 기록한 활성 차량 수/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('unknown historical fleet is not labeled as a current or frozen fleet', async ({ page }) => {
  await openStatistics(page, { ...values, quality: { formulaVersion: 2, coveredDays: 1, requestedDays: 1,
    excludedLegacyDays: 0, gpsObservationCount: 7, unclosedTripDays: 0, fleetBasis: 'LEGACY_FLEET_SNAPSHOT_UNKNOWN' } });
  await expect(page.getByText(/과거 통계의 기준 차량 수를 확인할 수 없습니다/)).toBeVisible();
  await expect(page.getByText(/최초 집계 당시/)).toHaveCount(0);
});

test('legacy server numbers are not silently shown as the new formula', async ({ page }) => {
  await openStatistics(page, values);
  await expect(page.getByText(/새 기준으로 재집계가 필요/)).toBeVisible();
  await expect(page.getByText('10.4%', { exact: true })).toHaveCount(0);
  await expect(page.getByText('5시간 0분', { exact: true })).toHaveCount(0);
});

test('zero covered days are unknown, not a zero-operation claim', async ({ page }) => {
  await openStatistics(page, { ...values, quality: { formulaVersion: 2, coveredDays: 0, requestedDays: 3,
    excludedLegacyDays: 0, gpsObservationCount: 0, unclosedTripDays: 0 } });
  await expect(page.getByText(/새 기준 집계 0\/3일/)).toBeVisible();
  await expect(page.getByText('10.4%', { exact: true })).toHaveCount(0);
});
