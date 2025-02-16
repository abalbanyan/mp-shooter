import { PowerupEntity } from "../../../game/types";
import { POWERUP_IMAGES } from "../images";
import { POWERUP_RADIUS } from "../../../game/entities/powerup";

const POWERUP_ANIMATION_FRAME_DURATION_MS = 500;

export const drawPowerup = (
  ctx: CanvasRenderingContext2D,
  powerup: PowerupEntity
) => {
  if (powerup.collectedAtTimestamp) return;

  const frameDuration = POWERUP_ANIMATION_FRAME_DURATION_MS;
  const powerupImages = POWERUP_IMAGES[powerup.type];
  const totalFrames = powerupImages.length;
  const frameIndex =
    Math.floor(performance.now() / frameDuration) % totalFrames;
  const frame = powerupImages[frameIndex];

  ctx.drawImage(
    frame,
    powerup.pos.x,
    powerup.pos.y,
    POWERUP_RADIUS,
    POWERUP_RADIUS
  );
};
