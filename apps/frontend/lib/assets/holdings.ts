import {
  positionPreviews,
  type PositionPreviewItem,
} from "@/components/dashboard/assets/assets-mock-data";

export type LinkedHoldingPreview = PositionPreviewItem & {
  catalogReleaseId: string;
  heldUnits: number;
};

function isLinkedHolding(p: PositionPreviewItem): p is LinkedHoldingPreview {
  return typeof p.catalogReleaseId === "string" && typeof p.heldUnits === "number";
}

/** Позиция в кабинете, привязанная к каталожному id релиза (для `/assets/sell/[id]`). */
export function getHoldingPreviewForCatalogReleaseId(
  catalogReleaseId: string,
): LinkedHoldingPreview | undefined {
  const h = positionPreviews.find((p) => p.catalogReleaseId === catalogReleaseId);
  return h && isLinkedHolding(h) ? h : undefined;
}
