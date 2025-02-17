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

export const scale = (v: Vector, s: number) => ({
  x: v.x * s,
  y: v.y * s,
});

export const perpendiculars = (v: Vector): [Vector, Vector] => [
  {
    x: -v.y,
    y: v.x,
  },
  {
    x: v.y,
    y: -v.x,
  },
];

export const rotate = (v: Vector, radians: number): Vector => {
  const cosTheta = Math.cos(radians);
  const sinTheta = Math.sin(radians);
  return {
    x: v.x * cosTheta - v.y * sinTheta,
    y: v.x * sinTheta + v.y * cosTheta,
  };
};
