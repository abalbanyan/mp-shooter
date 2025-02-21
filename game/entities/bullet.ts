import type {
  PlayerEntity,
  GameState,
  BulletEntity,
  Vector,
  PlayerInput,
} from "../types";
import { rayIntersectsAABB, rayIntersectsCircle } from "../util/collision";
import { damagePlayer, PLAYER_RADIUS, playerDamageOnCooldown } from "./player";
import { moveEntity } from "../util/move-entity";
import { onCooldown } from "../util/cooldown";
import { hasPowerup } from "./powerup";
import { perpendiculars, rotate, scale } from "../util/vector";
import { isTeleportIntersectingBullet } from "./teleport";

const BULLET_DAMAGE = 1;
const BULLET_SPEED = 270;
const BULLET_COOLDOWN_MS = 180;
const BULLET_COOLDOWN_WITH_POWERUP_MS = 40;
/** How far away from the player do bullets spawn? */
const BULLET_DISTANCE_SPAWN = 13;

const BULLET_SPREAD_DEGREE = 30;
const BULLET_SPREAD_LEFT_DEGREE = (-BULLET_SPREAD_DEGREE * Math.PI) / 180;
const BULLET_SPREAD_RIGHT_DEGREE = (BULLET_SPREAD_DEGREE * Math.PI) / 180;

/**
 * Initializes a bullet and adds it to the provided game state. provided the bullet is not off-cooldown.
 */
export const initBulletOnCooldown = (
  gameState: GameState,
  player: PlayerEntity,
  bulletParams: {
    hi: boolean;
  }
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

  player.lastBulletFiredTimestamp = Date.now();

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
    big: hasPowerup(player, "BulletSize"),
    hi: bulletParams.hi,
  });

  if (hasPowerup(player, "Spread")) {
    const leftTrajectory = rotate(
      player.bulletTrajectory,
      BULLET_SPREAD_LEFT_DEGREE
    );
    gameState.bullets.push({
      pos: {
        x: player.pos.x + leftTrajectory.x * BULLET_DISTANCE_SPAWN,
        y: player.pos.y + leftTrajectory.y * BULLET_DISTANCE_SPAWN,
      },
      playerId: player.id,
      color: player.color,
      direction: {
        x: leftTrajectory.x,
        y: leftTrajectory.y,
      },
      big: hasPowerup(player, "BulletSize"),
    });

    const rightTrajectory = rotate(
      player.bulletTrajectory,
      BULLET_SPREAD_RIGHT_DEGREE
    );
    gameState.bullets.push({
      pos: {
        x: player.pos.x + rightTrajectory.x * BULLET_DISTANCE_SPAWN,
        y: player.pos.y + rightTrajectory.y * BULLET_DISTANCE_SPAWN,
      },
      playerId: player.id,
      color: player.color,
      direction: {
        x: rightTrajectory.x,
        y: rightTrajectory.y,
      },
      big: hasPowerup(player, "BulletSize"),
    });
  }
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

export const isBulletIntersectingPlayerPos = (
  playerPos: Vector,
  bullet: BulletEntity
) => {
  // We want to raycast two additional casts, shifted left and right of the bullet.
  if (bullet.big) {
    const [left, right] = perpendiculars(bullet.direction);
    const leftRayPos = {
      x: bullet.pos.x + left.x * 10,
      y: bullet.pos.y + left.y * 10,
    };
    const rightRayPos = {
      x: bullet.pos.x + right.x * 10,
      y: bullet.pos.y + right.y * 10,
    };
    if (
      rayIntersectsCircle(
        leftRayPos,
        bullet.direction,
        30,
        playerPos,
        PLAYER_RADIUS
      )
    ) {
      return true;
    }
    if (
      rayIntersectsCircle(
        rightRayPos,
        bullet.direction,
        30,
        playerPos,
        PLAYER_RADIUS
      )
    ) {
      return true;
    }
    if (
      rayIntersectsCircle(
        bullet.pos,
        bullet.direction,
        30,
        playerPos,
        PLAYER_RADIUS
      )
    ) {
      return true;
    }
  } else {
    return rayIntersectsCircle(
      bullet.pos,
      bullet.direction,
      20,
      playerPos,
      PLAYER_RADIUS
    );
  }
  return false;
};

/**
 * Detect if the bullet is colliding with another entity and take appropriate actions.
 * TODO: broad-phase optimizations, e.g. partitioning world into grid and only checking grid items where there are players
 */
const bulletCollision = (gameState: GameState, bullet: BulletEntity) => {
  // Check if the bullet is colliding with any walls.
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

  // Check if bullet is colliding with any players.
  const players = Object.values(gameState.players);
  players.forEach((player) => {
    if (player.id === bullet.playerId || bullet.deleted || bullet.hi) {
      return;
    }
    if (playerDamageOnCooldown(player)) {
      return;
    }
    if (isBulletIntersectingPlayerPos(player.pos, bullet)) {
      deleteBullet(bullet);
      cleanupDeletedBullets(gameState);
      damagePlayer(gameState, player, BULLET_DAMAGE, bullet.playerId);
    }
  });

  gameState.teleports.forEach((teleport) => {
    if (bullet.hasTeleported) {
      return;
    }
    if (isTeleportIntersectingBullet(bullet, teleport)) {
      bullet.hasTeleported = true;
      bullet.pos = structuredClone(teleport.destination);
    }
  });
};

const moveBullet = (bullet: BulletEntity, delta: number) => {
  let velocity: Vector = {
    x: bullet.direction.x,
    y: bullet.direction.y,
  };
  moveEntity(
    bullet.pos,
    velocity,
    bullet.hi ? BULLET_SPEED * 0.5 : BULLET_SPEED,
    delta
  );
};

export const bulletAct = (
  gameState: GameState,
  bullet: BulletEntity,
  delta: number
) => {
  moveBullet(bullet, delta);
  bulletCollision(gameState, bullet);
};
