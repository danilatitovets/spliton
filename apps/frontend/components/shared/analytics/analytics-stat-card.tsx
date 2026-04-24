export function AnalyticsStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-[#111111] px-3.5 py-3">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-1.5 font-mono text-lg font-semibold tabular-nums tracking-tight text-white">{value}</div>
      {hint ? <div className="mt-1 font-sans text-[11px] text-zinc-600">{hint}</div> : null}
    </div>
  );
}
