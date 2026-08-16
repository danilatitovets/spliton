import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

const mockTitles = catalogLandingDemoItems.map((item) => item.title);

describe("DashboardCatalogSection", () => {
  it("always shows polished landing demo releases linking to catalog", () => {
    renderWithI18n(<DashboardCatalogSection />);

    const cards = screen.getAllByTestId("catalog-card");
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.textContent)).toEqual(mockTitles);

    expect(screen.queryByText(/E2E Release/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Пример карточек/i)).not.toBeInTheDocument();

    const cardLink = screen.getByRole("link", { name: new RegExp(mockTitles[0]!, "i") });
    expect(cardLink).toBeTruthy();
    // Landing cards link into catalog/buy/detail — not a single wrapper to /catalog.
    expect(cardLink.getAttribute("href")).toMatch(/^\/(catalog|analytics|dashboard)/);
  });
});
