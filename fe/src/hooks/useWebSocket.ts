import { useEffect, useEffectEvent, useRef, useState } from "react";

export type WebSocketStatus = "connecting" | "closed" | "open" | "error";

type UseWebSocketOptions<TServerMessage> = {
  url: string;
  messageValidator: (message: unknown) => message is TServerMessage;
  onMessage: (message: TServerMessage) => void;
};

type UseWebSocketResult<TClientMessage extends object> = {
  status: WebSocketStatus;
  send: (message: TClientMessage) => void;
};

export const useWebSocket = <
  TServerMessage,
  TClientMessage extends object = never,
>({
  url,
  messageValidator,
  onMessage,
}: UseWebSocketOptions<TServerMessage>): UseWebSocketResult<TClientMessage> => {
  const webSocketRef = useRef<WebSocket>(null);
  const [status, setStatus] = useState<WebSocketStatus>("connecting");

  const onMessageEffect = useEffectEvent(onMessage);

  useEffect(() => {
    const webSocket = new WebSocket(url);
    webSocketRef.current = webSocket;

    const handleOpen = () => {
      setStatus("open");
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
      setStatus("closed");
      console.log("[ws] Closed.");
    };

    webSocket.addEventListener("open", handleOpen);
    webSocket.addEventListener("message", handleMessage);
    webSocket.addEventListener("error", handleError);
    webSocket.addEventListener("close", handleClose);

    return () => {
      webSocket.removeEventListener("open", handleOpen);
      webSocket.removeEventListener("message", handleMessage);
      webSocket.removeEventListener("error", handleError);
      webSocket.removeEventListener("close", handleClose);

      webSocket.close();
    };
  }, [messageValidator, url]);

  const send: UseWebSocketResult<TClientMessage>["send"] = (message) => {
    const webSocket = webSocketRef.current;

    if (!webSocket) {
      console.error("Error sending message. Websocket not ready");
      return;
    }

    webSocket.send(JSON.stringify(message));
  };

  return { status, send };
};
