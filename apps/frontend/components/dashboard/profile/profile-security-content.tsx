"use client";

/** Прототип: `?tab=security&securityState=hardened` — см. `SECURITY_STATE_QUERY`. */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  HelpCircle,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";

import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import {
  MOCK_SECURITY_SESSIONS,
  SECURITY_STATE_QUERY,
  parseSecurityUiState,
  type SecuritySessionRow,
} from "@/constants/dashboard/profile-security";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type ProtectionCfg = {
  twoFa: boolean;
  withdrawEmail: boolean;
  newAddressDelay: boolean;
  addressWhitelist: boolean;
  alertNewDevice: boolean;
  alertLargeSecondary: boolean;
  alertWithdraw: boolean;
};

function defaultCfg(tier: ReturnType<typeof parseSecurityUiState>): ProtectionCfg {
  if (tier === "hardened") {
    return {
      twoFa: true,
      withdrawEmail: true,
      newAddressDelay: true,
      addressWhitelist: true,
      alertNewDevice: true,
      alertLargeSecondary: true,
      alertWithdraw: true,
    };
  }
  return {
    twoFa: false,
    withdrawEmail: true,
    newAddressDelay: false,
    addressWhitelist: false,
    alertNewDevice: true,
    alertLargeSecondary: false,
    alertWithdraw: true,
  };
}

function computeScore(c: ProtectionCfg): number {
  let s = 38;
  if (c.twoFa) s += 28;
  if (c.withdrawEmail) s += 8;
  if (c.newAddressDelay) s += 8;
  if (c.addressWhitelist) s += 6;
  if (c.alertNewDevice) s += 4;
  if (c.alertLargeSecondary) s += 4;
  if (c.alertWithdraw) s += 4;
  return Math.min(100, s);
}

function scoreLabel(n: number): { title: string; sub: string; tone: string } {
  if (n >= 85)
    return {
      title: "Сильная защита",
      sub: "Критичные опции включены. Проверяйте сессии время от времени.",
      tone: "bg-lime-100/90 text-lime-950 ring-1 ring-lime-200/80",
    };
  if (n >= 60)
    return {
      title: "Хороший базис",
      sub: "Рекомендуем включить 2FA и защиту вывода до максимума.",
      tone: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
    };
  return {
    title: "Нужно усилить",
    sub: "Включите двухфакторную аутентификацию и подтверждение вывода.",
    tone: "bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200/80",
  };
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-lime-400" : "bg-neutral-200",
          disabled && "cursor-not-allowed opacity-50",
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

function SecurityRingScore({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const deg = (pct / 100) * 360;
  return (
    <div
      className="relative grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(rgb(163 230 53) 0deg ${deg}deg, #e5e7eb ${deg}deg 360deg)`,
      }}
      aria-hidden
    >
      <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-white text-center">
        <span className="text-lg font-bold tabular-nums leading-none text-neutral-900">{pct}</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">из 100</span>
      </div>
    </div>
  );
}

