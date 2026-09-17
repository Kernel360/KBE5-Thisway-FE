import { test, expect } from '@playwright/test';

test('login and password-reset navigation work after dependency migration', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/login');
  await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
  await page.getByText('비밀번호를 잊으셨나요?').click();
  await expect(page).toHaveURL(/\/password-reset$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();
  expect(errors).toEqual([]);
});

test('unauthenticated protected-route access returns to login', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/company/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
});

test('Axios login failure preserves the 401 guidance', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/login');
  await page.getByPlaceholder('이메일을 입력하세요').fill('fixture@example.test');
  await page.getByPlaceholder('비밀번호를 입력하세요').fill('fixture-password');
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다. 다시 시도해 주세요.')).toBeVisible();
});

test('login does not print token and no token-debug global is exposed', async ({ page }) => {
  const token = 'fixture-sensitive-token';
  const output = [];
  page.on('console', message => output.push(message.text()));
  await page.addInitScript(value => localStorage.setItem('token', value), token);
  await page.goto('/login');
  await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
  expect(output.join('\n')).not.toContain(token);
  expect(await page.evaluate(() => typeof window.checkToken)).toBe('undefined');
  expect(await page.evaluate(() => typeof window.clearToken)).toBe('undefined');
});
