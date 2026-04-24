"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Gavel,
  Minus,
  Percent,
  Plus,
  Scale,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { GuideSectionShell } from "@/features/guide/selection/ui/guide-section-shell";
import { cn } from "@/lib/utils";

const RULES_NAV = [
  { id: "rules-top", label: "Введение" },
  { id: "rules-at-a-glance", label: "Сводка" },
  { id: "rules-risk", label: "Важно" },
  { id: "rules-principles", label: "Принципы" },
  { id: "rules-depth", label: "Детали" },
] as const;

const HERO_PILLS = [
  { href: "#rules-at-a-glance", label: "Сводка", hint: "fees · min" },
  { href: "#rules-risk", label: "Риски", hint: "disclaimer" },
  { href: "#rules-principles", label: "Исполнение", hint: "matching" },
  { href: "#rules-depth", label: "Правила", hint: "accordion" },
] as const;

function RulesInPageNav() {
  const [active, setActive] = React.useState<string>(RULES_NAV[0]?.id ?? "rules-top");

  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-rules-section]"));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.target.id)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const next = visible[0]?.target.id;
        if (next) setActive(next);
      },
      { root: null, rootMargin: "-12% 0px -55% 0px", threshold: [0.08, 0.2, 0.35, 0.55] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Содержание правил рынка" className="sticky top-28">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">On this page</div>
      <ul className="mt-3 space-y-1">
        {RULES_NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-[#B7F500]/14 font-medium text-[#d4f570]"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function RuleDetails({
  id,
  title,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <details
      id={id}
      className="group overflow-hidden rounded-xl bg-[#111111] [&_summary::-webkit-details-marker]:hidden"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-white/[0.04] md:px-5 md:py-5">
        <span className="text-left text-[15px] font-medium leading-snug text-white md:text-base">{title}</span>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white transition-colors group-open:bg-[#B7F500]/14 group-open:text-[#d4f570]"
          aria-hidden
        >
          <Plus className="size-4 group-open:hidden" strokeWidth={1.75} />
          <Minus className="hidden size-4 group-open:block" strokeWidth={1.75} />
        </span>
      </summary>
      <div className="space-y-2 bg-[#0a0a0a] px-4 pb-4 pt-0 text-sm leading-relaxed text-zinc-500 md:px-5 md:pb-5 md:text-[15px]">
        {children}
      </div>
    </details>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-2 size-1 shrink-0 rounded-full bg-[#B7F500]/70" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

export function SecondaryMarketRulesTab() {
  return (
    <div className="scroll-smooth bg-black pb-4 pt-2 md:pt-4">
      <div className="flex gap-10 lg:gap-14 xl:gap-16">
        <div className="min-w-0 flex-1 space-y-16 md:space-y-20 lg:space-y-24">
          {/* Hero — как guide/selection */}
          <section id="rules-top" data-rules-section className="scroll-mt-28">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              RevShare · Secondary · Market rules center
            </p>
            <p className="mt-3 max-w-3xl text-base font-medium leading-snug tracking-tight text-zinc-200 md:text-lg">
              Краткий справочник по заявкам, исполнению и settlement — без дублирования юридических документов.
            </p>
            <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-zinc-400 md:text-base">
              <p>
                Внутренняя площадка заявок на передачу{" "}
                <span className="font-medium text-zinc-200">units</span> и связанных{" "}
                <span className="font-medium text-zinc-200">rights</span> по релизам. Расчёты в{" "}
                <span className="font-mono text-zinc-200">USDT (TRC20)</span>; матчинг и settlement проходят внутри
                RevShare — без внешней «биржи токенов».
              </p>
              <p>
                Ниже — быстрые якоря и блоки в формате knowledge hub: плотная сетка, ровные отступы и спокойная
                типографика на чёрном фоне — как в гиде по выбору релиза.
              </p>
            </div>

            <div className="mt-10">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Найдите нужный блок
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {HERO_PILLS.map((pill) => (
                  <a
                    key={pill.href}
                    href={pill.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-3.5 py-2 text-left text-[13px] text-white transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="font-medium">{pill.label}</span>
                    <span className="text-[11px] text-zinc-500">{pill.hint}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Сводка — KPI как карточки гида */}
          <section id="rules-at-a-glance" data-rules-section className="scroll-mt-28">
            <GuideSectionShell
              title="Сводка по рынку"
              subtitle="Ключевые числа и рамка расчётов — для быстрого сканирования перед размещением заявки."
              headerAlign="left"
            >
              <div className="grid gap-4 sm:grid-cols-3 md:gap-6">
                <article className="flex min-h-[180px] flex-col rounded-xl bg-[#111111] p-6 transition-colors hover:bg-white/[0.04] md:p-7">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a]">
                    <Percent className="size-[18px] text-[#B7F500]/90" strokeWidth={1.35} aria-hidden />
                  </div>
                  <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Комиссия taker
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">0,15%</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-400">От номинала сделки при заборе ликвидности.</p>
                </article>
                <article className="flex min-h-[180px] flex-col rounded-xl bg-[#111111] p-6 transition-colors hover:bg-white/[0.04] md:p-7">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a]">
                    <Percent className="size-[18px] text-[#B7F500]/90" strokeWidth={1.35} aria-hidden />
                  </div>
                  <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Комиссия maker
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">0,08%</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-400">При добавлении ликвидности в стакан.</p>
                </article>
                <article className="flex min-h-[180px] flex-col rounded-xl bg-[#111111] p-6 transition-colors hover:bg-white/[0.04] md:p-7 sm:col-span-2 lg:col-span-1">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a]">
                    <Scale className="size-[18px] text-[#B7F500]/90" strokeWidth={1.35} aria-hidden />
                  </div>
                  <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Мин. заявка
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">10 USDT</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-400">Номинал, демо-порог для макета.</p>
                </article>
              </div>
            </GuideSectionShell>
          </section>

          {/* Риск — карточки как в guide-risks */}
          <section id="rules-risk" data-rules-section className="scroll-mt-28">
            <GuideSectionShell
              title="Важно понимать"
              subtitle="Короткая фиксация ограничений — без драматизации, в формате защитных карточек."
              headerAlign="left"
            >
              <div className="grid gap-5 sm:grid-cols-2 xl:gap-6">
                <article className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-xl bg-[#111111] p-6 transition-colors duration-200 hover:bg-white/[0.04] md:min-h-[220px] md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] transition-colors group-hover:bg-[#B7F500]/10">
                      <AlertTriangle
                        className="size-[18px] text-zinc-400 transition-colors group-hover:text-[#B7F500]"
                        strokeWidth={1.35}
                        aria-hidden
                      />
                    </div>
                    <span className="pt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600 transition-colors group-hover:text-zinc-500">
                      R01
                    </span>
                  </div>
                  <p className="mt-6 flex-1 text-[15px] font-medium leading-snug tracking-tight text-zinc-100 md:text-base md:leading-relaxed">
                    Доли дохода треков — не токены и не ценные бумаги. Цены в стакане отражают спрос участников
                    платформы.
                  </p>
                </article>
                <article className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-xl bg-[#111111] p-6 transition-colors duration-200 hover:bg-white/[0.04] md:min-h-[220px] md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] transition-colors group-hover:bg-[#B7F500]/10">
                      <BookOpen
                        className="size-[18px] text-zinc-400 transition-colors group-hover:text-[#B7F500]"
                        strokeWidth={1.35}
                        aria-hidden
                      />
                    </div>
                    <span className="pt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600 transition-colors group-hover:text-zinc-500">
                      R02
                    </span>
                  </div>
                  <p className="mt-6 flex-1 text-[15px] font-medium leading-snug tracking-tight text-zinc-100 md:text-base md:leading-relaxed">
                    Прошлая активность и выплаты по релизу не гарантируют будущий cashflow — учитывайте это в решениях
                    на вторичном рынке.
                  </p>
                </article>
              </div>
            </GuideSectionShell>
          </section>

          {/* Принципы — чеклист + карточки как в гиде */}
          <section id="rules-principles" data-rules-section className="scroll-mt-28">
            <GuideSectionShell
              title="Исполнение и перевод прав"
              subtitle="Два опорных принципа: как сопоставляются заявки и как фиксируется владение внутри платформы."
              headerAlign="left"
            >
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                <div className="flex gap-4 rounded-xl bg-[#111111] p-5 md:p-6">
                  <div className="mt-1 w-1 shrink-0 self-stretch rounded-full bg-[#B7F500]/45" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <Gavel className="size-5 shrink-0 text-[#B7F500]/90" strokeWidth={1.25} aria-hidden />
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Матчинг
                      </div>
                    </div>
                    <p className="mt-3 text-base font-semibold tracking-tight text-white">Стакан и приоритет</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Заявки сопоставляются по цене и времени; частичное исполнение возможно, если это включено для типа
                      заявки.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl bg-[#111111] p-5 md:p-6">
                  <div className="mt-1 w-1 shrink-0 self-stretch rounded-full bg-[#B7F500]/45" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <ArrowLeftRight className="size-5 shrink-0 text-[#B7F500]/90" strokeWidth={1.25} aria-hidden />
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Settlement
                      </div>
                    </div>
                    <p className="mt-3 text-base font-semibold tracking-tight text-white">Units и rights</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      После успешного settlement units и связанные права учитываются на вашем счёте внутри RevShare;
                      внешний transfer токенов не выполняется.
                    </p>
                  </div>
                </div>
              </div>
            </GuideSectionShell>
          </section>

          {/* Детали — FAQ-style details как guide-faq */}
          <section id="rules-depth" data-rules-section className="scroll-mt-28">
            <h3 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Детальные правила</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-base">
              Раскрывайте блоки ниже — формат как в FAQ гида: спокойный фон ответа и акцент на читаемость, без юридической
              простыни.
            </p>

            <div className="mt-8 space-y-2">
              <RuleDetails id="rules-fees" title="Комиссии и удержания" defaultOpen>
                <Bullet>
                  Сбор удерживается в USDT при исполнении; отображается в истории сделок и влияет на итоговую сумму к
                  зачислению или списанию.
                </Bullet>
                <Bullet>Ставки maker/taker и скидки по объёму могут обновляться политикой рынка с уведомлением в продукте.</Bullet>
                <Bullet>Отдельные операции (например, вывод на TRC20) могут иметь сетевую комиссию блокчейна вне стакана.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-listing" title="Листинги и объём">
                <Bullet>Листинг привязан к релизу и доступному объёму units, выставленному на вторичный рынок.</Bullet>
                <Bullet>Несколько уровней цены в стакане могут относиться к одному релизу; глубина зависит от активности участников.</Bullet>
                <Bullet>Индикаторы ликвидности и «в стакане» units носят информационный характер и обновляются с задержкой.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-orders" title="Заявки: лимит и рынок">
                <Bullet>
                  <span className="font-medium text-zinc-300">Лимит</span> — цена и объём задаются вами; заявка стоит в
                  стакане до исполнения, отмены или истечения срока.
                </Bullet>
                <Bullet>
                  <span className="font-medium text-zinc-300">Рынок</span> — исполнение по лучшим доступным уровням;
                  итоговая средняя цена определяется фактическим матчингом.
                </Bullet>
                <Bullet>Доступный баланс USDT и доступные к продаже units проверяются при размещении заявки.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-execution" title="Матчинг и приоритет">
                <Bullet>Цена-время: при равной цене раньше размещённая заявка исполняется первой.</Bullet>
                <Bullet>Частичное исполнение уменьшает остаток заявки; остаток остаётся активным с прежним сроком, если он задан.</Bullet>
                <Bullet>Рыночные заявки не гарантируют объём при низкой ликвидности — возможен отказ или исполнение меньшего объёма по политике.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-settlement" title="Расчёты и перенос units / rights">
                <Bullet>Резервирование средств или units происходит на этапе принятия заявки в обработку; окончательное списание — после подтверждения сделки.</Bullet>
                <Bullet>Settlement фиксирует смену владельца units и учёт rights в соответствии с карточкой релиза и внутренними правилами RevShare.</Bullet>
                <Bullet>Статус «В обработке» в истории означает, что клиринг ещё не завершён; не проводите повторную сделку с тем же объёмом до завершения.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-cancel" title="Отмена и срок действия">
                <Bullet>Активные и частично исполненные лимитные заявки можно отменить, пока они не полностью исполнены и не истекли.</Bullet>
                <Bullet>По истечении TTL заявка снимается со стакана; неисполненный остаток освобождает зарезервированные средства или units.</Bullet>
                <Bullet>Рыночная заявка после отправки обычно не отменяется — только до момента принятия системой (короткое окно).</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-limits" title="Лимиты и ограничения">
                <Bullet>Минимальный и максимальный размер заявки, дневной объём и количество открытых ордеров задаются политикой рынка и могут различаться по релизам.</Bullet>
                <Bullet>При аномальной волатильности или технических работах площадка может временно ограничить новые заявки или только рыночные типы.</Bullet>
                <Bullet>KYC / лимиты по уровню аккаунта применяются ко всем операциям с USDT на платформе.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-prohibited" title="Недопустимое поведение">
                <Bullet>Манипуляции стаканом, согласованные сделки для искусственного объёма, эксплуатация ошибок ценообразования.</Bullet>
                <Bullet>Использование нескольких аккаунтов для обхода лимитов или комиссий.</Bullet>
                <Bullet>RevShare может приостановить торги, отменить подозрительные заявки и ограничить доступ после рассмотрения.</Bullet>
              </RuleDetails>

              <RuleDetails id="rules-support" title="Споры и поддержка">
                <Bullet>Спорные ситуации по исполнению, задержкам settlement или расхождениям баланса рассматриваются через службу поддержки в рамках правил платформы.</Bullet>
                <Bullet>Не является арбитражом по ценным бумагам и не подменяет договор с правообладателем релиза — полные условия оферты и релиза смотрите в юридических документах.</Bullet>
              </RuleDetails>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[60ch] text-sm leading-relaxed text-zinc-500">
                Экран носит справочный характер. Итоговые комиссии, лимиты и процедуры уточняйте в актуальной оферте и в
                интерфейсе при размещении заявки.
              </p>
              <Link
                href={ROUTES.terms}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.04]"
              >
                Условия платформы
              </Link>
            </div>
          </section>
        </div>

        <aside className="hidden w-52 shrink-0 xl:block">
          <RulesInPageNav />
        </aside>
      </div>
    </div>
  );
}
