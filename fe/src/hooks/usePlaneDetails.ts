import { useEffect, useState } from "react";
import { WS_BASE_URL } from "../constants";
import {
  type PlaneDetailed,
  type PlaneDetailsMessage,
  type SubscribeMessage,
  isPlaneDetailsMessage,
} from "../types";
import { useWebSocket, type WebSocketStatus } from "./useWebSocket";

type UsePlaneDetailsOptions = {
  planeId: string | null;
};

type UsePlaneDetailsResult = {
  planeDetails: PlaneDetailed | null;
  status: WebSocketStatus;
};

export const usePlaneDetails = ({ planeId }: UsePlaneDetailsOptions): UsePlaneDetailsResult => {
  const [planeDetails, setPlaneDetails] = useState<PlaneDetailed | null>(null);

  const { status, send } = useWebSocket<PlaneDetailsMessage, SubscribeMessage>({
    url: `${WS_BASE_URL}/ws/planes/details`,
    connect: planeId !== null,
    messageValidator: isPlaneDetailsMessage,
    onMessage: (message) => setPlaneDetails(message.data),
  });

  const isConnected = status === "open";

  useEffect(() => {
    if (!planeId || !isConnected) {
      return;
    }

    send({ type: "subscribe", planeId });
  }, [planeId, isConnected, send]);

  return { planeDetails, status };
};
