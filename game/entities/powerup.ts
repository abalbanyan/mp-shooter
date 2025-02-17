import { PlayerEntity } from "../types";
import { onCooldown } from "../util/cooldown";

export type PowerupType = "Speed" | "BulletSpeed";

const POWERUP_DURATION_MAP: Record<PowerupType, { duration: number }> = {
  Speed: {
    duration: 5_000,
  },
  BulletSpeed: {
    duration: 5_000,
  },
};

export const hasPowerup = (player: PlayerEntity, type: PowerupType) => {
  return (
    player.powerups[type] &&
    onCooldown(
      player.powerups[type].timestamp,
      POWERUP_DURATION_MAP[type].duration
    )
  );
};

// TODO, should be called in powerupAct()
export const removePlayerExpiredPowerups = (player: PlayerEntity) => {};
