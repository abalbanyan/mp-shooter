import { Direction, GameState, PlayerEntity, PlayerInput } from "../types";
import { initBulletOnCooldown } from "./bullet";

const PLAYER_SPEED = 200;

export const movePlayer = (
  player: PlayerEntity,
  dir: Direction,
  delta: number
) => {
  switch (dir) {
    case Direction.Up:
      player.pos.y -= PLAYER_SPEED * delta;
      break;
    case Direction.Down:
      player.pos.y += PLAYER_SPEED * delta;
      break;
    case Direction.Left:
      player.pos.x -= PLAYER_SPEED * delta;
      break;
    case Direction.Right:
      player.pos.x += PLAYER_SPEED * delta;
      break;
  }
};

export const actOnInput = (
  gameState: GameState,
  player: PlayerEntity,
  delta: number,
  input: PlayerInput
) => {
  if (input.down) {
    movePlayer(player, Direction.Down, delta);
  }
  if (input.up) {
    movePlayer(player, Direction.Up, delta);
  }
  if (input.right) {
    movePlayer(player, Direction.Right, delta);
  }
  if (input.left) {
    movePlayer(player, Direction.Left, delta);
  }
  if (input.attack) {
    initBulletOnCooldown(gameState, player);
  }
};
