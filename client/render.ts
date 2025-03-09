import type { GameState } from "../game/types";
import { drawBullet } from "./rendering/entities/bullet";
import { drawWall } from "./rendering/entities/wall";
import { context } from "./context";
import { COLORS } from "../game/constants";
import { drawPlayer } from "./rendering/entities/player";
import { drawPickup } from "./rendering/entities/pickup";
import { drawPlayerTrail } from "./rendering/entities/player-trails";
import { drawPlayerGhostEntity } from "./rendering/entities/player-ghost";
import { onCooldown } from "../game/util/cooldown";
import { playerDamageOnCooldown } from "../game/entities/player";
import { renderScoreboard } from "./rendering/scores";
import { drawTeleport } from "./rendering/entities/teleport";

const renderHTML = (gameState: GameState) => {
  renderScoreboard(gameState);
};

const drawTargetReticule = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) => {
  const length = 8;
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.target;
  ctx.moveTo(x - length, y);
  ctx.lineTo(x + length, y);
  ctx.moveTo(x, y - length);
  ctx.lineTo(x, y + length);
  ctx.stroke();
};

/**
 * Must call ctx.save(); before this, and ctx.restore() before drawing background.
 */
const applyScreenShake = (ctx: CanvasRenderingContext2D) => {
  const intensity = 5;
  const shakeX = (Math.random() - 0.5) * intensity;
  const shakeY = (Math.random() - 0.5) * intensity;
  ctx.translate(shakeX, shakeY);
};

/**
 * TODO: Viewport + camera
 */
export const renderGameState = (gameState: GameState) => {
  const canvas = context.canvas;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  // Using DPR here fixes a bug with the whole canvas not being cleared since we scaled it using dpr earlier in resizeCanvas()
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  ctx.save();

  const myPlayer = context.id && gameState.players[context.id];
  if (myPlayer && onCooldown(myPlayer.lastDamagedTimestamp, 400)) {
    applyScreenShake(ctx);
  }

  gameState.bullets.forEach((bullet) => {
    const player = gameState.players[bullet.playerId];
    if (!player) {
      return;
    }
    drawBullet(ctx, bullet, player.color);
  });

  gameState.walls.forEach((wall) => {
    drawWall(ctx, wall);
  });

  gameState.pickups.forEach((pickup) => drawPickup(ctx, pickup));
  gameState.teleports.forEach((teleport) => drawTeleport(ctx, teleport));

  context.playerTrails.forEach((trail) => drawPlayerTrail(ctx, trail));
  context.playerGhosts.forEach((ghost) => drawPlayerGhostEntity(ctx, ghost));

  Object.values(gameState.players).forEach((player) => {
    drawPlayer(ctx, player);
  });

  ctx.restore();

  drawTargetReticule(ctx, context.mousePos.x, context.mousePos.y);

  // background
  ctx.fillStyle = COLORS.bg;
  ctx.font = "10px Arial";

  renderHTML(gameState);

  // debug
  if (localStorage.getItem("debug")) {
    ctx.fillStyle = "red";
    if (context.debugInfo) {
      ctx.fillText(JSON.stringify(context.debugInfo), 40, 80);
    }
    ctx.fillText("RTT: " + context.RTT.toString(), 40, 120);
  }
};

function resizeCanvas() {
  if (!context.gameState?.map || !context.canvas) {
    setTimeout(() => resizeCanvas(), 30);
    return;
  }

  const canvas = context.canvas;
  const dpr = window.devicePixelRatio || 1;

  // Scaling using dpr makes the canvas much crisper, especially on high-resolution screens.
  // canvas.width = window.innerWidth * dpr;
  // canvas.height = window.innerHeight * dpr;
  canvas.height = context.gameState.map.h * dpr;
  canvas.width = context.gameState.map.w * dpr;
  canvas.style.height = `${context.gameState.map.w}px`;
  canvas.style.width = `${context.gameState.map.w}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
