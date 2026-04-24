/** Плотная «сглаженная» серия между опорными точками — как на графике доходности (mock-детализация). */
export function buildDetailedSeries(base: number[], pointsPerSegment = 5) {
  if (base.length <= 1) return [...base];
  const next: number[] = [];
  for (let i = 0; i < base.length - 1; i++) {
    const a = base[i]!;
    const b = base[i + 1]!;
    const diff = b - a;
    next.push(a);
    for (let s = 1; s < pointsPerSegment; s++) {
      const t = s / pointsPerSegment;
      const smooth = t * t * (3 - 2 * t);
      const waveSeed = (i + 1) * 0.83 + s * 1.37;
      const wave = Math.sin(waveSeed) * 0.16 + Math.cos(waveSeed * 1.91) * 0.07;
      const micro = wave * Math.max(0.28, Math.abs(diff) * 0.08);
      next.push(a + diff * smooth + micro);
    }
  }
  next.push(base[base.length - 1]!);
  return next;
}
