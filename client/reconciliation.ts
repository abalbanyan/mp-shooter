import { GameState } from "../game/types";
import { context } from "./context";
import { spawnPlayerGhost } from "./rendering/entities/player-ghost";

const applyTimestampCorrection = (
  timestamp: number | undefined,
  timestampDiff: number
) => {
  if (!timestamp) return timestamp;
  return timestamp - timestampDiff;
};

/**
 * We don't want to use the server state for our cooldowns unless they're higher than expected, since that can lead to jankiness.
 * e.g., we might try to dash, but the server doesn't realize we have dashed yet, so it pushes a remainingDashCooldown of 0 to us,
 * causing us to dash multiple times in a few frames before eventually the server catches up and pushes an update fixing our final position.
 */
const storeClientMyPlayerCooldowns = (
  clientState: GameState,
  serverState: GameState
) => {
  const myCooldowns: Record<string, number | null> = {
    remainingDashCooldown: null,
  };

  if (!context.id) return myCooldowns;

  const myPlayerServer = serverState.players[context.id];
  const myPlayerClient = clientState.players[context.id];
  if (myPlayerServer && myPlayerClient) {
    myCooldowns.remainingDashCooldown = Math.max(
      myPlayerClient.dash.remainingDashCooldown,
      myPlayerServer.dash.remainingDashCooldown
    );
  }
  return myCooldowns;
};

/**
 * Update client gameState based on values returned from the server stateUpdate.
 * The timestamp is required to perform timestamp correction on the server-provided timestamps
 * since the server clock may not be in sync with the client.
 *
 * TODO:
 *   - don't overwrite player bulletTrajectory
 *   - combine these entities into a single entities property for easier copying when we add new entity types
 *   - RTT is needed to make the timestamp correction more accurate
 *   - Store the last x inputs, and when server sends correction, instead of simply overwriting state, we can
 *     use some new inputId to find the last processed input, and replay inputs since then. this will avoid
 *     the annoying rubberbanding when the player has some server latency
 */
export const updateClientGameState = (
  serverState: GameState,
  serverTimestamp: number
) => {
  if (!context.id) return;

  const timestampDiff = serverTimestamp - Date.now();

  const clientState = context.gameState;
  clientState.map = structuredClone(serverState.map);
  clientState.bullets = structuredClone(serverState.bullets);
  clientState.walls = structuredClone(serverState.walls);
  clientState.pickups = structuredClone(serverState.pickups);

  // Find removed players, assume they've died, and remove them while spawning a ghost animation.
  Object.values(clientState.players).forEach((clientPlayer) => {
    if (!serverState.players[clientPlayer.id]) {
      spawnPlayerGhost(clientPlayer);
      delete clientState.players[clientPlayer.id];
    }
  });

  if (serverState.players[context.id]) {
    console.log(
      "Server says my remainingDashCooldown is:",
      serverState.players[context.id].dash.remainingDashCooldown
    );
  }

  const myCooldowns = storeClientMyPlayerCooldowns(clientState, serverState);

  clientState.players = structuredClone(serverState.players);

  if (clientState.players[context.id]) {
    clientState.players[context.id].dash.remainingDashCooldown =
      myCooldowns.remainingDashCooldown === null
        ? clientState.players[context.id].dash.remainingDashCooldown
        : myCooldowns.remainingDashCooldown;
  }

  // Apply timestamp correction to all timestamps.
  Object.values(clientState.players).forEach((clientPlayer) => {
    clientPlayer.lastBulletFiredTimestamp = applyTimestampCorrection(
      clientPlayer.lastBulletFiredTimestamp,
      timestampDiff
    );
    clientPlayer.lastDamagedTimestamp = applyTimestampCorrection(
      clientPlayer.lastDamagedTimestamp,
      timestampDiff
    );
  });

  // Object.values(clientState.players).forEach((clientPlayer) => {
  //   if (!serverState.players[clientPlayer.id]) {
  //     // This player has died, remove them and spawn a ghost animation.
  //     spawnPlayerGhost(clientPlayer);
  //     delete clientState.players[clientPlayer.id];
  //   } else if (clientPlayer.id !== context.id) {
  //     clientState.players[clientPlayer.id] = structuredClone(
  //       serverState.players[clientPlayer.id]
  //     );
  //   } else {
  //     // This is my player.
  //     // All timestamps are intentionally omitted since we can't use server timestamps on the client.
  //     const serverPlayer = serverState.players[clientPlayer.id];
  //     const myPlayer = clientState.players[clientPlayer.id];
  //     myPlayer.name = serverPlayer.name;
  //     myPlayer.pos = serverPlayer.pos;
  //     myPlayer.health = serverPlayer.health;
  //     myPlayer.color = serverPlayer.color;
  //     myPlayer.dead = serverPlayer.dead;
  //     myPlayer.dash.dashDistanceElapsed = serverPlayer.dash.dashDistanceElapsed;
  //     myPlayer.dash.isDashing = serverPlayer.dash.isDashing;
  //     myPlayer.dash.normalizedDashDirection =
  //       serverPlayer.dash.normalizedDashDirection;
  //     myPlayer.powerups = serverPlayer.powerups;
  //   }
  // });

  // Object.values(serverState.players).forEach((serverPlayer) => {
  //   if (!clientState.players[serverPlayer.id]) {
  //     // New player (which could be me).
  //     clientState.players[serverPlayer.id] = structuredClone(serverPlayer);
  //   }
  // });

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
};
