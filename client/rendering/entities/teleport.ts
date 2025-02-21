import {
  TELEPORT_RADIUS,
  TeleportEntity,
} from "../../../game/entities/teleport";
import { TELEPORTS } from "../images";
import { getAnimationFrame } from "../util/animate-frame";

const TELEPORT_BG_SIZE = TELEPORT_RADIUS * 1.5;

export const drawTeleport = (
  ctx: CanvasRenderingContext2D,
  teleport: TeleportEntity
) => {
  ctx.save();

  const angle = ((performance.now() + teleport.pos.y) * 0.0002) % (Math.PI * 2);

  ctx.translate(teleport.pos.x, teleport.pos.y);
  ctx.rotate(angle);
  ctx.drawImage(
    getAnimationFrame(TELEPORTS, 500),
    -TELEPORT_BG_SIZE,
    -TELEPORT_BG_SIZE,
    TELEPORT_BG_SIZE * 2,
    TELEPORT_BG_SIZE * 2
  );

  ctx.restore();
};
