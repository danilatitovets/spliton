"use client";

import Link from "next/link";
import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { GUIDE_RELEASE_CARD_STEP_IDS, type GuideReleaseCardStepId } from "@/constants/guide/selection";
import { ROUTES } from "@/constants/routes";
import { ChevronRight, Share2 } from "@/lib/lucide";
import { cn } from "@/lib/utils";

import { GuideReleaseCardDemo, GuideReleaseCardSteps } from "./ui/guide-release-card-demo";
import "./ui/guide-release-card.css";

const LINK = "font-medium text-black underline-offset-2 hover:underline";
const GUIDE_VIDEO = "/videos/position-holding-bg.mp4";

const SECTIONS = [
  { id: "checklist", n: "1", title: "ЧЕКЛИСТ ПЕРЕД ПОКУПКОЙ", short: "Чеклист" },
  { id: "look", n: "2", title: "КАК СМОТРЕТЬ КАРТОЧКУ", short: "Карточка" },
  { id: "video", n: "3", title: "ВИДЕО И МАТЕРИАЛЫ", short: "Видео" },
  { id: "buy", n: "4", title: "КАК КУПИТЬ UNITS", short: "Покупка" },
  { id: "factors", n: "5", title: "ПЯТЬ ФАКТОРОВ ВЫБОРА", short: "Факторы" },
  { id: "payouts", n: "6", title: "ВЫПЛАТЫ", short: "Выплаты" },
  { id: "risks", n: "7", title: "РИСКИ", short: "Риски" },
  { id: "faq", n: "8", title: "FAQ", short: "FAQ" },
] as const;

