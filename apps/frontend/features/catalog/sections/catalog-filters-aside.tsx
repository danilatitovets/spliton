"use client";

import Link from "next/link";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CatalogFundingPhase, CatalogKindFilter, CatalogSortKey } from "@/types/catalog/page";

const KIND_OPTIONS: { id: CatalogKindFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "funding", label: "Раунды" },
  { id: "market", label: "Вторичка" },
];

const PHASE_OPTIONS: { id: CatalogFundingPhase; label: string }[] = [
  { id: "all", label: "Любая фаза" },
  { id: "open", label: "Сбор" },
  { id: "payouts", label: "Выплаты" },
];

const SORT_OPTIONS: { id: CatalogSortKey; label: string }[] = [
  { id: "catalog_order", label: "По умолчанию" },
  { id: "title_asc", label: "Название А→Я" },
  { id: "progress_desc", label: "Прогресс ↓" },
  { id: "yield_desc", label: "Доходность ↓" },
];

const sectionTitle =
  "mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500";

const rowClass =
  "flex flex-wrap gap-2";

const baseChip =
  "inline-flex h-10 items-center justify-center rounded-xl px-4 text-[12px] font-medium tracking-[0.02em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20";

const idleChip =
  "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100";

const activeChip =
  "bg-white text-black shadow-[0_6px_20px_rgba(0,0,0,0.3)]";

const ghostButton =
  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200";

function normalizeMarketNumber(value: string): string {
  return value.replace(/[^\d,.\s]/g, "").replace(/\s+/g, " ").trim();
}

