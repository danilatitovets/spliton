/** Равномерная интерполяция между опорными точками — плотнее линия/бары без смены исходных данных. */
export function densifySeries(values: number[], targetLen = 32): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return Array.from({ length: targetLen }, () => values[0]);
  const n = Math.max(2, Math.floor(targetLen));
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (values.length - 1);
    const j = Math.floor(t);
    const f = t - j;
    const a = values[j] ?? 0;
    const b = values[j + 1] ?? a;
    out.push(a + (b - a) * f);
  }
  return out;
}
