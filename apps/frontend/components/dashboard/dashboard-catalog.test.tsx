import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { BackendAvailabilityProvider } from "@/components/providers/backend-availability-provider";
import { catalogLandingDemoItems } from "@/lib/catalog-mock";

import { DashboardCatalogSection } from "./dashboard-catalog";

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="ru">
      <BackendAvailabilityProvider>{ui}</BackendAvailabilityProvider>
    </I18nProvider>,
  );
}

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

vi.mock("@/components/dashboard/catalog-track-card", () => ({
  CatalogTrackCard: ({ item }: { item: { title: string } }) => (
    <div data-testid="catalog-card">{item.title}</div>
  ),
}));

const catalogMocks = vi.hoisted(() => ({
  isLiveCatalogEnabled: vi.fn(() => true),
  loadLiveCatalogItems: vi.fn(),
}));

vi.mock("@/services/catalog.service", () => ({
  isLiveCatalogEnabled: catalogMocks.isLiveCatalogEnabled,
  loadLiveCatalogItems: catalogMocks.loadLiveCatalogItems,
}));

const liveItem = {
  kind: "funding" as const,
  id: "live-uuid-1",
  title: "Live API Release Alpha",
  artist: "API Artist",
  genre: "Pop",
  status: "open" as const,
  raised: "10 000",
  goal: "50 000",
  pct: 20,
  availablePct: "5%",
  forecastYield: "9%",
  unitPriceUsdt: "12,00",
};

describe("DashboardCatalogSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    catalogMocks.isLiveCatalogEnabled.mockReturnValue(true);
  });

  it("renders live catalog cards and never demo titles", async () => {
    catalogMocks.loadLiveCatalogItems.mockResolvedValue({ items: [liveItem], pagination: null });
    renderWithI18n(<DashboardCatalogSection />);

    await waitFor(() => {
      expect(screen.getByTestId("catalog-card")).toHaveTextContent("Live API Release Alpha");
    });

    for (const title of catalogLandingDemoItems.map((item) => item.title)) {
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    }
    expect(screen.queryByText(/Пример карточек/i)).not.toBeInTheDocument();
  });

  it("shows empty state when live catalog returns no items", async () => {
    catalogMocks.loadLiveCatalogItems.mockResolvedValue({ items: [], pagination: null });
    renderWithI18n(<DashboardCatalogSection />);

    await waitFor(() => {
      expect(screen.getByText("Пока нет доступных релизов в каталоге.")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("catalog-card")).not.toBeInTheDocument();
  });

  it("shows labelled demo cards only when catalog source is explicitly mock", async () => {
    catalogMocks.isLiveCatalogEnabled.mockReturnValue(false);
    renderWithI18n(<DashboardCatalogSection />);

    const cards = await screen.findAllByTestId("catalog-card");
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.textContent)).toEqual(catalogLandingDemoItems.map((item) => item.title));
    expect(screen.getByText(/Пример карточек/i)).toBeInTheDocument();
  });
});
