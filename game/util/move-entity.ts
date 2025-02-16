import type { Vector } from "../types";
import { magnitude } from "./vector";

/**
 * Returns the movement vector, useful if you need to know how far a player
 * moved during this frame.
 */
export const moveEntity = (
  entityPos: Vector,
  velocity: Vector,
  speed: number,
  delta: number
) => {
  // We need to normalize the vector to avoid the entity traveling faster diagonally
  const mg = magnitude(velocity);
  if (mg <= 0) return { x: 0, y: 0 };
  const normalizedVelocity: Vector = {
    x: velocity.x / mg,
    y: velocity.y / mg,
  };

  const movement: Vector = {
    x: normalizedVelocity.x * speed * delta,
    y: normalizedVelocity.y * speed * delta,
  };

  entityPos.x += normalizedVelocity.x * speed * delta;
  entityPos.y += normalizedVelocity.y * speed * delta;

  return movement;
};
