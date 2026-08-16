/** Lightweight stage timer for cold-path diagnostics (no secrets). */
export type StageMs = Record<string, number>;

export function createStageTimer() {
  const started = performance.now();
  let last = started;
  const stages: StageMs = {};

  return {
    mark(name: string) {
      const now = performance.now();
      stages[name] = Math.round(now - last);
      last = now;
      return stages[name];
    },
    total() {
      return Math.round(performance.now() - started);
    },
    stages() {
      return { ...stages };
    },
  };
}