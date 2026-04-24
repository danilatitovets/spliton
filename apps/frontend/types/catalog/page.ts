/** Вид сетки: крупные карточки или список. */
export type CatalogGridView = "grid" | "list";

/** Первичный раунд / вторичка / всё. */
export type CatalogKindFilter = "all" | "funding" | "market";

/** Фаза раунда (только для funding; при «Вторичка» не используется). */
export type CatalogFundingPhase = "all" | "open" | "payouts";

export type CatalogSortKey = "catalog_order" | "title_asc" | "progress_desc" | "yield_desc";
