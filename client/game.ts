import { io } from "socket.io-client";

import type {
  GameState,
  IOMessageInput,
  SocketEventGameStateUpdate,
} from "../game/types";

import { setupInput } from "./input";
import { context, updateDelta } from "./context";
import { playerProcessInput } from "./input";
import { renderGameState } from "./render";
import { actOnEntities } from "../game/act-on-entities";
import { createPlayerTrailsForPlayers } from "./rendering/entities/player-trails";
import { cleanupPlayerGhosts } from "./rendering/entities/player-ghost";
import { pushGameStateBuffer } from "./rendering/interpolation";
import { setupModals } from "./modals";
import { updateClientGameState } from "./reconciliation";

const socket = io();

socket.on("connect", () => {
  if (socket.id) {
    context.id = socket.id;
    requestAnimationFrame(gameLoop);
    setupModals(socket);

    setInterval(() => {
      context.lastPing = performance.now();
      socket.emit("ping");
    }, 1000);
  }
});

socket.on("pong", () => {
  context.RTT = Math.floor(performance.now() - context.lastPing);
});

/**
 * Server reconciliation.
 */
socket.on("stateUpdate", (data: SocketEventGameStateUpdate) => {
  // console.log("server/client time discrepency:", Date.now() - data.timestamp); // This was quite high -- 1.8 seconds.
  pushGameStateBuffer(data.gameState, data.timestamp);
  updateClientGameState(data.gameState, data.timestamp);
  renderGameState(context.gameState);
});

setupInput();

const gameLoop = () => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  updateDelta();
  playerProcessInput();
  context.inputBuffer.push({
    delta: context.delta,
    input: structuredClone(context.keys),
  });

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
  if (context.inputBuffer.length > 0) {
    socket.emit("input", {
      inputs: context.inputBuffer,
      bulletTrajectory: player.bulletTrajectory,
    } satisfies IOMessageInput);

    context.inputBuffer = [];
  }
};
setInterval(sendInput, 15);
