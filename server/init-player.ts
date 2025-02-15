import { uniqueNamesGenerator, Config, starWars } from "unique-names-generator";

import { COLORS } from "../game/constants";
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
    pos: {
      x: Math.floor(Math.random() * (500 - 20)),
      y: Math.floor(Math.random() * (500 - 20)),
    },
    health: 5,
  };
};
