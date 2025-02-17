import { GameState, PickupEntity, PlayerEntity, Vector } from "../types";
import { circleIntersectsCircle } from "../util/collision";
import { onCooldown } from "../util/cooldown";
import { PLAYER_MAX_HEALTH, PLAYER_RADIUS } from "./player";
import { PowerupType } from "./powerup";

export const PICKUP_RADIUS = 16;

export type PickupType = PowerupType | "Health";

const PICKUP_PROPERTY_MAP: Record<
  PickupType,
  { respawn: number; onPickup: (player: PlayerEntity) => void }
> = {
  Speed: {
    respawn: 10_000,
    onPickup: (player: PlayerEntity) => {
      player.powerups["Speed"] = { timestamp: new Date().getTime() };
    },
  },
  BulletSpeed: {
    respawn: 10_000,
    onPickup: (player: PlayerEntity) => {
      player.powerups["BulletSpeed"] = { timestamp: new Date().getTime() };
    },
  },
  Health: {
    respawn: 10_000,
    onPickup: (player: PlayerEntity) => {
      player.health = Math.min(PLAYER_MAX_HEALTH, (player.health += 2));
    },
  },
};

export const pickupCollision = (gameState: GameState, pickup: PickupEntity) => {
  const players = Object.values(gameState.players);

  players.forEach((player) => {
    if (pickup.collectedAtTimestamp) return;

    const intersects = circleIntersectsCircle(
      pickup.pos,
      PICKUP_RADIUS,
      player.pos,
      PLAYER_RADIUS
    );

    if (intersects) {
      PICKUP_PROPERTY_MAP[pickup.type].onPickup(player);
      pickup.collectedAtTimestamp = new Date().getTime();
    }
  });
};

export const initPickup = (pos: Vector, type: PickupType) => {
  return {
    pos,
    type,
  };
};

export const pickupAct = (gameState: GameState, pickup: PickupEntity) => {
  // Check if the pickup should be respawned.
  if (
    !onCooldown(
      pickup.collectedAtTimestamp,
      PICKUP_PROPERTY_MAP[pickup.type].respawn
    )
  ) {
    pickup.collectedAtTimestamp = undefined;
  }

  pickupCollision(gameState, pickup);
};
