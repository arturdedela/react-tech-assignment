// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "./useWebSocket";

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = [];
  send = vi.fn();
  close = vi.fn();

  constructor(publicUrl: string) {
    super();
    this.url = publicUrl;
    MockWebSocket.instances.push(this);
  }

  readonly url: string;
}

type Message = { text: string };
const messageValidator = (message: unknown): message is Message =>
  typeof message === "object" &&
  message !== null &&
  "text" in message &&
  typeof message.text === "string";
const url = "ws://localhost:1234";

function setup(connect = true) {
  const onMessage = vi.fn();
  const hook = renderHook(
    ({ connect }) => useWebSocket<Message, Message>({ url, connect, messageValidator, onMessage }),
    { initialProps: { connect } },
  );
  return { ...hook, onMessage };
}

function socket() {
  expect(MockWebSocket.instances).toHaveLength(1);
  return MockWebSocket.instances[0]!;
}

describe("useWebSocket", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("closes the connection on unmount and stops handling messages", () => {
    const { unmount, onMessage } = setup();
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));

    unmount();

    expect(connection.close).toHaveBeenCalledTimes(1);
    act(() => connection.dispatchEvent(new MessageEvent("message", { data: '{"text":"late"}' })));
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("moves from closed to connecting to open to closed", () => {
    const { result, rerender } = setup(false);
    expect(result.current.status).toBe("closed");
    expect(MockWebSocket.instances).toHaveLength(0);

    rerender({ connect: true });
    const connection = socket();
    expect(connection.url).toBe(url);
    expect(result.current.status).toBe("connecting");

    act(() => connection.dispatchEvent(new Event("open")));
    expect(result.current.status).toBe("open");

    act(() => connection.dispatchEvent(new Event("close")));
    expect(result.current.status).toBe("closed");
  });

  it("reconnects after disconnection and uses the replacement socket", () => {
    vi.useFakeTimers();
    const { result, onMessage } = setup();
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));

    act(() => connection.dispatchEvent(new Event("close")));
    expect(result.current.status).toBe("closed");
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => vi.runOnlyPendingTimers());
    expect(MockWebSocket.instances).toHaveLength(2);
    const retriedConnection = MockWebSocket.instances[1]!;
    expect(retriedConnection.url).toBe(url);
    expect(result.current.status).toBe("connecting");

    act(() => retriedConnection.dispatchEvent(new Event("open")));
    expect(result.current.status).toBe("open");
    act(() => {
      result.current.send({ text: "hello again" });
      retriedConnection.dispatchEvent(
        new MessageEvent("message", { data: '{"text":"welcome back"}' }),
      );
    });
    expect(retriedConnection.send).toHaveBeenCalledExactlyOnceWith('{"text":"hello again"}');
    expect(connection.send).not.toHaveBeenCalled();
    expect(onMessage).toHaveBeenCalledExactlyOnceWith({ text: "welcome back" });
  });

  it("sends messages as JSON through the open connection", () => {
    const { result } = setup();
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));

    act(() => result.current.send({ text: "hello" }));

    expect(connection.send).toHaveBeenCalledExactlyOnceWith('{"text":"hello"}');
  });

  it("throws when sending before a connection has been created", () => {
    const { result } = setup(false);
    expect(() => result.current.send({ text: "hello" })).toThrow(
      "Websocket not ready. Check status before sending messages.",
    );
  });

  it("passes only valid parsed messages to onMessage", () => {
    const { onMessage } = setup();
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));

    for (const data of ['{"text":42}', "null", '"hello"', "not JSON"]) {
      act(() => connection.dispatchEvent(new MessageEvent("message", { data })));
    }
    expect(onMessage).not.toHaveBeenCalled();

    act(() => connection.dispatchEvent(new MessageEvent("message", { data: '{"text":"hello"}' })));
    expect(onMessage).toHaveBeenCalledExactlyOnceWith({ text: "hello" });
  });

  it("closes an existing connection when connect becomes false", () => {
    const { result, rerender, onMessage } = setup();
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));

    rerender({ connect: false });

    expect(connection.close).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("closed");
    expect(MockWebSocket.instances).toHaveLength(1);
    act(() => {
      connection.dispatchEvent(new Event("open"));
      connection.dispatchEvent(new MessageEvent("message", { data: '{"text":"late"}' }));
    });
    expect(result.current.status).toBe("closed");
    expect(onMessage).not.toHaveBeenCalled();
  });
});
