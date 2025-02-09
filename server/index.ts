import express from "express";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer, Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);
const port = 3000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../dist/index.html"));
  });
}

app.get("/api/test", (req, res) => {
  res
    .status(200)
    .send(
      "Pokem ipsum dolor sit amet Porygon2 Emolga Herdier Chansey Kecleon Munna."
    );
});

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // delete gameState.players[socket.id];
    // delete playerInputs[socket.id];
    // io.emit("stateUpdate", { tick: currentTick, gameState });
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
