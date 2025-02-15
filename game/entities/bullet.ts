import type { PlayerEntity, GameState, BulletEntity } from "../types";

const BULLET_SPEED = 200;
const BULLET_COOLDOWN_MS = 400;
const BULLET_DISTANCE_SPAWN = 5;

const isPlayerShootBulletOnCooldown = (player: PlayerEntity) => {
  if (!player.lastBulletFiredTimestamp) {
    console.log("masaka");
    return false;
  }

  if (
    player.lastBulletFiredTimestamp + BULLET_COOLDOWN_MS >
    new Date().getTime()
  ) {
    return true;
  }
};

/**
 * Initializes a bullet and adds it to the provided game state. provided the bullet is not off-cooldown.
 */
export const initBulletOnCooldown = (
  gameState: GameState,
  player: PlayerEntity
) => {
  if (!player.bulletTrajectory || isPlayerShootBulletOnCooldown(player)) {
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

export const cleanupBullets = (
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

export const bulletAct = (
  gameState: GameState,
  bullet: BulletEntity,
  delta: number
) => {
  bullet.pos.x += BULLET_SPEED * delta * bullet.direction.x;
  bullet.pos.y += BULLET_SPEED * delta * bullet.direction.y;

  // Collision detection.
  // TODO: broad-phase optimizations, e.g. partitioning world into grid and only checking grid items where there are players
  const players = Object.values(gameState.players);
  players.forEach(() => {
    //
  });
};
