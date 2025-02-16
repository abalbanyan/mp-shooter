/**
 * Vector-related utilities.
 */

import { Vector } from "../types";

export const magnitude = (v: Vector) => Math.sqrt(v.x ** 2 + v.y ** 2);

export const dotProduct = (a: Vector, b: Vector): number =>
  a.x * b.x + a.y * b.y;

export const subVector = (a: Vector, d: Vector): Vector => ({
  x: a.x - d.x,
  y: a.y - d.y,
});
