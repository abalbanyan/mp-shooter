/**
 * Various utilities related to collision detection.
 */

import type { AABB, Vector } from "./types";

import { dotProduct } from "./util/vector";

export const rayIntersectsCircle = (
  rayOrigin: Vector,
  normalizedRayDirection: Vector,
  rayLength: number,
  circlePos: Vector,
  circleRadius: number
): boolean => {
  const vectorToCircle = {
    x: circlePos.x - rayOrigin.x,
    y: circlePos.y - rayOrigin.y,
  };

  const closestApproach = dotProduct(vectorToCircle, normalizedRayDirection);

  const rayIsPointingInOppositeDirection = closestApproach < 0;
  const rayIsBeyondCircle = closestApproach > rayLength;
  if (rayIsPointingInOppositeDirection || rayIsBeyondCircle) {
    return false;
  }

  const magnitudeVectorToCircleSquared = dotProduct(
    vectorToCircle,
    vectorToCircle
  );
  const d2 = magnitudeVectorToCircleSquared - closestApproach ** 2;
  const radius2 = circleRadius ** 2;

  return d2 <= radius2;
};

export const rayIntersectsAABB = (
  rayOrigin: Vector,
  normalizedRayDirection: Vector,
  rayLength: number,
  box: AABB
) => {
  // This avoids division in comparisons for performance reasons.
  const dirFracX =
    normalizedRayDirection.x !== 0 ? 1 / normalizedRayDirection.x : Infinity;
  const dirFracY =
    normalizedRayDirection.y !== 0 ? 1 / normalizedRayDirection.y : Infinity;

  // Compute the intersection time along x and y axis. (t in this context is somewhat analogous to distance between a point and the axis)
  const t1 = (box.pos.x - rayOrigin.x) * dirFracX; // left edge
  const t2 = (box.pos.x + box.w - rayOrigin.x) * dirFracX; // right edge
  const t3 = (box.pos.y - rayOrigin.y) * dirFracY; // bottom edge
  const t4 = (box.pos.y + box.h - rayOrigin.y) * dirFracY; // top edge

  const entryTimeX = Math.min(t1, t2);
  const exitTimeX = Math.max(t1, t2);
  const entryTimeY = Math.min(t3, t4);
  const exitTimeY = Math.max(t3, t4);

  const entryTime = Math.max(entryTimeX, entryTimeY);
  const exitTime = Math.min(exitTimeX, exitTimeY);

  const noIntersection = entryTime < 0 || entryTime > exitTime || exitTime < 0;
  if (noIntersection) {
    return false;
  }

  return entryTime <= rayLength && entryTime >= 0;
};

/**
 * Returns false if no intersection.
 * Returns clamping position if there is an intersection.
 * Additionally returns the clamping position of the circle (simple to calculate with an aabb).
 */
export const circleIntersectsAABB = (
  circlePos: Vector,
  circleRadius: number,
  box: AABB
): { isIntersecting: false } | { isIntersecting: true; clampTo: Vector } => {
  const closestX = Math.max(
    box.pos.x,
    Math.min(circlePos.x, box.pos.x + box.w)
  );
  const closestY = Math.max(
    box.pos.y,
    Math.min(circlePos.y, box.pos.y + box.h)
  );
  const dx = circlePos.x - closestX;
  const dy = circlePos.y - closestY;
  const distanceSquared = dx * dx + dy * dy;

  const intersects = distanceSquared < circleRadius ** 2;

  if (!intersects) {
    return { isIntersecting: false };
  }

  // Intersecting with vertical section.
  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      isIntersecting: true,
      clampTo: {
        x: closestX + Math.sign(dx) * circleRadius,
        y: circlePos.y,
      },
    };
  }
  // Intersecting with horizontal section.
  return {
    isIntersecting: true,
    clampTo: {
      x: circlePos.x,
      y: closestY + Math.sign(dy) * circleRadius,
    },
  };
};
