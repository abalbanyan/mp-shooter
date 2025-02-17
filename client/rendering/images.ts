import type { PickupType } from "../../game/entities/pickup";

export const loadImage = (path: string) => {
  const img = new Image();
  img.src = path;
  return img;
};

export const loadImages = (paths: string[]) => paths.map(loadImage);

export const PICKUPS: Record<PickupType, HTMLImageElement[]> = {
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
  BulletSize: loadImages([
    "/bulletsize/bulletsize_1.png",
    "/bulletsize/bulletsize_2.png",
    "/bulletsize/bulletsize_3.png",
  ]),
  Spread: loadImages([
    "/spread/spread_1.png",
    "/spread/spread_2.png",
    "/spread/spread_3.png",
  ]),
  Health: loadImages([
    "/health/health_1.png",
    "/health/health_2.png",
    "/health/health_3.png",
  ]),
};

export const HEARTS = {
  full: loadImages([
    "/hearts/heart_1.png",
    "/hearts/heart_2.png",
    "/hearts/heart_3.png",
  ]),
  broke: loadImages([
    "/hearts/heart_broke_12.png",
    "/hearts/heart_broke_22.png",
    "/hearts/heart_broke_32.png",
  ]),
};

export const TILES = {
  walls: {
    base: loadImage("/walls/base_wall_tile.png"),
    busted: loadImage("/walls/busted_wall_tile.png"),
  },
};
