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

// TODO: This will be the actual game loop where we process
// user input and add it to a inputMessage buffer in context,
// but for now we're going to process the game loop at the same
// interval that we send to the server.
// setInterval(() => {

// }, 10);

// Send the current input state to the server every 50ms.
setInterval(() => {
  // If no assigned id, don't take any actions yet.
  if (!context.id) {
    return;
  }

  updateDelta();
  playerProcessInput();
  renderGameState(context.gameState);

  socket.emit("input", {
    inputs: [
      {
        delta: context.delta,
        input: context.keys,
      },
    ],
  } satisfies IOMessageInput);
}, 50);
