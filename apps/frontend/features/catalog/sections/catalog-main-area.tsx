"use client";

import type { CatalogItem } from "@/lib/catalog-mock";
import { catalogGridClass } from "@/lib/catalog/catalog-filter";
import { cn } from "@/lib/utils";
import type { CatalogGridView } from "@/types/catalog/page";

import { CatalogTrackCard } from "@/components/dashboard/catalog-track-card";

import { CatalogMainSubheader } from "./catalog-main-subheader";
import { CatalogPageHero } from "./catalog-page-hero";

export function CatalogMainArea({
  catalogView,
  onCatalogView,
  filtered,
  totalCount,
}: {
  catalogView: CatalogGridView;
  onCatalogView: (v: CatalogGridView) => void;
  filtered: CatalogItem[];
  totalCount: number;
}) {
  const isList = catalogView === "list";
  const cardSize = isList ? "default" : "large";

  return (
    <main
      className={cn(
        "h-full min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain border-t border-white/8 bg-black",
        "touch-pan-y lg:border-t-0",
      )}
      aria-label="Каталог релизов"
    >
      <CatalogPageHero />
      <div className="sticky top-0 z-20 border-b border-white/8 bg-black/90 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-black/80 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <CatalogMainSubheader
            view={catalogView}
            onViewChange={onCatalogView}
            resultCount={filtered.length}
            totalCount={totalCount}
          />
        </div>
      </div>
      <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-6 sm:px-5 lg:px-8 lg:pb-16 lg:pt-8">
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#111111] py-16 text-center text-sm text-zinc-500 ring-1 ring-white/[0.06]">
            Нет совпадений — ослабьте фильтры слева или сбросьте их.
          </p>
        ) : (
          <div className={catalogGridClass(catalogView)}>
            {filtered.map((item) => (
              <CatalogTrackCard
                key={item.id}
                item={item}
                variant={isList ? "row" : "card"}
                size={cardSize}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
