import { uniqueNamesGenerator, Config, starWars } from "unique-names-generator";

import {
  BOUNDING_WALL_SIZE,
  COLORS,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../game/constants";
import { context } from "./context";

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

export const initNewPlayer = (id: string) => {
  console.log("Initializing new player!", id);
  context.gameState.players[id] = {
    color: assignColor(),
    id: id,
    name: uniqueNamesGenerator(uniqueNamesConfig),
    lastDamagedTimestamp: new Date().getTime(),
    dead: false,
    dash: {
      isDashing: false,
      dashDistanceElapsed: 0,
    },
    pos: {
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
    },
    health: 5,
  };
};
