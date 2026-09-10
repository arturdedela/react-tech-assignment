import { useState } from "react";
import { PlanesMap } from "./components/Map/PlanesMap";
import { isPlanesMessage, type PlaneBasic } from "./types";
import { useWebSocket } from "./hooks/useWebSocket";
import { StatusPanel } from "./components/StatusPanel/StatusPanel";
import { WS_BASE_URL } from "./constants";

function App() {
  const [planes, setPlanes] = useState<PlaneBasic[]>();

  const { status } = useWebSocket({
    url: `${WS_BASE_URL}/ws/planes/basic`,
    messageValidator: isPlanesMessage,
    onMessage: (message) => setPlanes(message.data),
  });

  return (
    <>
      <PlanesMap planes={planes} />
      <StatusPanel
        connections={[{ label: "Aircraft positions", status: status }]}
      />
    </>
  );
}

export default App;
