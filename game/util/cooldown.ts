export const onCooldown = (
  timeStamp: number | undefined,
  cooldownMs: number
) => {
  if (!timeStamp) {
    return false;
  }
  const now = new Date().getTime();
  return now < timeStamp + cooldownMs;
};
