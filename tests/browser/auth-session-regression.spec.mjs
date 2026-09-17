import { test, expect } from '@playwright/test';

function tokenFor(subject) {
  return `fixture.${Buffer.from(JSON.stringify({
    sub: subject, companyId: 1, companyName: '테스트 회사 🚚',
    roles: ['MEMBER'], exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url')}.fixture`;
}

async function seedSession(page, token) {
  await page.evaluate(async value => {
    const { default: useUserStore } = await import('/src/store/userStore.js');
    localStorage.setItem('token', value);
    useUserStore.getState().setToken(value);
  }, token);
}

async function sessionState(page) {
  return page.evaluate(async () => {
    const { default: useUserStore } = await import('/src/store/userStore.js');
    return { stored: localStorage.getItem('token'), token: useUserStore.getState().token,
      user: useUserStore.getState().user };
  });
}

test('403 preserves the session and the next permitted request still sends its token', async ({ page }) => {
  const token = tokenFor('member@example.test');
  await page.route('**/api/session-denied', route => route.fulfill({ status: 403, json: {} }));
  let nextAuthorization;
  await page.route('**/api/session-permitted', route => {
    nextAuthorization = route.request().headers().authorization;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto('/login');
  await expect(page.getByLabel('이메일', { exact: true })).toBeVisible();
  await seedSession(page, token);
  const result = await page.evaluate(async () => {
    const { authApi } = await import('/src/utils/api.js');
    const deniedStatus = await authApi.get('/session-denied').catch(error => error.response.status);
    const permitted = await authApi.get('/session-permitted');
    return { deniedStatus, permitted: permitted.data.ok };
  });
  expect(result).toEqual({ deniedStatus: 403, permitted: true });
  expect(nextAuthorization).toBe(`Bearer ${token}`);
  expect(await sessionState(page)).toMatchObject({ stored: token, token, user: { sub: 'member@example.test' } });
});

test('401 for the current session clears both browser storage and user state', async ({ page }) => {
  await page.route('**/api/session-expired', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/login');
  await expect(page.getByLabel('이메일', { exact: true })).toBeVisible();
  await seedSession(page, tokenFor('expired@example.test'));
  const status = await page.evaluate(async () => {
    const { authApi } = await import('/src/utils/api.js');
    return authApi.get('/session-expired').catch(error => error.response.status);
  });
  expect(status).toBe(401);
  expect(await sessionState(page)).toEqual({ stored: null, token: null, user: null });
});

test('a delayed 401 for an earlier token cannot clear the replacement session', async ({ page }) => {
  let releaseResponse;
  const responseGate = new Promise(resolve => { releaseResponse = resolve; });
  await page.route('**/api/session-old', async route => {
    await responseGate;
    await route.fulfill({ status: 401, json: {} });
  });
  await page.goto('/login');
  await expect(page.getByLabel('이메일', { exact: true })).toBeVisible();
  await seedSession(page, tokenFor('old@example.test'));
  const requestStarted = page.waitForRequest('**/api/session-old');
  await page.evaluate(async () => {
    const { authApi } = await import('/src/utils/api.js');
    window.sessionOldRequest = authApi.get('/session-old').catch(error => error.response.status);
  });
  await requestStarted;
  const replacement = tokenFor('new@example.test');
  await seedSession(page, replacement);
  releaseResponse();
  expect(await page.evaluate(() => window.sessionOldRequest)).toBe(401);
  expect(await sessionState(page)).toMatchObject({ stored: replacement, token: replacement,
    user: { sub: 'new@example.test' } });
});

test('the actual sidebar preserves a UTF-8 subject from a base64url JWT', async ({ page }) => {
  const subject = '테스트담당자🚚@example.test';
  const token = tokenFor(subject);
  await page.addInitScript(value => localStorage.setItem('token', value), token);
  await page.goto('/member/dashboard');
  await expect(page.getByRole('button', { name: '계정 메뉴' })).toContainText(subject);
  expect(await sessionState(page)).toMatchObject({ stored: token, token,
    user: { sub: subject, companyName: '테스트 회사 🚚' } });
});
