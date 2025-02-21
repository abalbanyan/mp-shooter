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
        context.input.up = true;
        break;
      case "ArrowDown":
      case "KeyS":
        context.input.down = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        context.input.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        context.input.right = true;
        break;
      case "Space":
        context.input.attack = true;
        break;
      case "ShiftLeft":
        context.input.dash = true;
        break;
    }
  });

  document.addEventListener("keyup", (e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        context.input.up = false;
        break;
      case "ArrowDown":
      case "KeyS":
        context.input.down = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        context.input.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        context.input.right = false;
        break;
      case "Space":
        context.input.attack = false;
        break;
      case "ShiftLeft":
        context.input.dash = false;
        break;
    }
  });

  document.addEventListener("mousedown", (event) => {
    switch (event.button) {
      case 0:
        context.input.attack = true;
        break;
      case 1:
        context.input.hi = true;
        break;
      case 2:
        context.input.dash = true;
        break;
    }
  });

  document.addEventListener("mouseup", (event) => {
    switch (event.button) {
      case 0:
        context.input.attack = false;
        break;
      case 1:
        context.input.hi = false;
        break;
      case 2:
        context.input.dash = false;
        break;
    }
  });

  context.canvas.addEventListener("mousemove", (event) => {
    const rect = context.canvas.getBoundingClientRect();
    context.mousePos.x = event.clientX - rect.left;
    context.mousePos.y = event.clientY - rect.top;
  });

  // Disable right click menu
  document.addEventListener("contextmenu", (event) => event.preventDefault());
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

  const { id, input: keys, gameState, delta, mousePos } = context;

  const myPlayer = gameState.players[id];
  if (!myPlayer) {
    return;
  }

  context.input.bulletTrajectory = calculateBulletTrajectory(
    myPlayer,
    mousePos
  );
  myPlayer.bulletTrajectory = context.input.bulletTrajectory;

  applyPlayerInput(gameState, myPlayer, delta, keys);
};
