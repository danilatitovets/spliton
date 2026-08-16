"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { useCatalogKindOptions } from "@/hooks/use-catalog-i18n";
import {
  CATALOG_GENRE_CHIP_KEYS,
  catalogGenreLabelKey,
  genresMatch,
  normalizeCatalogGenreKey,
} from "@/lib/catalog/catalog-genre";
import { cn } from "@/lib/utils";
import type { CatalogKindFilter } from "@/types/catalog/page";
import type { CatalogSearchSuggestionItem } from "@/types/catalog/page";

import { CatalogSearchInput } from "../ui/catalog-search-input";

export function CatalogMarketsToolbar({
  kind,
  onKind,
  genre,
  onGenre,
  searchOpen = false,
  onSearchOpenChange,
  query = "",
  onQuery,
  onSelectSuggestion,
  liveMode = true,
  onOpenFilters,
  activeFiltersCount = 0,
}: {
  kind: CatalogKindFilter;
  onKind: (k: CatalogKindFilter) => void;
  genre: string;
  onGenre: (g: string) => void;
  searchOpen?: boolean;
  onSearchOpenChange?: (open: boolean) => void;
  query?: string;
  onQuery?: (q: string) => void;
  onSelectSuggestion?: (item: CatalogSearchSuggestionItem) => void;
  liveMode?: boolean;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
}) {
  const { t } = useI18n();
  const kindOptions = useCatalogKindOptions();

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onSearchOpenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, onSearchOpenChange]);

  return (
    <div className="space-y-3 bg-black pb-3">
      <div className="flex min-h-9 items-center gap-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/catalog"
          className="inline-flex shrink-0 items-center border-b-2 border-white pb-2 text-[15px] font-semibold text-white"
        >
          {t("catalog.markets.tabCatalog")}
        </Link>
        <Link
          href="/catalog/market-overview"
          className="inline-flex shrink-0 items-center border-b-2 border-transparent pb-2 text-[15px] font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          {t("catalog.markets.tabOverview")}
        </Link>
      </div>

      {searchOpen ? (
        <div className="flex min-h-9 items-center gap-3">
          <CatalogSearchInput
            value={query}
            onChange={(v) => onQuery?.(v)}
            onSelectSuggestion={(item) => {
              onSelectSuggestion?.(item);
              onSearchOpenChange?.(false);
            }}
            liveMode={liveMode}
            exchange
            autoFocus
            placeholder={t("catalog.search.shortPlaceholder")}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => onSearchOpenChange?.(false)}
            className="shrink-0 text-[14px] font-medium text-zinc-300 transition hover:text-white"
          >
            {t("catalog.search.cancel")}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {kindOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onKind(opt.id)}
                className={cn(
                  "shrink-0 border-b-2 pb-2 text-[14px] font-medium transition-colors",
                  kind === opt.id ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onSearchOpenChange?.(true)}
            className="flex h-9 shrink-0 items-center gap-1.5 text-zinc-400 transition hover:text-white"
            aria-label={t("catalog.search.placeholder")}
          >
            <Search className="size-4" strokeWidth={1.75} />
            <span className="hidden text-[13px] sm:inline">{t("catalog.search.shortPlaceholder")}</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATALOG_GENRE_CHIP_KEYS.map((chip) => {
            const active =
              chip === "all"
                ? !genre || genre === "all"
                : genresMatch(genre, chip) || normalizeCatalogGenreKey(genre) === chip;
            const labelKey = chip === "all" ? "catalog.markets.chipAll" : catalogGenreLabelKey(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => onGenre(chip === "all" ? "" : chip)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "bg-[#1a1a1a] text-white" : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {labelKey ? t(labelKey) : chip}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onOpenFilters?.()}
          className={cn(
            "relative flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#1a1a1a] px-3 text-[13px] font-medium text-zinc-300 transition hover:text-white lg:hidden",
            activeFiltersCount > 0 && "text-white",
          )}
          aria-label={t("catalog.filters.mobileButton")}
        >
          <SlidersHorizontal className="size-3.5" strokeWidth={1.75} />
          <span>{t("catalog.filters.mobileButton")}</span>
          {activeFiltersCount > 0 ? (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
              {activeFiltersCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
