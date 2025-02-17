import { COLORS } from "../../../game/constants";
import type { BulletEntity } from "../../../game/types";
import { perpendiculars } from "../../../game/util/vector";

const BULLET_RADIUS = 4;
const BIG_BULLET_RADIUS = 12;

export const drawBullet = (
  ctx: CanvasRenderingContext2D,
  bullet: BulletEntity,
  color: string
) => {
  const radius = bullet.big ? BIG_BULLET_RADIUS : BULLET_RADIUS;

  ctx.beginPath();
  ctx.arc(bullet.pos.x, bullet.pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.target;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(bullet.pos.x, bullet.pos.y, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // debugging, drawing raycast
  // const [left, right] = perpendiculars(bullet.direction);
  // const leftRayPos = {
  //   x: bullet.pos.x + left.x * 10,
  //   y: bullet.pos.y + left.y * 10,
  // };
  // const rightRayPos = {
  //   x: bullet.pos.x + right.x * 10,
  //   y: bullet.pos.y + right.y * 10,
  // };
  // ctx.beginPath();
  // ctx.arc(leftRayPos.x, leftRayPos.y, 3, 0, Math.PI * 2);
  // ctx.fillStyle = "red";
  // ctx.fill();
  // ctx.beginPath();
  // ctx.arc(rightRayPos.x, rightRayPos.y, 3, 0, Math.PI * 2);
  // ctx.fillStyle = "red";
  // ctx.fill();
  // console.log(bullet.pos);
  // console.log(rightRayPos);
  // console.log(leftRayPos);
};
