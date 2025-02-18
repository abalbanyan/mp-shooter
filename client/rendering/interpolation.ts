import { GameState, PlayerEntity, Vector } from "../../game/types";
import { context } from "../context";

const INTERPOLATION_BUFFER_SIZE = 2;
const INTERPOLATION_DELAY_MS = 100;

/**
 * Returns the interpolated position of the player based on the previous server updates, used for rendering only.
 * We additionally apply an INTERPOLATION_DELAY to avoid immediately shifting the player after server reconcilliation.
 *
 * TODO:
 *  - Can make INTERPOLATION_DELAY dynamic based on the player's latency
 *  - Make dynamic based on INTERPOLATION_BUFFER_SIZE
 */
export const getInterpolatedPlayerPosition = (player: PlayerEntity): Vector => {
  const buffer = context.gameStateBuffer;

  if (buffer.length < INTERPOLATION_BUFFER_SIZE) {
    return player.pos;
  }

  const prevPlayerState = buffer[0].gameState.players[player.id];
  const curPlayerState = buffer[1].gameState.players[player.id];
  if (!prevPlayerState || !curPlayerState) {
    return player.pos;
  }

  const now = Date.now();
  const renderTime = now - INTERPOLATION_DELAY_MS;

  if (renderTime < buffer[0].timestamp) {
    console.debug(
      "unexpected! current time is before first position in buffer. diff:",
      renderTime - buffer[0].timestamp
    );
    return prevPlayerState.pos;
  }
  if (renderTime >= buffer[1].timestamp) {
    console.debug(
      "renderTime is greater than latest buffered timestamp, player might be lagging"
    );
    return curPlayerState.pos;
  }

  const t =
    (renderTime - buffer[0].timestamp) /
    (buffer[1].timestamp - buffer[0].timestamp);

  const clampT = Math.max(0, Math.min(1, t));

  return {
    x:
      prevPlayerState.pos.x +
      clampT * (curPlayerState.pos.x - prevPlayerState.pos.x),
    y:
      prevPlayerState.pos.y +
      clampT * (curPlayerState.pos.y - prevPlayerState.pos.y),
  };
};

/**
 * Makes a deep copy of gameState and adds it to the buffer.
 */
export const pushGameStateBuffer = (
  gameState: GameState,
  timestamp: number
) => {
  // We don't need to sort by timestamp since socket.io guarantees message order
  context.gameStateBuffer.push({
    gameState: structuredClone(gameState),
    timestamp,
  });
  if (context.gameStateBuffer.length > INTERPOLATION_BUFFER_SIZE) {
    context.gameStateBuffer.shift();
  }
};
