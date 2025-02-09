import { io, Socket } from "socket.io-client";

import type {
  GameState,
  IOMessageInput,
  SocketEventGameStateUpdate,
} from "../game/types";

import { setupInput } from "./input";
import { context, updateClientGameState, updateDelta } from "./context";
import { playerProcessInput } from "./input";
import { renderGameState } from "./render";

const socket = io();

let serverGameState: GameState | null = null;

socket.on("connect", () => {
  if (socket.id) {
    context.id = socket.id;
  }
});

socket.on("stateUpdate", (data: SocketEventGameStateUpdate) => {
  serverGameState = data.gameState;

  // TODO: interpolation for player movement?

  updateClientGameState(serverGameState);
});

setupInput();

// Process user actions every 10ms and add them to the buffer.
setInterval(() => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  updateDelta();
  playerProcessInput();

  context.inputBuffer.push({
    delta: context.delta,
    input: context.keys,
  });

  renderGameState(context.gameState);
}, 10);

// Send the current input state to the server every 50ms.
setInterval(() => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  // Send all buffered actions to the server.
  if (context.inputBuffer.length > 0) {
    socket.emit("input", {
      inputs: context.inputBuffer,
    } satisfies IOMessageInput);

    context.inputBuffer = [];
  }
}, 50);
