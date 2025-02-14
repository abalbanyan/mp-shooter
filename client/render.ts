import type { GameState } from "../game/types";
import { context } from "./context";
import { COLORS } from "../game/constants";

export const renderGameState = (gameState: GameState) => {
  const canvas = context.canvas;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in gameState.players) {
    const player = gameState.players[id];

    ctx.fillStyle = player.color;

    ctx.fillRect(player.pos.x, player.pos.y, 20, 20);

    // background
    ctx.fillStyle = COLORS.bg;
    ctx.font = "12px Arial";

    ctx.fillText(player.health.toString(), player.pos.x + 5, player.pos.y + 15);
    ctx.fillText(player.name, player.pos.x, player.pos.y - 5);
  }
};
