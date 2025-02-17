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
import {
  cleanupPlayerGhosts,
  createPlayerGhostsForPlayers,
} from "./rendering/entities/player-ghost";
import { pushGameStateBuffer } from "./rendering/interpolation";

const socket = io();

socket.on("connect", () => {
  if (socket.id) {
    context.id = socket.id;
    requestAnimationFrame(gameLoop);
  }
});

/**
 * Update client gameState based on values returned from the server stateUpdate.
 * TODO:
 *   - don't overwrite player bulletTrajectory
 *   - combine these entities into a single entities property for easier copying when we add new entity types
 */
const updateClientGameState = (newState: GameState) => {
  context.gameState.players = newState.players;
  context.gameState.bullets = newState.bullets;
  context.gameState.walls = newState.walls;
  context.gameState.pickups = newState.pickups;
};

/**
 * Server reconciliation.
 */
socket.on("stateUpdate", (data: SocketEventGameStateUpdate) => {
  pushGameStateBuffer(data.gameState, data.timestamp);
  updateClientGameState(data.gameState);
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
  // context.debugInfo = Math.round(1 / context.delta);

  // Act on all entities.
  actOnEntities(context.gameState, context.delta);

  const players = Object.values(context.gameState.players);

  createPlayerTrailsForPlayers(players);
  createPlayerGhostsForPlayers(players);
  cleanupPlayerGhosts();

  context.inputBuffer.push({
    delta: context.delta,
    input: context.keys,
  });

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
