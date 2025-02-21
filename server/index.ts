import express from "express";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer, Socket } from "socket.io";

import "dotenv/config";

import type {
  GetSuggestedNameResponse,
  IOMessageInput,
  IOMessagePlayerJoin,
  IOMessageStateUpdate,
} from "../game/types";
import { context } from "./context";
import { applyPlayerInput } from "../game/entities/player";
import { initNewPlayer } from "./init-player";
import { actOnEntities } from "../game/act-on-entities";
import { getRandomName } from "./util/random-name";
import { SERVER_TICK_RATE } from "../game/constants";
import { resetScores, resetScoresForPlayer } from "../game/scores";
import { sendPushNotificationNewPlayerJoined } from "./pushover";

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

app.get("/api/reset-scores", (req, res) => {
  if (req.query.name) {
    console.log(`Resetting scores for ${req.query.name}`);
    resetScoresForPlayer(context.gameState, req.query.name.toString());
  } else {
    console.log("Resetting all scores");
    resetScores(context.gameState);
  }
  res.send(200);
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
    gameState: structuredClone(context.gameState),
    timestamp: Date.now(),
    lastProcessedPlayerSequenceNumbers: structuredClone(
      context.lastProcessedPlayerSequenceNumbers
    ),
  } satisfies IOMessageStateUpdate);
};

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // todo: cleanupPlayer func?
    delete context.gameState.players[socket.id];
    delete context.lastProcessedPlayerSequenceNumbers[socket.id];

    broadcastStateUpdate();
  });

  // Allows client to measure RTT.
  socket.on("ping", () => {
    socket.emit("pong");
  });

  // Note: socket.io guarantees message order, so we don't need to account for that ourselves
  socket.on("input", (data: IOMessageInput) => {
    const player = context.gameState.players[socket.id];
    if (!player) {
      console.error("Unexpected input event emitted by non-existent player");
      return;
    }

    // Act on all the inputs in the buffer sent by the client.
    // NOTE: We don't act on entities here, so if a player moves
    // in and out of a collision point (e.g. a bullet or a pickup)
    // in the space of a complete server tick, then the collision won't register.
    // I think this is considered acceptable for online games.
    data.inputMessages.forEach((inputMessage) => {
      // TODO: Clamp delta to prevent cheating.
      applyPlayerInput(
        context.gameState,
        player,
        inputMessage.delta,
        structuredClone(inputMessage.input)
      );
      context.lastProcessedPlayerSequenceNumbers[player.id] =
        inputMessage.sequenceNumber;
    });
  });

  socket.on("playerJoin", (data: IOMessagePlayerJoin) => {
    initNewPlayer(socket.id, data.name);
    broadcastStateUpdate();

    // Sending myself a notification for now to see if people are playing. :)
    sendPushNotificationNewPlayerJoined(
      context.gameState.players[socket.id].name
    );
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
}, SERVER_TICK_RATE);

io.httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
