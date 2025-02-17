import { PLAYER_RADIUS } from "../../../game/entities/player";
import { PlayerEntity } from "../../../game/types";
import { HEARTS } from "../images";
import { getAnimationFrame } from "../util/animate-frame";

const HEART_ANIMATION_FRAME_DURATION_MS = 500;
const HEART_SIZE = 12;
const HEART_SPACING = 2;

export const drawHealth = (
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity
) => {
  const frameFullHeart = getAnimationFrame(
    HEARTS.full,
    HEART_ANIMATION_FRAME_DURATION_MS
  );
  const frameBrokenHeart = getAnimationFrame(
    HEARTS.broke,
    HEART_ANIMATION_FRAME_DURATION_MS
  );
  const numHearts = Math.ceil(player.health / 2);

  for (let i = 0; i < numHearts; i++) {
    ctx.drawImage(
      numHearts - i === 1 && player.health % 2 === 1
        ? frameBrokenHeart
        : frameFullHeart,
      player.pos.x - PLAYER_RADIUS + i * (HEART_SIZE + HEART_SPACING),
      player.pos.y + PLAYER_RADIUS + 5,
      HEART_SIZE,
      HEART_SIZE
    );
  }
};
