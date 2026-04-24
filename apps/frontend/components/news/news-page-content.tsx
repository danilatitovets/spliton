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
  return (
    <div className="space-y-8 sm:space-y-10">
      <section
        className="rounded-3xl bg-white px-5 py-6 sm:px-8 sm:py-8"
        aria-labelledby="news-intro-heading"
      >
        <h2 id="news-intro-heading" className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
          Лента обновлений
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Здесь публикуем заметные изменения интерфейса, выплат и вторичного рынка. Пока источник — демонстрационные
          записи; после подключения CMS или API список станет живым.
        </p>
      </section>

      <div className="space-y-4">
        {newsArticlesMock.map((article) => (
          <article
            key={article.id}
            className="rounded-2xl bg-neutral-50 px-5 py-5 transition-colors hover:bg-neutral-50/80 sm:px-6 sm:py-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryPill category={article.category} />
                {article.isNew ? (
                  <span className="rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                    Новое
                  </span>
                ) : null}
              </div>
              <time className="font-mono text-[11px] tabular-nums text-neutral-500" dateTime={article.isoDate}>
                {article.dateLabel}
              </time>
            </div>
            <h3 className="mt-3 text-base font-semibold tracking-tight text-neutral-900 sm:text-[1.05rem]">
              {article.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
