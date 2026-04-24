export function buildLinePath(
  values: number[],
  width: number,
  height: number,
  paddingX = 0,
  paddingY = 0,
  domain?: { min: number; max: number },
) {
  const min = domain?.min ?? Math.min(...values);
  const max = domain?.max ?? Math.max(...values);
  const span = max - min || 1;
  const denom = Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const x = paddingX + (i / denom) * (width - paddingX * 2);
      const y = paddingY + (1 - (v - min) / span) * (height - paddingY * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
