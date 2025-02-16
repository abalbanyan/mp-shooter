import { PowerupType } from "../../game/entities/powerup";

export const loadImages = (paths: string[]) =>
  paths.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });

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
