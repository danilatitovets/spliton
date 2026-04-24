"use client";

import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PartnerFaqList } from "@/components/partner-program/partner-faq-list";
import { buttonVariants } from "@/components/ui/button";
import type { PartnerProgramTabId } from "@/constants/dashboard/partner-program";
import {
  partnerApplyMailto,
  partnerBenefits,
  partnerFaqItems,
  partnerFormats,
  partnerHowSteps,
  PARTNER_CONTACT_EMAIL,
  partnerRequirements,
  partnerVoices,
} from "@/constants/partner-program-mock";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const surfaceCard = "rounded-2xl bg-[#111111] ring-1 ring-white/[0.06]";

function PartnerVoicesBlock() {
  const [activeId, setActiveId] = useState(partnerVoices[0]!.id);
  const voice = partnerVoices.find((v) => v.id === activeId) ?? partnerVoices[0]!;

  return (
    <div className="relative">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Trust</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">
          Истории из комьюнити — без лишнего пафоса, в тоне продукта.
        </p>
      </div>

      <div
        className="mx-auto mt-8 flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5"
        role="tablist"
        aria-label="Категории отзывов"
      >
        {partnerVoices.map((v) => {
          const on = v.id === activeId;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveId(v.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-left text-xs font-medium transition-all ring-1 sm:text-[13px]",
                on
                  ? "bg-[#B7F500]/10 text-[#d4f570] ring-[#B7F500]/35"
                  : "bg-[#0a0a0a] text-zinc-400 ring-white/10 hover:bg-white/5 hover:text-zinc-200",
              )}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-zinc-200 ring-1 ring-white/10">
                {v.avatarLetter}
              </span>
              {v.tabLabel}
            </button>
          );
        })}
      </div>

      <div className="relative mx-auto mt-10 max-w-[640px] px-2 sm:px-0">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {[12, -10, -14, 8].map((deg, i) => (
            <div
              key={deg}
              className="absolute aspect-4/3 w-[88%] max-w-[520px] rounded-2xl bg-[#0a0a0a] ring-1 ring-white/4"
              style={{
                transform: `rotate(${deg}deg) translateY(${i * 4}px) scale(${0.92 - i * 0.04})`,
                opacity: 0.22 - i * 0.04,
                zIndex: 0 - i,
              }}
            />
          ))}
        </div>

        <article className={cn("relative z-10 overflow-hidden px-6 py-8 sm:px-9 sm:py-10", surfaceCard)}>
          <Quote className="absolute right-5 top-5 size-16 text-white/6 sm:right-8 sm:top-8 sm:size-20" aria-hidden />
          <div className="relative space-y-4">
            {voice.quote.map((p, idx) => (
              <p key={`${voice.id}-${idx}`} className="text-sm leading-relaxed text-zinc-200 sm:text-base">
                {p}
              </p>
            ))}
          </div>
          <footer className="relative mt-8 flex items-center gap-3 border-t border-white/8 pt-6">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#B7F500]/15 text-sm font-semibold text-[#d4f570] ring-1 ring-[#B7F500]/25">
              {voice.avatarLetter}
            </span>
            <div>
              <p className="text-sm font-medium text-white">{voice.tabLabel}</p>
              <p className="text-xs text-zinc-500">{voice.role}</p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}

export type PartnerProgramPageContentProps = {
  activeTab: PartnerProgramTabId;
};

