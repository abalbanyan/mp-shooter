import type { GameState } from "../game/types";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

export const renderGameState = (gameState: GameState) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in gameState.players) {
    const player = gameState.players[id];

    ctx.fillStyle = "red";

    ctx.fillRect(player.pos.x, player.pos.y, 20, 20);

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";

    ctx.fillText(player.health.toString(), player.pos.x, player.pos.y - 5);
  }
};
