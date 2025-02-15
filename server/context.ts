import { GameState } from "../game/types";

type ServerContext = {
  lastTime: number;
  gameState: GameState;
};

export const context: ServerContext = {
  lastTime: performance.now(),
  gameState: {
    players: {},
    bullets: [],
  },
};
