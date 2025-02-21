/**
 * TODO: As this file as grown, I think it makes more sense to colocate entity type declararations
 * with the entities themselves.
 */

import type { PowerupType } from "../game/entities/powerup";
import type { PickupType } from "./entities/pickup";
import type { TeleportEntity } from "./entities/teleport";

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
  spawnTimestamp: number;
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
    remainingDashCooldown: number;
  };
  lastBulletFiredTimestamp?: number; // TODO: convert to cooldown duration
  lastDamagedTimestamp?: number; // TODO: convert to cooldown duration
  teleportCooldown: number;
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
  big: boolean;
  /** for simplicity, only allow bullet to teleport once for now */
  hasTeleported?: boolean;
  hi?: boolean;
};

export type WallEntity = {
  box: AABB;
};

export type PickupEntity = {
  pos: Vector;
  type: PickupType;
  /** undefined means it's spawned */
  collectedAtTimestamp?: number;
};

export type GameState = {
  players: { [id: string]: PlayerEntity };
  bullets: BulletEntity[];
  walls: WallEntity[];
  pickups: PickupEntity[];
  teleports: TeleportEntity[];
  /** All scores are name -> score mappings; players are intentionally allowed to re-use names. */
  scores: Record<
    string,
    {
      kills: number;
      deaths: number;
      damage: number;
    }
  >;
  map?: {
    h: number;
    w: number;
  };
};

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export type PlayerInputSequenceNumbers = Record<string, number>;

export type PlayerInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  dash: boolean;
  /** normalized vector */
  bulletTrajectory?: Vector;
  hi: boolean;
};

/**
 * Message sent by server to clients for reconcilliation
 */
export type IOMessageStateUpdate = {
  /**
   * For simplicity, we just send the entire game state.
   */
  gameState: GameState;
  timestamp: number;
  /**
   * Mapping of each playerId to an input sequence number.
   * This is used to accurately replay inputs on the client when a server update is received.
   * The sequence numbers are incremented on the client every time an input is made and passed along
   * to the server. The server then echoes back the last processed sequence number when broadcasting updates.
   * Note that this is UNTRUSTED since sequence numbers come from the client.
   */
  lastProcessedPlayerSequenceNumbers: PlayerInputSequenceNumbers;
};

/**
 * Message sent by clients to server to notify of input.
 */
export type IOMessageInput = {
  inputMessages: {
    input: PlayerInput;
    /** client timestamp */
    timestamp: number;
    sequenceNumber: number;
    /**
     * I think it might be insecure to send delta, but I don't know of a better way to handle this.
     * Perhaps we can clamp the delta on the server to prevent cheating?
     * Then the user will rubber-band if they're lagging, but we can interpolate.
     * https://gamedev.stackexchange.com/questions/150774/online-multiplayer-cheating-w-delta-time-movement
     */
    delta: number;
  }[];
};

/**
 * Message sent by clients to notify that they have selected a name and would like to join the game.
 */
export type IOMessagePlayerJoin = {
  name?: string;
};

export type GetSuggestedNameResponse = {
  name: string;
};
