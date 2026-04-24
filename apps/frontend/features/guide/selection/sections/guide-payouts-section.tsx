import { GuideSectionShell } from "../ui/guide-section-shell";

const SERIES = [
  { label: "Jan", value: 84_200, status: "released" as const },
  { label: "Feb", value: 79_440, status: "released" as const },
  { label: "Mar", value: 92_110, status: "released" as const },
  { label: "Apr", value: 88_300, status: "accrued" as const },
] as const;

const CONTEXT = [
  [
    "Регулярность",
    "Ищите предсказуемый ритм начислений и узкий диапазон отклонений период к периоду.",
  ],
  [
    "Accrued vs released",
    "Сопоставляйте начисленное и выплаченное, чтобы видеть реальный cashflow.",
  ],
  [
    "Умеренный yield",
    "Стабильный умеренный % часто предпочтительнее агрессивной сделки с высокой волатильностью.",
  ],
] as const;

function formatKRub(v: number) {
  return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
}

function PayoutTrendChart() {
  const w = 440;
  const h = 220;
  const pad = { t: 18, r: 14, b: 42, l: 46 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const values = SERIES.map((s) => s.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, 1);
  const minV = rawMin - span * 0.12;
  const maxV = rawMax + span * 0.12;

  const xAt = (i: number) => pad.l + (i / (SERIES.length - 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const linePath = SERIES.map((s, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(s.value).toFixed(1)}`).join(" ");
  const lastX = xAt(SERIES.length - 1);
  const firstX = xAt(0);
  const baseY = h - pad.b;
  const areaPath = `${linePath} L ${lastX.toFixed(1)} ${baseY} L ${firstX.toFixed(1)} ${baseY} Z`;

  const gridTicks = 4;
  const gridLines = Array.from({ length: gridTicks + 1 }, (_, i) => {
    const v = minV + (i / gridTicks) * (maxV - minV);
    const y = yAt(v);
    return { y, label: formatKRub(v) };
  });

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[220px] w-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Условный график выплат по месяцам: рост с просадкой в феврале и последняя точка в статусе accrued"
      >
        <title>Тренд выплат по месяцам (mock)</title>
        <defs>
          <linearGradient id="guide-payout-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#B7F500" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#B7F500" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#B7F500" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="guide-payout-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#71717a" />
            <stop offset="100%" stopColor="#B7F500" />
          </linearGradient>
        </defs>

        {gridLines.map(({ y, label }, gi) => (
          <g key={gi}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={4} y={y + 4} className="fill-zinc-600" fontSize="10" fontFamily="ui-monospace, monospace">
              {label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#guide-payout-area)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#guide-payout-line)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {SERIES.map((s, i) => {
          const cx = xAt(i);
          const cy = yAt(s.value);
          const isAccrued = s.status === "accrued";
          return (
            <g key={s.label}>
              <circle
                cx={cx}
                cy={cy}
                r={isAccrued ? 6 : 5}
                fill={isAccrued ? "#0a0a0a" : "#171717"}
                stroke={isAccrued ? "#B7F500" : "#a1a1aa"}
                strokeWidth={isAccrued ? 2 : 1.5}
              />
              <text
                x={cx}
                y={baseY + 16}
                textAnchor="middle"
                className="fill-zinc-500"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap justify-between gap-2 pt-1 font-mono text-[10px] text-zinc-600">
        <span>Mock · не реальные данные</span>
        <span className="text-zinc-500">
          Apr · <span className="text-[#c4f570]">accrued</span>
        </span>
      </div>
    </div>
  );
}

export function GuidePayoutsSection() {
  return (
    <GuideSectionShell
      id="payouts"
      title="Как оценивать выплаты"
      subtitle="Тренд по периодам нагляднее таблицы: смотрите ритм, просадки и последнюю точку в статусе accrued vs released."
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-xl bg-[#111111] p-5 md:p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Payout trend · mock</div>
          <PayoutTrendChart />
          <div className="mt-4 overflow-hidden rounded-lg bg-[#0a0a0a]">
            {SERIES.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] md:px-4"
              >
                <span className="text-zinc-500">{row.label}</span>
                <span className="tabular-nums text-zinc-200">₽ {row.value.toLocaleString("ru-RU")}</span>
                <span className={row.status === "accrued" ? "text-[#c4f570]" : "text-zinc-500"}>{row.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#111111] px-5 py-5 md:px-6 md:py-6">
          <div className="space-y-8">
            {CONTEXT.map(([title, body]) => (
              <div key={title}>
                <div className="text-sm font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GuideSectionShell>
  );
}
