import { COLORS } from "../../../game/constants";
import {
  COOLDOWN_BAR_WIDTH,
  DASH_COOLDOWN_MS,
  dashOnCooldown,
  PLAYER_RADIUS,
  playerDamageOnCooldown,
} from "../../../game/entities/player";
import { PlayerEntity, Vector } from "../../../game/types";
import { getInterpolatedPlayerPosition } from "../interpolation";
import { drawHealth } from "./health";

/** Maybe this needs to be another entity? */
const drawPlayerDashCooldownBar = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity
) => {
  if (!dashOnCooldown(player)) return;
  if (!player.dash.lastDashTimestamp) return;

  const now = Date.now();
  if (localStorage.getItem("debug") && player.dash.lastDashTimestamp > now) {
    console.error(
      "lastDashTimestamp is greater than now",
      now - player.dash.lastDashTimestamp
    );
  }

  const timeRemaining = Math.max(
    0,
    player.dash.lastDashTimestamp + DASH_COOLDOWN_MS - now
  );
  const progressLeft = timeRemaining / DASH_COOLDOWN_MS;

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
  if (player.dead) return;

  // const player.pos = getInterpolatedPlayerPosition(player);

  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(player.name, player.pos.x, player.pos.y - 15);
  drawHealth(ctx, player);

  drawPlayerBulletTrajectoryIndicator(ctx, player);
  drawPlayerDashCooldownBar(ctx, player);

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
