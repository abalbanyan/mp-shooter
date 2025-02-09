import { GameState, IOMessageInput, PlayerInput } from "../game/types";
import { renderGameState } from "./render";

type ClientContext = {
  lastTime: number;
  delta: number;
  id: null | string;
  gameState: GameState;
  keys: PlayerInput;
  inputBuffer: IOMessageInput["inputs"];
};

export const context: ClientContext = {
  lastTime: performance.now(),
  delta: 0,

  inputBuffer: [],
  id: null,
  gameState: {
    players: {},
  },
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  },
};

export const updateClientGameState = (newState: GameState) => {
  context.gameState.players = newState.players;
  renderGameState(context.gameState);
};

export const updateDelta = () => {
  const now = performance.now();
  context.delta = (now - context.lastTime) / 1000;
  context.lastTime = now;
};
