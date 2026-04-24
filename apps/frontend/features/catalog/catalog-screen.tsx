"use client";

import { useCatalogScreenState } from "./hooks/use-catalog-screen-state";
import { CatalogFiltersAside } from "./sections/catalog-filters-aside";
import { CatalogMainArea } from "./sections/catalog-main-area";

export function CatalogScreen() {
  const {
    catalogView,
    setCatalogView,
    query,
    setQuery,
    kind,
    setKind,
    phase,
    setPhase,
    genre,
    setGenre,
    genres,
    sort,
    setSort,
    filtered,
    totalCount,
    resetFilters,
  } = useCatalogScreenState();

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-black lg:flex-row lg:items-stretch">
      <CatalogFiltersAside
        query={query}
        onQuery={setQuery}
        kind={kind}
        onKind={setKind}
        phase={phase}
        onPhase={setPhase}
        genre={genre}
        onGenre={setGenre}
        genres={genres}
        sort={sort}
        onSort={setSort}
        filteredCount={filtered.length}
        totalCount={totalCount}
        onReset={resetFilters}
      />
      <CatalogMainArea catalogView={catalogView} onCatalogView={setCatalogView} filtered={filtered} />
    </div>
  );
}
