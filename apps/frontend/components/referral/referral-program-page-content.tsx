"use client";

import {
  Check,
  Copy,
  Gift,
  Share2,
  UserCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { ReferralFaqList } from "@/components/referral/referral-faq-list";
import {
  buildReferralLink,
  getReferralRewardsHistory,
  referralFaqItems,
  referralProgramStats,
  REFERRAL_CODE,
  type ReferralRewardStatus,
} from "@/components/referral/referral-mock-data";
import { Button } from "@/components/ui/button";
import type { ReferralProgramTabId } from "@/constants/dashboard/referral-program";
import { cn } from "@/lib/utils";

const usdt = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FILTER_OPTIONS: { id: "all" | ReferralRewardStatus; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "pending", label: "В ожидании" },
  { id: "available", label: "Доступно" },
  { id: "paid", label: "Выплачено" },
  { id: "rejected", label: "Отклонено" },
  { id: "cancelled", label: "Отменено" },
];

function statusLabel(s: ReferralRewardStatus) {
  const map: Record<ReferralRewardStatus, string> = {
    pending: "В ожидании",
    available: "Доступно",
    paid: "Выплачено",
    rejected: "Отклонено",
    cancelled: "Отменено",
  };
  return map[s];
}

function statusPillClass(s: ReferralRewardStatus) {
  const map: Record<ReferralRewardStatus, string> = {
    pending: "border-white/10 bg-white/5 text-zinc-200",
    available: "border-white/10 bg-white/5 text-zinc-100",
    paid: "border-white/10 bg-white/5 text-white",
    rejected: "border-white/10 bg-white/5 text-zinc-300",
    cancelled: "border-white/10 bg-white/5 text-zinc-400",
  };
  return map[s];
}

function useCopyFeedback() {
  const [key, setKey] = useState<string | null>(null);
  const flash = useCallback((id: string) => {
    setKey(id);
    window.setTimeout(() => setKey((k) => (k === id ? null : k)), 2000);
  }, []);
  return { key, flash };
}

function CopyField({
  label,
  value,
  copyId,
  copiedKey,
  onCopy,
}: {
  label: string;
  value: string;
  copyId: string;
  copiedKey: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const done = copiedKey === copyId;
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 rounded-xl bg-black px-3 py-2.5 font-mono text-xs text-zinc-200 ring-1 ring-white/10 sm:text-sm">
          <span className="break-all">{value}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCopy(value, copyId)}
          className="h-9 shrink-0 border-white/12 bg-[#0a0a0a] text-zinc-100 ring-1 ring-white/10 hover:bg-white/6"
        >
          {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span className="ml-1.5">{done ? "Скопировано" : "Копировать"}</span>
        </Button>
      </div>
    </div>
  );
}

export type ReferralProgramPageContentProps = {
  activeTab: ReferralProgramTabId;
  onRequestProgramTab?: () => void;
};

