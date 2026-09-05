// Invoked by BE sseBrowserTest against a real Boot server behind isolated nginx.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(process.env.SSE_TEST_URL);
  const result = await page.evaluate(async ({ token, foreignToken, vehicle, idleTimeout }) => {
    const { openAuthenticatedEventStream } = await import('/adapter.js');
    const url = `/api/trip-log/current/stream/${vehicle}`;
    const denied = await fetch(url);
    const foreign = await fetch(url, { headers: { Authorization: `Bearer ${foreignToken}` } });
    const receive = (waitForDisconnect = false) => new Promise((resolve, reject) => {
      const stream = openAuthenticatedEventStream(url, token);
      let received;
      const timeout = setTimeout(() => { stream.close(); reject(new Error('live event timeout')); }, 10000);
      const disconnected = async error => {
        clearTimeout(timeout);
        stream.close();
        // Do not await finished inside onerror/onend: they run in the read loop.
        if (waitForDisconnect && received === 'fixture') resolve(received);
        else reject(error ?? new Error('unexpected EOF'));
      };
      stream.onerror = disconnected;
      stream.onend = () => disconnected();
      stream.addEventListener('vehicle_detail_gps_stream', async event => {
        received = event.data;
        if (waitForDisconnect) return;
        stream.close();
        clearTimeout(timeout);
        await stream.finished;
        resolve(event.data);
      });
    });
    return { unauthorized: denied.status, foreign: foreign.status,
      first: await receive(idleTimeout), reconnected: await receive() };
  }, { token: process.env.SSE_TEST_TOKEN, foreignToken: process.env.SSE_TEST_FOREIGN_TOKEN,
    vehicle: process.env.SSE_TEST_VEHICLE, idleTimeout: process.env.SSE_TEST_IDLE_TIMEOUT === 'true' });
  assert.deepEqual(result, { unauthorized: 401, foreign: 404, first: 'fixture', reconnected: 'fixture' });
  console.log(`Boot/nginx/Chromium: 401, tenant 404, live and reconnect verified; idleTimeout=${process.env.SSE_TEST_IDLE_TIMEOUT}`);
} finally {
  await browser.close();
}
