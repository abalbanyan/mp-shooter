import { circleIntersectsAABB } from "../collision";
import { COLORS } from "../constants";
import type { GameState, PlayerEntity, PlayerInput, Vector } from "../types";
import { initBulletOnCooldown } from "./bullet";
import { moveEntity } from "../util/move-entity";
import { onCooldown } from "../util/cooldown";
import { magnitude } from "../util/vector";

const PLAYER_IFRAME_DURATION_MS = 1000;
const PLAYER_SPEED = 200;
const DASH_COOLDOWN_MS = 1000;
const DASH_DISTANCE = 100;
const DASH_SPEED = 600;
const COOLDOWN_BAR_WIDTH = 4;
export const PLAYER_RADIUS = 10;

/** Maybe this needs to be another entity? */
export const drawPlayerDashCooldownBar = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity
) => {
  if (!dashOnCooldown(player)) return;
  if (!player.dash.lastDashTimestamp) return;

  const now = new Date().getTime();
  const timeRemaining = Math.max(
    0,
    player.dash.lastDashTimestamp + DASH_COOLDOWN_MS - now
  );
  const progressLeft = timeRemaining / DASH_COOLDOWN_MS;

  const pos = {
    x: player.pos.x - PLAYER_RADIUS - COOLDOWN_BAR_WIDTH,
    y: player.pos.y - PLAYER_RADIUS,
  };
  ctx.fillStyle = COLORS.cooldownBar;
  ctx.fillRect(
    player.pos.x - PLAYER_RADIUS - 5,
    player.pos.y - PLAYER_RADIUS,
    COOLDOWN_BAR_WIDTH,
    PLAYER_RADIUS * 2 * progressLeft
  );
};

const drawPlayerBulletTrajectoryIndicator = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity
) => {
  if (!player.bulletTrajectory) return;

  ctx.lineWidth = 3;

  const bulletTrajectoryStart = 11;
  const bulletTrajectoryEnd = 26;

  ctx.beginPath();
  ctx.strokeStyle = player.color;
  ctx.moveTo(
    player.pos.x + player.bulletTrajectory.x * bulletTrajectoryStart,
    player.pos.y + player.bulletTrajectory.y * bulletTrajectoryStart
  );
  ctx.lineTo(
    player.pos.x + player.bulletTrajectory.x * bulletTrajectoryEnd,
    player.pos.y + player.bulletTrajectory.y * bulletTrajectoryEnd
  );
  ctx.stroke();
};

let bumpAnimationTime: number = 0;

function drawBumpyCircle(
  ctx: CanvasRenderingContext2D,
  baseRadius: number,
  bumpAmplitude: number,
  numBumps: number,
  speed: number,
  pos: {
    x: number;
    y: number;
  },
  color: string,
  thickness: number,
  /** number of steps to points to draw the circle, higher values means more smooth */
  steps: number
): void {
  ctx.beginPath();

  for (let i = 0; i <= steps; i++) {
    const angle: number = (i / steps) * Math.PI * 2;

    // combine multiple sine waves to create a more organic, bumpy look
    const primary = Math.sin(numBumps * angle + bumpAnimationTime);
    const secondary = Math.sin(
      numBumps * 1.5 * angle - bumpAnimationTime * 1.3
    );
    const tertiary = Math.sin(numBumps * 0.7 * angle + bumpAnimationTime * 0.7);

    const offset: number =
      primary * bumpAmplitude +
      secondary * (bumpAmplitude * 0.5) +
      tertiary * (bumpAmplitude * 0.3);

    const r: number = baseRadius + offset;
    const x: number = pos.x + r * Math.cos(angle);
    const y: number = pos.y + r * Math.sin(angle);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();

  bumpAnimationTime = (bumpAnimationTime + speed) % (Math.PI * 2);
}

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity
) => {
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(player.health.toString(), player.pos.x, player.pos.y + 26);
  ctx.fillText(player.name, player.pos.x, player.pos.y - 15);

  drawPlayerBulletTrajectoryIndicator(ctx, player);

  const playerIsImmune =
    playerDamageOnCooldown(player) || player.dash.isDashing;
  if (playerIsImmune) {
    drawBumpyCircle(ctx, 10, 2, 12, 0.1, player.pos, player.color, 1, 100);
  } else {
    drawBumpyCircle(ctx, 10, 1, 10, 0.03, player.pos, player.color, 3, 200);
  }

  // center circle
  ctx.beginPath();
  ctx.arc(player.pos.x, player.pos.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
};

export const playerDamageOnCooldown = (player: PlayerEntity) =>
  onCooldown(player.lastDamagedTimestamp, PLAYER_IFRAME_DURATION_MS);
export const dashOnCooldown = (player: PlayerEntity) =>
  onCooldown(player.dash.lastDashTimestamp, DASH_COOLDOWN_MS);

export const damagePlayer = (player: PlayerEntity, damage: number) => {
  player.health -= damage;
  player.lastDamagedTimestamp = new Date().getTime();
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

  player.dash.normalizedDashDirection = {
    x: player.bulletTrajectory.x,
    y: player.bulletTrajectory.y,
  };
  player.dash.isDashing = true;
  player.dash.lastDashTimestamp = new Date().getTime();
  player.dash.dashDistanceElapsed = 0;
};

const progressDash = (player: PlayerEntity, delta: number) => {
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
  if (player.dash.dashDistanceElapsed >= DASH_DISTANCE) {
    player.dash.isDashing = false;
  }
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

  moveEntity(player.pos, velocity, PLAYER_SPEED, delta);
};

export const playerActOnInput = (
  gameState: GameState,
  player: PlayerEntity,
  delta: number,
  input: PlayerInput
) => {
  if (player.dash.isDashing) {
    progressDash(player, delta);
  } else if (input.dash && !dashOnCooldown(player)) {
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
