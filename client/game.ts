import { io, Socket } from "socket.io-client";

import type { GameState, SocketEventGameStateUpdate } from "../game/types";

import { setupInput } from "./input";
import { context, updateClientGameState } from "./context";
import { initPlayer, playerProcessInput } from "./entities/player";
import { renderGameState } from "./render";

const socket = io();

let serverGameState: GameState | null = null;
let serverTick = 0;
let clientTick = 0;

socket.on("connect", () => {
  if (socket.id) {
    context.id = socket.id;
    initPlayer();
  }
});

socket.on("stateUpdate", (data: SocketEventGameStateUpdate) => {
  serverTick = data.tick;
  clientTick = serverTick;
  serverGameState = data.gameState;

  // TODO: interpolation for player movement

  updateClientGameState(serverGameState);
});

setupInput();

// Send the current input state to the server every 50ms.
setInterval(() => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  // Adjust delta.
  const now = performance.now();
  context.delta = (now - context.lastTime) / 1000;
  context.lastTime = now;

  clientTick++;

  playerProcessInput();
  renderGameState(context.gameState);

  socket.emit("input", { tick: clientTick, input: context.keys });
}, 10);
