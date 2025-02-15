import { circleIntersectsAABB } from "../collision";
import type { GameState, PlayerEntity, PlayerInput, Vector } from "../types";
import { initBulletOnCooldown } from "./bullet";
import { moveEntity } from "./util/move-entity";

const PLAYER_IFRAME_DURATION_MS = 1000;
const PLAYER_SPEED = 200;
export const PLAYER_RADIUS = 10;
const PLAYER_SPEED_MAGNITUDE = Math.sqrt(PLAYER_SPEED ** 2 + PLAYER_SPEED ** 2);

// TODO
export const renderPlayer = () => {};

export const playerDamageOnCooldown = (player: PlayerEntity) => {
  if (!player.lastDamagedTimestamp) {
    return false;
  }
  const now = new Date().getTime();
  return now < player.lastDamagedTimestamp + PLAYER_IFRAME_DURATION_MS;
};

export const damagePlayer = (player: PlayerEntity, damage: number) => {
  player.health -= damage;
  player.lastDamagedTimestamp = new Date().getTime();
};

const movePlayer = (
  player: PlayerEntity,
  input: PlayerInput,
  delta: number
) => {
  const velocity: Vector = {
    x: 0,
    y: 0,
  };

  if (input.down) {
    velocity.y += 1;
  }
  if (input.up) {
    velocity.y -= 1;
  }
  if (input.right) {
    velocity.x += 1;
  }
  if (input.left) {
    velocity.x -= 1;
  }
  // TODO
  // if (input.dash) {
  //   velocity.x = player.bulletTrajectory.x,
  //   velocity.y = player.bulletTrajectory.y,
  // }

  moveEntity(player.pos, velocity, PLAYER_SPEED, delta);
};

export const actOnInput = (
  gameState: GameState,
  player: PlayerEntity,
  delta: number,
  input: PlayerInput
) => {
  movePlayer(player, input, delta);

  if (input.attack) {
    initBulletOnCooldown(gameState, player);
  }

  // Check if the player is nowcolliding with any walls, and clamp their position if so.
  gameState.walls.forEach((wall) => {
    const intersection = circleIntersectsAABB(
      player.pos,
      PLAYER_RADIUS,
      wall.box
    );
    if (intersection.isIntersecting) {
      console.log("clamp");
      player.pos = intersection.clampTo;
    }
  });
};
