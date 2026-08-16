"use client";

import { useMemo, Fragment } from "react";

import type { CatalogItem } from "@/lib/catalog-mock";
import { tf } from "@/lib/i18n/financial-messages";
import { cn } from "@/lib/utils";
import type { CatalogGridView, CatalogPagination, CatalogStats } from "@/types/catalog/page";
import type { CatalogKindFilter } from "@/types/catalog/page";

import { useI18n } from "@/components/providers/i18n-provider";
import { CatalogTrackCard } from "@/components/dashboard/catalog-track-card";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";

import { CatalogMainSubheader } from "./catalog-main-subheader";
import { CatalogMarketsToolbar } from "./catalog-markets-toolbar";
import { CatalogPageHero } from "./catalog-page-hero";
import { CatalogActiveFilterChips } from "../ui/catalog-active-filter-chips";
import { CatalogEmptyState } from "../ui/catalog-empty-state";
import { CatalogCardsSkeleton } from "../ui/catalog-skeleton";
import {
  CatalogMarketInstrumentRow,
  CatalogMarketsTableHeader,
  catalogItemHref,
} from "../ui/catalog-market-instrument-row";
import type { CatalogActiveFilter } from "../hooks/use-catalog-active-filters";

export function CatalogMainArea({
  catalogView,
  onCatalogView,
  filtered,
  resultCount,
  totalCount,
  pagination,
  page,
  onPageChange,
  catalogLoading,
  catalogError,
  liveMode,
  stats,
  statsUnavailable = false,
  onReloadCatalog,
  hasActiveFilters,
  onResetFilters,
  onOpenFilters,
  activeFiltersCount,
  activeFilters = [],
  kind,
  onKind,
  genre,
  onGenre,
  onFocusSearch,
  searchOpen = false,
  onSearchOpenChange,
  query = "",
  onQuery,
  onSelectSuggestion,
  favoritesOnly = false,
  isFavorite,
  onToggleFavorite,
}: {
  catalogView: CatalogGridView;
  onCatalogView: (v: CatalogGridView) => void;
  filtered: CatalogItem[];
  resultCount: number;
  totalCount: number;
  pagination: CatalogPagination | null;
  page: number;
  onPageChange: (page: number) => void;
  catalogLoading?: boolean;
  catalogError?: unknown;
  liveMode?: boolean;
  stats?: CatalogStats | null;
  statsUnavailable?: boolean;
  onReloadCatalog?: () => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  activeFilters?: CatalogActiveFilter[];
  kind: CatalogKindFilter;
  onKind: (k: CatalogKindFilter) => void;
  genre: string;
  onGenre: (g: string) => void;
  onFocusSearch?: () => void;
  searchOpen?: boolean;
  onSearchOpenChange?: (open: boolean) => void;
  query?: string;
  onQuery?: (q: string) => void;
  onSelectSuggestion?: (item: import("@/types/catalog/page").CatalogSearchSuggestionItem) => void;
  favoritesOnly?: boolean;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void | Promise<void>;
}) {
  const { t } = useI18n();
  const isList = catalogView === "list";
  const totalPages = pagination?.totalPages ?? 1;

  const catalogCardGrid = (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((item) => (
        <CatalogTrackCard key={item.id} item={item} variant="card" size="large" />
      ))}
    </div>
  );

  const sortedForList = useMemo(() => filtered, [filtered]);

  const emptyTitle = favoritesOnly
    ? t("catalog.empty.favoritesTitle")
    : hasActiveFilters
      ? t("catalog.empty.filteredTitle")
      : t("catalog.empty.noItemsTitle");
  const emptyHint = favoritesOnly
    ? t("catalog.empty.favoritesHint")
    : hasActiveFilters
      ? t("catalog.empty.filteredHint")
      : t("catalog.empty.noItemsHint");

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-black",
      )}
      aria-label={t("catalog.main.ariaLabel")}
    >
      <div className="relative z-30 shrink-0 bg-black px-4 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <CatalogMarketsToolbar
            kind={kind}
            onKind={onKind}
            genre={genre}
            onGenre={onGenre}
            searchOpen={searchOpen}
            onSearchOpenChange={onSearchOpenChange}
            query={query}
            onQuery={onQuery}
            onSelectSuggestion={onSelectSuggestion}
            liveMode={liveMode}
            onOpenFilters={onOpenFilters}
            activeFiltersCount={activeFiltersCount}
          />
          {isList ? null : (
            <div className="py-3">
              <CatalogMainSubheader
                view={catalogView}
                onViewChange={onCatalogView}
                resultCount={resultCount}
                totalCount={totalCount}
                onOpenFilters={onOpenFilters}
                activeFiltersCount={activeFiltersCount}
                compact
              />
            </div>
          )}
          {activeFilters.length > 0 ? (
            <div className="pb-3 lg:hidden">
              <CatalogActiveFilterChips filters={activeFilters} onReset={onResetFilters} compact />
            </div>
          ) : null}
        </div>
      </div>

      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-black",
          "touch-pan-y",
        )}
        data-mobile-scroll-root
      >
      <CatalogPageHero
        stats={liveMode ? (stats ?? null) : null}
        statsUnavailable={liveMode ? statsUnavailable : false}
        previewItems={filtered}
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-12 sm:px-5 lg:px-8 lg:pb-16">
        {catalogError ? (
          <div className="mb-4">
            <ReadOnlySectionError
              sectionId="catalog-main"
              error={catalogError}
              onRetry={onReloadCatalog}
              retryLabel={t("common.retry")}
              variant="dark"
            />
          </div>
        ) : null}

        {catalogLoading && filtered.length === 0 ? (
          <>
            <div className={cn(isList && "hidden lg:block")}>
              <CatalogCardsSkeleton count={8} variant={isList ? "list" : "grid"} />
            </div>
            {isList ? (
              <div className="lg:hidden">
                <CatalogCardsSkeleton count={8} variant="list" />
              </div>
            ) : null}
          </>
        ) : filtered.length === 0 ? (
          <CatalogEmptyState
            title={emptyTitle}
            hint={emptyHint}
            action={
              hasActiveFilters && onResetFilters ? (
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8]"
                  onClick={onResetFilters}
                >
                  {t("catalog.actions.resetFilters")}
                </button>
              ) : null
            }
          />
        ) : isList ? (
          <>
            <div className="flex items-center justify-end gap-2 pb-2">
              <CatalogMainSubheader
                view={catalogView}
                onViewChange={onCatalogView}
                resultCount={resultCount}
                totalCount={totalCount}
                onOpenFilters={onOpenFilters}
                activeFiltersCount={activeFiltersCount}
                compact
              />
            </div>
              <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="min-w-[320px] lg:min-w-[980px]">
                <CatalogMarketsTableHeader t={t} />
                <div>
                  {sortedForList.map((item) => (
                    <CatalogMarketInstrumentRow
                      key={item.id}
                      item={item}
                      href={catalogItemHref(item)}
                      isFavorite={isFavorite?.(item.id) ?? false}
                      onToggleFavorite={() => void onToggleFavorite?.(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
            {liveMode && totalPages > 1 ? (
              <PaginationBlock page={page} totalPages={totalPages} onPageChange={onPageChange} t={t} />
            ) : null}
          </>
        ) : (
          <>
            <p className="mb-4 text-xs text-zinc-500">
              {tf(t("catalog.main.shownCount"), {
                shown: String(resultCount),
                total: String(totalCount),
              })}
            </p>
            {catalogCardGrid}
            {liveMode && totalPages > 1 ? (
              <PaginationBlock page={page} totalPages={totalPages} onPageChange={onPageChange} t={t} />
            ) : null}
          </>
        )}
      </div>
      </main>
    </div>
  );
}

function PaginationBlock({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  t: (key: string) => string;
}) {
  const pages = useMemo(() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, totalPages, page]);
    for (let d = 1; set.size < maxButtons - 1 && d < totalPages; d++) {
      if (page - d > 1) set.add(page - d);
      if (page + d < totalPages) set.add(page + d);
    }
    return [...set].sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex size-8 items-center justify-center text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous"
      >
        ‹
      </button>
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const showEllipsis = prev != null && p - prev > 1;
        return (
          <Fragment key={p}>
            {showEllipsis ? <span className="px-1 text-zinc-600">…</span> : null}
            <button
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-[13px] font-medium tabular-nums transition",
                p === page ? "bg-white text-black" : "text-zinc-400 hover:text-white",
              )}
            >
              {p}
            </button>
          </Fragment>
        );
      })}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex size-8 items-center justify-center text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}
