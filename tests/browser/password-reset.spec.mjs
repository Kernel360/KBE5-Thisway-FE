import { test, expect } from '@playwright/test';

const email = 'reset@example.test';
const password = 'NewPassword1!';
const emailInput = page => page.getByPlaceholder('user@example.com');
const codeInput = page => page.getByPlaceholder('인증번호 6자리 입력');
const sendButton = page => page.getByRole('button', { name: /인증 요청|다시 발송|발송 중/ });
const resetButton = page => page.getByRole('button', { name: /비밀번호 변경|변경 중/ });

async function start(page) {
  await page.goto('/password-reset');
  await emailInput(page).fill(email);
}

async function sendCode(page) {
  await page.route('**/api/auth/verify-code', route => route.fulfill({ status: 200, body: '' }));
  await start(page);
  await sendButton(page).click();
  await expect(codeInput(page)).toBeEnabled();
}

async function fillReset(page, value = password) {
  await codeInput(page).fill('123456');
  await page.getByPlaceholder('새 비밀번호를 입력하세요').fill(value);
  await page.getByPlaceholder('비밀번호 재입력').fill(value);
}

test('resend becomes available after the cooldown and an expired code cannot reset a password', async ({ page }) => {
  await page.clock.install();
  await sendCode(page);
  await fillReset(page);
  await expect(sendButton(page)).toBeDisabled();
  await page.clock.fastForward(60000);
  await expect(sendButton(page)).toBeEnabled();
  await page.clock.fastForward(540000);
  await expect(resetButton(page)).toBeDisabled();
  await expect(page.getByText('인증 코드가 만료되었습니다. 새 코드를 요청해 주세요.')).toBeVisible();
  await sendButton(page).click();
  await expect(codeInput(page)).toHaveValue('');
  await expect(codeInput(page)).toBeEnabled();
});

test('duplicate send clicks produce one request while the response is pending', async ({ page }) => {
  let sent = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/auth/verify-code', async route => {
    sent += 1;
    await gate;
    await route.fulfill({ status: 200, body: '' });
  });
  await start(page);
  try {
    await sendButton(page).evaluate(button => { button.click(); button.click(); });
    await expect.poll(() => sent).toBe(1);
    await expect(sendButton(page)).toBeDisabled();
    await expect(emailInput(page)).toBeDisabled();
  } finally { release(); }
  await expect(codeInput(page)).toBeEnabled();
  expect(sent).toBe(1);
});

test('a delayed send response does not restart the full ten-minute validity window', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-12T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-12T00:01:00Z'));
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/auth/verify-code', async route => {
    await gate;
    await route.fulfill({ status: 200, body: '' });
  });
  await start(page);
  const requestStarted = page.waitForRequest('**/api/auth/verify-code');
  await sendButton(page).click();
  await requestStarted;
  await page.clock.fastForward(7000);
  release();
  await expect(codeInput(page)).toBeEnabled();
  await expect(page.getByRole('timer', { name: '인증 코드 남은 시간' })).toHaveText('09:53');
  await page.clock.fastForward(593000);
  await expect(codeInput(page)).toBeDisabled();
  await expect(page.getByText('인증 코드가 만료되었습니다. 새 코드를 요청해 주세요.')).toBeVisible();
});

test('editing the email invalidates its old code and requires a new send', async ({ page }) => {
  await sendCode(page);
  await fillReset(page);
  await emailInput(page).fill('another@example.test');
  await expect(codeInput(page)).toBeDisabled();
  await expect(codeInput(page)).toHaveValue('');
  await expect(resetButton(page)).toBeDisabled();
  await expect(page.getByPlaceholder('새 비밀번호를 입력하세요')).toHaveValue(password);
  await expect(sendButton(page)).toBeEnabled();
});

