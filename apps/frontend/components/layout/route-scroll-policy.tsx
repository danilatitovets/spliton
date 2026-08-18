"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useLayoutEffect } from "react";

function scrollWindowToTop() {
  if (typeof window === "undefined") return;
  if (window.location.hash) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

/**
 * Main-route navigations open at the top. Profile tabs are query-only, so they
 * must reset scroll too — otherwise a previous long page (or the footer) stays
 * in view when opening /dashboard/profile?tab=account.
 */
function RouteScrollPolicyInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profileTab = pathname.startsWith("/dashboard/profile")
    ? (searchParams.get("tab") ?? "overview")
    : null;

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    scrollWindowToTop();
  }, [pathname, profileTab]);

  return null;
}

export function RouteScrollPolicy() {
  return (
    <Suspense fallback={null}>
      <RouteScrollPolicyInner />
    </Suspense>
  );
}
