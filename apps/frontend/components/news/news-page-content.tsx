import Image from "next/image";
import { ChevronRight, Search } from "lucide-react";

import { NEWS_CATEGORY_META, newsArticlesMock, type NewsCategoryId } from "@/constants/news-mock-data";
import { cn } from "@/lib/utils";

function CategoryPill({ category }: { category: NewsCategoryId }) {
  const meta = NEWS_CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight",
        meta.pillClass,
      )}
    >
      {meta.label}
    </span>
  );
}

export function NewsPageContent() {
  const [featured, ...rest] = newsArticlesMock;

  if (!featured) return null;

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="rounded-3xl bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-neutral-500">
            Узнать больше <span className="mx-1 text-neutral-300">›</span> <span className="text-neutral-900">Блог</span>
          </p>
          <label className="relative block w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              type="search"
              placeholder="Поиск статей"
              className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-300"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 pb-4">
          {["В тренде", "Для начинающих", "Торговля", "Объяснение", "Глоссарий", "Блог", "Аналитика"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={cn(
                "text-2xs sm:text-sm font-semibold transition-colors",
                tab === "Блог" ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800",
              )}
            >
              {tab}
            </button>
          ))}
          <button type="button" className="ml-auto inline-flex items-center text-neutral-500 hover:text-neutral-900">
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">Блог (71)</h2>
          <p className="mt-2 text-sm text-neutral-600">Узнайте последние новости о RevShare.</p>
        </div>
      </section>

      <article className="grid gap-6 rounded-3xl bg-white p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CategoryPill category={featured.category} />
            {featured.isNew ? (
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold text-neutral-800">
                New
              </span>
            ) : null}
          </div>
          <time className="font-mono text-[11px] text-neutral-500" dateTime={featured.isoDate}>
            {featured.dateLabel}
          </time>
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{featured.title}</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">{featured.excerpt}</p>
        </div>
        <div className="relative h-52 overflow-hidden rounded-2xl sm:h-60">
          <Image src="/images/news/back.jpg" alt="" fill className="object-cover object-center" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/45 via-transparent to-neutral-900/15" aria-hidden />
        </div>
      </article>

      <section aria-labelledby="news-grid-title">
        <h2 id="news-grid-title" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Все публикации
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-2xl bg-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="relative h-36">
                <Image src="/images/news/back.jpg" alt="" fill className="object-cover object-center" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/35 via-transparent to-neutral-900/20" aria-hidden />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <CategoryPill category={article.category} />
                  <time className="font-mono text-[11px] tabular-nums text-neutral-500" dateTime={article.isoDate}>
                    {article.dateLabel}
                  </time>
                </div>
                <h3 className="text-base font-semibold tracking-tight text-neutral-900">{article.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{article.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
