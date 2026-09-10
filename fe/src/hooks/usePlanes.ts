import { useState } from "react";
import { WS_BASE_URL } from "../constants";
import { type PlaneBasic, isPlanesMessage } from "../types";
import { useWebSocket } from "./useWebSocket";

export const usePlanes = () => {
  const [planes, setPlanes] = useState<PlaneBasic[]>([]);

  const { status } = useWebSocket({
    url: `${WS_BASE_URL}/ws/planes/basic`,
    messageValidator: isPlanesMessage,
    onMessage: (message) => setPlanes(message.data),
  });

  return { planes, status };
};
