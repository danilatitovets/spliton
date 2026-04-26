"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { positionPreviews } from "@/components/dashboard/assets/assets-mock-data";
import { PositionsPortfolioValueChart, PositionsUnitsTrajectoryChart } from "@/components/dashboard/assets/positions-charts";
import { PositionsHeaderBar } from "@/components/dashboard/assets/positions-header-bar";
import { PositionsSummaryCards } from "@/components/dashboard/assets/positions-summary-cards";
import { PositionsTableCard } from "@/components/dashboard/assets/positions-table-card";
import { TopPositionCardsGrid } from "@/components/dashboard/assets/top-position-cards-grid";
import { ROUTES } from "@/constants/routes";

const statuses = ["Все статусы", "Active", "Open round", "Secondary", "Closed"] as const;
const sorts = [
  "Сортировка: по стоимости",
  "Сортировка: по количеству UNT",
  "Сортировка: по дате входа",
  "Сортировка: по доле в портфеле",
] as const;

function toNumber(raw: string) {
  return Number(raw.replace(/[^\d.-]/g, ""));
}

export function PositionsPageContent() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>(statuses[0]);
  const [sort, setSort] = useState<(typeof sorts)[number]>(sorts[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedStatus = status;
    const rows = positionPreviews.filter((row) => {
      if (selectedStatus !== "Все статусы" && row.status !== selectedStatus) return false;
      if (!q) return true;
      return row.release.toLowerCase().includes(q) || row.artist.toLowerCase().includes(q) || row.genre.toLowerCase().includes(q);
    });
    const sorted = [...rows];
    if (sort === "Сортировка: по стоимости") sorted.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    if (sort === "Сортировка: по количеству UNT") {
      sorted.sort((a, b) => parseFloat(b.units.replace(/\s/g, "")) - parseFloat(a.units.replace(/\s/g, "")));
    }
    if (sort === "Сортировка: по дате входа") sorted.sort((a, b) => b.dateEntered.localeCompare(a.dateEntered));
    if (sort === "Сортировка: по доле в портфеле") sorted.sort((a, b) => parseFloat(b.share) - parseFloat(a.share));
    return sorted;
  }, [query, sort, status]);

  const totalUnits = filtered.reduce((acc, row) => acc + Number(row.units.replace(/\s/g, "")), 0);
  const avgShare = filtered.length
    ? `${(filtered.reduce((acc, row) => acc + parseFloat(row.share), 0) / filtered.length).toFixed(1)}%`
    : "0%";
  const activeReleases = new Set(filtered.filter((r) => r.status === "Active").map((r) => r.release)).size;

  const portfolioUsdt = useMemo(
    () => filtered.reduce((acc, row) => acc + toNumber(row.value), 0),
    [filtered],
  );

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [filtered]);

  const resetFilters = () => {
    setQuery("");
    setStatus(statuses[0]);
    setSort(sorts[0]);
  };

  if (positionPreviews.length === 0) {
    return (
      <section className="rounded-3xl bg-white px-5 py-12 text-center sm:px-8 sm:py-14">
        <p className="text-xl font-semibold tracking-tight text-neutral-900">У вас пока нет позиций</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
          Позиции появятся после входа в релизы и покупки UNT.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ROUTES.dashboardCatalog}
            className="inline-flex h-10 items-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Открыть каталог
          </Link>
          <Link
            href={ROUTES.dashboardOverview}
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-5 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-100 transition hover:bg-neutral-100"
          >
            Перейти в сводку
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PositionsHeaderBar
        query={query}
        onQuery={setQuery}
        status={status}
        statusOptions={[...statuses]}
        onStatus={(v) => setStatus(v as (typeof statuses)[number])}
        sort={sort}
        sortOptions={[...sorts]}
        onSort={(v) => setSort(v as (typeof sorts)[number])}
      />

      <PositionsSummaryCards
        total={String(filtered.length)}
        activeReleases={String(activeReleases)}
        totalUnits={totalUnits.toLocaleString("ru-RU")}
        averageShare={avgShare}
      />

      {filtered.length === 0 ? (
        <section className="rounded-3xl bg-white px-5 py-10 text-center sm:px-8 sm:py-12">
          <p className="text-lg font-semibold tracking-tight text-neutral-900">Ничего не найдено по текущим фильтрам</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">Измените фильтры или откройте каталог релизов.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Сбросить фильтры
            </button>
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-100 transition hover:bg-neutral-50"
            >
              Открыть каталог
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <PositionsPortfolioValueChart portfolioUsdt={portfolioUsdt} />
            <PositionsUnitsTrajectoryChart totalUnits={totalUnits} />
          </section>
          <PositionsTableCard rows={filtered} />
          <TopPositionCardsGrid rows={filtered} />
        </>
      )}
    </div>
  );
}