test('password rules are validated before sending a reset request', async ({ page }) => {
  let resets = 0;
  await page.route('**/api/auth/password', route => { resets += 1; return route.fulfill({ status: 200, body: '' }); });
  await sendCode(page);
  for (const invalid of ['short1!', 'OnlyLetters!', 'NoSpecial123', 'Password1?', 'A'.repeat(20) + '1!']) {
    await fillReset(page, invalid);
    await expect(resetButton(page)).toBeDisabled();
    await expect(page.getByText('영문, 숫자, 특수문자(!@#$%^&*)를 각각 포함한 8~20자로 입력해 주세요.')).toBeVisible();
  }
  expect(resets).toBe(0);
});

test('wrong-code and password-validation responses have different guidance and preserve input', async ({ page }) => {
  let errorCode = '13000';
  await page.route('**/api/auth/password', route => route.fulfill({ status: 400, json: { code: errorCode } }));
  await sendCode(page);
  await fillReset(page);
  await resetButton(page).click();
  await expect(page.getByRole('alert')).toContainText('인증 코드가 올바르지 않거나 만료되었습니다.');
  await expect(codeInput(page)).toHaveValue('123456');
  await expect(page.getByPlaceholder('새 비밀번호를 입력하세요')).toHaveValue(password);
  errorCode = '12005';
  await resetButton(page).click();
  await expect(page.getByRole('alert')).toContainText('비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)를 각각 포함한 8~20자여야 합니다.');
});

test('send rate limiting is visible without claiming that a code was sent', async ({ page }) => {
  await page.route('**/api/auth/verify-code', route => route.fulfill({ status: 429, json: { code: '13006' } }));
  await start(page);
  await sendButton(page).click();
  await expect(page.getByRole('alert')).toContainText('인증 코드 발송 요청이 제한되었습니다.');
  await expect(codeInput(page)).toBeDisabled();
  await expect(emailInput(page)).toHaveValue(email);
  await expect(page.getByText(`${email}로 인증 코드를 보냈습니다.`)).toHaveCount(0);
});

test('too many verification attempts require a new code while keeping password inputs', async ({ page }) => {
  await page.route('**/api/auth/password', route => route.fulfill({ status: 429, json: { code: '13006' } }));
  await sendCode(page);
  await fillReset(page);
  await resetButton(page).click();
  await expect(page.getByRole('alert')).toContainText('인증 시도 한도에 도달했습니다. 새 인증 코드를 요청해 주세요.');
  await expect(resetButton(page)).toBeDisabled();
  await expect(page.getByPlaceholder('새 비밀번호를 입력하세요')).toHaveValue(password);
});

for (const failure of ['network', 'server']) {
  test(`${failure} reset failure preserves inputs and requires a fresh code on the same page`, async ({ page }) => {
    await page.route('**/api/auth/password', route => failure === 'network'
      ? route.abort('failed') : route.fulfill({ status: 500, json: { code: 'INTERNAL_SERVER_ERROR' } }));
    await sendCode(page);
    await fillReset(page);
    await resetButton(page).click();
    await expect(page.getByRole('alert')).toContainText('새 인증 코드를 요청해 다시 시도해 주세요.');
    await expect(page).toHaveURL(/\/password-reset$/);
    await expect(emailInput(page)).toHaveValue(email);
    await expect(codeInput(page)).toHaveValue('123456');
    await expect(page.getByPlaceholder('새 비밀번호를 입력하세요')).toHaveValue(password);
    await expect(page.getByPlaceholder('비밀번호 재입력')).toHaveValue(password);
    await expect(resetButton(page)).toBeDisabled();
  });
}

test('duplicate reset clicks submit once with the issued email and reach success', async ({ page }) => {
  const bodies = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/auth/password', async route => {
    bodies.push(route.request().postDataJSON());
    await gate;
    await route.fulfill({ status: 200, body: '' });
  });
  await sendCode(page);
  await fillReset(page);
  try {
    await resetButton(page).evaluate(button => { button.click(); button.click(); });
    await expect.poll(() => bodies.length).toBe(1);
    await expect(resetButton(page)).toBeDisabled();
  } finally { release(); }
  await expect(page.getByRole('heading', { name: '비밀번호 변경 완료' })).toBeVisible();
  expect(bodies).toEqual([{ email, code: '123456', newPassword: password }]);
});
