"use client";

import * as React from "react";
import { Search } from "@/lib/lucide";

import { NewsCard } from "@/components/news/news-card";
import { NewsCategoryFilters } from "@/components/news/news-category-filters";
import { NewsPagination } from "@/components/news/news-pagination";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import type { NewsCategoryFilterId } from "@/constants/news-mock-data";
import { NEWS_PAGE_SIZE } from "@/constants/news-mock-data";
import { isLiveNewsEnabled } from "@/lib/public-env";
import { fetchPublicNewsList } from "@/services/news.service";
import { cn } from "@/lib/utils";

export function NewsPageContent() {
  const { t } = useI18n();
  const [category, setCategory] = React.useState<NewsCategoryFilterId>("all");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [articles, setArticles] = React.useState<Awaited<ReturnType<typeof fetchPublicNewsList>>["items"]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(false);
    void fetchPublicNewsList({
      page,
      pageSize: NEWS_PAGE_SIZE,
      category,
      q: debouncedSearch || undefined,
    })
      .then((result) => {
        setArticles(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, category, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleCategoryChange = (id: NewsCategoryFilterId) => {
    setCategory(id);
  };

  return (
    <div className="space-y-7 pb-4 sm:space-y-9">
      <section className="rounded-2xl bg-black px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:rounded-[1.35rem] sm:px-8 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <NewsCategoryFilters active={category} onChange={handleCategoryChange} className="min-w-0" />
          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">{t("news.searchPlaceholder")}</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("news.searchPlaceholder")}
              className={cn(
                "h-10 w-full appearance-none rounded-full border-0 bg-white/[0.06] py-2 pl-10 pr-4 text-sm text-white shadow-none outline-none ring-0",
                "placeholder:text-zinc-600 transition-[background-color] duration-200",
                "hover:bg-white/[0.08] focus:bg-white/[0.1] focus:ring-0",
                "[-webkit-appearance:none]",
              )}
            />
          </label>
        </div>

        <div className="mt-7">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t("news.blogTitle")}
            {!loading && !error ? ` (${total})` : ""}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">{t("news.blogSubtitle")}</p>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: NEWS_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/10] rounded-xl bg-white/[0.05]" />
              <div className="mt-4 h-3 w-16 rounded bg-white/[0.05]" />
              <div className="mt-3 h-5 w-full rounded bg-white/[0.05]" />
              <div className="mt-2 h-4 w-4/5 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-500/10 px-6 py-12 text-center shadow-[inset_0_0_0_1px_rgba(251,113,133,0.25)]">
          <p className="text-sm text-rose-100">
            {isLiveNewsEnabled() ? t("news.error.live") : t("news.error.demo")}
          </p>
          <Button
            type="button"
            className="mt-4 rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-[#e8e8e8]"
            onClick={load}
          >
            {t("news.retry")}
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.04] px-6 py-16 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <p className="text-sm font-medium text-white">{t("news.empty.title")}</p>
          <p className="mt-2 text-sm text-zinc-500">
            {debouncedSearch ? t("news.empty.searchHint") : t("news.empty.categoryHint")}
          </p>
          {(debouncedSearch || category !== "all") && (
            <Button
              type="button"
              className="mt-4 rounded-full bg-white/[0.08] px-4 text-sm font-medium text-white hover:bg-white/[0.12]"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              {t("news.empty.resetFilters")}
            </Button>
          )}
        </div>
      ) : (
        <>
          <section aria-label={t("news.list.aria")}>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          <NewsPagination page={page} totalPages={totalPages} onPageChange={setPage} className="pt-2" />
        </>
      )}
    </div>
  );
}