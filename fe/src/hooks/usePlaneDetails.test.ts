// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WS_BASE_URL } from "../constants";
import { usePlaneDetails } from "./usePlaneDetails";

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = [];
  readonly url: string;
  send = vi.fn();
  close = vi.fn();

  constructor(url: string) {
    super();
    this.url = url;
    MockWebSocket.instances.push(this);
  }
}

function setup(planeId: string | null) {
  return renderHook(({ planeId }) => usePlaneDetails({ planeId }), {
    initialProps: { planeId },
  });
}

function socket() {
  expect(MockWebSocket.instances).toHaveLength(1);
  return MockWebSocket.instances[0]!;
}

describe("usePlaneDetails", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a subscribe message only after the connection opens", () => {
    const { result, rerender } = setup("plane-1");
    const connection = socket();
    expect(connection.url).toBe(`${WS_BASE_URL}/ws/planes/details`);
    expect(result.current.status).toBe("connecting");
    expect(connection.send).not.toHaveBeenCalled();

    rerender({ planeId: "plane-2" });
    expect(connection.send).not.toHaveBeenCalled();

    act(() => connection.dispatchEvent(new Event("open")));

    expect(result.current.status).toBe("open");
    expect(connection.send).toHaveBeenCalledExactlyOnceWith(
      JSON.stringify({ type: "subscribe", planeId: "plane-2" }),
    );
  });

  it("reuses the same connection when switching plane IDs", () => {
    const { rerender } = setup("plane-1");
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));

    rerender({ planeId: "plane-2" });

    expect(socket()).toBe(connection);
    expect(connection.close).not.toHaveBeenCalled();
    expect(connection.send).toHaveBeenCalledTimes(2);
    expect(connection.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({ type: "subscribe", planeId: "plane-1" }),
    );
    expect(connection.send).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({ type: "subscribe", planeId: "plane-2" }),
    );

    rerender({ planeId: "plane-2" });
    expect(socket()).toBe(connection);
    expect(connection.send).toHaveBeenCalledTimes(2);
  });

  it("closes the connection when the plane ID becomes null", () => {
    const { result, rerender } = setup("plane-1");
    const connection = socket();
    act(() => connection.dispatchEvent(new Event("open")));
    expect(result.current.status).toBe("open");
    expect(connection.send).toHaveBeenCalledTimes(1);

    rerender({ planeId: null });

    expect(connection.close).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("closed");
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(connection.send).toHaveBeenCalledTimes(1);
  });
});
