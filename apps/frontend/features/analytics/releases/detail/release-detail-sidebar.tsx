import Link from "next/link";

import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { cn } from "@/lib/utils";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

type SummaryTone = "up" | "down" | "neutral";

function toneForSummaryItem(label: string, value: string, idx: number): SummaryTone {
  const l = label.toLowerCase();
  const v = value.toLowerCase();
  if (l.includes("статус") || v.includes("раунд")) {
    if (v.includes("окончен") || v.includes("закрыт") || v.includes("пауза")) return "down";
    if (v.includes("актив") || v.includes("открыт")) return "up";
    return "neutral";
  }
  if (v.includes("+") || v.includes("рост") || l.includes("gross")) return "up";
  if (v.includes("-") || v.includes("снижен")) return "down";
  return (["neutral", "up", "neutral", "down"] as const)[idx % 4];
}

function toneValueClass(tone: SummaryTone): string {
  if (tone === "up") return "text-emerald-300";
  if (tone === "down") return "text-rose-300";
  return "text-white";
}

function SummarySparkline({ tone }: { tone: SummaryTone }) {
  const values =
    tone === "up"
      ? [16, 15, 17, 16, 18, 17, 19, 18, 20, 21]
      : tone === "down"
        ? [21, 20, 19, 20, 18, 17, 16, 17, 15, 14]
        : [18, 17.5, 18.5, 17, 18, 17.5, 18, 17, 18.5, 18];
  const trend = tone === "neutral" ? "flat" : tone;
  return (
    <ExchangeNeonSparkline values={values} trend={trend} width={68} height={26} detailSegments={4} />
  );
}

export function ReleaseDetailSidebar({
  data,
  personalLedgerHref,
}: {
  data: ReleaseDetailPageData;
  /** Ссылка на персональный экран (`?view=ledger`); не карточка актива. */
  personalLedgerHref?: string;
}) {
  return (
    <aside className="rounded-2xl bg-[#0d0d0d] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
      <div className="rounded-xl bg-[#090909] px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Пульс релиза</p>
        <p className="mt-1 text-[11px] leading-snug text-zinc-600">
          Ключевые сигналы по треку: динамика, статус и ориентиры в одном срезе.
        </p>
      </div>
      <dl className="mt-2 grid gap-1.5">
        {data.summaryPanel.map((item, idx) => {
          const featured = idx === 0;
          const tone = toneForSummaryItem(item.label, item.value, idx);
          return (
            <div
              key={item.label}
              className="rounded-xl bg-[#090909] px-3 py-2.5"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{item.label}</dt>
                  <dd className="mt-1">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={cn(
                          "font-mono font-semibold hover:text-zinc-300",
                          toneValueClass(tone),
                          featured ? "text-2xl leading-none" : "text-lg leading-tight",
                        )}
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          "font-mono font-semibold",
                          toneValueClass(tone),
                          featured ? "text-2xl leading-none" : "text-lg leading-tight",
                        )}
                      >
                        {item.value}
                      </span>
                    )}
                    {item.hint ? <p className="mt-0.5 text-[11px] text-zinc-600">{item.hint}</p> : null}
                  </dd>
                  {featured ? <div className="mt-2 h-px w-full bg-white/8" aria-hidden /> : null}
                </div>
                {!featured ? <SummarySparkline tone={tone} /> : null}
              </div>
            </div>
          );
        })}
      </dl>
      {personalLedgerHref ? (
        <div className="mt-4 border-t border-white/8 pt-4">
          <Link
            href={personalLedgerHref}
            className="block rounded-xl border border-white/10 bg-[#090909] px-3 py-3 text-[13px] font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
          >
            Моя история по релизу
          </Link>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
            Заявки, исполнения и выплаты по вашей позиции (mock). Не путать с общей аналитикой актива.
          </p>
        </div>
      ) : null}
    </aside>
  );
}
