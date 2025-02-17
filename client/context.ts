import { GameState, IOMessageInput, PlayerInput } from "../game/types";
import type { PlayerTrailEntity } from "./rendering/entities/player-trails";

type ClientContext = {
  /**
   * HTML canvas that we render the game to.
   */
  canvas: HTMLCanvasElement;
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

  mousePos: {
    x: number;
    y: number;
  };

  playerTrails: PlayerTrailEntity[];

  debugInfo?: any;
};

export const context: ClientContext = {
  canvas: document.getElementById("gameCanvas") as HTMLCanvasElement,

  lastTime: performance.now(),
  delta: 0,

  inputBuffer: [],
  id: null,
  gameState: {
    players: {},
    bullets: [],
    walls: [],
    pickups: [],
  },

  gameStateBuffer: [],

  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    dash: false,
  },

  mousePos: {
    x: 0,
    y: 0,
  },

  playerTrails: [],
};

context.debugInfo = context.mousePos;

export const updateDelta = () => {
  const now = performance.now();
  context.delta = (now - context.lastTime) / 1000;
  context.lastTime = now;
};
