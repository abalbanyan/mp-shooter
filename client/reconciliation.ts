import { actOnEntities } from "../game/act-on-entities";
import { applyPlayerInput } from "../game/entities/player";
import { GameState, IOMessageStateUpdate } from "../game/types";
import { context } from "./context";
import { showDeathModal } from "./modals";
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
 *
 * also I wrote this at 5am and it's awful
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
export const updateClientGameState = ({
  gameState: serverState,
  timestamp: serverTimestamp,
  lastProcessedPlayerSequenceNumbers,
}: IOMessageStateUpdate) => {
  if (!context.id) return;

  if (localStorage.getItem("debug_reconciliation")) {
    console.log("server update");
  }

  // estimating server delay using RTT
  const serverTimeOffset = Date.now() - context.RTT / 2 - serverTimestamp;
  const correctedServerTimestamp = serverTimestamp + serverTimeOffset;

  const clientState = context.gameState;
  clientState.scores = structuredClone(serverState.scores);
  clientState.map = structuredClone(serverState.map);
  clientState.bullets = structuredClone(serverState.bullets);
  clientState.walls = structuredClone(serverState.walls);
  clientState.pickups = structuredClone(serverState.pickups);

  // Find removed players, assume they've died, and remove them while spawning a ghost animation. TODO: Some onPlayerDeath function
  Object.values(clientState.players).forEach((clientPlayer) => {
    if (!serverState.players[clientPlayer.id]) {
      spawnPlayerGhost(clientPlayer);
      delete clientState.players[clientPlayer.id];
      if (clientPlayer.id === context.id) {
        showDeathModal();
      }
    }
  });

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
      serverTimeOffset
    );
    clientPlayer.lastDamagedTimestamp = applyTimestampCorrection(
      clientPlayer.lastDamagedTimestamp,
      serverTimeOffset
    );
    clientPlayer.spawnTimestamp =
      applyTimestampCorrection(clientPlayer.spawnTimestamp, serverTimeOffset) ||
      0;
  });

  // Find all inputs since the last update and apply them. (note: input buffer is ordered).
  if (localStorage.getItem("debug_disable_replay")) {
    return;
  }

  const myPlayer = context.gameState.players[context.id];
  const lastProcessedSequenceNumber =
    lastProcessedPlayerSequenceNumbers[context.id];
  if (myPlayer && lastProcessedSequenceNumber) {
    context.inputBufferForReplays.forEach(
      ({ input, sequenceNumber, delta }, i) => {
        if (sequenceNumber > lastProcessedSequenceNumber) {
          applyPlayerInput(
            context.gameState,
            myPlayer,
            delta,
            structuredClone(input),
            true
          );
        }
      }
    );
  }

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
