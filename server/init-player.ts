import { uniqueNamesGenerator, Config, starWars } from "unique-names-generator";

import {
  BOUNDING_WALL_SIZE,
  COLORS,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../game/constants";
import { context } from "./context";
import { PLAYER_MAX_HEALTH, PLAYER_RADIUS } from "../game/entities/player";
import { isBulletIntersectingPlayerPos } from "../game/entities/bullet";
import { Vector } from "../game/types";
import { isPickupIntersectingPlayerPos } from "../game/entities/pickup";
import {
  circleIntersectsAABB,
  circleIntersectsCircle,
} from "../game/util/collision";

const uniqueNamesConfig: Config = {
  dictionaries: [starWars],
};

/**
 * Return a random player color not assigned to another player.
 */
const assignColor = (myColor = "") => {
  const otherPlayers = Object.values(context.gameState.players);
  const otherPlayerHasSameColor = otherPlayers.some(
    ({ color }) => color === myColor
  );
  if (
    myColor !== "" &&
    (!otherPlayerHasSameColor ||
      otherPlayers.length >= COLORS.playerColors.length)
  ) {
    return myColor;
  }
  return assignColor(
    COLORS.playerColors[Math.floor(Math.random() * COLORS.playerColors.length)]
  );
};

const isPlayerPosIntersectingCollisionEntities = (playerPos: Vector) => {
  const bullets = context.gameState.bullets;
  for (let i = 0; i < bullets.length; i++) {
    if (isBulletIntersectingPlayerPos(playerPos, bullets[i])) {
      return true;
    }
  }

  const pickups = context.gameState.pickups;
  for (let i = 0; i < pickups.length; i++) {
    if (isPickupIntersectingPlayerPos(playerPos, pickups[i])) {
      return true;
    }
  }
  const walls = context.gameState.walls;
  for (let i = 0; i < walls.length; i++) {
    const { isIntersecting } = circleIntersectsAABB(
      playerPos,
      PLAYER_RADIUS,
      walls[i].box
    );
    if (isIntersecting) {
      return true;
    }
  }

  const players = Object.values(context.gameState.players);
  for (let i = 0; i < players.length; i++) {
    if (
      circleIntersectsCircle(
        playerPos,
        PLAYER_RADIUS,
        players[i].pos,
        PLAYER_RADIUS
      )
    ) {
      return true;
    }
  }

  return false;
};

const getRandomPlayerPos = () => {
  let iterations = 0; // Just in case, let's avoid an infinite loop.
  let newPlayerPos: Vector;
  do {
    iterations++;
    newPlayerPos = {
      x:
        Math.floor(
          Math.random() *
            (MAP_WIDTH - BOUNDING_WALL_SIZE - 100 - BOUNDING_WALL_SIZE - 100)
        ) +
        BOUNDING_WALL_SIZE +
        100,
      y:
        Math.floor(
          Math.random() *
            (MAP_HEIGHT - BOUNDING_WALL_SIZE - 100 - BOUNDING_WALL_SIZE - 100)
        ) +
        BOUNDING_WALL_SIZE +
        100,
    };
  } while (
    iterations < 20 &&
    isPlayerPosIntersectingCollisionEntities(newPlayerPos)
  );

  return newPlayerPos;
};

export const initNewPlayer = (id: string, name?: string) => {
  console.log(`Initializing new player! name: ${name}, id: ${id}`);

  context.gameState.players[id] = {
    color: assignColor(),
    id: id,
    name: name || uniqueNamesGenerator(uniqueNamesConfig),
    spawnTimestamp: Date.now(),
    lastDamagedTimestamp: undefined,
    dead: false,
    dash: {
      isDashing: false,
      dashDistanceElapsed: 0,
      remainingDashCooldown: 0,
    },
    pos: getRandomPlayerPos(),
    health: PLAYER_MAX_HEALTH,
    powerups: {
      Speed: { timestamp: undefined },
      BulletSpeed: { timestamp: undefined },
      BulletSize: { timestamp: undefined },
      Spread: { timestamp: undefined },
    },
  };
};
