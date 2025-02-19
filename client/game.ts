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
import { setupJoinGameForm } from "./join-game";

const socket = io();

socket.on("connect", () => {
  if (socket.id) {
    context.id = socket.id;
    requestAnimationFrame(gameLoop);
    setupJoinGameForm(socket);
  }
});

/**
 * Update client gameState based on values returned from the server stateUpdate.
 * TODO:
 *   - don't overwrite player bulletTrajectory
 *   - combine these entities into a single entities property for easier copying when we add new entity types
 */
const updateClientGameState = (newState: GameState) => {
  context.gameState.map = newState.map;

  // debugging
  // const clientPos = Object.values(context.gameState.players)[0]?.pos;
  // const serverPos = Object.values(newState.players)[0]?.pos;
  // if (clientPos && serverPos) {
  //   if (
  //     Math.floor(clientPos.x) !== Math.floor(serverPos.x) ||
  //     Math.floor(clientPos.y) !== Math.floor(serverPos.y)
  //   ) {
  //     console.log("RECONCILLIATION", { c: clientPos.x, s: serverPos.x });
  //   }
  // }
  context.gameState.players = newState.players;
  context.gameState.bullets = newState.bullets;
  context.gameState.walls = newState.walls;
  context.gameState.pickups = newState.pickups;
};

/**
 * Server reconciliation.
 */
socket.on("stateUpdate", (data: SocketEventGameStateUpdate) => {
  // console.log("server/client time discrepency:", Date.now() - data.timestamp); // This was quite high -- 1.8 seconds.
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
  createPlayerGhostsForPlayers(players);
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
