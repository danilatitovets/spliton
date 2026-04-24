"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

import {
  parseProfilePageTabParam,
  profileDashboardHref,
  type ProfilePageTabId,
} from "@/constants/dashboard/profile-page";
import { ProfileSettingsContent } from "@/components/dashboard/profile/profile-settings-content";
import { ProfileSecurityContent } from "@/components/dashboard/profile/profile-security-content";
import { ProfileVerificationContent } from "@/components/dashboard/profile/profile-verification-content";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const MOCK_ROWS = [
  { name: "USDT", sub: "TRC20", price: "1,0000", change: "+0,00%", up: true },
  { name: "RS-Track A", sub: "доля", price: "12,40", change: "+1,2%", up: true },
  { name: "RS-Track B", sub: "доля", price: "8,05", change: "−0,4%", up: false },
  { name: "RS-Track C", sub: "доля", price: "21,00", change: "+0,0%", up: true },
] as const;

function SecurityRing({ current, max }: { current: number; max: number }) {
  const pct = Math.min(1, current / max);
  const deg = pct * 360;
  return (
    <div
      className="relative grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(rgb(163 230 53) 0deg ${deg}deg, #e5e7eb ${deg}deg 360deg)`,
      }}
      aria-hidden
    >
      <div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-white text-center text-xs font-semibold tabular-nums text-neutral-800">
        {current}/{max}
      </div>
    </div>
  );
}

