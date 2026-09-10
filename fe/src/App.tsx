import { useEffect, useState } from "react";
import { PlanesMap } from "./components/PlanesMap";
import { isPlanesMessage, type PlaneBasic } from "./types";

function App() {
  const [planes, setPlanes] = useState<PlaneBasic[]>([]);

  useEffect(() => {
    const allPlanesSocket = new WebSocket("ws://localhost:4000/ws/planes/basic");

    allPlanesSocket.addEventListener("open", (ev) => {
      console.log("[ws] WebSocket opened", ev);
    });

    allPlanesSocket.addEventListener("message", (event) => {
      try {
        const message: unknown = JSON.parse(event.data);

        if (isPlanesMessage(message)) {
          setPlanes(message.data);
        } else {
          console.warn("Received not supported message");
        }
      } catch (err) {
        console.error("Error parsing socket message: ", err);
      }
    });

    allPlanesSocket.addEventListener("error", (error) => {
      console.error("[ws] Error: ", error);
    });

    allPlanesSocket.addEventListener("close", (ev) => {
      console.log("[ws] Close", ev);
    });
  }, []);

  return <PlanesMap planes={planes} />;
}

export default App;
