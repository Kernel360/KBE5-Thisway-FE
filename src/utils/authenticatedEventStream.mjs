// The application closes streams on failure. Reconnect/replay is intentionally
// explicit: replaying historical chunks automatically would duplicate map points.
export function createSseParser(emit, maxEventChars = 1024 * 1024) {
  let pending = "";
  let event = "message";
  let data = [];
  let size = 0;
  const line = (value) => {
    if (value === "") {
      if (data.length) emit({ type: event, data: data.join("\n") });
      event = "message";
      data = [];
      size = 0;
      return;
    }
    size += value.length;
    if (size > maxEventChars) throw new Error("SSE event too large");
    if (value.startsWith(":")) return;
    const colon = value.indexOf(":");
    const field = colon < 0 ? value : value.slice(0, colon);
    let content = colon < 0 ? "" : value.slice(colon + 1);
    if (content.startsWith(" ")) content = content.slice(1);
    if (field === "event") event = content || "message";
    if (field === "data") data.push(content);
  };
  return (text) => {
    pending += text;
    let start = 0;
    for (let i = 0; i < pending.length; i++) {
      if (pending[i] !== "\r" && pending[i] !== "\n") continue;
      if (pending[i] === "\r" && i === pending.length - 1) break;
      line(pending.slice(start, i));
      if (pending[i] === "\r" && pending[i + 1] === "\n") i++;
      start = i + 1;
    }
    pending = pending.slice(start);
    if (size + pending.length > maxEventChars) throw new Error("SSE event too large");
  };
}

export function openAuthenticatedEventStream(url, token, fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const listeners = new Map();
  const source = {
    onopen: null,
    onerror: null,
    onend: null,
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    },
    close() { controller.abort(); },
  };
  source.finished = (async () => {
    let reader;
    try {
      // Defer so callers can attach handlers even for local validation errors.
      await Promise.resolve();
      if (controller.signal.aborted) return;
      if (!token) throw new Error("Authentication required");
      if (!url.startsWith("/api/") || url.includes("?")) throw new Error("Invalid stream URL");
      const response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
        signal: controller.signal,
        redirect: "error",
        cache: "no-store",
      });
      if (!response.ok) {
        const error = new Error(`SSE HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      if (response.headers.get("content-type")?.split(";")[0].trim() !== "text/event-stream") {
        throw new Error("Expected event stream");
      }
      if (!response.body) throw new Error("Missing event stream body");
      reader = response.body.getReader();
      source.onopen?.();
      const parse = createSseParser((event) => {
        if (controller.signal.aborted) return;
        for (const callback of listeners.get(event.type) ?? []) callback(event);
      });
      const decoder = new TextDecoder();
      while (!controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) {
          parse(decoder.decode());
          if (!controller.signal.aborted) source.onend?.();
          break;
        }
        parse(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      if (!controller.signal.aborted) source.onerror?.(error);
    } finally {
      if (reader) {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    }
  })();
  return source;
}
