"use client";

import { LayoutGrid } from "lucide-react";

import type { CatalogGridView } from "@/types/catalog/page";

import { CatalogViewIconButton } from "../ui/catalog-view-icon-button";

export function CatalogMainSubheader({
  view,
  onViewChange,
  resultCount,
}: {
  view: CatalogGridView;
  onViewChange: (v: CatalogGridView) => void;
  resultCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 font-mono text-[13px] tabular-nums tracking-tight sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Результат</p>
        <h2 className="mt-1 font-sans text-lg font-semibold tracking-tight text-white sm:text-xl">
          Релизы
          <span className="ml-2 font-mono text-sm font-medium text-zinc-500">· {resultCount}</span>
        </h2>
      </div>
      <div
        className="flex w-fit max-w-full shrink-0 items-center gap-0.5 rounded-xl bg-[#111111] p-1 ring-1 ring-white/10 sm:ml-auto"
        role="toolbar"
        aria-label="Вид каталога"
      >
        <CatalogViewIconButton
          icon={LayoutGrid}
          label="Крупная сетка"
          active={view === "grid"}
          onClick={() => onViewChange("grid")}
        />
      </div>
    </div>
  );
}
