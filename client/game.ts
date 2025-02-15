import { io, Socket } from "socket.io-client";

import type {
  GameState,
  IOMessageInput,
  SocketEventGameStateUpdate,
} from "../game/types";

import { setupInput } from "./input";
import { context, updateDelta } from "./context";
import { playerProcessInput } from "./input";
import { renderGameState } from "./render";
import { bulletAct } from "../game/entities/bullet";

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
 */
const updateClientGameState = (newState: GameState) => {
  context.gameState.players = newState.players;
  context.gameState.bullets = newState.bullets;
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
});

setupInput();

const gameLoop = () => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  updateDelta();
  playerProcessInput();

  context.gameState.bullets.forEach((bullet) => {
    bulletAct(context.gameState, bullet, context.delta);
  });

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