function formatMarketNumber(value: string): string {
  const normalized = normalizeMarketNumber(value).replace(/\s/g, "").replace(",", ".");
  if (!normalized) return "";
  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat("ru-RU", {
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
    <section
      className={cn(
        "px-1 py-1",
        muted && "opacity-45",
      )}
    >
      <p className={sectionTitle}>{title}</p>
      {children}
    </section>
  );
}

export function CatalogFiltersAside({
  query,
  onQuery,
  kind,
  onKind,
  phase,
  onPhase,
  genre,
  onGenre,
  genres,
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
  filteredCount,
  totalCount,
  onReset,
}: {
  query: string;
  onQuery: (q: string) => void;
  kind: CatalogKindFilter;
  onKind: (k: CatalogKindFilter) => void;
  phase: CatalogFundingPhase;
  onPhase: (p: CatalogFundingPhase) => void;
  genre: string;
  onGenre: (g: string) => void;
  genres: string[];
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
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
}) {
  const phaseLocked = kind === "market";

  const activeFilters: Array<{ label: string; onClear: () => void }> = [];

  if (kind !== "all") {
    activeFilters.push({
      label: KIND_OPTIONS.find((o) => o.id === kind)?.label ?? "",
      onClear: () => onKind("all"),
    });
  }

  if (!phaseLocked && phase !== "all") {
    activeFilters.push({
      label: PHASE_OPTIONS.find((o) => o.id === phase)?.label ?? "",
      onClear: () => onPhase("all"),
    });
  }

  if (genre) {
    activeFilters.push({
      label: genre,
      onClear: () => onGenre(""),
    });
  }

  if (sort !== "catalog_order") {
    activeFilters.push({
      label: SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "",
      onClear: () => onSort("catalog_order"),
    });
  }

  if (minPrice.trim()) {
    activeFilters.push({
      label: `Цена от: ${formatMarketNumber(minPrice) || minPrice.trim()}`,
      onClear: () => onMinPrice(""),
    });
  }

  if (maxPrice.trim()) {
    activeFilters.push({
      label: `Цена до: ${formatMarketNumber(maxPrice) || maxPrice.trim()}`,
      onClear: () => onMaxPrice(""),
    });
  }

  if (minProgress.trim()) {
    activeFilters.push({
      label: `Прогресс от: ${formatMarketNumber(minProgress) || minProgress.trim()}%`,
      onClear: () => onMinProgress(""),
    });
  }

  if (minYield.trim()) {
    activeFilters.push({
      label: `Доходность от: ${formatMarketNumber(minYield) || minYield.trim()}%`,
      onClear: () => onMinYield(""),
    });
  }

  if (query.trim()) {
    activeFilters.push({
      label: `Поиск: ${query.trim()}`,
      onClear: () => onQuery(""),
    });
  }

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col bg-[#050505] text-[13px] text-white",
        "lg:h-full lg:w-[430px] lg:min-w-[380px] lg:max-w-[460px]",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-white/4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <SlidersHorizontal className="size-4 text-zinc-200" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[18px] font-semibold tracking-tight text-white">
                Фильтры
              </p>
            </div>
          </div>

          <button type="button" onClick={onReset} className={ghostButton}>
            <RotateCcw className="size-3.5" strokeWidth={1.9} aria-hidden />
            Сброс
          </button>
        </div>

        <div className="revshare-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
          <div className="space-y-2">
            <section className="px-1 py-1">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-zinc-600"
                  strokeWidth={1.9}
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder="Трек или артист"
                  className={cn(
                    "h-11 w-full rounded-2xl bg-black/30 py-2 pl-10 pr-4 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600",
                    "focus:ring-1 focus:ring-white/20",
                  )}
                />
              </div>

              {activeFilters.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeFilters.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClear}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-medium text-zinc-300 transition hover:bg-white/8"
                    >
                      {item.label}
                      <X className="size-3 text-zinc-500" strokeWidth={2} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-zinc-600">
                  Нет активных фильтров
                </p>
              )}
            </section>

            <FilterSection title="Цена (вторичка)">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={minPrice}
                  onChange={(e) => onMinPrice(normalizeMarketNumber(e.target.value))}
                  onBlur={(e) => onMinPrice(formatMarketNumber(e.target.value))}
                  placeholder="От, напр. 1 000"
                  className="h-11 rounded-xl bg-black/30 px-3 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-white/20"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={maxPrice}
                  onChange={(e) => onMaxPrice(normalizeMarketNumber(e.target.value))}
                  onBlur={(e) => onMaxPrice(formatMarketNumber(e.target.value))}
                  placeholder="До, напр. 2 500"
                  className="h-11 rounded-xl bg-black/30 px-3 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-white/20"
                />
              </div>
            </FilterSection>

            <FilterSection title="Тип">
              <div className={rowClass}>
                {KIND_OPTIONS.map((o) => {
                  const isActive = kind === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => onKind(o.id)}
                      className={cn(baseChip, isActive ? activeChip : idleChip)}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection
              title="Фаза раунда"
              muted={phaseLocked}
            >
              <div
                className={rowClass}
                aria-disabled={phaseLocked}
                title={phaseLocked ? "Для вторичного рынка фаза не применяется" : undefined}
              >
                {PHASE_OPTIONS.map((o) => {
                  const isActive = phase === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={phaseLocked}
                      onClick={() => onPhase(o.id)}
                      className={cn(
                        baseChip,
                        isActive ? activeChip : idleChip,
                        phaseLocked && "pointer-events-none",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Жанр">
              <div className={rowClass}>
                <button
                  type="button"
                  onClick={() => onGenre("")}
                  className={cn(baseChip, genre === "" ? activeChip : idleChip)}
                >
                  Все
                </button>

                {genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGenre(g)}
                    className={cn(baseChip, genre === g ? activeChip : idleChip)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Сортировка">
              <div className={rowClass}>
                {SORT_OPTIONS.map((o) => {
                  const isActive = sort === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => onSort(o.id)}
                      className={cn(baseChip, isActive ? activeChip : idleChip)}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Прогресс раунда (funding)">
              <input
                type="text"
                inputMode="decimal"
                value={minProgress}
                onChange={(e) => onMinProgress(normalizeMarketNumber(e.target.value))}
                onBlur={(e) => onMinProgress(formatMarketNumber(e.target.value))}
                placeholder="Минимум, %, напр. 50"
                className="h-11 w-full rounded-xl bg-black/30 px-3 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-white/20"
              />
            </FilterSection>

            <FilterSection title="Доходность (funding)">
              <input
                type="text"
                inputMode="decimal"
                value={minYield}
                onChange={(e) => onMinYield(normalizeMarketNumber(e.target.value))}
                onBlur={(e) => onMinYield(formatMarketNumber(e.target.value))}
                placeholder="Минимум, %, напр. 8,5"
                className="h-11 w-full rounded-xl bg-black/30 px-3 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-white/20"
              />
            </FilterSection>
          </div>
        </div>
        <div className="px-4 pb-4 pt-2 sm:px-5">
          <div className="text-center">
            <Link
              href="/assets/unt"
              className="inline-flex items-center justify-center font-sans text-[11px] font-medium text-zinc-500 transition hover:text-zinc-200"
              aria-label="Что такое UNT"
            >
              Что такое UNT?
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}