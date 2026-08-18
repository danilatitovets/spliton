import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LegalDocumentInPageNav } from "@/components/legal/legal-document-in-page-nav";

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: "ru" }),
}));

describe("LegalDocumentInPageNav", () => {
  it("keeps full section titles in a sticky sidebar instead of truncating them", () => {
    render(
      <LegalDocumentInPageNav
        variant="desktop"
        headings={[
          { id: "role", title: "1. Роль платформы", level: 2 },
          { id: "account", title: "2. Аккаунт и безопасность", level: 2 },
          { id: "finance", title: "3. Финансовые операции", level: 2 },
          { id: "limits", title: "4. Ограничения", level: 2 },
          { id: "contacts", title: "5. Контакты", level: 2 },
          { id: "nested", title: "Подробности", level: 3 },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "profile.legal.tocLabel" })).toHaveClass("sticky");
    expect(screen.getByText("1. Роль платформы")).toBeInTheDocument();
    expect(screen.getByText("2. Аккаунт и безопасность")).toBeInTheDocument();
    expect(screen.getByText("5. Контакты")).toBeInTheDocument();
    expect(screen.queryByText("Подробности")).not.toBeInTheDocument();
  });
});
