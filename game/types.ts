import type { PowerupType } from "../game/entities/powerup";

export type Vector = {
  x: number;
  y: number;
};

// https://www.sciencedirect.com/topics/computer-science/aligned-bounding-box
export type AABB = {
  pos: Vector;
  h: number;
  w: number;
};

export type Animation = {
  tick: number;
  id: string;
};

export type PlayerEntity = {
  id: string;
  name: string;
  pos: Vector;
  /** Normalized vector. */
  bulletTrajectory?: {
    x: number;
    y: number;
  };
  health: number;
  color: string;
  dead: boolean;
  dash: {
    isDashing: boolean;
    dashDistanceElapsed: number;
    normalizedDashDirection?: Vector;
    lastDashTimestamp?: number;
  };
  lastBulletFiredTimestamp?: number;
  lastDamagedTimestamp?: number;
  powerups: Record<PowerupType, { timestamp?: number }>;
};

export type BulletEntity = {
  pos: Vector;
  /** player that emitted the bullet */
  playerId: string;
  color: string;
  /** normalized vector, direction the bullet will travel */
  direction: Vector;
  deleted?: boolean;
};

export type WallEntity = {
  box: AABB;
};

export type PowerupEntity = {
  pos: Vector;
  type: PowerupType;
  /** undefined means it's spawned */
  collectedAtTimestamp?: number;
};

export type GameState = {
  players: { [id: string]: PlayerEntity };
  bullets: BulletEntity[];
  walls: WallEntity[];
  powerups: PowerupEntity[];
};

export type SocketEventGameStateUpdate = {
  timestamp: number;
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
  dash: boolean;
};

/**
 * Message sent by server to clients to force a state update.
 */
export type IOMessageStateUpdate = {
  /**
   * For simplicity, we just send the entire game state.
   */
  gameState: GameState;
};

/**
 * Message sent by clients to server to notify of input.
 */
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
  bulletTrajectory: PlayerEntity["bulletTrajectory"];
};
