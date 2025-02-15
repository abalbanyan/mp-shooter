import express from "express";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer, Socket } from "socket.io";

import type { IOMessageInput, IOMessageStateUpdate } from "../game/types";
import { context } from "./context";
import { actOnInput, movePlayer } from "../game/entities/player";
import { initNewPlayer } from "./init-player";
import { bulletAct } from "../game/entities/bullet";

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

const broadcastStateUpdate = () => {
  io.emit("stateUpdate", {
    gameState: context.gameState,
  });
};

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete context.gameState.players[socket.id];

    broadcastStateUpdate();
  });

  // Init new player.
  // TODO: This should happen later, once we allow the user to choose their own name.
  initNewPlayer(socket.id);

  broadcastStateUpdate();

  // Note: socket.io guarantees message order, so we don't need to account for that ourselves
  socket.on("input", (data: IOMessageInput) => {
    const player = context.gameState.players[socket.id];
    if (!player) {
      console.error("Unexpected input event emitted by non-existent player");
      return;
    }

    player.bulletTrajectory = data.bulletTrajectory;

    // Act on all the inputs in the buffer sent by the client.
    data.inputs.forEach((input) => {
      // TODO: Clamp delta to prevent cheating.
      actOnInput(context.gameState, player, input.delta, input.input);
    });
  });
});

/**
 * This is the game loop.
 */
setInterval(() => {
  // delta might not always be 30 since the JS event loop doesn't guarantee the interval runs every 30ms.
  const now = performance.now();
  const delta = (now - context.lastTime) / 1000;
  context.lastTime = now;

  // Act on all entities.
  context.gameState.bullets.forEach((bullet) => {
    bulletAct(context.gameState, bullet, delta);
  });

  broadcastStateUpdate();
}, 30);

io.httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
