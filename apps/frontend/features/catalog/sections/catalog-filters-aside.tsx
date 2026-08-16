"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { RotateCcw } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  useCatalogKindOptions,
  useCatalogPhaseOptions,
  useCatalogSortOptions,
} from "@/hooks/use-catalog-i18n";
import { tf } from "@/lib/i18n/financial-messages";
import { intlLocaleFor } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import type { CatalogSearchSuggestionItem } from "@/types/catalog/page";
import type { CatalogFundingPhase, CatalogKindFilter, CatalogSortKey } from "@/types/catalog/page";

import type { CatalogActiveFilter } from "../hooks/use-catalog-active-filters";
import { CatalogActiveFilterChips } from "../ui/catalog-active-filter-chips";
import { CatalogGenreFilterSection } from "../ui/catalog-genre-filter-section";
import { CatalogSearchInput } from "../ui/catalog-search-input";

const FILTERS_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

const sectionTitle =
  "mb-3 text-[11px] font-medium tracking-wide text-zinc-500";

const rowClass = "flex flex-wrap gap-2";

const baseChip =
  "inline-flex h-10 items-center justify-center rounded-full px-4 text-[12px] font-medium tracking-[0.02em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20";

const idleChip =
  "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-100";

const activeChip = "bg-white text-black";

const ghostButton =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[11px] font-medium tracking-wide text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200";

const filterInput =
  "h-11 w-full appearance-none rounded-xl border-0 bg-white/[0.06] px-3 text-[13px] text-zinc-100 shadow-none outline-none ring-0 placeholder:text-zinc-600 transition-[background-color] hover:bg-white/[0.08] focus:bg-white/[0.1]";

function normalizeMarketNumber(value: string): string {
  return value.replace(/[^\d,.\s]/g, "").replace(/\s+/g, " ").trim();
}

