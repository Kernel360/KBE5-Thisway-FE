import { test } from "node:test";
import assert from "node:assert/strict";
import { createSseParser, openAuthenticatedEventStream } from "./authenticatedEventStream.mjs";

test("immediate unmount prevents a request; query token URLs are rejected", async () => {
  let calls = 0;
  const fetchMock = async () => { calls++; };
  const closed = openAuthenticatedEventStream("/api/stream", "token", fetchMock);
  closed.close();
  await closed.finished;
  const invalid = openAuthenticatedEventStream("/api/stream?token=secret", "token", fetchMock);
  let error;
  invalid.onerror = e => { error = e; };
  await invalid.finished;
  assert.equal(calls, 0);
  assert.match(error.message, /Invalid stream URL/);
});

test("fragmented CRLF, multiline data, comments and event names", () => {
  const events = [];
  const parse = createSseParser(e => events.push(e));
  for (const char of ": heartbeat\r\nevent: gps\r\ndata: first\r\ndata: second\r\n\r\nevent: done\ndata: complete\n\n") parse(char);
  assert.deepEqual(events, [{ type: "gps", data: "first\nsecond" }, { type: "done", data: "complete" }]);
});

test("unterminated events are not dispatched; oversize input is rejected", () => {
  const events = [];
  const parse = createSseParser(e => events.push(e), 30);
  parse("data: partial\n");
  assert.equal(events.length, 0);
  assert.throws(() => parse("a".repeat(31)), /too large/);
});

test("JWT travels only in header and split UTF8 is decoded correctly", async () => {
  let request;
  const bytes = new TextEncoder().encode("event: gps\ndata: 서울\n\n");
  const fetchMock = async (url, options) => {
    request = { url, options };
    return new Response(new ReadableStream({ start(c) {
      for (const byte of bytes) c.enqueue(new Uint8Array([byte]));
      c.close();
    } }), { headers: { "content-type": "text/event-stream;charset=UTF-8" } });
  };
  const stream = openAuthenticatedEventStream("/api/trip-log/detail/stream/1", "test-token", fetchMock);
  const events = [];
  stream.addEventListener("gps", e => events.push(e.data));
  await stream.finished;
  assert.deepEqual(events, ["서울"]);
  assert.equal(request.options.headers.Authorization, "Bearer test-token");
  assert.equal(request.url.includes("test-token"), false);
});

test("401 and incorrect content type report errors", async () => {
  for (const response of [new Response("", { status: 401 }), new Response("html")]) {
    const stream = openAuthenticatedEventStream("/api/stream", "token", async () => response);
    let error;
    stream.onerror = e => { error = e; };
    await stream.finished;
    assert.ok(error instanceof Error);
  }
});

test("close aborts the request without reporting an authentication error", async () => {
  let signal;
  const stream = openAuthenticatedEventStream("/api/stream", "token", async (_, options) => {
    signal = options.signal;
    return new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("aborted")));
    });
  });
  let errors = 0;
  stream.onerror = () => errors++;
  await Promise.resolve();
  stream.close();
  await stream.finished;
  assert.equal(signal.aborted, true);
  assert.equal(errors, 0);
});

test("EOF reports end after events, while explicit close suppresses end", async () => {
  const response = () => new Response("event: done\ndata: complete\n\n", {
    headers: { "content-type": "text/event-stream" },
  });
  const seen = [];
  const stream = openAuthenticatedEventStream("/api/stream", "token", async () => response());
  stream.addEventListener("done", () => seen.push("done"));
  stream.onend = () => seen.push("end");
  await stream.finished;
  assert.deepEqual(seen, ["done", "end"]);
  const closed = openAuthenticatedEventStream("/api/stream", "token", async () => response());
  closed.addEventListener("done", () => closed.close());
  closed.onend = () => assert.fail("closed stream must not report EOF");
  await closed.finished;
});

test("HTTP status is available for authentication and ownership recovery policies", async () => {
  for (const status of [401, 403, 404, 503]) {
    const stream = openAuthenticatedEventStream("/api/stream", "token",
      async () => new Response("", { status }));
    let received;
    stream.onerror = error => { received = error.status; };
    await stream.finished;
    assert.equal(received, status);
  }
});
