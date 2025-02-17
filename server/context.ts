import { GameState } from "../game/types";
import { initialGameState } from "./init-game";

type ServerContext = {
  lastTime: number;
  gameState: GameState;
};

export const context: ServerContext = {
  lastTime: performance.now(),

  gameState: initialGameState,
};
