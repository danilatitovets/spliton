"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import type { CatalogSearchSuggestionItem } from "@/types/catalog/page";

import { CatalogSearchInput } from "./catalog-search-input";

/** Fallback search sheet (video header, borderless) — primary UX is OKX-style inline in toolbar. */
export function CatalogSearchModal({
  open,
  onOpenChange,
  query,
  onQuery,
  onSelectSuggestion,
  liveMode = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQuery: (value: string) => void;
  onSelectSuggestion: (item: CatalogSearchSuggestionItem) => void;
  liveMode?: boolean;
}) {
  const { t } = useI18n();

  return (
    <SecondaryMarketResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      headerVideo
      title={t("catalog.search.modalTitle")}
      description={t("catalog.search.modalHint")}
    >
      <CatalogSearchInput
        value={query}
        onChange={onQuery}
        onSelectSuggestion={(item) => {
          onSelectSuggestion(item);
          onOpenChange(false);
        }}
        liveMode={liveMode}
        embedded
        autoFocus={open}
      />
    </SecondaryMarketResponsiveSheet>
  );
}
