import { context } from "./context";

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
