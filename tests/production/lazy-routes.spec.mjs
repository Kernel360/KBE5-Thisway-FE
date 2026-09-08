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

function fixtureToken(payload) {
  return `fixture.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.fixture`;
}

test('a MEMBER returning to login reaches the configured member route and can log out by keyboard', async ({ page }) => {
  const token = fixtureToken({ sub: 'fixture@example.test', roles: ['MEMBER'], exp: Math.floor(Date.now()/1000)+600 });
  await page.addInitScript(value => localStorage.setItem('token',value),token);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/member\/dashboard$/);
  await expect(page.getByText('내 대시보드 (준비 중)')).toBeVisible();
  const menu = page.getByRole('button', {name:'계정 메뉴'});
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded','true');
  const logout = page.getByRole('button', {name:'로그아웃',exact:true});
  await logout.focus(); await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await page.keyboard.press('Enter'); await page.getByRole('button',{name:'로그아웃',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/login$/);
});

for (const [name,payload] of [
  ['expired', {roles:['MEMBER'],exp:1}],
  ['missing roles', {exp:Math.floor(Date.now()/1000)+600}],
  ['invalid expiry', {roles:['MEMBER'],exp:'invalid'}],
]) test(`${name} session stays on a usable login form`, async ({page}) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(value=>localStorage.setItem('token',value),fixtureToken(payload));
  await page.goto('/login');
  await expect(page.getByLabel('이메일',{exact:true})).toBeVisible();
  await expect(page.getByLabel('비밀번호',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'비밀번호를 잊으셨나요?'}).click();
  await expect(page).toHaveURL(/\/password-reset$/);
  expect(errors).toEqual([]);
});

test('an unknown URL has a working recovery link on a narrow screen', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading',{name:'페이지를 찾을 수 없습니다'})).toBeVisible();
  await page.getByRole('link',{name:'시작 화면으로 이동'}).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
