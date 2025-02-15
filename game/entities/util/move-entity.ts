import type { Vector } from "../../types";

export const moveEntity = (
  entityPos: Vector,
  velocity: Vector,
  speed: number,
  delta: number
) => {
  // We need to normalize the vector to avoid the entity traveling faster diagonally
  const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  if (magnitude <= 0) return;
  const normalizedVelocity: Vector = {
    x: velocity.x / magnitude,
    y: velocity.y / magnitude,
  };

  entityPos.x += normalizedVelocity.x * speed * delta;
  entityPos.y += normalizedVelocity.y * speed * delta;
};
