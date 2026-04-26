"use client";

import type { CatalogGridView } from "@/types/catalog/page";

export function CatalogMainSubheader({
  view: _view,
  onViewChange: _onViewChange,
  resultCount,
  totalCount,
}: {
  view: CatalogGridView;
  onViewChange: (v: CatalogGridView) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 font-mono text-[13px] tabular-nums tracking-tight sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-white sm:text-xl">Релиз</h2>
      </div>
      <div className="sm:ml-auto">
        <div className="inline-flex h-9 items-center rounded-full bg-white px-4 font-sans text-sm font-semibold text-black">
          Позиций: <span className="ml-1 tabular-nums">{resultCount} / {totalCount}</span>
        </div>
      </div>
    </div>
  );
}
