import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const nav = {
  pathname: "/dashboard/profile",
  search: new URLSearchParams("tab=account"),
};

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.search,
}));

describe("RouteScrollPolicy", () => {
  beforeEach(() => {
    nav.pathname = "/dashboard/profile";
    nav.search = new URLSearchParams("tab=account");
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("scrolls to top when opening the account tab", async () => {
    const { RouteScrollPolicy } = await import("@/components/layout/route-scroll-policy");
    render(<RouteScrollPolicy />);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
