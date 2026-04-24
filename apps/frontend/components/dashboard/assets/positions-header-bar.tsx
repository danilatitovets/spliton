"use client";

import { ChevronDown, ListFilter, Search } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

function FancyDropdown({
  value,
  options,
  onSelect,
  icon,
}: {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => options, [options]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-neutral-200 bg-neutral-50/90 px-3.5 text-xs font-semibold text-neutral-800 ring-1 ring-neutral-100 transition",
          open ? "border-neutral-300 bg-white" : "hover:bg-neutral-100",
        )}
      >
        {icon}
        {value}
        <ChevronDown className={cn("size-3.5 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]">
          <ul className="max-h-64 overflow-auto py-1">
            {items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-xs transition",
                    item === value ? "bg-neutral-100 font-semibold text-neutral-900" : "text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PositionsHeaderBar({
  query,
  onQuery,
  status,
  onStatus,
  sort,
  onSort,
  statusOptions,
  sortOptions,
}: {
  query: string;
  onQuery: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  statusOptions: string[];
  sortOptions: string[];
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white px-4 py-4 shadow-sm ring-1 ring-neutral-100/80 sm:px-6 sm:py-4">
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Фильтры</p>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <FancyDropdown
              value={status}
              options={statusOptions}
              onSelect={onStatus}
              icon={<ListFilter className="size-3.5 text-neutral-500" />}
            />
            <FancyDropdown value={sort} options={sortOptions} onSelect={onSort} />
            <label className="relative min-w-[200px] flex-1 sm:min-w-0 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Поиск: релиз / артист / жанр"
                className="h-10 w-full min-w-[220px] rounded-xl border border-neutral-200 bg-neutral-50/90 pl-9 pr-3 text-xs text-neutral-800 outline-none ring-1 ring-neutral-100 transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-[280px]"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
