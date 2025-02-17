import { PlayerEntity, Vector } from "../../../game/types";
import { onCooldown } from "../../../game/util/cooldown";
import { context } from "../../context";

const DEATH_ANIMATION_DURATION_MS = 2000;

/**
 * Spawned client-side only when a player dies. These are used to show a death animation.
 */
export type PlayerGhostEntity = {
  pos: Vector;
  color: string;
  playerId: string;
  spawnedAt: number;
};

export const initPlayerGhostEntity = (player: PlayerEntity) => ({
  pos: player.pos,
  color: player.color,
  playerId: player.id,
  spawnedAt: new Date().getTime(),
});

export const cleanupPlayerGhosts = () => {
  context.playerGhosts = context.playerGhosts.filter((ghost) =>
    onCooldown(ghost.spawnedAt, DEATH_ANIMATION_DURATION_MS)
  );
};

export const createPlayerGhostsForPlayers = (players: PlayerEntity[]) => {
  players.forEach((player) => {
    if (player.dead) {
      context.playerGhosts.push(initPlayerGhostEntity(player));
    }
  });
};

export const drawPlayerGhostEntity = (
  ctx: CanvasRenderingContext2D,
  ghost: PlayerGhostEntity
) => {
  ctx.save();

  const remainingTimeRatio = Math.min(
    1,
    (new Date().getTime() - ghost.spawnedAt) / DEATH_ANIMATION_DURATION_MS
  );
  const opacity = (1 - remainingTimeRatio) ** 2;

  ctx.globalAlpha = opacity;

  const numCircles = 8;
  const maxDistance = 20;
  const radius = 4;

  for (let i = 0; i < numCircles; i++) {
    const angle = (i / numCircles) * Math.PI * 2;
    const distance = maxDistance * remainingTimeRatio;
    const x = ghost.pos.x + Math.cos(angle) * distance;
    const y = ghost.pos.y + Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = ghost.color;
    ctx.fill();
  }

  ctx.restore();
};
