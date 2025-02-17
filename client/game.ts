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
 *   - interpolating position
 *   - don't overwrite player bulletTrajectory
 *   - combine these entities into a single entities property for easier copying when we add new entity types
 */
const updateClientGameState = (newState: GameState) => {
  context.gameState.players = newState.players;
  context.gameState.bullets = newState.bullets;
  context.gameState.walls = newState.walls;
  context.gameState.powerups = newState.powerups;
};

socket.on("stateUpdate", (data: SocketEventGameStateUpdate) => {
  context.gameStateBuffer.push({
    gameState: data.gameState,
    timestamp: new Date().getTime(),
  });
  if (context.gameStateBuffer.length > 10) {
    context.gameStateBuffer.shift();
  }

  updateClientGameState(data.gameState);
  renderGameState(context.gameState);
  context.debugInfo = context.playerTrails;
});

setupInput();

const gameLoop = () => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  updateDelta();
  playerProcessInput();
  context.debugInfo = Math.round(1 / context.delta);

  // Act on all entities.
  actOnEntities(context.gameState, context.delta);

  // Spawn trails on all players.
  createPlayerTrailsForPlayers(Object.values(context.gameState.players));

  context.inputBuffer.push({
    delta: context.delta,
    input: context.keys,
  });

  renderGameState(context.gameState);
  requestAnimationFrame(gameLoop);
};

// Send the current input state to the server every 50ms.
setInterval(() => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  const player = context.gameState.players[context.id];

  // Send all buffered actions to the server.
  if (context.inputBuffer.length > 0) {
    socket.emit("input", {
      inputs: context.inputBuffer,
      bulletTrajectory: player.bulletTrajectory,
    } satisfies IOMessageInput);

    context.inputBuffer = [];
  }
}, 30);
