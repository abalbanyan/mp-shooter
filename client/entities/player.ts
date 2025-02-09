import { Direction, PlayerEntity } from "../../game/types";
import { context } from "../context";
import { movePlayer } from "../game";

export const PLAYER_SPEED = 200;

export const initPlayer = () => {
  if (!context.id) {
    console.error("can't init player with no id");
    return;
  }

  const myPlayer: PlayerEntity = {
    id: context.id,
    pos: {
      x: 500 / 2,
      y: 500 / 2,
    },
    health: 5,
  };
  context.gameState.players[context.id] = myPlayer;
};

/**
 * Perform client actions based on currently pressed keys.
 */
export const playerProcessInput = () => {
  if (!context.id) {
    return;
  }

  const { id, keys, gameState, delta } = context;

  const player = gameState.players[id];
  if (player) {
    console.error("Missing player entity.");
    return;
  }

  if (keys.up) {
    movePlayer(player, Direction.Up, delta);
  }
  if (keys.down) {
    movePlayer(player, Direction.Down, delta);
  }
  if (keys.left) {
    movePlayer(player, Direction.Left, delta);
  }
  if (keys.right) {
    movePlayer(player, Direction.Right, delta);
  }
};
