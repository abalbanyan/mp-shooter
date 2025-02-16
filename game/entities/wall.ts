import type { AABB, GameState } from "../types";

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
  const halfWidth = mapWidth / 2;
  const halfHeight = mapHeight / 2;
  const quarterWidth = mapWidth / 4;
  const quarterHeight = mapHeight / 4;

  return [
    // Top Wall
    {
      box: {
        h: wallSize,
        w: mapWidth,
        pos: { x: 0, y: mapHeight - wallSize },
      },
    },
    // Right Wall
    {
      box: {
        h: mapHeight - wallSize - wallSize,
        w: wallSize,
        pos: { x: mapWidth - wallSize, y: wallSize },
      },
    },
    // Bottom Wall
    {
      box: {
        h: wallSize,
        w: mapWidth,
        pos: { x: 0, y: 0 },
      },
    },
    // Left Wall
    {
      box: {
        h: mapHeight - wallSize - wallSize,
        w: wallSize,
        pos: { x: 0, y: wallSize },
      },
    },

    // └
    {
      box: {
        h: wallSize * 4,
        w: wallSize,
        pos: { x: quarterWidth, y: halfHeight + quarterHeight - wallSize * 4 },
      },
    },
    {
      box: {
        h: wallSize,
        w: wallSize * 4,
        pos: { x: quarterWidth, y: halfHeight + quarterHeight - wallSize },
      },
    },

    // ┘
    {
      box: {
        h: wallSize * 4,
        w: wallSize,
        pos: {
          x: halfWidth + quarterWidth,
          y: halfHeight + quarterHeight - wallSize * 4,
        },
      },
    },
    {
      box: {
        h: wallSize,
        w: wallSize * 4,
        pos: {
          x: halfWidth + quarterWidth - wallSize * 3,
          y: halfHeight + quarterHeight - wallSize,
        },
      },
    },

    // ┌
    {
      box: {
        h: wallSize * 4,
        w: wallSize,
        pos: { x: quarterWidth, y: quarterHeight },
      },
    },
    {
      box: {
        h: wallSize,
        w: wallSize * 4,
        pos: { x: quarterWidth, y: quarterHeight },
      },
    },

    // ┐
    {
      box: {
        h: wallSize * 4,
        w: wallSize,
        pos: { x: halfWidth + quarterWidth, y: quarterHeight },
      },
    },
    {
      box: {
        h: wallSize,
        w: wallSize * 4,
        pos: {
          x: halfWidth + quarterWidth - wallSize * 3,
          y: quarterHeight,
        },
      },
    },
  ];
};
