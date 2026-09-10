import { useState } from "react";
import { WS_BASE_URL } from "../constants";
import {
  type PlaneDetailed,
  type PlaneDetailsMessage,
  type SubscribeMessage,
  isPlaneDetailsMessage,
} from "../types";
import { useWebSocket, type WebSocketStatus } from "./useWebSocket";

type UsePlaneDetailsResult = {
  planeDetails: PlaneDetailed | null;
  status: WebSocketStatus;
  subscribe: (planeId: string) => void;
};

export const usePlaneDetails = (): UsePlaneDetailsResult => {
  const [planeDetails, setPlaneDetails] = useState<PlaneDetailed | null>(null);

  const { status, send } = useWebSocket<PlaneDetailsMessage, SubscribeMessage>({
    url: `${WS_BASE_URL}/ws/planes/details`,
    messageValidator: isPlaneDetailsMessage,
    onMessage: (message) => setPlaneDetails(message.data),
  });

  const subscribe: UsePlaneDetailsResult["subscribe"] = (planeId) => {
    send({ type: "subscribe", planeId });
  };

  return { planeDetails, status, subscribe };
};
