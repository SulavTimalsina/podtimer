const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    let state;

    try {
      state = JSON.parse(message);
    } catch {
      return;
    }

    const payload = JSON.stringify({
      timeLeft: state.timeLeft,
      running: state.running,
      segmentName: state.segmentName,
      total: state.total
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

server.listen(PORT, () => {
  console.log(`Podtimer running at http://localhost:${PORT}`);
});
