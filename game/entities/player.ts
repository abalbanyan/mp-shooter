import { circleIntersectsAABB } from "../util/collision";
import type { GameState, PlayerEntity, PlayerInput, Vector } from "../types";
import { initBulletOnCooldown } from "./bullet";
import { moveEntity } from "../util/move-entity";
import { onCooldown } from "../util/cooldown";
import { magnitude } from "../util/vector";
import { hasPowerup } from "./powerup";
import {
  playBulletFire,
  playBulletHit,
  playDeathSound,
  playTeleportSound,
} from "../../client/sound";
import {
  incPlayerDamageScore,
  incPlayerDeathScore,
  incPlayerKillScore,
} from "../scores";
import {
  isTeleportIntersectingPlayer,
  startTeleportCooldown,
} from "./teleport";

export const PLAYER_MAX_HEALTH = 4;
const PLAYER_SPAWN_IMMUNITY = 2000;
const PLAYER_IFRAME_DURATION_MS = 1000;
const PLAYER_SPEED = 200;
const PLAYER_SPEED_WITH_POWERUP = 350; // TODO: I feel like this is the wrong place for this
export const DASH_COOLDOWN_MS = 1000;
const DASH_DISTANCE = 100;
const DASH_SPEED = 600;
export const COOLDOWN_BAR_WIDTH = 4;
export const PLAYER_RADIUS = 10;

/** Has player been attacked recently? */
export const playerDamageOnCooldown = (player: PlayerEntity) =>
  onCooldown(player.lastDamagedTimestamp, PLAYER_IFRAME_DURATION_MS);
export const dashOnCooldown = (player: PlayerEntity) =>
  player.dash.remainingDashCooldown > 0;
export const teleportOnCooldown = (player: PlayerEntity) =>
  player.teleportCooldown > 0;
export const playerJustSpawned = (player: PlayerEntity) =>
  onCooldown(player.spawnTimestamp, PLAYER_SPAWN_IMMUNITY);

export const playerIsImmune = (player: PlayerEntity) =>
  playerDamageOnCooldown(player) ||
  player.dash.isDashing ||
  playerJustSpawned(player);

export const damagePlayer = (
  gameState: GameState,
  player: PlayerEntity,
  damage: number,
  attackerId?: string
) => {
  if (playerIsImmune(player)) {
    return;
  }

  player.health -= damage;
  player.lastDamagedTimestamp = Date.now();
  if (player.health <= 0) {
    player.dead = true;
  }

  if (attackerId) {
    playBulletHit(attackerId, player.id);
  }

  // Adjust scores if there was an attacker.
  if (attackerId && gameState.players[attackerId]) {
    const attacker = gameState.players[attackerId];
    incPlayerDamageScore(gameState, attacker, damage);
    if (player.dead) {
      playDeathSound();
      incPlayerKillScore(gameState, attacker);
      incPlayerDeathScore(gameState, player);
    }
  }
};

const endDash = (player: PlayerEntity) => {
  player.dash.isDashing = false;
  player.dash.dashDistanceElapsed = 0;
};

const beginDash = (player: PlayerEntity) => {
  if (!player.bulletTrajectory) {
    return;
  }

  player.dash.normalizedDashDirection = {
    x: player.bulletTrajectory.x,
    y: player.bulletTrajectory.y,
  };
  player.dash.isDashing = true;
  player.dash.remainingDashCooldown = DASH_COOLDOWN_MS;
  player.dash.dashDistanceElapsed = 0;
};

const progressDash = (player: PlayerEntity, delta: number) => {
  if (player.dash.dashDistanceElapsed >= DASH_DISTANCE) {
    endDash(player);
    return;
  }
  if (!player.dash.normalizedDashDirection) {
    return;
  }

  const movement = moveEntity(
    player.pos,
    player.dash.normalizedDashDirection,
    DASH_SPEED,
    delta
  );

  // Need to decrement the dash distance.
  player.dash.dashDistanceElapsed += magnitude(movement);
};

const updateDashCooldown = (player: PlayerEntity, delta: number) => {
  if (!dashOnCooldown(player)) {
    return;
  }
  player.dash.remainingDashCooldown = Math.max(
    0,
    player.dash.remainingDashCooldown - delta * 1000
  );
};

const updateTeleportCooldown = (player: PlayerEntity, delta: number) => {
  if (!teleportOnCooldown(player)) {
    return;
  }
  player.teleportCooldown = Math.max(0, player.teleportCooldown - delta * 1000);
};

const updateCooldown = (player: PlayerEntity, delta: number) => {
  updateDashCooldown(player, delta);
  updateTeleportCooldown(player, delta);
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

  const speed = hasPowerup(player, "Speed")
    ? PLAYER_SPEED_WITH_POWERUP
    : PLAYER_SPEED;
  moveEntity(player.pos, velocity, speed, delta);
};

export const applyPlayerInput = (
  gameState: GameState,
  player: PlayerEntity,
  delta: number,
  input: PlayerInput,
  /** Are we replaying inputs from the server? */
  isReplay = false
) => {
  player.bulletTrajectory = structuredClone(input.bulletTrajectory);

  updateCooldown(player, delta);

  if (player.dash.isDashing) {
    progressDash(player, delta);
  } else if (input.dash && !dashOnCooldown(player)) {
    beginDash(player);
    progressDash(player, delta);
  } else {
    movePlayer(player, input, delta);
  }

  if ((input.attack || input.hi) && !isReplay) {
    playBulletFire();
    initBulletOnCooldown(gameState, player, { hi: input.hi });
  }

  // Check if the player is nowcolliding with any walls, and clamp their position if so.
  gameState.walls.forEach((wall) => {
    const intersection = circleIntersectsAABB(
      player.pos,
      PLAYER_RADIUS,
      wall.box
    );
    if (intersection.isIntersecting) {
      endDash(player);
      player.pos = intersection.clampTo;
    }
  });

  gameState.teleports.forEach((teleport) => {
    if (teleportOnCooldown(player)) {
      return;
    }
    if (isTeleportIntersectingPlayer(player, teleport)) {
      if (!isReplay) {
        startTeleportCooldown(player);
      }
      console.log("teleport");
      playTeleportSound(player.id);
      player.pos = structuredClone(teleport.destination);
    }
  });
};
