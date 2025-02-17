import { bulletAct } from "./entities/bullet";
import { pickupAct } from "./entities/pickup";
import { GameState } from "./types";

/**
 * Acts on all entities, including cleanup.
 * (with the exception of the player which is handled differently on the client vs server)
 */
export const actOnEntities = (gameState: GameState, delta: number) => {
  gameState.bullets.forEach((bullet) => {
    bulletAct(gameState, bullet, delta);
  });
  gameState.pickups.forEach((pickup) => {
    pickupAct(gameState, pickup);
  });
};
