import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

export type WebSocketStatus = "connecting" | "closed" | "open" | "error";

type UseWebSocketOptions<TServerMessage> = {
  url: string;
  connect?: boolean;
  messageValidator: (message: unknown) => message is TServerMessage;
  onMessage: (message: TServerMessage) => void;
};

type UseWebSocketResult<TClientMessage extends object> = {
  status: WebSocketStatus;
  send: (message: TClientMessage) => void;
};

export const useWebSocket = <TServerMessage, TClientMessage extends object = never>({
  url,
  connect = true,
  messageValidator,
  onMessage,
}: UseWebSocketOptions<TServerMessage>): UseWebSocketResult<TClientMessage> => {
  const webSocketRef = useRef<WebSocket>(null);
  const [status, setStatus] = useState<WebSocketStatus>(connect ? "connecting" : "closed");

  const onMessageEffect = useEffectEvent(onMessage);

  useEffect(() => {
    if (!connect) {
      setStatus("closed");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let webSocket: WebSocket | null = null;
    let cleanupSocket = () => {};

    const openSocket = () => {
      if (cancelled) {
        return;
      }

      attempts += 1;

      webSocket = new WebSocket(url);
      webSocketRef.current = webSocket;
      setStatus("connecting");

      const handleOpen = () => {
        setStatus("open");
        attempts = 0;
        console.log(`[ws] Connection opened to "${url}"`);
      };

      const handleMessage = (event: MessageEvent) => {
        try {
          const message: unknown = JSON.parse(event.data);

          // TODO: Error messages?
          if (messageValidator(message)) {
            onMessageEffect(message);
          } else {
            console.warn("Received not supported message: ", message);
          }
        } catch (err) {
          console.error("Error parsing socket message: ", err);
        }
      };

      const handleError = (error: Event) => {
        setStatus("error");
        console.error("[ws] Error:", error);
      };

      const handleClose = () => {
        // After error socket always triggers closed.
        setStatus((prevStatus) => (prevStatus === "error" ? "error" : "closed"));
        console.log("[ws] Closed.");

        retryTimer = setTimeout(openSocket, 1000 * attempts);
      };

      webSocket.addEventListener("open", handleOpen);
      webSocket.addEventListener("message", handleMessage);
      webSocket.addEventListener("error", handleError);
      webSocket.addEventListener("close", handleClose);

      cleanupSocket = () => {
        webSocket?.removeEventListener("open", handleOpen);
        webSocket?.removeEventListener("message", handleMessage);
        webSocket?.removeEventListener("error", handleError);
        webSocket?.removeEventListener("close", handleClose);

        webSocket?.close();
      };
    };

    openSocket();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);

      cleanupSocket();

      webSocketRef.current = null;
    };
  }, [messageValidator, url, connect]);

  const send: UseWebSocketResult<TClientMessage>["send"] = useCallback((message) => {
    const webSocket = webSocketRef.current;

    if (!webSocket) {
      throw new Error("Websocket not ready. Check status before sending messages.");
    }

    webSocket.send(JSON.stringify(message));
  }, []);

  return { status, send };
};
