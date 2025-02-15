import { GameState } from "../game/types";
import { initBoundingWalls } from "../game/entities/wall";
import { MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE } from "../game/constants";

type ServerContext = {
  lastTime: number;
  gameState: GameState;
};

export const context: ServerContext = {
  lastTime: performance.now(),

  /** Initial game state. */
  gameState: {
    players: {},
    bullets: [],
    walls: initBoundingWalls(MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE),
  },
};
