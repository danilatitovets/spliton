"use client";

import { useMemo, useState } from "react";

import { catalogItems } from "@/lib/catalog-mock";
import { catalogMatchesFilters, sortCatalogItems } from "@/lib/catalog/catalog-filter";
import type {
  CatalogFundingPhase,
  CatalogGridView,
  CatalogKindFilter,
  CatalogSortKey,
} from "@/types/catalog/page";

export function useCatalogScreenState() {
  const [catalogView, setCatalogView] = useState<CatalogGridView>("grid");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<CatalogKindFilter>("all");
  const [phase, setPhase] = useState<CatalogFundingPhase>("all");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<CatalogSortKey>("catalog_order");

  const catalogOrder = useMemo(() => new Map(catalogItems.map((it, i) => [it.id, i])), []);

  const genres = useMemo(() => {
    const g = new Set<string>();
    for (const it of catalogItems) g.add(it.genre);
    return Array.from(g).sort((a, b) => a.localeCompare(b, "ru"));
  }, []);

  const filtered = useMemo(() => {
    const base = catalogItems.filter((item) =>
      catalogMatchesFilters(item, { kind, phase, genre, query }),
    );
    return sortCatalogItems(base, sort, catalogOrder);
  }, [query, kind, phase, genre, sort, catalogOrder]);

  const resetFilters = () => {
    setQuery("");
    setKind("all");
    setPhase("all");
    setGenre("");
    setSort("catalog_order");
  };

  return {
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
    totalCount: catalogItems.length,
    resetFilters,
  };
}
