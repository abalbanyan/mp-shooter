import type { GameState } from "../game/types";
import { drawBullet } from "../game/entities/bullet";
import { drawWall } from "../game/entities/wall";
import { context } from "./context";
import { COLORS } from "../game/constants";
import { drawPlayer, drawPlayerDashCooldownBar } from "../game/entities/player";
import { drawPowerup } from "./rendering/entities/powerup";

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

export const renderGameState = (gameState: GameState) => {
  const canvas = context.canvas;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gameState.bullets.forEach((bullet) => {
    const player = gameState.players[bullet.playerId];
    if (!player) {
      return;
    }
    drawBullet(ctx, bullet, player.color);
  });

  for (const id in gameState.players) {
    const player = gameState.players[id];

    drawPlayer(ctx, player);
  }

  gameState.walls.forEach((wall) => {
    drawWall(ctx, wall);
  });

  drawTargetReticule(ctx, context.mousePos.x, context.mousePos.y);
  if (context.id) {
    const myPlayer = gameState.players[context.id];
    drawPlayerDashCooldownBar(ctx, myPlayer);
  }

  gameState.powerups.forEach((powerup) => {
    drawPowerup(ctx, powerup);
  });

  // background
  ctx.fillStyle = COLORS.bg;
  ctx.font = "12px Arial";

  // debug
  ctx.fillStyle = "red";
  ctx.fillText(JSON.stringify(context.debugInfo), 60, 50);
};

function resizeCanvas() {
  const canvas = context.canvas;
  const dpr = window.devicePixelRatio || 1;

  // Scaling using dpr makes the canvas much crisper, especially on high-resolution screens.
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
