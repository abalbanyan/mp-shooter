import { GameState, PlayerEntity, PowerupEntity, Vector } from "../types";
import { circleIntersectsCircle } from "../util/collision";
import { onCooldown } from "../util/cooldown";
import { PLAYER_RADIUS } from "./player";

export const POWERUP_RADIUS = 35;

export type PowerupType = "Speed" | "BulletSpeed";

const POWERUP_PROPERTIES_MAP: Record<
  PowerupType,
  { respawn: number; duration: number }
> = {
  Speed: {
    respawn: 10_000,
    duration: 5_000,
  },
  BulletSpeed: {
    respawn: 10_000,
    duration: 5_000,
  },
};

// might not be needed actually lol
export const activePowerupsForPlayer = (
  player: PlayerEntity
): Record<PowerupType, boolean | undefined> => {
  return Object.keys(player.powerups).reduce((activePowerups, powerupType) => {
    const typedPowerupType = powerupType as PowerupType;

    if (POWERUP_PROPERTIES_MAP[typedPowerupType]) {
      activePowerups[typedPowerupType] = onCooldown(
        player.powerups[typedPowerupType].timestamp,
        POWERUP_PROPERTIES_MAP[typedPowerupType].duration
      );
    }

    return activePowerups;
  }, {} as Record<PowerupType, boolean | undefined>);
};

export const hasPowerup = (player: PlayerEntity, type: PowerupType) => {
  return (
    player.powerups[type] &&
    onCooldown(
      player.powerups[type].timestamp,
      POWERUP_PROPERTIES_MAP[type].duration
    )
  );
};

// TODO, should be called in powerupAct()
export const removePlayerExpiredPowerups = (player: PlayerEntity) => {};

export const powerupCollision = (
  gameState: GameState,
  powerup: PowerupEntity
) => {
  const players = Object.values(gameState.players);

  players.forEach((player) => {
    if (powerup.collectedAtTimestamp) return;

    const intersects = circleIntersectsCircle(
      powerup.pos,
      POWERUP_RADIUS,
      player.pos,
      PLAYER_RADIUS
    );

    if (intersects) {
      const now = new Date().getTime();
      powerup.collectedAtTimestamp = now;
      player.powerups[powerup.type] = { timestamp: now };
    }
  });
};

export const initPowerup = (pos: Vector, type: PowerupType) => {
  return {
    pos,
    type,
  };
};

export const powerupAct = (gameState: GameState, powerup: PowerupEntity) => {
  // Check if the powerup should be respawned.
  if (
    !onCooldown(
      powerup.collectedAtTimestamp,
      POWERUP_PROPERTIES_MAP[powerup.type].respawn
    )
  ) {
    powerup.collectedAtTimestamp = undefined;
  }

  powerupCollision(gameState, powerup);
};
