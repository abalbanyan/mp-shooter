import type { GameState } from "../game/types";
import { drawBullet } from "./rendering/entities/bullet";
import { drawWall } from "./rendering/entities/wall";
import { context } from "./context";
import { COLORS } from "../game/constants";
import { drawPlayer } from "./rendering/entities/player";
import { drawPickup } from "./rendering/entities/pickup";
import { drawPlayerTrail } from "./rendering/entities/player-trails";
import { drawPlayerGhostEntity } from "./rendering/entities/player-ghost";
import { hasPowerup } from "../game/entities/powerup";

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

  gameState.walls.forEach((wall) => {
    drawWall(ctx, wall);
  });

  drawTargetReticule(ctx, context.mousePos.x, context.mousePos.y);

  gameState.pickups.forEach((pickup) => {
    drawPickup(ctx, pickup);
  });

  context.playerTrails.forEach((trail) => drawPlayerTrail(ctx, trail));
  context.playerGhosts.forEach((ghost) => drawPlayerGhostEntity(ctx, ghost));

  Object.values(gameState.players).forEach((player) => {
    drawPlayer(ctx, player);
  });

  // background
  ctx.fillStyle = COLORS.bg;
  ctx.font = "12px Arial";

  // debug
  // ctx.fillStyle = "red";
  // ctx.fillText(JSON.stringify(context.debugInfo), 60, 50);
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