function formatMarketNumber(value: string, locale: import("@/lib/i18n/types").AppLocale): string {
  const normalized = normalizeMarketNumber(value).replace(/\s/g, "").replace(",", ".");
  if (!normalized) return "";
  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat(intlLocaleFor(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function FilterSection({
  title,
  children,
  muted = false,
}: {
  title: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={cn("px-1 py-1", muted && "opacity-45")}>
      <p className={sectionTitle}>{title}</p>
      {children}
    </section>
  );
}

function FiltersPanel({
  query,
  onQuery,
  onSelectSuggestion,
  kind,
  onKind,
  phase,
  onPhase,
  genre,
  onGenre,
  genres,
  genreCounts,
  sort,
  onSort,
  minPrice,
  onMinPrice,
  maxPrice,
  onMaxPrice,
  minProgress,
  onMinProgress,
  minYield,
  onMinYield,
  minLiquidity,
  onMinLiquidity,
  favoritesOnly,
  onFavoritesOnly,
  priceLabel,
  activeFilters,
  onReset,
  liveMode,
  kindOptions,
  phaseOptions,
  sortOptions,
  t,
  locale,
}: {
  query: string;
  onQuery: (q: string) => void;
  onSelectSuggestion: (item: CatalogSearchSuggestionItem) => void;
  kind: CatalogKindFilter;
  onKind: (k: CatalogKindFilter) => void;
  phase: CatalogFundingPhase;
  onPhase: (p: CatalogFundingPhase) => void;
  genre: string;
  onGenre: (g: string) => void;
  genres: string[];
  genreCounts: Map<string, number>;
  sort: CatalogSortKey;
  onSort: (s: CatalogSortKey) => void;
  minPrice: string;
  onMinPrice: (value: string) => void;
  maxPrice: string;
  onMaxPrice: (value: string) => void;
  minProgress: string;
  onMinProgress: (value: string) => void;
  minYield: string;
  onMinYield: (value: string) => void;
  minLiquidity: string;
  onMinLiquidity: (value: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnly: (value: boolean) => void;
  priceLabel: string;
  onReset: () => void;
  liveMode: boolean;
  kindOptions: { id: CatalogKindFilter; label: string }[];
  phaseOptions: { id: CatalogFundingPhase; label: string }[];
  sortOptions: { id: CatalogSortKey; label: string }[];
  t: (key: string) => string;
  locale: import("@/lib/i18n/types").AppLocale;
  activeFilters: CatalogActiveFilter[];
}) {
  const phaseLocked = kind === "market";

  return (
    <div className="space-y-2">
      <section className="px-1 py-1">
        {liveMode ? (
          <CatalogSearchInput
            value={query}
            onChange={onQuery}
            onSelectSuggestion={onSelectSuggestion}
            liveMode
          />
        ) : (
          <CatalogSearchInput
            value={query}
            onChange={onQuery}
            onSelectSuggestion={(item) => onQuery(item.value)}
            liveMode={false}
          />
        )}

        {activeFilters.length > 0 ? (
          <div className="mt-3 max-h-28 overflow-y-auto pr-1 Spliton-scrollbar">
            <CatalogActiveFilterChips filters={activeFilters} onReset={onReset} />
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-zinc-600">{t("catalog.filters.noActive")}</p>
        )}
      </section>

      <FilterSection title={t("catalog.filters.section.favorites")}>
        <button
          type="button"
          onClick={() => onFavoritesOnly(!favoritesOnly)}
          className={cn(baseChip, favoritesOnly ? activeChip : idleChip)}
          aria-pressed={favoritesOnly}
        >
          {t("catalog.filters.favoritesOnly")}
        </button>
      </FilterSection>

      <FilterSection title={priceLabel}>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={minPrice}
            onChange={(e) => onMinPrice(normalizeMarketNumber(e.target.value))}
            onBlur={(e) => onMinPrice(formatMarketNumber(e.target.value, locale))}
            placeholder={t("catalog.filters.priceFrom")}
            className={filterInput}
          />
          <input
            type="text"
            inputMode="decimal"
            value={maxPrice}
            onChange={(e) => onMaxPrice(normalizeMarketNumber(e.target.value))}
            onBlur={(e) => onMaxPrice(formatMarketNumber(e.target.value, locale))}
            placeholder={t("catalog.filters.priceTo")}
            className={filterInput}
          />
        </div>
      </FilterSection>

      <FilterSection title={t("catalog.filters.section.type")}>
        <div className={rowClass}>
          {kindOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onKind(o.id)}
              className={cn(baseChip, kind === o.id ? activeChip : idleChip)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t("catalog.filters.section.status")} muted={phaseLocked}>
        <div className={rowClass} aria-disabled={phaseLocked}>
          {phaseOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={phaseLocked}
              onClick={() => onPhase(o.id)}
              className={cn(baseChip, phase === o.id ? activeChip : idleChip, phaseLocked && "pointer-events-none")}
            >
              {o.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <CatalogGenreFilterSection
        genre={genre}
        onGenre={onGenre}
        genres={genres}
        genreCounts={genreCounts}
      />

      <FilterSection title={t("catalog.filters.section.sort")}>
        <div className={rowClass}>
          {sortOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onSort(o.id)}
              className={cn(baseChip, sort === o.id ? activeChip : idleChip)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {kind !== "market" ? (
        <>
          <FilterSection title={t("catalog.filters.section.progress")}>
            <input
              type="text"
              inputMode="decimal"
              value={minProgress}
              onChange={(e) => onMinProgress(normalizeMarketNumber(e.target.value))}
              onBlur={(e) => onMinProgress(formatMarketNumber(e.target.value, locale))}
              placeholder={t("catalog.filters.placeholder.minProgress")}
              className={filterInput}
            />
          </FilterSection>

          <FilterSection title={t("catalog.filters.section.yield")}>
            <input
              type="text"
              inputMode="decimal"
              value={minYield}
              onChange={(e) => onMinYield(normalizeMarketNumber(e.target.value))}
              onBlur={(e) => onMinYield(formatMarketNumber(e.target.value, locale))}
              placeholder={t("catalog.filters.placeholder.minYield")}
              className={filterInput}
            />
          </FilterSection>
        </>
      ) : (
        <FilterSection title={t("catalog.filters.section.liquidity")}>
          <input
            type="text"
            inputMode="decimal"
            value={minLiquidity}
            onChange={(e) => onMinLiquidity(normalizeMarketNumber(e.target.value))}
            onBlur={(e) => onMinLiquidity(formatMarketNumber(e.target.value, locale))}
            placeholder={t("catalog.filters.placeholder.minLiquidity")}
            className={filterInput}
          />
        </FilterSection>
      )}
    </div>
  );
}

export function CatalogFiltersAside(props: {
  query: string;
  onQuery: (q: string) => void;
  onSelectSuggestion: (item: CatalogSearchSuggestionItem) => void;
  kind: CatalogKindFilter;
  onKind: (k: CatalogKindFilter) => void;
  phase: CatalogFundingPhase;
  onPhase: (p: CatalogFundingPhase) => void;
  genre: string;
  onGenre: (g: string) => void;
  genres: string[];
  genreCounts: Map<string, number>;
  sort: CatalogSortKey;
  onSort: (s: CatalogSortKey) => void;
  minPrice: string;
  onMinPrice: (value: string) => void;
  maxPrice: string;
  onMaxPrice: (value: string) => void;
  minProgress: string;
  onMinProgress: (value: string) => void;
  minYield: string;
  onMinYield: (value: string) => void;
  minLiquidity: string;
  onMinLiquidity: (value: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnly: (value: boolean) => void;
  priceLabel: string;
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
  liveMode: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  activeFilters: CatalogActiveFilter[];
}) {
  const {
    query,
    onQuery,
    onSelectSuggestion,
    kind,
    onKind,
    phase,
    onPhase,
    genre,
    onGenre,
    genres,
    genreCounts,
    sort,
    onSort,
    minPrice,
    onMinPrice,
    maxPrice,
    onMaxPrice,
    minProgress,
    onMinProgress,
    minYield,
    onMinYield,
    minLiquidity,
    onMinLiquidity,
    favoritesOnly,
    onFavoritesOnly,
    priceLabel,
    filteredCount,
    totalCount,
    onReset,
    liveMode,
    mobileOpen,
    onMobileOpenChange,
    activeFilters,
  } = props;

  const { t, locale } = useI18n();
  const kindOptions = useCatalogKindOptions();
  const phaseOptions = useCatalogPhaseOptions();
  const sortOptions = useCatalogSortOptions();
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const panelProps = {
    query,
    onQuery,
    onSelectSuggestion,
    kind,
    onKind,
    phase,
    onPhase,
    genre,
    onGenre,
    genres,
    genreCounts,
    sort,
    onSort,
    minPrice,
    onMinPrice,
    maxPrice,
    onMaxPrice,
    minProgress,
    onMinProgress,
    minYield,
    onMinYield,
    minLiquidity,
    onMinLiquidity,
    favoritesOnly,
    onFavoritesOnly,
    priceLabel,
    activeFilters,
    onReset,
    liveMode,
    kindOptions,
    phaseOptions,
    sortOptions,
    t,
    locale,
  };

  const mobileFiltersSheet =
    mobileOpen && portalReady ? (
      <div className="fixed inset-0 z-[250] lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/70"
          aria-label={t("catalog.filters.closeAria")}
          onClick={() => onMobileOpenChange?.(false)}
        />
        <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-[#050505] shadow-2xl">
          <div className="flex shrink-0 flex-col items-center pt-2.5 pb-1">
            <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
          </div>
          <div className="relative isolate shrink-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <video
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-[10px] motion-reduce:hidden"
                src={FILTERS_HEADER_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-[#050505]" />
            </div>
            <div className="relative z-10 flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-base font-semibold text-white">{t("catalog.filters.title")}</p>
                <p className="mt-0.5 text-[11px] text-white/55">
                  {tf(t("catalog.filters.countOf"), {
                    filtered: String(filteredCount),
                    total: String(totalCount),
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black/35 px-3 text-[12px] font-medium text-zinc-300 backdrop-blur-sm"
              >
                <RotateCcw className="size-3.5" />
                {t("catalog.filters.reset")}
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 Spliton-scrollbar">
            <FiltersPanel {...panelProps} />
          </div>
          <div className="shrink-0 border-t border-white/[0.06] bg-[#050505] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
              >
                <RotateCcw className="size-3.5 opacity-70" aria-hidden />
                {t("catalog.filters.reset")}
              </button>
              <button
                type="button"
                className="inline-flex h-11 flex-[1.2] touch-manipulation items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
                onClick={() => onMobileOpenChange?.(false)}
              >
                {t("catalog.filters.apply")}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      {mobileFiltersSheet ? createPortal(mobileFiltersSheet, document.body) : null}

      <aside
        className={cn(
          "hidden w-full shrink-0 flex-col overflow-hidden bg-[#050505] text-[13px] text-white lg:flex",
          "lg:h-full lg:w-[400px] lg:min-w-[360px] lg:max-w-[420px]",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative isolate shrink-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <video
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-[10px] motion-reduce:hidden"
                src={FILTERS_HEADER_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-[#050505]" />
            </div>
            <div className="relative z-10 flex items-start justify-between gap-3 px-5 pb-4 pt-5">
              <div className="min-w-0">
                <p className="text-[17px] font-semibold tracking-tight text-white">{t("catalog.filters.title")}</p>
                <p className="mt-1 text-[12px] text-white/55">
                  {tf(t("catalog.filters.countOf"), {
                    filtered: String(filteredCount),
                    total: String(totalCount),
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-black/35 px-3 text-[12px] font-medium text-zinc-300 backdrop-blur-sm transition hover:bg-black/50 hover:text-white"
              >
                <RotateCcw className="size-3.5" strokeWidth={1.9} aria-hidden />
                {t("catalog.filters.reset")}
              </button>
            </div>
          </div>
          <div className="Spliton-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            <FiltersPanel {...panelProps} />
          </div>
          <div className="shrink-0 px-5 pb-5 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
              >
                <RotateCcw className="size-3.5 opacity-70" aria-hidden />
                {t("catalog.filters.reset")}
              </button>
              <Link
                href="/assets/unt"
                className="inline-flex h-11 flex-[1.15] items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-zinc-200"
              >
                {t("catalog.filters.untLink")}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
