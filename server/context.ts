import { GameState } from "../game/types";
import { initBoundingWalls } from "../game/entities/wall";
import { MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE } from "../game/constants";
import { PowerupType, initPowerup } from "../game/entities/powerup";

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
    powerups: [
      initPowerup({ x: 535, y: 250 }, "Speed"),
      initPowerup({ x: 250, y: 515 }, "Speed"),
      initPowerup({ x: 250, y: 250 }, "BulletSpeed"),
      initPowerup({ x: 535, y: 515 }, "BulletSpeed"),
    ],
    walls: initBoundingWalls(MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE),
  },
};
