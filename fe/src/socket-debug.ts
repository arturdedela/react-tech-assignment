const apiSocket = new WebSocket("ws://localhost:4000");

apiSocket.addEventListener("open", (ev) => {
  console.log("[ws] WebSocket opened", ev);
});

apiSocket.addEventListener("message", (ev) => {
  console.log("[ws] Message: ", ev);
});

apiSocket.addEventListener("error", (error) => {
  console.error("[ws] Error: ", error);
});

apiSocket.addEventListener("close", (ev) => {
  console.log("[ws] Close", ev);
});