function GuideArticleMeta() {
  return (
    <div className="mx-auto mt-3 flex max-w-2xl items-start justify-center gap-3">
      <p className="min-w-0 text-center text-[13px] leading-relaxed text-[#8c8c8c]">
        Последнее обновление: 13 авг. 2026 г.
        <span className="mx-1.5 text-[#cfcfcf]">/</span>
        8 мин. чтения
      </p>
      <button
        type="button"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#8c8c8c] transition hover:bg-[#f5f5f5] hover:text-black"
        onClick={() => {
          void navigator.clipboard?.writeText(window.location.href);
        }}
        aria-label="Поделиться"
      >
        <Share2 className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function GuideStartCta() {
  return (
    <section
      id="cta"
      className="relative isolate mt-14 overflow-hidden rounded-[1.35rem] bg-black sm:mt-16 sm:rounded-[1.75rem]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 motion-reduce:hidden"
          src={GUIDE_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35 motion-reduce:bg-black" />
      </div>

      <div className="relative z-10 flex min-h-[220px] flex-col justify-center gap-6 px-6 py-10 sm:min-h-[280px] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-14 md:min-h-[320px]">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
            Готовы выбрать релиз?
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65 sm:text-[15px]">
            Откройте каталог и переходите к покупке units после проверки условий и рисков.
          </p>
        </div>
        <Link
          href={ROUTES.dashboardCatalog}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-white px-8 text-[14px] font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98] sm:h-14 sm:w-auto sm:px-10 sm:text-[15px]"
        >
          Начать
        </Link>
      </div>
    </section>
  );
}

function GuideLookCardExplainer() {
  const [activeStep, setActiveStep] = React.useState<GuideReleaseCardStepId>(GUIDE_RELEASE_CARD_STEP_IDS[0]!);

  return (
    <div>
      <div className="guide-release-card-layout">
        <div className="guide-release-card-col">
          <GuideReleaseCardDemo activeStep={activeStep} />
        </div>
        <div className="guide-release-card-col">
          <GuideReleaseCardSteps activeStep={activeStep} onStepSelect={setActiveStep} />
        </div>
      </div>
    </div>
  );
}

function ArticleH2({ id, n, children }: { id: string; n: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-[18px] font-bold leading-snug tracking-tight text-black sm:scroll-mt-28 sm:text-[22px]"
    >
      {n}. {children}
    </h2>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-4 text-[15px] leading-[1.75] text-[#1a1a1a] sm:text-[16px] sm:leading-[1.7]", className)}>
      {children}
    </p>
  );
}

function Sub({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[15px] leading-[1.75] text-[#1a1a1a] sm:mt-5 sm:text-[16px] sm:leading-[1.7]">
      <span className="font-bold">{n}</span> {children}
    </p>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[#e8e8e8] py-4 first:border-t">
      <summary className="cursor-pointer list-none text-[15px] font-semibold text-black marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-3">
          {q}
          <ChevronRight className="mt-1 size-4 shrink-0 text-[#999] transition group-open:rotate-90" aria-hidden />
        </span>
      </summary>
      <p className="mt-2 pr-6 text-[14px] leading-[1.7] text-[#555]">{a}</p>
    </details>
  );
}

export function GuideSelectionScreen() {
  const { t } = useI18n();
  const [activeId, setActiveId] = React.useState<string>(SECTIONS[0]!.id);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0]?.target.id;
        if (top) setActiveId(top);
      },
      { root, rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="h-full min-h-0 overflow-x-hidden overflow-y-auto scroll-smooth bg-white font-sans text-black antialiased [color-scheme:light]"
      data-mobile-scroll-root
    >
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <nav aria-label="Хлебные крошки" className="mb-4 sm:mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#8c8c8c] sm:text-[13px]">
            <li>
              <Link href={ROUTES.support} className="transition hover:text-black">
                Центр поддержки
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#c4c4c4]">›</span>
              <span>Гид</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#c4c4c4]">›</span>
              <span className="text-[#555]">Статья</span>
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:gap-14 xl:gap-16">
          <article className="min-w-0 max-w-[720px]">
            <header className="text-center">
              <h1 className="mx-auto max-w-2xl text-[28px] font-bold leading-[1.15] tracking-tight text-black sm:text-[36px] lg:text-[40px]">
                {t("guide.hero.title")}
              </h1>
              <GuideArticleMeta />
            </header>

            <P className="mx-auto mt-6 max-w-2xl text-center font-semibold sm:mt-8">{t("guide.hero.subtitle")}</P>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px] sm:text-[16px]">
              <Link href={ROUTES.dashboardCatalog} className={LINK}>
                {t("guide.hero.cta.catalog")}
              </Link>
              <Link href={ROUTES.analyticsReleases} className={LINK}>
                {t("guide.hero.cta.compare")}
              </Link>
            </div>

            <P className="mt-6 sm:mt-8">
              Этот гид — практическая статья Spliton: как читать карточку, смотреть видео и материалы, покупать units и
              оценивать риски. Это не инвестиционная рекомендация.
            </P>

            <nav aria-label="Содержание" className="mt-8 border-y border-[#eee] py-4 lg:hidden">
              <p className="text-[12px] font-semibold text-[#8c8c8c]">Содержание</p>
              <ol className="mt-3 columns-2 gap-x-4 space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s.id} className="break-inside-avoid">
                    <a href={`#${s.id}`} className="text-[13px] text-[#555] hover:text-black">
                      {s.n}. {s.short}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="checklist" n="1">
                Чеклист перед покупкой
              </ArticleH2>
              <Sub n="1.1">Пройдите короткий список перед входом в релиз — обычно хватает пары минут.</Sub>
              <Sub n="1.2">Проверьте доходность и историю выплат.</Sub>
              <Sub n="1.3">Посмотрите долю держателей units и комиссии.</Sub>
              <Sub n="1.4">Оцените заполнение раунда и активность вторичного рынка.</Sub>
              <Sub n="1.5">Сравните релиз с 1–2 другими релизами.</Sub>
              <Sub n="1.6">Учтите риски: доходность и ликвидность не гарантированы.</Sub>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="look" n="2">
                Как смотреть карточку
              </ArticleH2>
              <P>
                В каталоге откройте карточку релиза и пройдитесь по полям сверху вниз. Нажмите цифру на карточке или
                шаг <span className="lg:hidden">ниже</span>
                <span className="hidden lg:inline">справа</span> — так видно, что означает каждое поле.
              </P>
              <div className="guide-look-on-light mt-6">
                <GuideLookCardExplainer />
              </div>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="video" n="3">
                Видео и материалы
              </ArticleH2>
              <Sub n="3.1">
                Обложка и видео на странице релиза дают контекст по треку и артисту, но не заменяют метрики.
              </Sub>
              <Sub n="3.2">Видео / обложка — атмосфера и визуальный контекст.</Sub>
              <Sub n="3.3">Описание и условия — как делится доход и какие правила выплат.</Sub>
              <Sub n="3.4">Аналитика — история начислений и динамика доходности.</Sub>
              <Sub n="3.5">Если видео нет — опирайтесь на цифры, условия и историю выплат.</Sub>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="buy" n="4">
                Как купить units
              </ArticleH2>
              <Sub n="4.1">
                На первичке покупка доступна, пока раунд открыт. На вторичке — если есть лоты у других пользователей.
              </Sub>
              <Sub n="4.2">
                Откройте{" "}
                <Link href={ROUTES.dashboardCatalog} className={LINK}>
                  каталог
                </Link>{" "}
                и выберите релиз.
              </Sub>
              <Sub n="4.3">Проверьте условия, долю держателей и риски.</Sub>
              <Sub n="4.4">Нажмите «Купить», укажите количество units и подтвердите оплату в USDT.</Sub>
              <Sub n="4.5">После покупки units появятся в портфеле; выплаты — по правилам релиза.</Sub>
              <Sub n="4.6">Досрочный выход — через вторичный рынок, если есть спрос.</Sub>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="factors" n="5">
                Пять факторов выбора
              </ArticleH2>
              <Sub n="5.1">
                <span className="font-bold">Доходность.</span> Ожидаемый процент. Высокий процент без истории выплат
                часто рискованнее умеренного.
              </Sub>
              <Sub n="5.2">
                <span className="font-bold">Условия сделки.</span> Как делится доход между держателями units, артистом и
                платформой.
              </Sub>
              <Sub n="5.3">
                <span className="font-bold">История выплат.</span> Регулярность и суммы по периодам важнее одного
                красивого процента.
              </Sub>
              <Sub n="5.4">
                <span className="font-bold">Спрос на units.</span> Прогресс раунда и интерес пользователей к релизу.
              </Sub>
              <Sub n="5.5">
                <span className="font-bold">Вторичный рынок.</span> Можно ли продать units до конца цикла — и как быстро.
              </Sub>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="payouts" n="6">
                Выплаты
              </ArticleH2>
              <Sub n="6.1">
                Выплаты держателям units идут в USDT (TRC20) по правилам релиза. Смотрите ритм, суммы и статус
                «начислено» / «выплачено».
              </Sub>
              <Sub n="6.2">Регулярность — предсказуемый ритм важнее разовых пиков.</Sub>
              <Sub n="6.3">Начислено — сумма за период ещё может быть не на кошельке.</Sub>
              <Sub n="6.4">Выплачено — уже переведено на кошелёк в USDT TRC20.</Sub>
              <Sub n="6.5">Сравнивайте несколько периодов, а не один месяц.</Sub>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="risks" n="7">
                Риски
              </ArticleH2>
              <Sub n="7.1">
                Перед покупкой учтите: доход, сроки и выход из позиции могут пойти иначе, чем вы ожидаете.
              </Sub>
              <Sub n="7.2">Выплаты могут проседать от периода к периоду.</Sub>
              <Sub n="7.3">Похожие релизы в одном жанре ведут себя по-разному.</Sub>
              <Sub n="7.4">Окупаемость может затянуться относительно прогноза.</Sub>
              <Sub n="7.5">На вторичке может не быть покупателя сразу.</Sub>
              <Sub n="7.6">Высокий процент — не гарантия будущих выплат.</Sub>
              <P className="mt-6 text-[14px] text-[#666]">
                Это не инвестиционная рекомендация. Итоговая доходность зависит от результатов релиза, условий сделки и
                ликвидности.
              </P>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="faq" n="8">
                FAQ
              </ArticleH2>
              <div className="mt-4">
                <FaqItem
                  q="Что такое units?"
                  a="Unit — доля в пуле дохода релиза. Чем больше units вы держите, тем больше ваша часть выплат в USDT за период."
                />
                <FaqItem
                  q="На что смотреть новичку?"
                  a="История выплат, доля держателей units, условия сделки, прогресс раунда и активность вторичного рынка."
                />
                <FaqItem
                  q="Можно ли выйти раньше?"
                  a="Да — через вторичный рынок, если он включён и есть покупатель. Быстрого выхода никто не гарантирует."
                />
                <FaqItem
                  q="Что важнее: высокая доходность или стабильные выплаты?"
                  a="На длинном горизонте чаще важнее стабильная история выплат, чем один высокий процент без трека записи."
                />
              </div>
            </section>
          </article>

          <aside className="hidden lg:block">
            <nav className="sticky top-8" aria-label="Содержание статьи">
              <ol className="space-y-0 border-l border-[#e5e5e5]">
                {SECTIONS.map((s) => {
                  const active = activeId === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={cn(
                          "relative -ml-px block border-l-2 py-2 pl-3 text-[12px] font-medium uppercase leading-snug tracking-[0.02em] transition",
                          active ? "border-black text-black" : "border-transparent text-[#9a9a9a] hover:text-[#555]",
                        )}
                      >
                        {s.n}. {s.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>
        </div>

        <GuideStartCta />
      </div>
    </div>
  );
}
