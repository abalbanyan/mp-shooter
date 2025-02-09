import { GameState } from "../game/types";

type ServerContext = {
  gameState: GameState;
};

export const context: ServerContext = {
  gameState: {
    players: {},
  },
};
