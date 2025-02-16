import type { PlayerEntity, GameState, BulletEntity, Vector } from "../types";
import { rayIntersectsAABB, rayIntersectsCircle } from "../util/collision";
import { damagePlayer, PLAYER_RADIUS, playerDamageOnCooldown } from "./player";
import { moveEntity } from "../util/move-entity";
import { onCooldown } from "../util/cooldown";
import { hasPowerup } from "./powerup";

const BULLET_DAMAGE = 1;
const BULLET_SPEED = 250;
const BULLET_COOLDOWN_MS = 200;
const BULLET_COOLDOWN_WITH_POWERUP_MS = 50;
const BULLET_DISTANCE_SPAWN = 5;

/**
 * Initializes a bullet and adds it to the provided game state. provided the bullet is not off-cooldown.
 */
export const initBulletOnCooldown = (
  gameState: GameState,
  player: PlayerEntity
) => {
  const bulletCooldown = hasPowerup(player, "BulletSpeed")
    ? BULLET_COOLDOWN_WITH_POWERUP_MS
    : BULLET_COOLDOWN_MS;

  if (
    !player.bulletTrajectory ||
    onCooldown(player.lastBulletFiredTimestamp, bulletCooldown)
  ) {
    return;
  }

  player.lastBulletFiredTimestamp = new Date().getTime();

  gameState.bullets.push({
    pos: {
      x: player.pos.x + player.bulletTrajectory.x * BULLET_DISTANCE_SPAWN,
      y: player.pos.y + player.bulletTrajectory.y * BULLET_DISTANCE_SPAWN,
    },
    playerId: player.id,
    color: player.color,
    direction: {
      x: player.bulletTrajectory.x,
      y: player.bulletTrajectory.y,
    },
  });
};

/**
 * TODO: Maybe we should assign the bullets ids instead.
 */
const deleteBullet = (bullet: BulletEntity) => {
  bullet.deleted = true;
};
const cleanupDeletedBullets = (gameState: GameState) => {
  gameState.bullets = gameState.bullets.filter((bullet) => !bullet.deleted);
};

export const cleanupBulletsFromRemovedPlayer = (
  gameState: GameState,
  playerId: PlayerEntity["id"]
) => {
  gameState.bullets = gameState.bullets.filter(
    (bullet) => bullet.playerId !== playerId
  );
};

export const drawBullet = (
  ctx: CanvasRenderingContext2D,
  bullet: BulletEntity,
  color: string
) => {
  ctx.beginPath();
  ctx.arc(bullet.pos.x, bullet.pos.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

/**
 * Detect if the bullet is colliding with another entity and take appropriate actions.
 * TODO: broad-phase optimizations, e.g. partitioning world into grid and only checking grid items where there are players
 */
const bulletCollision = (gameState: GameState, bullet: BulletEntity) => {
  gameState.walls.forEach((wall) => {
    // We "pull" the bullet's raycast back to allow for increasing the length of the raycast.
    // This helps avoid bullets tunneling through walls.
    const extraLength = 10;
    const behindBullet = {
      x: bullet.pos.x - extraLength * bullet.direction.x,
      y: bullet.pos.y - extraLength * bullet.direction.y,
    };

    if (
      rayIntersectsAABB(
        behindBullet,
        bullet.direction,
        1 + extraLength,
        wall.box
      )
    ) {
      deleteBullet(bullet);
      cleanupDeletedBullets(gameState);
    }
  });

  const players = Object.values(gameState.players);
  players.forEach((player) => {
    if (player.id === bullet.playerId || bullet.deleted) {
      return;
    }
    if (playerDamageOnCooldown(player)) {
      return;
    }
    const intersect = rayIntersectsCircle(
      bullet.pos,
      bullet.direction,
      20,
      player.pos,
      PLAYER_RADIUS
    );
    if (intersect) {
      deleteBullet(bullet);
      cleanupDeletedBullets(gameState);
      damagePlayer(player, BULLET_DAMAGE);
    }
  });
};

const moveBullet = (bullet: BulletEntity, delta: number) => {
  const velocity: Vector = {
    x: bullet.direction.x,
    y: bullet.direction.y,
  };
  moveEntity(bullet.pos, velocity, BULLET_SPEED, delta);
};

export const bulletAct = (
  gameState: GameState,
  bullet: BulletEntity,
  delta: number
) => {
  moveBullet(bullet, delta);
  bulletCollision(gameState, bullet);
};
