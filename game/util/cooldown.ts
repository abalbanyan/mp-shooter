export const onCooldown = (
  timeStamp: number | undefined,
  cooldownMs: number
) => {
  if (!timeStamp) {
    return false;
  }
  const now = Date.now();
  return now < timeStamp + cooldownMs;
};
