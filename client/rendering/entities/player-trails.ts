import type { PlayerEntity, Vector } from "../../../game/types";
import { onCooldown } from "../../../game/util/cooldown";
import { context } from "../../context";

const TRAIL_RADIUS = 3;
const TRAIL_DURATION_MS = 300;

/**
 * Trail particles that are left behind when a player moves and gradually disappear.
 * Only rendered on the client.
 */
export type PlayerTrailEntity = {
  pos: Vector;
  color: string;
  playerId: string;
  spawnedAt: number;
};

export const createPlayerTrailsForPlayers = (players: PlayerEntity[]) => {
  // First, clean up old player trails.
  context.playerTrails = context.playerTrails.reduce(
    (trails: PlayerTrailEntity[], trail) => {
      if (onCooldown(trail.spawnedAt, TRAIL_DURATION_MS)) {
        trails.push(trail);
      }
      return trails;
    },
    []
  );

  players.forEach((player) => {
    context.playerTrails.push({
      pos: player.pos,
      color: player.color,
      playerId: player.id,
      spawnedAt: new Date().getTime(),
    });
  });
};

export const drawPlayerTrail = (
  ctx: CanvasRenderingContext2D,
  trail: PlayerTrailEntity
) => {
  const remainingTimeRatio =
    (new Date().getTime() - trail.spawnedAt) / TRAIL_DURATION_MS;
  const opacity = (1 - remainingTimeRatio) ** 2;

  ctx.beginPath();
  ctx.globalAlpha = opacity;
  ctx.arc(trail.pos.x, trail.pos.y, TRAIL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = trail.color;
  ctx.fill();
  ctx.globalAlpha = 1;
};
