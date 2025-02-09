import { Direction, PlayerEntity } from "../types";

const PLAYER_SPEED = 200;

export const movePlayer = (
  player: PlayerEntity,
  dir: Direction,
  // server uses fixed delta
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
