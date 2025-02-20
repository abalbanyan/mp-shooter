import type { GameState, PlayerInputSequenceNumbers } from "../game/types";
import { initialGameState } from "./init-game";

type ServerContext = {
  lastTime: number;
  gameState: GameState;
  lastProcessedPlayerSequenceNumbers: PlayerInputSequenceNumbers;
};

export const context: ServerContext = {
  lastTime: performance.now(),

  gameState: initialGameState,

  lastProcessedPlayerSequenceNumbers: {},
};
