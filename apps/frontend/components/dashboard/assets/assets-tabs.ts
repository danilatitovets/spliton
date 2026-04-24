import { ROUTES } from "@/constants/routes";

export type AssetTabItem = {
  label: string;
  href: string;
};

export const assetsTabs: AssetTabItem[] = [
  { label: "Сводка", href: ROUTES.dashboardOverview },
  { label: "Метрики", href: ROUTES.dashboardMetrics },
  { label: "Позиции", href: ROUTES.dashboardPositions },
  { label: "Активность", href: ROUTES.dashboardActivity },
];
