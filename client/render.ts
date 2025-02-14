import type { GameState } from "../game/types";
import { context } from "./context";
import { COLORS } from "../game/constants";

let animationTime: number = 0;

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
    const primary = Math.sin(numBumps * angle + animationTime);
    const secondary = Math.sin(numBumps * 1.5 * angle - animationTime * 1.3);
    const tertiary = Math.sin(numBumps * 0.7 * angle + animationTime * 0.7);

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

  animationTime = (animationTime + speed) % (Math.PI * 2);
}

const drawTargetReticule = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) => {
  const length = 10;
  ctx.beginPath();
  ctx.moveTo(x - length, y);
  ctx.lineTo(x + length, y);
  ctx.moveTo(x, y - length);
  ctx.lineTo(x, y + length);
  ctx.strokeStyle = COLORS.target;
  ctx.lineWidth = 2;
  ctx.stroke();
};


export const renderGameState = (gameState: GameState) => {
  const canvas = context.canvas;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in gameState.players) {
    const player = gameState.players[id];

    ctx.fillStyle = player.color;

    drawBumpyCircle(ctx, 10, 1, 10, 0.03, player.pos, player.color, 3, 200);

    // Hitbox?
    ctx.beginPath();
    ctx.arc(player.pos.x, player.pos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // background
    ctx.fillStyle = COLORS.bg;
    ctx.font = "12px Arial";

    drawTargetReticule(ctx, context.mousePos.x, context.mousePos.y);

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(player.health.toString(), player.pos.x, player.pos.y + 26);
    ctx.fillText(player.name, player.pos.x, player.pos.y - 15);
  }
};
