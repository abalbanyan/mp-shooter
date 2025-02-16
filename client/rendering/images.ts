import { PowerupType } from "../../game/entities/powerup";

export const loadImage = (path: string) => {
  const img = new Image();
  img.src = path;
  return img;
};

export const loadImages = (paths: string[]) => paths.map(loadImage);

export const POWERUP_IMAGES: Record<PowerupType, HTMLImageElement[]> = {
  Speed: loadImages([
    "/powerup/speed/speedup_1.png",
    "/powerup/speed/speedup_2.png",
    "/powerup/speed/speedup_3.png",
  ]),
  BulletSpeed: loadImages([
    "/powerup/bullet_speed/bullet_speed_1.png",
    "/powerup/bullet_speed/bullet_speed_2.png",
    "/powerup/bullet_speed/bullet_speed_3.png",
  ]),
};

export const TILES = {
  walls: {
    base: loadImage("/walls/base_wall_tile.png"),
    busted: loadImage("/walls/busted_wall_tile.png"),
  },
};
