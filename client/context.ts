import { GameState, IOMessageInput, PlayerInput } from "../game/types";
import { renderGameState } from "./render";

type ClientContext = {
  lastTime: number;
  delta: number;
  id: null | string;
  keys: PlayerInput;
  inputBuffer: IOMessageInput["inputs"];

  gameState: GameState;
  gameStateBuffer: {
    timestamp: number;
    gameState: GameState;
  }[];
};

export const context: ClientContext = {
  lastTime: performance.now(),
  delta: 0,

  inputBuffer: [],
  id: null,
  gameState: {
    players: {},
  },

  gameStateBuffer: [],

  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  },
};

export const updateDelta = () => {
  const now = performance.now();
  context.delta = (now - context.lastTime) / 1000;
  context.lastTime = now;
};
