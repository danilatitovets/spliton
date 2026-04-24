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
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    paid: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    rejected: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    cancelled: "border-white/10 bg-white/[0.04] text-neutral-400",
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
          className="h-9 shrink-0 border-white/12 bg-[#0a0a0a] text-zinc-100 ring-1 ring-white/10 hover:bg-white/[0.06]"
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
          <section className={cn("relative overflow-hidden px-6 py-8 sm:px-8 sm:py-9", surfaceCard)}>
            <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[#B7F500]/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-sky-500/8 blur-3xl" aria-hidden />
            <p className="relative max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              Делитесь платформой revenue share для музыкальных треков. За квалифицирующие действия приглашённых
              пользователей начисляются бонусы согласно правилам программы — спокойный, прозрачный механизм без лишнего
              шума.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.45fr)] lg:items-stretch">
            <div className={cn("p-6 sm:p-8", surfaceCard)}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Ваша ссылка и код</h2>
                  <p className="mt-1 text-sm text-zinc-500">Копируйте за один тап. Данные ниже — демонстрация UI.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="border-white/12 bg-[#0a0a0a] text-zinc-100 ring-1 ring-white/10 hover:bg-white/[0.06]"
                  >
                    {copiedKey === "share-fallback" ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      <Share2 className="size-3.5" aria-hidden />
                    )}
                    <span className="ml-1.5">{copiedKey === "share-fallback" ? "Ссылка скопирована" : "Поделиться"}</span>
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <CopyField
                  label="Реферальная ссылка"
                  value={referralLink}
                  copyId="link"
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
                <CopyField
                  label="Реферальный код"
                  value={REFERRAL_CODE}
                  copyId="code"
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </div>
            </div>

            <div className={cn("flex flex-col items-center justify-center p-6 sm:p-8", surfaceCard)}>
              <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                QR для ссылки
              </p>
              <div className="relative overflow-hidden rounded-xl bg-white p-2 ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- внешний QR без next/image remote config */}
                <img src={qrSrc} alt="" width={160} height={160} className="size-40 rounded-lg" />
              </div>
              <p className="mt-4 max-w-[220px] text-center text-xs text-zinc-500">
                Отсканируйте камерой телефона — откроется страница регистрации с вашим кодом.
              </p>
            </div>
          </section>

          <section className={cn("p-6 sm:p-8", surfaceCard)}>
            <h2 className="text-lg font-semibold text-white">Как это работает</h2>
            <p className="mt-1 text-sm text-zinc-500">Четыре шага от приглашения до начисления.</p>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="relative flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black text-[#d4f570] ring-1 ring-white/10">
                    <s.icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Шаг {i + 1}</p>
                    <p className="mt-1 font-medium text-zinc-100">{s.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Сводка по приглашениям</h2>
            <p className="mt-1 text-sm text-zinc-500">Ориентиры по мок-данным; после API подставятся реальные значения.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    statTile,
                    c.accent && "bg-[#B7F500]/[0.06] ring-[#B7F500]/22",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{c.label}</p>
                  <p
                    className={cn(
                      "mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl",
                      c.mono && "font-mono text-lg sm:text-xl",
                      c.accent && "text-[#d4f570]",
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
          <section>
            <h2 className="text-lg font-semibold text-white">Сводка по наградам</h2>
            <p className="mt-1 text-sm text-zinc-500">Агрегаты по текущему списку начислений в кабинете.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Всего по строкам", value: `${usdt.format(rewardSummary.total)} USDT`, mono: true },
                { label: "В ожидании", value: `${usdt.format(rewardSummary.pending)} USDT`, mono: true },
                { label: "Доступно", value: `${usdt.format(rewardSummary.available)} USDT`, mono: true },
                { label: "Выплачено", value: `${usdt.format(rewardSummary.paid)} USDT`, mono: true, accent: true },
              ].map((c) => (
                <div
                  key={c.label}
                  className={cn(
                    statTile,
                    c.accent && "bg-sky-500/10 ring-sky-400/20",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{c.label}</p>
                  <p
                    className={cn(
                      "mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl",
                      c.mono && "font-mono text-lg sm:text-xl",
                      c.accent && "text-sky-100",
                    )}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={cn("p-6 sm:p-8", surfaceCard)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">История наград</h2>
                <p className="mt-1 text-sm text-zinc-500">Фильтр по статусу, маскированные идентификаторы приглашённых.</p>
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
                        ? "bg-[#B7F500]/10 text-[#d4f570] ring-[#B7F500]/35"
                        : "bg-transparent text-zinc-400 ring-white/10 hover:bg-white/[0.04] hover:text-zinc-200",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {rewards.length === 0 ? (
              <div className="mt-10 flex flex-col items-center rounded-2xl bg-[#0a0a0a] px-6 py-14 text-center ring-1 ring-white/8">
                <p className="text-lg font-semibold text-white">Пока нет наград</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Как только приглашённые пользователи выполнят условия программы, строки появятся здесь автоматически.
                </p>
                <Button
                  type="button"
                  className="mt-6 bg-[#B7F500] text-black hover:bg-[#c8ff3d]"
                  onClick={() => onRequestProgramTab?.()}
                >
                  Пригласить друзей
                </Button>
              </div>
            ) : filteredRewards.length === 0 ? (
              <div className="mt-10 flex flex-col items-center rounded-2xl bg-[#0a0a0a] px-6 py-12 text-center ring-1 ring-white/8">
                <p className="font-medium text-white">Нет записей для выбранного статуса</p>
                <p className="mt-2 text-sm text-zinc-500">Смените фильтр или сбросьте на «Все».</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 border-white/12 bg-[#0a0a0a] text-zinc-100 ring-1 ring-white/10 hover:bg-white/[0.06]"
                  onClick={() => setRewardFilter("all")}
                >
                  Показать все
                </Button>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-xl bg-black ring-1 ring-white/[0.06]">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#111111] text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
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
                        className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.03] last:border-0"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-300">{row.date}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-200">{row.inviteeMasked}</td>
                        <td className="px-4 py-3.5 text-zinc-200">{row.rewardType}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                              statusPillClass(row.status),
                            )}
                          >
                            {statusLabel(row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs text-zinc-100">
                          {usdt.format(row.amountUsdt)} USDT
                        </td>
                        <td className="max-w-[220px] px-4 py-3.5 text-xs text-zinc-500">{row.note ?? "—"}</td>
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