function OverviewMainColumn() {
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-neutral-100">
              <UserRound className="h-7 w-7 text-neutral-500" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Аккаунт</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
                  inv***@example.com
                </p>
                <ShieldCheck className="h-4 w-4 shrink-0 text-lime-700" aria-hidden />
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">ID: RS-8F2A-01C4</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
          >
            Просмотреть профиль
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Портфель</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-600">Оценка</span>
              <button
                type="button"
                onClick={() => setBalanceHidden((v) => !v)}
                className="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-200/60 hover:text-neutral-700"
                aria-label={balanceHidden ? "Показать баланс" : "Скрыть баланс"}
              >
                {balanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums sm:text-3xl">
              {balanceHidden ? "••••••" : "0,00 USDT"}
            </p>
            <p className="mt-1 text-sm font-medium text-blue-800">PnL за сутки +0,00%</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={ROUTES.dashboardCatalog}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-lime-400 px-4 text-xs font-semibold text-neutral-950 transition hover:bg-lime-300"
          >
            Каталог релизов
          </Link>
          <Link
            href={ROUTES.dashboardSecondaryMarket}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
          >
            Вторичный рынок
          </Link>
          <Link
            href={ROUTES.dashboardPayoutsHistory}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
          >
            Выплаты
          </Link>
          <Link
            href={ROUTES.dashboardOverview}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
          >
            Обзор активов
          </Link>
        </div>

        <div className="mt-6 border-t border-neutral-200/80 pt-5">
          <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Период графика">
            {(["1д", "1н", "1м", "6м", "1г"] as const).map((label, i) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors",
                  i === 0
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl bg-neutral-100/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-neutral-800">График скоро подключим</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-neutral-500">
              Динамика оценки портфеля по периоду — в том же духе, что и лента на странице выплат.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">Сводка</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">По инструментам</h2>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Вкладки таблицы">
            {["Избранное", "Популярное", "Все"].map((label, i) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors",
                  i === 1 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-neutral-50/80">
          <table className="w-full min-w-[480px] table-auto text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                <th className="px-3 py-3 pl-4 font-medium">Название</th>
                <th className="px-3 py-3 font-medium">Цена</th>
                <th className="px-3 py-3 pr-4 text-right font-medium">Изм.</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {MOCK_ROWS.map((row, i) => (
                <tr
                  key={row.name}
                  className={cn(
                    "transition-colors hover:bg-neutral-50/90",
                    i !== MOCK_ROWS.length - 1 && "border-b border-neutral-100",
                  )}
                >
                  <td className="px-3 py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-100" />
                      <div>
                        <p className="font-medium text-neutral-900">{row.name}</p>
                        <p className="text-xs text-neutral-500">{row.sub}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-neutral-700">{row.price}</td>
                  <td
                    className={cn(
                      "px-3 py-3 pr-4 text-right tabular-nums font-medium",
                      row.up ? "text-blue-800" : "text-neutral-600",
                    )}
                  >
                    {row.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: ProfilePageTabId }) {
  const title =
    tab === "verification"
      ? "Верификация"
      : tab === "security"
        ? "Безопасность"
        : tab === "settings"
          ? "Настройки"
          : "Раздел";
  return (
    <section className="rounded-3xl bg-white px-5 py-10 sm:px-8 sm:py-12">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Раздел</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-500">
        Здесь появятся формы и статусы. Пока обзор доступен на вкладке «Мой профиль».
      </p>
      <Link
        href={profileDashboardHref("overview")}
        className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 transition hover:text-neutral-950"
      >
        На главный экран профиля
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}

function SidebarColumn() {
  return (
    <aside className="flex min-w-0 flex-col gap-4 lg:max-w-[360px] lg:gap-5">
      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex items-start gap-4">
          <SecurityRing current={3} max={5} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Безопасность</p>
            <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Аккаунт</h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Включите 2FA и подтвердите контакты.
            </p>
            <Link
              href={profileDashboardHref("security")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950"
            >
              Улучшить
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Платформа</p>
        <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">RevShare</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Доли в треках, вторичный рынок и выплаты в одном кабинете.
        </p>
        <ul className="mt-3 space-y-2 text-xs text-neutral-700">
          <li className="flex gap-2">
            <span className="text-lime-700">·</span>
            Прозрачные условия релизов
          </li>
          <li className="flex gap-2">
            <span className="text-lime-700">·</span>
            USDT (TRC20) на вывод
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-neutral-500" aria-hidden />
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900">Памятка</h3>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-neutral-500">
          Не передавайте коды входа третьим лицам. Уведомления — в кабинете и на почту.
        </p>
      </section>

      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Новости</p>
        <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Объявления</h3>
        <ul className="mt-3 space-y-3 text-xs">
          <li className="border-b border-neutral-200/80 pb-3 last:border-0 last:pb-0">
            <p className="text-neutral-500">12.04.2026</p>
            <p className="mt-0.5 font-medium text-neutral-800">Обновление вторичного рынка</p>
          </li>
          <li className="border-b border-neutral-200/80 pb-3 last:border-0 last:pb-0">
            <p className="text-neutral-500">01.04.2026</p>
            <p className="mt-0.5 font-medium text-neutral-800">Новые карточки в каталоге</p>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex gap-4">
          <div className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-2xl bg-neutral-100 text-[10px] font-medium text-neutral-400">
            QR
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900">
              <Smartphone className="h-4 w-4 text-neutral-500" aria-hidden />
              Мобильный доступ
            </div>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Сканируйте с телефона, когда появится приложение.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}

export function ProfileDashboardScreen() {
  const searchParams = useSearchParams();
  const tab = useMemo(
    () => parseProfilePageTabParam(searchParams.get("tab")),
    [searchParams],
  );

  if (tab === "verification") {
    return (
      <div className="scroll-mt-24">
        <ProfileVerificationContent />
      </div>
    );
  }

  if (tab === "security") {
    return (
      <div className="scroll-mt-24">
        <ProfileSecurityContent />
      </div>
    );
  }

  if (tab === "settings") {
    return (
      <div className="scroll-mt-24">
        <ProfileSettingsContent />
      </div>
    );
  }

  return (
    <div className="scroll-mt-24 space-y-6">
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Кабинет</p>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Профиль</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start lg:gap-8">
        <div className="min-w-0">
          {tab === "overview" ? <OverviewMainColumn /> : <TabPlaceholder tab={tab} />}
        </div>
        <SidebarColumn />
      </div>
    </div>
  );
}

export function ProfileDashboardScreenFallback() {
  return (
    <div className="scroll-mt-24 space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-neutral-200/80" />
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200/80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    </div>
  );
}
