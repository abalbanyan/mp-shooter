import { COLORS } from "../constants";
import type { AABB, GameState, WallEntity } from "../types";

export const initWall = (gameState: GameState, box: AABB) => {
  gameState.walls.push({
    box,
  });
};

export const initBoundingWalls = (
  mapHeight: number,
  mapWidth: number,
  wallSize: number
) => {
  return [
    // Top
    {
      box: {
        h: wallSize,
        w: mapWidth,
        pos: {
          x: 0,
          y: mapHeight - wallSize,
        },
      },
    },
    // Right
    {
      box: {
        h: mapHeight,
        w: wallSize,
        pos: {
          x: mapWidth - wallSize,
          y: 0,
        },
      },
    },
    // Bottom
    {
      box: {
        h: wallSize,
        w: mapWidth,
        pos: {
          x: 0,
          y: 0,
        },
      },
    },
    // Left
    {
      box: {
        h: mapHeight,
        w: wallSize,
        pos: {
          x: 0,
          y: 0,
        },
      },
    },
  ];
};

export const drawWall = (ctx: CanvasRenderingContext2D, wall: WallEntity) => {
  ctx.beginPath();
  ctx.fillStyle = COLORS.walls;
  ctx.moveTo(wall.box.pos.x, wall.box.pos.y);
  ctx.lineTo(wall.box.pos.x + wall.box.w, wall.box.pos.y);
  ctx.lineTo(wall.box.pos.x + wall.box.w, wall.box.pos.y + wall.box.h);
  ctx.lineTo(wall.box.pos.x, wall.box.pos.y + wall.box.h);
  ctx.lineTo(wall.box.pos.x, wall.box.pos.y);
  ctx.fill();
};
