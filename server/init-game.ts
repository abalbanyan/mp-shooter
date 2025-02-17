import { BOUNDING_WALL_SIZE, MAP_HEIGHT, MAP_WIDTH } from "../game/constants";
import { initPickup } from "../game/entities/pickup";
import { initBoundingWalls } from "../game/entities/wall";
import { GameState } from "../game/types";

export const initialGameState: GameState = {
  players: {},
  bullets: [],
  pickups: [
    initPickup({ x: 580, y: 250 }, "Speed"),
    initPickup({ x: 250, y: 550 }, "BulletSize"),
    initPickup({ x: 250, y: 250 }, "BulletSpeed"),
    initPickup({ x: 580, y: 550 }, "Spread"),
    initPickup({ x: 710, y: 85 }, "Health"),
    initPickup({ x: 110, y: 700 }, "Health"),
  ],
  walls: initBoundingWalls(MAP_HEIGHT, MAP_WIDTH, BOUNDING_WALL_SIZE),
};
