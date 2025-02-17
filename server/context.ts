import { GameState } from "../game/types";
import { initBoundingWalls } from "../game/entities/wall";
import { MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE } from "../game/constants";
import { initPickup } from "../game/entities/pickup";

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
    pickups: [
      initPickup({ x: 580, y: 250 }, "Speed"),
      initPickup({ x: 250, y: 550 }, "Speed"),
      initPickup({ x: 250, y: 250 }, "BulletSpeed"),
      initPickup({ x: 580, y: 550 }, "BulletSpeed"),
      initPickup({ x: 710, y: 85 }, "Health"),
      initPickup({ x: 110, y: 700 }, "Health"),
    ],
    walls: initBoundingWalls(MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE),
  },
};