export function ProfileSecurityContent() {
  const searchParams = useSearchParams();
  const tier = useMemo(
    () => parseSecurityUiState(searchParams.get(SECURITY_STATE_QUERY)),
    [searchParams],
  );
  const [cfg, setCfg] = useState<ProtectionCfg>(() => defaultCfg(tier));
  const [sessions, setSessions] = useState<SecuritySessionRow[]>(MOCK_SECURITY_SESSIONS);

  useEffect(() => {
    setCfg(defaultCfg(tier));
    setSessions(MOCK_SECURITY_SESSIONS);
  }, [tier]);

  const score = computeScore(cfg);
  const label = scoreLabel(score);

  const setField = useCallback(<K extends keyof ProtectionCfg>(key: K, value: ProtectionCfg[K]) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }, []);

  const revoke = useCallback((id: string) => {
    setSessions((rows) => rows.filter((r) => r.id !== id));
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Аккаунт</p>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Безопасность</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
          Центр защиты RevShare: пароль, 2FA, вывод USDT, сессии и уведомления — всё, что снижает риск для баланса и
          сделок с rights / units.
        </p>
      </header>

      {/* Обзор + оценка */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            <SecurityRingScore value={score} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Уровень защиты
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", label.tone)}>
                  {label.title}
                </span>
              </div>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">{label.sub}</p>
              {!cfg.twoFa && (
                <p className="mt-3 text-xs font-medium text-amber-800">
                  Рекомендуем: включите 2FA — так сложнее получить доступ к выводу и вторичному рынку.
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={profileDashboardHref("verification")}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
            >
              Верификация аккаунта
              <ChevronRight className="ml-1 size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Вход и аутентификация */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <KeyRound className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Вход</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Пароль и вход</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Пароль защищает кабинет. 2FA добавляет второй фактор при входе и чувствительных действиях.
            </p>
          </div>
        </div>

        <ul className="mt-5 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-neutral-50/50">
          <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-start gap-3">
              <Lock className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-neutral-900">Пароль</p>
                <p className="mt-0.5 text-xs text-neutral-500">Меняйте пароль регулярно и не используйте его на других сервисах.</p>
                <p className="mt-1 text-xs text-neutral-400">Последнее обновление: ~90 дней назад</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              Сменить пароль
            </button>
          </li>
          <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-lime-700" aria-hidden />
              <div>
                <p className="text-sm font-medium text-neutral-900">Двухфакторная аутентификация (2FA)</p>
                <p className="mt-0.5 text-xs text-neutral-500">Приложение-аутентификатор или SMS — по выбору платформы.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  cfg.twoFa ? "bg-lime-100/90 text-lime-950" : "bg-neutral-200 text-neutral-700",
                )}
              >
                {cfg.twoFa ? "Включена" : "Выключена"}
              </span>
              <button
                type="button"
                onClick={() => setField("twoFa", !cfg.twoFa)}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-lime-400 px-4 text-xs font-semibold text-neutral-950 transition hover:bg-lime-300"
              >
                {cfg.twoFa ? "Настроить" : "Включить 2FA"}
              </button>
            </div>
          </li>
          <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-neutral-900">Почта аккаунта</p>
                <p className="mt-0.5 text-xs text-neutral-500">На почту приходят коды подтверждения и оповещения.</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime-100/90 px-2.5 py-1 text-[11px] font-semibold text-lime-950">
              <Check className="size-3.5" aria-hidden />
              Подтверждена
            </span>
          </li>
        </ul>
      </section>

      {/* Защита вывода и адресов */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Wallet className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Баланс</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Вывод USDT и адреса</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Дополнительные шаги перед отправкой средств на TRC20 — меньше риска при компрометации почты или сессии.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 px-1 sm:px-2">
          <ToggleRow
            id="withdraw-email"
            title="Подтверждение вывода по e-mail"
            description="Письмо с ссылкой или кодом перед исполнением заявки на вывод."
            checked={cfg.withdrawEmail}
            onChange={(v) => setField("withdrawEmail", v)}
          />
          <ToggleRow
            id="addr-delay"
            title="Задержка для нового адреса"
            description="Первый вывод на новый кошелёк — через 24 часа после добавления."
            checked={cfg.newAddressDelay}
            onChange={(v) => setField("newAddressDelay", v)}
          />
          <ToggleRow
            id="whitelist"
            title="Белый список адресов"
            description="Вывод только на сохранённые вами адреса TRC20."
            checked={cfg.addressWhitelist}
            onChange={(v) => setField("addressWhitelist", v)}
          />
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Лимиты и история заявок — в разделе выплат. Здесь только политика безопасности вывода.
        </p>
      </section>

      {/* Устройства и сессии */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Laptop className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Доступ</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Сессии и устройства</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Активные входы в кабинет. Завершите сессию, если не узнаёте устройство или локацию.
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-neutral-50/80">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                <th className="px-3 py-3 pl-4 font-medium">Устройство</th>
                <th className="px-3 py-3 font-medium">Локация</th>
                <th className="px-3 py-3 font-medium">IP</th>
                <th className="px-3 py-3 font-medium">Активность</th>
                <th className="px-3 py-3 pr-4 text-right font-medium" />
              </tr>
            </thead>
            <tbody className="bg-white">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                    Нет других сессий кроме текущей.
                  </td>
                </tr>
              ) : (
                sessions.map((row, i) => (
                  <tr key={row.id} className={cn(i !== sessions.length - 1 && "border-b border-neutral-100")}>
                    <td className="px-3 py-3 pl-4">
                      <div className="flex items-center gap-2">
                        {row.device.includes("iPhone") ? (
                          <Smartphone className="size-4 text-neutral-400" aria-hidden />
                        ) : (
                          <Laptop className="size-4 text-neutral-400" aria-hidden />
                        )}
                        <span className="font-medium text-neutral-900">{row.device}</span>
                        {row.current && (
                          <span className="rounded-md bg-lime-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-lime-950">
                            Текущая
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-neutral-600">{row.location}</td>
                    <td className="px-3 py-3 font-mono text-xs text-neutral-500">{row.ip}</td>
                    <td className="px-3 py-3 text-neutral-600">{row.lastActive}</td>
                    <td className="px-3 py-3 pr-4 text-right">
                      {!row.current && (
                        <button
                          type="button"
                          onClick={() => revoke(row.id)}
                          className="text-xs font-semibold text-red-700 hover:text-red-800"
                        >
                          Завершить
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
        >
          Завершить все остальные сессии
        </button>
      </section>

      {/* Уведомления */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
            <Bell className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Мониторинг</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">Оповещения</h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Письма о важных событиях: вход, вывод, крупные заявки на вторичном рынке.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 px-1 sm:px-2">
          <ToggleRow
            id="al-dev"
            title="Вход с нового устройства"
            description="Уведомление при первом входе с незнакомого браузера или ОС."
            checked={cfg.alertNewDevice}
            onChange={(v) => setField("alertNewDevice", v)}
          />
          <ToggleRow
            id="al-sec"
            title="Крупная заявка на вторичном рынке"
            description="Когда размер заявки превышает выбранный порог (настройка порога — позже)."
            checked={cfg.alertLargeSecondary}
            onChange={(v) => setField("alertLargeSecondary", v)}
          />
          <ToggleRow
            id="al-wd"
            title="Запрос на вывод USDT"
            description="Каждое создание или подтверждение заявки на вывод."
            checked={cfg.alertWithdraw}
            onChange={(v) => setField("alertWithdraw", v)}
          />
        </div>
      </section>

      {/* Активность + восстановление */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Журнал</p>
          <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Активность аккаунта</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Входы, смена настроек и операции с балансом — сводная лента в разделе активности.
          </p>
          <Link
            href={ROUTES.dashboardActivity}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950"
          >
            Открыть активность
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </section>
        <section className="rounded-2xl border border-neutral-100 bg-white px-4 py-4 sm:px-5 sm:py-4">
          <div className="flex gap-3">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-neutral-900">Потеряли доступ?</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                Используйте восстановление пароля. Если подозреаете взлом — завершите сессии и напишите в поддержку с
                ID аккаунта.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={ROUTES.forgotPassword}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  Восстановить доступ
                </Link>
                <Link
                  href={ROUTES.guideSelection}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-800 hover:bg-neutral-200/90"
                >
                  Справка
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
