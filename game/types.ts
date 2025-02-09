export type PlayerEntity = {
  id: string;
  pos: {
    x: number;
    y: number;
  };
  health: number;
};

export type GameState = {
  players: { [id: string]: PlayerEntity };
};

export type SocketEventGameStateUpdate = {
  tick: number;
  gameState: GameState;
};

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export type PlayerInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
};

export type InputMessage = {
  tick: number; // ?
  input: PlayerInput;
};
