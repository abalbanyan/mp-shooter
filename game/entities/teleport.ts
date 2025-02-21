import type { BulletEntity, PlayerEntity, Vector } from "../types";
import { circleIntersectsCircle } from "../util/collision";
import { PLAYER_RADIUS } from "./player";

export const TELEPORT_RADIUS = 16;
export const TELEPORT_COOLDOWN_MS = 1000;

export type TeleportEntity = {
  pos: Vector;
  destination: Vector;
};

export const initTeleport = (pos: Vector, destination: Vector) => ({
  pos,
  destination,
});

export const isTeleportIntersectingPlayer = (
  player: PlayerEntity,
  teleport: TeleportEntity
) => {
  return circleIntersectsCircle(
    player.pos,
    PLAYER_RADIUS,
    teleport.pos,
    TELEPORT_RADIUS
  );
};

export const isTeleportIntersectingBullet = (
  bullet: BulletEntity,
  teleport: TeleportEntity
) => {
  return circleIntersectsCircle(bullet.pos, 4, teleport.pos, TELEPORT_RADIUS);
};

export const startTeleportCooldown = (player: PlayerEntity) => {
  player.teleportCooldown = TELEPORT_COOLDOWN_MS;
};
