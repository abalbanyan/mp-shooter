import { circleIntersectsAABB } from "../util/collision";
import type { GameState, PlayerEntity, PlayerInput, Vector } from "../types";
import { initBulletOnCooldown } from "./bullet";
import { moveEntity } from "../util/move-entity";
import { onCooldown } from "../util/cooldown";
import { magnitude } from "../util/vector";
import { hasPowerup } from "./powerup";

export const PLAYER_MAX_HEALTH = 4;
const PLAYER_IFRAME_DURATION_MS = 1000;
const PLAYER_SPEED = 200;
const PLAYER_SPEED_WITH_POWERUP = 350; // TODO: I feel like this is the wrong place for this
export const DASH_COOLDOWN_MS = 1000;
const DASH_DISTANCE = 100;
const DASH_SPEED = 600;
export const COOLDOWN_BAR_WIDTH = 4;
export const PLAYER_RADIUS = 10;

export const playerDamageOnCooldown = (player: PlayerEntity) =>
  onCooldown(player.lastDamagedTimestamp, PLAYER_IFRAME_DURATION_MS);
export const dashOnCooldown = (player: PlayerEntity) =>
  onCooldown(player?.dash.lastDashTimestamp, DASH_COOLDOWN_MS);

export const damagePlayer = (player: PlayerEntity, damage: number) => {
  player.health -= damage;
  player.lastDamagedTimestamp = Date.now();
  if (player.health <= 0) {
    player.dead = true;
  }
};

const endDash = (player: PlayerEntity) => {
  player.dash.isDashing = false;
};

const beginDash = (player: PlayerEntity) => {
  if (!player.bulletTrajectory) {
    return;
  }
  console.debug("dash!");

  player.dash.normalizedDashDirection = {
    x: player.bulletTrajectory.x,
    y: player.bulletTrajectory.y,
  };
  player.dash.isDashing = true;
  player.dash.lastDashTimestamp = Date.now();
  player.dash.dashDistanceElapsed = 0;
};

const progressDash = (player: PlayerEntity, delta: number) => {
  if (player.dash.dashDistanceElapsed >= DASH_DISTANCE) {
    player.dash.isDashing = false;
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

export const playerActOnInput = (
  gameState: GameState,
  player: PlayerEntity,
  delta: number,
  input: PlayerInput
) => {
  if (player.dash.isDashing) {
    console.log("progress dash!");
    progressDash(player, delta);
  } else if (input.dash && !player.dash.isDashing && !dashOnCooldown(player)) {
    console.log(
      "begin dash!",
      player.dash?.lastDashTimestamp || 0 - Date.now(),
      Date.now()
    );
    beginDash(player);
    progressDash(player, delta);
  } else {
    movePlayer(player, input, delta);
  }

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
      endDash(player);
      player.pos = intersection.clampTo;
    }
  });
};
