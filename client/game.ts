import { io } from "socket.io-client";

import type { IOMessageInput, IOMessageStateUpdate } from "../game/types";

import { setupInput } from "./input";
import { context, pushInputToBuffer, updateDelta } from "./context";
import { playerProcessInput } from "./input";
import { renderGameState } from "./render";
import { actOnEntities } from "../game/act-on-entities";
import { createPlayerTrailsForPlayers } from "./rendering/entities/player-trails";
import { cleanupPlayerGhosts } from "./rendering/entities/player-ghost";
import { pushGameStateBuffer } from "./rendering/interpolation";
import { setupModals } from "./modals";
import { updateClientGameState } from "./reconciliation";
import { setupSound } from "./sound";
import { CLIENT_TICK_RATE } from "../game/constants";

setupSound();

const socket = io();

socket.on("connect", () => {
  if (socket.id) {
    context.id = socket.id;
    requestAnimationFrame(gameLoop);
    setupModals(socket);

    setInterval(() => {
      context.lastPing = performance.now();
      socket.emit("ping");
    }, 500);
  }
});

socket.on("pong", () => {
  context.RTT = Math.floor(performance.now() - context.lastPing);
});

/**
 * Server reconciliation.
 */
socket.on("stateUpdate", (data: IOMessageStateUpdate) => {
  // console.log("server/client time discrepency:", Date.now() - data.timestamp); // This was quite high -- 1.8 seconds.
  pushGameStateBuffer(data.gameState, data.timestamp);
  updateClientGameState(data);
  renderGameState(context.gameState);
});

setupInput();

const gameLoop = () => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  // Order is important
  updateDelta();
  playerProcessInput();
  context.sequenceNumber++;
  pushInputToBuffer();

  // fps
  // context.debugInfo = Math.round(1 / context.delta);

  // Act on all entities.
  actOnEntities(context.gameState, context.delta);

  const players = Object.values(context.gameState.players);

  createPlayerTrailsForPlayers(players);
  // createPlayerGhostsForPlayers(players);
  cleanupPlayerGhosts();

  renderGameState(context.gameState);
  requestAnimationFrame(gameLoop);
};

/**
 * Send the current input state to the server periodically.
 */
const sendInput = () => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  const player = context.gameState.players[context.id];
  if (!player || player.dead) {
    return;
  }

  // Send all buffered actions to the server.
  if (context.inputBufferForServer.length > 0) {
    socket.emit("input", {
      inputMessages: structuredClone(context.inputBufferForServer),
    } satisfies IOMessageInput);
    context.inputBufferForServer = [];
  }
};
setInterval(sendInput, CLIENT_TICK_RATE);
