import { COLORS } from "../../../game/constants";
import type { BulletEntity } from "../../../game/types";

export const drawBullet = (
  ctx: CanvasRenderingContext2D,
  bullet: BulletEntity,
  color: string
) => {
  ctx.beginPath();
  ctx.arc(bullet.pos.x, bullet.pos.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.target;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(bullet.pos.x, bullet.pos.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};