export function PartnerProgramPageContent({ activeTab }: PartnerProgramPageContentProps) {
  return (
    <div className="space-y-10 pb-8 md:space-y-12">
      {activeTab === "about" ? (
        <div className="space-y-10">
          <section className={cn("relative overflow-hidden px-6 py-8 sm:px-8 sm:py-9", surfaceCard)}>
            <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#B7F500]/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-violet-500/10 blur-3xl" aria-hidden />
            <p className="relative max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              Развивайтесь вместе с платформой revenue share по музыкальным трекам. Партнёрка — для профессионального и
              медийного сотрудничества;{" "}
              <Link href={ROUTES.referralProgram} className="text-[#d4f570] underline-offset-4 hover:underline">
                реферальная программа
              </Link>{" "}
              остаётся в кабинете для личных приглашений.
            </p>
            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={partnerApplyMailto("Заявка: партнёрская программа RevShare")}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 border-0 bg-[#B7F500] px-6 text-sm font-semibold text-black hover:bg-[#c8ff3d]",
                )}
              >
                Подать заявку
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </a>
              <Link
                href={ROUTES.referralProgram}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 border-white/12 bg-[#0a0a0a] text-zinc-100 ring-1 ring-white/10 hover:bg-white/5",
                )}
              >
                Реферальная программа для пользователей
              </Link>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start" aria-labelledby="what-title">
            <div>
              <h2 id="what-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Что это за программа
              </h2>
              <p className="mt-2 text-sm text-zinc-500 sm:text-base">Имиджевый, но продуктовый контур RevShare.</p>
            </div>
            <div className={cn("space-y-4 p-6 sm:p-8", surfaceCard)}>
              <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                Партнёрская программа соединяет платформу с теми, кто усиливает доверие и охват: медиа, комьюнити-лидеры,
                rights-экосистема и стратегические игроки. Это не замена реферальной механики — разные цели и договорённости.
              </p>
              <p className="text-sm leading-relaxed text-zinc-500">
                Ценность — в прозрачных условиях, доступе к материалам и совместном росте вокруг музыкальных rights и USDT
                (TRC20) в продукте.
              </p>
            </div>
          </section>

          <section aria-labelledby="formats-title">
            <h2 id="formats-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Форматы партнёрства
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500 sm:text-base">
              Выберите ближайший тип — на этапе заявки можно уточнить гибрид или кастомный сценарий.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partnerFormats.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    "group p-6 transition-colors hover:ring-[#B7F500]/22",
                    surfaceCard,
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4f570]/90">{f.subtitle}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="benefits-title">
            <h2 id="benefits-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Зачем вступать
            </h2>
            <p className="mt-2 text-sm text-zinc-500 sm:text-base">Преимущества партнёрского контура RevShare.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partnerBenefits.map((b) => (
                <div key={b.id} className={cn("p-6", surfaceCard)}>
                  <h3 className="font-semibold text-white">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "process" ? (
        <div className="space-y-10">
          <section aria-labelledby="how-title">
            <h2 id="how-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Как это устроено
            </h2>
            <p className="mt-2 text-sm text-zinc-500">Пять шагов от заявки до регулярной отчётности.</p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {partnerHowSteps.map((s, i) => (
                <li key={s.id} className={cn("relative p-5 pt-8", surfaceCard)}>
                  <span className="absolute -top-3 left-5 flex size-8 items-center justify-center rounded-full bg-[#B7F500]/15 text-xs font-bold text-[#d4f570] ring-1 ring-[#B7F500]/30">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="req-title">
            <h2 id="req-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Кого мы рассматриваем
            </h2>
            <p className="mt-2 text-sm text-zinc-500 sm:text-base">Критерии отбора и качество взаимодействия с аудиторией.</p>
            <ul className={cn("mt-8 space-y-4 p-6 sm:p-8", surfaceCard)}>
              {partnerRequirements.map((r) => (
                <li key={r} className="flex gap-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#B7F500]/80" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="apply"
            className={cn(
              "relative overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-14",
              surfaceCard,
            )}
            aria-labelledby="apply-title"
          >
            <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-[#B7F500]/12 blur-3xl" aria-hidden />
            <h2 id="apply-title" className="relative text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Присоединяйтесь к росту RevShare
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm text-zinc-400 sm:text-base">
              Напишите на{" "}
              <a href={`mailto:${PARTNER_CONTACT_EMAIL}`} className="font-mono text-[#d4f570] hover:underline">
                {PARTNER_CONTACT_EMAIL}
              </a>{" "}
              или отправьте заявку одним кликом — в письме укажите ссылку на площадку и желаемый формат партнёрства.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={partnerApplyMailto("Партнёрская программа RevShare — заявка")}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 min-w-[220px] border-0 bg-[#B7F500] px-8 text-sm font-semibold text-black hover:bg-[#c8ff3d]",
                )}
              >
                Отправить заявку
              </a>
              <Link
                href={ROUTES.support}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 border-white/12 bg-black text-zinc-100 ring-1 ring-white/10 hover:bg-white/5",
                )}
              >
                Вопросы в поддержку
              </Link>
            </div>
            <p className="relative mt-6 text-xs text-zinc-600">
              Онлайн-форма в кабинете подключится позже — сейчас точка входа через почту партнёрской команды.
            </p>
          </section>
        </div>
      ) : null}

      {activeTab === "community" ? (
        <section className={cn("px-4 py-12 sm:px-8 sm:py-14", surfaceCard)} aria-labelledby="voices-title">
          <h2 id="voices-title" className="sr-only">
            Отзывы партнёров
          </h2>
          <PartnerVoicesBlock />
        </section>
      ) : null}

      {activeTab === "faq" ? (
        <section className={cn("p-6 sm:p-8", surfaceCard)} aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-lg font-semibold text-white sm:text-xl">
            Вопросы и ответы
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Партнёрский контур и отличия от реферальной программы.</p>
          <PartnerFaqList items={partnerFaqItems} defaultOpenId={partnerFaqItems[0]?.id ?? null} />
        </section>
      ) : null}
    </div>
  );
}
