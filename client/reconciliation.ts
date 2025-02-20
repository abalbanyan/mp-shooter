import { applyPlayerInput } from "../game/entities/player";
import { GameState, IOMessageStateUpdate } from "../game/types";
import { clearInputBuffer, context } from "./context";
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
 * We don't need to use server state for cooldowns unless we introduce some pickup that resets the dash (maybe, even then might not be necessary).
 * Using the server state for cooldowns can result in jankiness like this with dashing:
 *
 * o
 *   o
 * o              <--- server pushes new state, and since our remainingCooldown is >0, replaying inputs causes dash to fail since it's on cooldown. however the player is dashing in the server's simulation.
 * o
 *          o     <--- server pushes new state, player rubberbands forward player has completed dash in the server-side simulation
 *
 * TODO: We might want to still use the server cooldown if it is significantly higher than the client cooldown.
 */
const storeClientMyPlayerCooldowns = (clientState: GameState) => {
  const myCooldowns: Record<string, number | null> = {
    remainingDashCooldown: null,
  };

  if (!context.id) return myCooldowns;

  const myPlayerClient = clientState.players[context.id];

  if (!myPlayerClient) return myCooldowns;

  myCooldowns.remainingDashCooldown = myPlayerClient.dash.remainingDashCooldown;

  return myCooldowns;
};

/**
 * Update client gameState based on values returned from the server stateUpdate.
 * The timestamp is required to perform timestamp correction on the server-provided timestamps
 * since the server clock may not be in sync with the client.
 *
 * TODO:
 *   - combine these entities into a single entities property for easier copying when we add new entity types
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

  const myCooldowns = storeClientMyPlayerCooldowns(clientState);

  // Our player is joining the game. Clear the buffers to avoid junk input being sent to the server.
  if (!clientState.players[context.id] && serverState.players[context.id]) {
    clearInputBuffer();
  }

  clientState.players = structuredClone(serverState.players);

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

  if (localStorage.getItem("debug_disable_replay")) {
    return;
  }

  // Find all inputs since the last update and apply them. (note: input buffer is ordered).
  const myPlayer = context.gameState.players[context.id];
  const lastProcessedSequenceNumber =
    lastProcessedPlayerSequenceNumbers[context.id];
  if (myPlayer && lastProcessedSequenceNumber) {
    context.inputBufferForReplays.forEach(
      ({ input, sequenceNumber, delta }) => {
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

  if (
    clientState.players[context.id] &&
    myCooldowns.remainingDashCooldown !== null
  ) {
    clientState.players[context.id].dash.remainingDashCooldown =
      myCooldowns.remainingDashCooldown;
  }
};
