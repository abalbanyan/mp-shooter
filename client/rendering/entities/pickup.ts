import { PICKUPS } from "../images";
import { PickupEntity } from "../../../game/types";
import { PICKUP_RADIUS } from "../../../game/entities/pickup";

const PICKUP_ANIMATION_FRAME_DURATION_MS = 500;

export const drawPickup = (
  ctx: CanvasRenderingContext2D,
  pickup: PickupEntity
) => {
  if (pickup.collectedAtTimestamp) return;

  const frameDuration = PICKUP_ANIMATION_FRAME_DURATION_MS;
  const pickupImages = PICKUPS[pickup.type];
  const totalFrames = pickupImages.length;
  const frameIndex =
    Math.floor(performance.now() / frameDuration) % totalFrames;
  const frame = pickupImages[frameIndex];

  ctx.drawImage(
    frame,
    pickup.pos.x - PICKUP_RADIUS,
    pickup.pos.y - PICKUP_RADIUS,
    PICKUP_RADIUS * 2,
    PICKUP_RADIUS * 2
  );
};
