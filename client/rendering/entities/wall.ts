import { BOUNDING_WALL_SIZE, COLORS } from "../../../game/constants";
import type { WallEntity } from "../../../game/types";
import { TILES } from "../images";
import { drawRepeatedTileInArea } from "../tile";

export const drawWall = (ctx: CanvasRenderingContext2D, wall: WallEntity) => {
  drawRepeatedTileInArea(
    ctx,
    TILES.walls.busted,
    BOUNDING_WALL_SIZE,
    wall.box.pos,
    wall.box.h,
    wall.box.w
  );
};
