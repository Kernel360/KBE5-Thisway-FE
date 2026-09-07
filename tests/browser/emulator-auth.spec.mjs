import { test, expect } from '@playwright/test';

const key = `twdev_${'A'.repeat(43)}`;
const csv = 'sec,lon,lat,spd,sum,ang\n0,127,37,0,100,0\n1,127,37,0,101,0';

async function setup(page, rejectKind) {
  const calls = [];
  await page.clock.install();
  await page.route('**/data/gps_scenario/*.csv', route => route.fulfill({ body: csv }));
  await page.route('**/api/logs/*', async route => {
    calls.push({ url: route.request().url(), headers: await route.request().allHeaders(), body: route.request().postDataJSON() });
    await route.fulfill({ status: route.request().url().endsWith(rejectKind || 'none') ? 401 : 200, json: { code: '000' } });
  });
  await page.goto('/tests/browser/emulator.html');
  return calls;
}

async function fill(page) {
  await page.getByLabel('MDN 입력').fill('fixture');
  await page.getByLabel('장치 ID').fill('123');
  await page.getByLabel('장치 키').fill(key);
}

test('requires device credentials before any telemetry request', async ({ page }) => {
  const calls = await setup(page);
  await page.getByRole('button', { name: '시작', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('발급받은 장치 키');
  expect(calls).toHaveLength(0);
});

test('sends headers on ON, GPS and OFF; clears key and completes the last batch', async ({ page }) => {
  const calls = await setup(page);
  await fill(page);
  await page.getByRole('button', { name: '시작', exact: true }).click();
  await expect.poll(() => calls.length).toBe(1);
  await expect(page.getByLabel('장치 키')).toHaveValue('');
  await page.clock.fastForward(1000);
  await expect.poll(() => calls.length).toBe(2);
  await page.clock.fastForward(1000);
  await expect(page.getByRole('button', { name: '시작', exact: true })).toBeVisible();
  expect(calls).toHaveLength(4);
  expect(calls.at(-1).body.offTime).toBeTruthy();
  for (const call of calls) {
    expect(call.headers['x-device-id']).toBe('123');
    expect(call.headers['x-device-key']).toBe(key);
    expect(call.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(call.headers['x-request-timestamp']).toMatch(/^[0-9]{10}$/);
    expect(call.headers.authorization).toBeUndefined();
    expect(call.body.did).toBe('1');
    expect(JSON.stringify(call.body)).not.toContain(key);
  }
  const storage = await page.evaluate(() => JSON.stringify([localStorage, sessionStorage]));
  expect(storage).not.toContain(key);
});

for (const kind of ['power', 'gps']) {
  test(`${kind} authentication failure stops future requests and reports the failure`, async ({ page }) => {
    const calls = await setup(page, kind);
    await fill(page);
    await page.getByRole('button', { name: '시작', exact: true }).click();
    if (kind === 'gps') {
      await expect.poll(() => calls.length).toBe(1);
      await page.clock.fastForward(1000);
    }
    await expect(page.getByRole('alert')).toContainText('장치 인증에 실패');
    await expect(page.getByRole('button', { name: '시작', exact: true })).toBeVisible();
    await expect(page.getByLabel('장치 키')).toHaveValue('');
    const count = calls.length;
    await page.clock.fastForward(10000);
    expect(calls).toHaveLength(count);
  });
}

for (const timezone of ['Asia/Seoul', 'UTC', 'America/Los_Angeles']) {
test.describe(`GPS packet calendar boundaries in ${timezone}`, () => {
  test.use({ timezoneId: timezone });

  for (const [label, start, expectedTimes] of [
    ['hour', '2026-09-01T09:59:58+09:00', ['20260901095958', '20260901095959', '20260901100000', '20260901100001', '20260901100002']],
    ['midnight', '2026-09-01T23:59:58+09:00', ['20260901235958', '20260901235959', '20260902000000', '20260902000001', '20260902000002']],
  ]) {
    test(`${label} crossing is split without changing reconstructed observation times`, async ({ page }) => {
      const calls = [];
      await page.clock.install({ time: new Date(start) });
      const boundaryCsv = 'sec,lon,lat,spd,sum,ang\n' + Array.from({ length: 5 }, (_, i) => `${i},127,37,0,${100 + i},0`).join('\n');
      await page.route('**/data/gps_scenario/*.csv', route => route.fulfill({ body: boundaryCsv }));
      await page.route('**/api/logs/*', async route => {
        calls.push({ url: route.request().url(), headers: await route.request().allHeaders(), body: route.request().postDataJSON() });
        await route.fulfill({ status: 200, json: { code: '000' } });
      });
      await page.goto('/tests/browser/emulator.html');
      await fill(page);
      await page.getByLabel('주기(초) 선택').selectOption('5');
      await page.getByRole('button', { name: '시작', exact: true }).click();
      await expect.poll(() => calls.length).toBe(1);
      await page.clock.fastForward(5000);
      await expect(page.getByRole('button', { name: '시작', exact: true })).toBeVisible();
      const gps = calls.filter(call => call.url.endsWith('/gps'));
      expect(gps).toHaveLength(2);
      expect(gps.map(call => call.body.cCnt)).toEqual(['2', '3']);
      const normalized = gps.flatMap(({ body }) => body.cList.map(entry =>
        body.oTime.slice(0, 10) + entry.min.padStart(2, '0') + entry.sec.padStart(2, '0')));
      expect(normalized).toEqual(expectedTimes);
      expect(new Set(gps.map(call => call.headers['x-request-id'])).size).toBe(2);
      expect(calls.filter(call => call.url.endsWith('/power'))).toHaveLength(2);
      expect(calls[0].body.onTime).toBe(expectedTimes[0]);
    });
  }
});
}
