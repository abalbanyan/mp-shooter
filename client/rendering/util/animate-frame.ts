export const getAnimationFrame = <T>(frames: T[], frameDurationMs: number) => {
  const frameDuration = frameDurationMs;
  const totalFrames = frames.length;
  const frameIndex =
    Math.floor(performance.now() / frameDuration) % totalFrames;

  return frames[frameIndex];
};
