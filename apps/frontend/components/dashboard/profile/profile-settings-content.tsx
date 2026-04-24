"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Bell,
  ChevronRight,
  Globe,
  Link2,
  Monitor,
  Palette,
  Save,
  User,
  Wallet,
} from "lucide-react";

import {
  SETTINGS_DATE_FORMAT_OPTIONS,
  SETTINGS_LANGUAGE_OPTIONS,
  SETTINGS_NUMBER_GROUPING_OPTIONS,
  SETTINGS_TIMEZONE_OPTIONS,
} from "@/constants/dashboard/profile-settings";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function SettingsToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-lime-400" : "bg-neutral-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-neutral-700">
      {children}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-2xl border-0 bg-neutral-50 px-3 text-sm font-medium text-neutral-900 outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-blue-600/15"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ProfileSettingsContent() {
  const [displayName, setDisplayName] = useState("Иван");
  const [language, setLanguage] = useState<string>("ru");
  const [timezone, setTimezone] = useState<string>("Europe/Moscow");
  const [dateFormat, setDateFormat] = useState<string>("dmy");
  const [numberGrouping, setNumberGrouping] = useState<string>("space");

  const [compactTables, setCompactTables] = useState(true);
  const [showBalanceInHeader, setShowBalanceInHeader] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [emailDigest, setEmailDigest] = useState(true);
  const [emailPayouts, setEmailPayouts] = useState(true);
  const [emailMarket, setEmailMarket] = useState(false);
  const [emailProduct, setEmailProduct] = useState(true);

  const [marketDefaultTab, setMarketDefaultTab] = useState<string>("orderbook");
  const [confirmSecondaryOrders, setConfirmSecondaryOrders] = useState(true);
  const [payoutCsvIncludeFees, setPayoutCsvIncludeFees] = useState(false);

  const [savedHint, setSavedHint] = useState<string | null>(null);

  const save = useCallback(() => {
    setSavedHint("Сохранено (демо)");
    window.setTimeout(() => setSavedHint(null), 2200);
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Аккаунт</p>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Настройки</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
          Предпочтения кабинета RevShare: отображение, уведомления, регион и работа с рынком — отдельно от разделов
          «Безопасность» и «Верификация».
        </p>
        <p className="text-xs text-neutral-400">
          Пароль, 2FA и сессии — в{" "}
          <Link href={profileDashboardHref("security")} className="font-medium text-neutral-600 underline-offset-2 hover:underline">
            Безопасности
          </Link>
          . Проверка личности — в{" "}
          <Link
            href={profileDashboardHref("verification")}
            className="font-medium text-neutral-600 underline-offset-2 hover:underline"
          >
            Верификации
          </Link>
          .
        </p>
      </header>

      {/* Профиль и регион */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <User className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Профиль</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Имя и регион</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Как показывать вас в кабинете и в письмах. Почта аккаунта меняется через поддержку.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="display-name">Отображаемое имя</FieldLabel>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
              className="h-11 w-full rounded-2xl bg-neutral-50 px-3 text-sm text-neutral-900 outline-none ring-0 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-600/15"
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="language">Язык интерфейса</FieldLabel>
            <SelectField id="language" value={language} onChange={setLanguage} options={SETTINGS_LANGUAGE_OPTIONS} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="tz">Часовой пояс</FieldLabel>
            <SelectField id="tz" value={timezone} onChange={setTimezone} options={SETTINGS_TIMEZONE_OPTIONS} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="df">Формат даты</FieldLabel>
            <SelectField
              id="df"
              value={dateFormat}
              onChange={setDateFormat}
              options={SETTINGS_DATE_FORMAT_OPTIONS}
            />
          </div>
        </div>
      </section>

      {/* Интерфейс */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Monitor className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Интерфейс</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Отображение</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Плотность таблиц и чисел в кабинете. Тема страниц сейчас задаётся продуктом; тонкие настройки — ниже.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="num">Группировка цифр</FieldLabel>
            <SelectField
              id="num"
              value={numberGrouping}
              onChange={setNumberGrouping}
              options={SETTINGS_NUMBER_GROUPING_OPTIONS}
            />
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-1 lg:col-span-2">
            <SettingsToggle
              title="Компактные таблицы"
              description="Меньше вертикальных отступов в списках ордеров, выплат и позиций."
              checked={compactTables}
              onChange={setCompactTables}
            />
            <SettingsToggle
              title="Показывать баланс в шапке"
              description="Краткая сумма USDT рядом с меню (можно скрыть на публичных экранах)."
              checked={showBalanceInHeader}
              onChange={setShowBalanceInHeader}
            />
            <SettingsToggle
              title="Меньше анимаций"
              description="Снижаем движение интерфейса там, где это не мешает работе."
              checked={reduceMotion}
              onChange={setReduceMotion}
            />
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
          <Palette className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
          <span>
            Отдельный «тёмный / светлый» режим для кабинета планируется позже; сейчас используется единый стиль RevShare
            в разделах активов и профиля.
          </span>
        </div>
      </section>

      {/* Уведомления */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Bell className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Коммуникации</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Письма на почту</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Оповещения о продукте и операциях. Критичные письма по безопасности могут приходить независимо от этих
              переключателей.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-1">
          <SettingsToggle
            title="Дайджест по аккаунту"
            description="Раз в неделю: баланс, выплаты, активность на вторичном рынке."
            checked={emailDigest}
            onChange={setEmailDigest}
          />
          <SettingsToggle
            title="Выплаты и пополнения"
            description="Подтверждения зачислений, статусы выводов и напоминания."
            checked={emailPayouts}
            onChange={setEmailPayouts}
          />
          <SettingsToggle
            title="Сделки на вторичном рынке"
            description="Исполнение заявок, отмены и крупные движения по вашим ордерам."
            checked={emailMarket}
            onChange={setEmailMarket}
          />
          <SettingsToggle
            title="Новости RevShare"
            description="Релизы каталога, обновления кабинета и обучающие материалы."
            checked={emailProduct}
            onChange={setEmailProduct}
          />
        </div>
      </section>

      {/* Рынок и выплаты */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Wallet className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Рынок и выплаты</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Поведение по умолчанию</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Вторичный рынок и USDT: что открывать первым и как подтверждать чувствительные действия.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="mkt">Вклад по умолчанию во вторичном рынке</FieldLabel>
            <select
              id="mkt"
              value={marketDefaultTab}
              onChange={(e) => setMarketDefaultTab(e.target.value)}
              className="h-11 w-full rounded-2xl border-0 bg-neutral-50 px-3 text-sm font-medium text-neutral-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="orderbook">Стакан</option>
              <option value="orders">Мои заявки</option>
              <option value="history">История сделок</option>
            </select>
          </div>
          <div className="rounded-xl bg-neutral-50 px-3 py-3 text-xs leading-relaxed text-neutral-600">
            <span className="font-semibold text-neutral-800">Сеть вывода:</span> USDT TRC20. Другие сети появятся в
            настройках, когда будут доступны в продукте.
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-1">
          <SettingsToggle
            title="Подтверждать заявки на вторичном рынке"
            description="Дополнительный шаг перед отправкой крупной заявки (рекомендуется)."
            checked={confirmSecondaryOrders}
            onChange={setConfirmSecondaryOrders}
          />
          <SettingsToggle
            title="Включать комиссии в выгрузку CSV"
            description="Для сверки с внешним учётом по выплатам."
            checked={payoutCsvIncludeFees}
            onChange={setPayoutCsvIncludeFees}
          />
        </div>
        <Link
          href={ROUTES.dashboardPayoutsHistory}
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950"
        >
          Открыть историю выплат
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </section>

      {/* Подключения */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Link2 className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Интеграции</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Подключённые сервисы</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Внешние приложения с доступом к аккаунту (API, партнёрские кошельки) — когда появятся в продукте, список
              будет здесь.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-8 text-center">
          <Globe className="mx-auto size-8 text-neutral-300" aria-hidden />
          <p className="mt-2 text-sm font-medium text-neutral-700">Пока нет подключений</p>
          <p className="mt-1 text-xs text-neutral-500">Следите за обновлениями RevShare.</p>
        </div>
      </section>

      {/* Сохранение */}
      <div className="sticky bottom-4 z-10 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:flex sm:items-center sm:gap-4 sm:px-5">
          <p className="text-xs text-neutral-500">Изменения применяются после сохранения.</p>
          <div className="mt-2 flex items-center gap-3 sm:mt-0">
            {savedHint && <span className="text-xs font-medium text-lime-800">{savedHint}</span>}
            <button
              type="button"
              onClick={save}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 text-xs font-semibold text-neutral-950 transition hover:bg-lime-300"
            >
              <Save className="size-4" aria-hidden />
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
