import { GameState, IOMessageInput, PlayerInput } from "../game/types";
import type { PlayerGhostEntity } from "./rendering/entities/player-ghost";
import type { PlayerTrailEntity } from "./rendering/entities/player-trails";

type ClientContext = {
  /**
   * HTML canvas that we render the game to.
   */
  canvas: HTMLCanvasElement;
  lastTime: number;
  delta: number;
  id: null | string;
  input: PlayerInput;
  /** Input buffer for replaying inputs during reconciliation. */
  inputBufferForReplays: IOMessageInput["inputMessages"];
  /** Input buffer for sending inputs to the server.
   * (TODO: clever way to share with inputBufferForReplays. We need two states because they get cleared at different times.) */
  inputBufferForServer: IOMessageInput["inputMessages"];
  sequenceNumber: number;

  joinedGame: boolean;

  gameState: GameState;
  gameStateBuffer: {
    timestamp: number;
    gameState: GameState;
  }[];

  mousePos: {
    x: number;
    y: number;
  };

  // Client-only entities for visual effect.
  playerTrails: PlayerTrailEntity[];
  playerGhosts: PlayerGhostEntity[];

  lastPing: number;
  RTT: number;
  screenShake: boolean;

  debugInfo?: any;
};

export const context: ClientContext = {
  canvas: document.getElementById("gameCanvas") as HTMLCanvasElement,
  id: null,

  lastTime: performance.now(),
  delta: 0,

  inputBufferForReplays: [],
  inputBufferForServer: [],
  sequenceNumber: 1,

  joinedGame: false,

  gameState: {
    players: {},
    bullets: [],
    walls: [],
    pickups: [],
    scores: {},
  },

  gameStateBuffer: [],

  input: {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    dash: false,
    bulletTrajectory: undefined,
  },

  mousePos: {
    x: 0,
    y: 0,
  },

  playerTrails: [],
  playerGhosts: [],
  screenShake: false,

  lastPing: 0,
  RTT: 0,
};

// context.debugInfo = context.mousePos;

export const updateDelta = () => {
  const now = performance.now();
  context.delta = (now - context.lastTime) / 1000;
  context.lastTime = now;
};

export const pushInputToBuffer = () => {
  context.inputBufferForServer.push({
    timestamp: Date.now(),
    sequenceNumber: context.sequenceNumber,
    delta: context.delta,
    input: structuredClone(context.input),
  });
  context.inputBufferForReplays.push({
    timestamp: Date.now(),
    sequenceNumber: context.sequenceNumber,
    delta: context.delta,
    input: structuredClone(context.input),
  });
  if (context.inputBufferForReplays.length > 200) {
    context.inputBufferForReplays.shift();
  }
};

export const clearInputBuffer = () => {
  context.inputBufferForReplays = [];
  context.inputBufferForServer = [];
};
