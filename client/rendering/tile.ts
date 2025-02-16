import { Vector } from "../../game/types";

/**
 * Draw a square tile in a repeated pattern in an area.
 */
export const drawRepeatedTileInArea = (
  ctx: CanvasRenderingContext2D,
  tile: HTMLImageElement,
  tileSize: number,
  pos: Vector,
  h: number,
  w: number
) => {
  for (let x = pos.x; x < pos.x + w; x += tileSize) {
    for (let y = pos.y; y < pos.y + h; y += tileSize) {
      // Calculate how much space is left at the edges
      const remainingX = Math.min(tileSize, pos.x + w - x);
      const remainingY = Math.min(tileSize, pos.y + h - y);

      ctx.drawImage(
        tile,
        0,
        0,
        tile.naturalWidth,
        tile.naturalHeight,
        x,
        y,
        remainingX,
        remainingY
      );
    }
  }
};
