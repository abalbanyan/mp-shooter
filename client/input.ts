import { Direction, PlayerEntity } from "../game/types";
import { context } from "./context";
import { actOnInput, movePlayer } from "../game/entities/player";
import { initBulletOnCooldown } from "../game/entities/bullet";

export const setupInput = () => {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    e.preventDefault(); // no scrolling!!!
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        context.keys.up = true;
        break;
      case "ArrowDown":
      case "KeyS":
        context.keys.down = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        context.keys.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        context.keys.right = true;
        break;
      case "Space":
        context.keys.attack = true;
        break;
    }
  });

  document.addEventListener("keyup", (e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        context.keys.up = false;
        break;
      case "ArrowDown":
      case "KeyS":
        context.keys.down = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        context.keys.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        context.keys.right = false;
        break;
      case "Space":
        context.keys.attack = false;
        break;
    }
  });

  context.canvas.addEventListener("mousemove", (event) => {
    const rect = context.canvas.getBoundingClientRect();
    context.mousePos.x = event.clientX - rect.left;
    context.mousePos.y = event.clientY - rect.top;
  });
};

/**
 * Determine normalized bullet trajectory vector based on mousePos.
 */
const calculateBulletTrajectory = (
  player: PlayerEntity,
  mousePos: { x: number; y: number }
) => {
  if (!mousePos.x || !mousePos.y) {
    return undefined;
  }

  const bulletTrajectory = {
    x: mousePos.x - player.pos.x,
    y: mousePos.y - player.pos.y,
  };
  const magnitude = Math.sqrt(
    bulletTrajectory.x ** 2 + bulletTrajectory.y ** 2 // wow!
  );
  const normalizedBulletTrajectory = {
    x: bulletTrajectory.x / magnitude,
    y: bulletTrajectory.y / magnitude,
  };
  return normalizedBulletTrajectory;
};

/**
 * Perform client actions based on currently pressed keys.
 */
export const playerProcessInput = () => {
  if (!context.id) {
    return;
  }

  const { id, keys, gameState, delta, mousePos } = context;

  const player = gameState.players[id];
  if (!player) {
    return;
  }

  player.bulletTrajectory = calculateBulletTrajectory(player, mousePos);

  actOnInput(gameState, player, delta, keys);
};
