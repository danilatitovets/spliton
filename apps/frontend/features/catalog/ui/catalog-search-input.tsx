"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { useI18n } from "@/components/providers/i18n-provider";
import { buildMockCatalogSuggestions } from "@/lib/catalog/catalog-mock-suggestions";
import { cn } from "@/lib/utils";
import type { CatalogSearchSuggestionItem } from "@/types/catalog/page";
import { fetchCatalogSearchSuggestions } from "@/services/catalog.service";

const DEBOUNCE_MS = 280;
const SEARCH_VIDEO = "/videos/position-holding-bg.mp4";

export function CatalogSearchInput({
  value,
  onChange,
  onSelectSuggestion,
  liveMode = true,
  className,
  embedded = false,
  /** OKX-style flat inline field (no pill chrome). */
  exchange = false,
  autoFocus = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (item: CatalogSearchSuggestionItem) => void;
  liveMode?: boolean;
  className?: string;
  /** Inline suggestions list (for modal / constrained layouts). */
  embedded?: boolean;
  exchange?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogSearchSuggestionItem[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      if (!liveMode) {
        setItems(buildMockCatalogSuggestions(term, 8));
        setOpen(true);
        setLoading(false);
        return;
      }

      void fetchCatalogSearchSuggestions(term, 8)
        .then((res) => {
          setItems(res.items);
          setOpen(true);
        })
        .catch(() => setError(t("catalog.search.suggestionsError")))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, t, liveMode]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const showSuggestions = open && value.trim().length >= 2;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 size-[15px] -translate-y-1/2",
            exchange ? "left-0 text-zinc-400" : "left-3 text-zinc-600",
          )}
          strokeWidth={1.9}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length >= 2) setOpen(true);
          }}
          placeholder={placeholder ?? t("catalog.search.placeholder")}
          className={cn(
            "w-full appearance-none border-0 text-[13px] text-zinc-100 shadow-none outline-none ring-0 placeholder:text-zinc-500",
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            exchange
              ? "h-9 bg-transparent py-1.5 pl-6 pr-8 caret-[#B7F500]"
              : embedded
                ? "h-11 rounded-full bg-white/[0.06] py-2 pl-10 pr-10 focus:bg-white/[0.1]"
                : "h-11 rounded-full bg-white/[0.06] py-2 pl-10 pr-10 focus:bg-white/[0.1]",
          )}
          autoComplete="off"
        />
        {loading ? (
          <SplitonLoader
            size="xxs"
            variant="light"
            className={cn("absolute top-1/2 -translate-y-1/2", exchange ? "right-0" : "right-3")}
            label={t("common.loading")}
          />
        ) : null}
      </div>

      {showSuggestions ? (
        <div
          className={cn(
            "relative isolate overflow-hidden",
            exchange
              ? "absolute left-0 right-0 top-[calc(100%+10px)] z-50 min-w-[min(100vw-2rem,420px)] rounded-2xl bg-[#0a0a0a]"
              : embedded
                ? "mt-2 max-h-[min(320px,45vh)] rounded-2xl bg-black/35"
                : "absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl bg-[#0a0a0a]",
          )}
        >
          {exchange ? (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <video
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-[12px] motion-reduce:hidden"
                src={SEARCH_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-[#0a0a0a]/88 to-[#0a0a0a]" />
            </div>
          ) : null}
          <div className="relative z-10">
            {error ? (
              <p className="px-4 py-3 text-sm text-rose-300">{error}</p>
            ) : items.length === 0 && !loading ? (
              <p className="px-4 py-3 text-sm text-zinc-500">{t("catalog.search.noResults")}</p>
            ) : (
              <ul className="max-h-72 overflow-y-auto py-1">
                {items.map((item, index) => (
                  <li key={`${item.type}-${item.value}-${index}`}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition hover:bg-white/[0.05]"
                      onClick={() => {
                        onSelectSuggestion(item);
                        setOpen(false);
                      }}
                    >
                      <span className="text-[13px] font-medium text-zinc-100">{item.label}</span>
                      {item.subtitle ? (
                        <span className="text-[11px] text-zinc-500">
                          {item.type === "release"
                            ? item.subtitle
                            : `${item.type}: ${item.subtitle}`}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
