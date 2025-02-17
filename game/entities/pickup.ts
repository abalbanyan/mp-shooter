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
  BulletSize: {
    respawn: 8_000,
    onPickup: (player: PlayerEntity) => {
      player.powerups["BulletSize"] = { timestamp: new Date().getTime() };
    },
  },
  Speed: {
    respawn: 8_000,
    onPickup: (player: PlayerEntity) => {
      player.powerups["Speed"] = { timestamp: new Date().getTime() };
    },
  },
  Spread: {
    respawn: 8_000,
    onPickup: (player: PlayerEntity) => {
      player.powerups["Spread"] = { timestamp: new Date().getTime() };
    },
  },
  BulletSpeed: {
    respawn: 8_000,
    onPickup: (player: PlayerEntity) => {
      player.powerups["BulletSpeed"] = { timestamp: new Date().getTime() };
    },
  },
  Health: {
    respawn: 8_000,
    onPickup: (player: PlayerEntity) => {
      player.health = Math.min(PLAYER_MAX_HEALTH, (player.health += 2));
    },
  },
};

export const isPickupIntersectingPlayerPos = (
  playerPos: Vector,
  pickup: PickupEntity
) => {
  return circleIntersectsCircle(
    pickup.pos,
    PICKUP_RADIUS,
    playerPos,
    PLAYER_RADIUS
  );
};

export const pickupCollision = (gameState: GameState, pickup: PickupEntity) => {
  const players = Object.values(gameState.players);

  players.forEach((player) => {
    if (pickup.collectedAtTimestamp) return;

    if (isPickupIntersectingPlayerPos(player.pos, pickup)) {
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
