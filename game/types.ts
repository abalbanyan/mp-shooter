export type PlayerEntity = {
  id: string;
  name: string;
  pos: {
    x: number;
    y: number;
  };
  health: number;
  color: string;
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

export type IOMessageStateUpdate = {
  /**
   * For simplicity, we just send the entire game state.
   */
  gameState: GameState;
};

export type IOMessageInput = {
  inputs: {
    input: PlayerInput;
    /**
     * I think it might be insecure to send delta, but I don't know of a better way to handle this.
     * Perhaps we can clamp the delta on the server to prevent cheating?
     * Then the user will rubber-band if they're lagging, but we can interpolate.
     * https://gamedev.stackexchange.com/questions/150774/online-multiplayer-cheating-w-delta-time-movement
     */
    delta: number;
  }[];
};
