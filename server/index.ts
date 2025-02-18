import express from "express";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer, Socket } from "socket.io";

import type {
  GetSuggestedNameResponse,
  IOMessageInput,
  IOMessagePlayerJoin,
  IOMessageStateUpdate,
} from "../game/types";
import { context } from "./context";
import { playerActOnInput } from "../game/entities/player";
import { initNewPlayer } from "./init-player";
import { actOnEntities } from "../game/act-on-entities";
import { getRandomName } from "./util/random-name";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);
const port = 3000;

/**
 * TODO: Split out socket.io event management.
 */

app.get("/api/suggest-name", (req, res) => {
  res.status(200).send(
    JSON.stringify({
      name: getRandomName(),
    } satisfies GetSuggestedNameResponse)
  );
});

/**
 * In a serverless Railway app, socket requests don't keep the service from sleeping,
 * so we send a heartbeat periodically to prevent the service from sleeping.
 */
app.get("/api/heartbeat", (req, res) => {
  res.status(200).send("");
});

app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const broadcastStateUpdate = () => {
  io.emit("stateUpdate", {
    gameState: context.gameState,
    timestamp: Date.now(),
  } satisfies IOMessageStateUpdate);
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
  // initNewPlayer(socket.id);
  // broadcastStateUpdate();

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
      playerActOnInput(context.gameState, player, input.delta, input.input);
    });
  });

  socket.on("playerJoin", (data: IOMessagePlayerJoin) => {
    initNewPlayer(socket.id, data.name);
    broadcastStateUpdate();
  });
});

/**
 * This is the game loop.
 */
setInterval(() => {
  // delta might not always be equal to tick rate since the JS event loop doesn't guarantee the interval runs in a fixed time
  const now = performance.now();
  const delta = (now - context.lastTime) / 1000;
  context.lastTime = now;

  // Act on all entities.
  actOnEntities(context.gameState, delta);

  // cleanup dead players
  const deadPlayers = Object.values(context.gameState.players).filter(
    (player) => player.dead
  );
  deadPlayers.forEach((deadPlayer) => {
    delete context.gameState.players[deadPlayer.id];
  });

  broadcastStateUpdate();
}, 15);

io.httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
