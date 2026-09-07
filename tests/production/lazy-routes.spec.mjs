import { test, expect } from '@playwright/test';

const resetChunk = '**/assets/PasswordResetPage-*.js';

test('production login loads its page without statistics and loads reset on navigation', async ({ page }) => {
  const scripts = [];
  const errors = [];
  page.on('request', request => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/login');
  await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
  expect(scripts.some(url => /LoginPage-[^/]+\.js$/.test(url))).toBe(true);
  expect(scripts.some(url => /(?:CompanyStatisticsPage|AdminStatisticsPage|PasswordResetPage)-[^/]+\.js$/.test(url))).toBe(false);
  await page.getByText('비밀번호를 잊으셨나요?').click();
  await expect(page.getByRole('heading', { name: '비밀번호 초기화' })).toBeVisible();
  expect(scripts.some(url => /PasswordResetPage-[^/]+\.js$/.test(url))).toBe(true);
  expect(errors).toEqual([]);
});

test('a delayed production page chunk displays loading and then the requested page', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route(resetChunk, async route => { await gate; await route.continue(); });
  try {
    await page.goto('/login');
    await page.getByText('비밀번호를 잊으셨나요?').click();
    await expect(page.getByRole('status')).toHaveText('화면을 불러오는 중입니다.');
  } finally {
    release();
  }
  await expect(page.getByRole('heading', { name: '비밀번호 초기화' })).toBeVisible();
});

test('a failed production page chunk offers a reload that recovers after connectivity returns', async ({ page }) => {
  let attempts = 0;
  await page.route(resetChunk, async route => {
    attempts += 1;
    if (attempts === 1) await route.abort('failed');
    else await route.continue();
  });
  await page.goto('/login');
  await page.getByText('비밀번호를 잊으셨나요?').click();
  await expect(page.getByRole('alert')).toContainText('화면을 불러오지 못했습니다.');
  await page.getByRole('button', { name: '새로고침', exact: true }).click();
  await expect(page.getByRole('heading', { name: '비밀번호 초기화' })).toBeVisible();
  await expect(page).toHaveURL(/\/password-reset$/);
  expect(attempts).toBeGreaterThanOrEqual(2);
});
