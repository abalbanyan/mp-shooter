import { PlayerEntity } from "../game/types";
import { context } from "./context";
import { applyPlayerInput } from "../game/entities/player";

export const setupInput = () => {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    // had to comment this out because it broke the join form
    // e.preventDefault(); // no scrolling!!!
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
      case "ShiftLeft":
        context.keys.dash = true;
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
      case "ShiftLeft":
        context.keys.dash = false;
        break;
    }
  });

  document.addEventListener("mousedown", (event) => {
    switch (event.button) {
      case 0:
        context.keys.attack = true;
        break;
      case 2:
        context.keys.dash = true;
        break;
    }
  });

  document.addEventListener("mouseup", (event) => {
    switch (event.button) {
      case 0:
        context.keys.attack = false;
        break;
      case 2:
        context.keys.dash = false;
        break;
    }
  });

  context.canvas.addEventListener("mousemove", (event) => {
    const rect = context.canvas.getBoundingClientRect();
    context.mousePos.x = event.clientX - rect.left;
    context.mousePos.y = event.clientY - rect.top;
  });

  // Disable right click menu
  context.canvas.addEventListener("contextmenu", (event) =>
    event.preventDefault()
  );
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

  applyPlayerInput(gameState, player, delta, keys);
};