export function ReferralProgramPageContent({ activeTab, onRequestProgramTab }: ReferralProgramPageContentProps) {
  const [rewardFilter, setRewardFilter] = useState<(typeof FILTER_OPTIONS)[number]["id"]>("all");
  const { key: copiedKey, flash } = useCopyFeedback();

  const rewards = useMemo(() => getReferralRewardsHistory(), []);

  const rewardSummary = useMemo(() => {
    let total = 0;
    let pending = 0;
    let available = 0;
    let paid = 0;
    for (const r of rewards) {
      total += r.amountUsdt;
      if (r.status === "pending") pending += r.amountUsdt;
      if (r.status === "available") available += r.amountUsdt;
      if (r.status === "paid") paid += r.amountUsdt;
    }
    return { total, pending, available, paid };
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    if (rewardFilter === "all") return rewards;
    return rewards.filter((r) => r.status === rewardFilter);
  }, [rewards, rewardFilter]);

  const referralLink = buildReferralLink();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`;

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(id);
    } catch {
      flash(id);
    }
  }, [flash]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "RevShare",
      text: "Присоединяйся к RevShare — revenue share по музыкальным трекам.",
      url: referralLink,
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* user cancelled or share failed */
    }
    await handleCopy(referralLink, "share-fallback");
  }, [handleCopy, referralLink]);

  const steps = [
    {
      icon: UserPlus,
      title: "Пригласите друга",
      text: "Отправьте ссылку или код — регистрация по ним связывает аккаунт с вашим профилем.",
    },
    {
      icon: UserCheck,
      title: "Друг создаёт аккаунт",
      text: "После регистрации событие фиксируется в реферальной системе RevShare.",
    },
    {
      icon: Wallet,
      title: "Квалифицирующие действия",
      text: "Пополнение USDT (TRC20), покупка units или другие сценарии из актуальных правил.",
    },
    {
      icon: Gift,
      title: "Вы получаете награду",
      text: "Начисления отображаются во вкладке «Награды» и учитываются в сводке.",
    },
  ];

  const surfaceCard = "rounded-2xl bg-[#111111] ring-1 ring-white/[0.06]";
  const statTile = "rounded-2xl bg-[#0a0a0a] px-4 py-4 ring-1 ring-white/[0.06] sm:px-5 sm:py-5";

  return (
    <div className="space-y-8 pb-12">
      {activeTab === "program" ? (
        <div className="space-y-10">
          <section className="relative overflow-hidden rounded-3xl px-6 py-8 sm:px-8 sm:py-10">
            <Image
              src="/images/partner-programtab=about/back.jpg"
              alt=""
              fill
              className="object-cover object-center opacity-42"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/56" aria-hidden />
            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Приглашайте друзей и получайте награды</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Отправьте ссылку или код. Когда приглашённый выполняет условия программы, награды начисляются в USDT.
              </p>

              <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- внешний QR без next/image remote config */}
                <img src={qrSrc} alt="" width={176} height={176} className="size-44 rounded-lg" />
              </div>

              <div className="mt-7 space-y-4 text-left">
                <CopyField label="Реферальная ссылка" value={referralLink} copyId="link" copiedKey={copiedKey} onCopy={handleCopy} />
                <CopyField label="Реферальный код" value={REFERRAL_CODE} copyId="code" copiedKey={copiedKey} onCopy={handleCopy} />
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  className="border-white/15 bg-black/55 text-zinc-100 hover:bg-white/10"
                >
                  {copiedKey === "share-fallback" ? <Check className="size-3.5" aria-hidden /> : <Share2 className="size-3.5" aria-hidden />}
                  <span className="ml-1.5">{copiedKey === "share-fallback" ? "Ссылка скопирована" : "Поделиться"}</span>
                </Button>
              </div>
            </div>
          </section>

          <section className={cn("rounded-3xl bg-[#121212] p-6 sm:p-8")}>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Как это работает</h2>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">Четыре шага от приглашения до начисления.</p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl bg-zinc-900/55 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/18">
                      <s.icon className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Шаг {i + 1}</p>
                      <p className="mt-1 font-semibold text-zinc-100">{s.title}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-300 sm:text-sm">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl bg-[#121212] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Сводка по приглашениям</h2>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">Ориентиры по мок-данным; после API подставятся реальные значения.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Приглашено", value: String(referralProgramStats.invitedUsers) },
                { label: "Активные рефералы", value: String(referralProgramStats.activeReferrals) },
                {
                  label: "Награды в ожидании",
                  value: `${usdt.format(referralProgramStats.pendingRewardsUsdt)} USDT`,
                  mono: true,
                },
                {
                  label: "Всего заработано",
                  value: `${usdt.format(referralProgramStats.earnedRewardsTotalUsdt)} USDT`,
                  mono: true,
                  accent: true,
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className={cn(
                    "rounded-2xl bg-zinc-900/55 px-4 py-4 sm:px-5 sm:py-5",
                    c.accent && "bg-white/10",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{c.label}</p>
                  <p
                    className={cn(
                      "mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl",
                      c.mono && "font-mono text-lg sm:text-xl",
                      c.accent && "text-white",
                    )}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={cn("p-6 sm:p-8", surfaceCard)}>
            <h2 className="text-lg font-semibold text-white">Вопросы и ответы</h2>
            <p className="mt-1 text-sm text-zinc-500">Коротко о правилах и статусах — без юридической замены оферты.</p>
            <ReferralFaqList items={referralFaqItems} defaultOpenId={referralFaqItems[0]?.id ?? null} />
          </section>
        </div>
      ) : null}

      {activeTab === "rewards" ? (
        <div className="space-y-8">
          <section className="rounded-3xl bg-[#121212] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Сводка по наградам</h2>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">Агрегаты по текущему списку начислений в кабинете.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Всего по строкам", value: `${usdt.format(rewardSummary.total)} USDT`, mono: true },
                { label: "В ожидании", value: `${usdt.format(rewardSummary.pending)} USDT`, mono: true },
                { label: "Доступно", value: `${usdt.format(rewardSummary.available)} USDT`, mono: true },
                { label: "Выплачено", value: `${usdt.format(rewardSummary.paid)} USDT`, mono: true, accent: true },
              ].map((c) => (
                <div
                  key={c.label}
                  className={cn(
                    "rounded-2xl bg-zinc-900/55 px-4 py-4 sm:px-5 sm:py-5",
                    c.accent && "bg-white/10",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{c.label}</p>
                  <p
                    className={cn(
                      "mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl",
                      c.mono && "font-mono text-lg sm:text-xl",
                      c.accent && "text-white",
                    )}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[#121212] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">История наград</h2>
                <p className="mt-2 text-sm text-zinc-300">Фильтр по статусу, маскированные идентификаторы приглашённых.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по статусу награды">
              {FILTER_OPTIONS.map((f) => {
                const active = rewardFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setRewardFilter(f.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                      active
                        ? "bg-white/14 text-white ring-white/22"
                        : "bg-transparent text-zinc-400 ring-white/10 hover:bg-white/4 hover:text-zinc-200",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {rewards.length === 0 ? (
              <div className="mt-10 flex flex-col items-center rounded-2xl bg-zinc-900/55 px-6 py-14 text-center">
                <p className="text-lg font-semibold text-white">Пока нет наград</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Как только приглашённые пользователи выполнят условия программы, строки появятся здесь автоматически.
                </p>
                <Button
                  type="button"
                  className="mt-6 bg-white text-black hover:bg-zinc-200"
                  onClick={() => onRequestProgramTab?.()}
                >
                  Пригласить друзей
                </Button>
              </div>
            ) : filteredRewards.length === 0 ? (
              <div className="mt-10 flex flex-col items-center rounded-2xl bg-zinc-900/55 px-6 py-12 text-center">
                <p className="font-medium text-white">Нет записей для выбранного статуса</p>
                <p className="mt-2 text-sm text-zinc-500">Смените фильтр или сбросьте на «Все».</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 border-white/12 bg-[#0a0a0a] text-zinc-100 ring-1 ring-white/10 hover:bg-white/6"
                  onClick={() => setRewardFilter("all")}
                >
                  Показать все
                </Button>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl bg-zinc-900/45">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      <th className="px-4 py-3 font-medium">Дата</th>
                      <th className="px-4 py-3 font-medium">Приглашённый</th>
                      <th className="px-4 py-3 font-medium">Тип</th>
                      <th className="px-4 py-3 font-medium">Статус</th>
                      <th className="px-4 py-3 font-medium text-right">Сумма</th>
                      <th className="px-4 py-3 font-medium">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRewards.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/6 transition-colors hover:bg-white/4 last:border-0"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-300">{row.date}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-300">{row.inviteeMasked}</td>
                        <td className="px-4 py-3.5 text-zinc-200">{row.rewardType}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                              statusPillClass(row.status),
                            )}
                          >
                            {statusLabel(row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs text-zinc-100">
                          {usdt.format(row.amountUsdt)} USDT
                        </td>
                        <td className="max-w-[220px] px-4 py-3.5 text-xs text-zinc-400">{row.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
