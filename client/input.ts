import { Direction } from "../game/types";
import { context } from "./context";
import { movePlayer } from "../game/entities/player";

export const setupInput = () => {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    e.preventDefault(); // no scrolling!!!
    switch (e.code) {
      case "ArrowUp":
        context.keys.up = true;
        break;
      case "ArrowDown":
        context.keys.down = true;
        break;
      case "ArrowLeft":
        context.keys.left = true;
        break;
      case "ArrowRight":
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
        context.keys.up = false;
        break;
      case "ArrowDown":
        context.keys.down = false;
        break;
      case "ArrowLeft":
        context.keys.left = false;
        break;
      case "ArrowRight":
        context.keys.right = false;
        break;
      case "Space":
        context.keys.attack = false;
        break;
    }
  });
};

/**
 * Perform client actions based on currently pressed keys.
 */
export const playerProcessInput = () => {
  if (!context.id) {
    return;
  }

  const { id, keys, gameState, delta } = context;

  const player = gameState.players[id];
  if (!player) {
    // Player not initialized yet.
    // console.error("Missing player entity.");
    return;
  }

  if (keys.up) {
    movePlayer(player, Direction.Up, delta);
  }
  if (keys.down) {
    movePlayer(player, Direction.Down, delta);
  }
  if (keys.left) {
    movePlayer(player, Direction.Left, delta);
  }
  if (keys.right) {
    movePlayer(player, Direction.Right, delta);
  }
};
