"use client";

import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { cn } from "@/lib/utils";

import "./megamenu-item-icons.css";

type Motion = "spin" | "bars" | "needle" | "slide" | "pulse" | "bounce" | "wiggle" | "tilt" | "spread" | "nudge" | "ring";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

const ICONS: Record<string, { motion: Motion; node: ReactNode }> = {
  [ROUTES.dashboardCatalog]: {
    motion: "spin",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <circle className="m-spin" cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.analyticsReleases]: {
    motion: "bars",
    node: (
      <Svg>
        <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path className="m-bar" d="M6 18V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path className="m-bar" d="M12 18V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path className="m-bar" d="M18 18V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.guideSelection]: {
    motion: "needle",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-needle" d="M12 12 L16 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.catalogReleaseParameters]: {
    motion: "slide",
    node: (
      <Svg>
        <path d="M5 8h14M5 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle className="m-slide" cx="9" cy="8" r="2" fill="currentColor" />
        <circle className="m-slide" cx="15" cy="16" r="2" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.catalogMarketOverview]: {
    motion: "pulse",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle className="m-pulse" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" />
      </Svg>
    ),
  },
  [ROUTES.dashboardSecondaryMarket]: {
    motion: "wiggle",
    node: (
      <Svg>
        <path className="m-wiggle" d="M7 8h10M7 16h10M9 8v8M15 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.myAssetsOverview]: {
    motion: "bounce",
    node: (
      <Svg>
        <path d="M4.5 19h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path className="m-bounce" d="M5 9.5 12 5l7 4.5V19H5V9.5Z" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [ROUTES.myAssetsMetrics]: {
    motion: "slide",
    node: (
      <Svg>
        <path className="m-slide" d="M5 16 10 11l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  [ROUTES.myAssetsOperations]: {
    motion: "pulse",
    node: (
      <Svg>
        <circle cx="6" cy="12" r="1.6" fill="currentColor" />
        <circle className="m-pulse" cx="12" cy="12" r="1.6" fill="currentColor" />
        <circle cx="18" cy="12" r="1.6" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.myAssetsPositionsStructure]: {
    motion: "spin",
    node: (
      <Svg>
        <path className="m-spin" d="M12 4a8 8 0 1 1-7.5 5.2L12 12Z" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [ROUTES.dashboardPayouts]: {
    motion: "bars",
    node: (
      <Svg>
        <path d="M4.5 19h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <rect className="m-bar" x="5" y="10" width="3.2" height="8" rx="1" fill="currentColor" />
        <rect className="m-bar" x="10.4" y="6" width="3.2" height="12" rx="1" fill="currentColor" />
        <rect className="m-bar" x="15.8" y="12" width="3.2" height="6" rx="1" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.dashboardPayoutsComparison]: {
    motion: "wiggle",
    node: (
      <Svg>
        <path className="m-wiggle" d="M8 7v10M16 7v10M5 10h6M13 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.dashboardPayoutsHistory]: {
    motion: "spin",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-spin" d="M12 8v4.5L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </Svg>
    ),
  },
  [`${ROUTES.dashboardPayouts}/deposit`]: {
    motion: "bounce",
    node: (
      <Svg>
        <rect x="6" y="14" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path className="m-bounce" d="M12 5v9M8.5 11.5 12 15l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  [`${ROUTES.dashboardPayouts}/withdraw`]: {
    motion: "bounce",
    node: (
      <Svg>
        <rect x="6" y="14" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path className="m-bounce" d="M12 16V6M8.5 9.5 12 6l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  [ROUTES.calculator]: {
    motion: "tilt",
    node: (
      <Svg>
        <rect className="m-tilt" x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 8h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.fees]: {
    motion: "wiggle",
    node: (
      <Svg>
        <path className="m-wiggle" d="M18 7A7 7 0 1 0 18 17M16 9l4-2-1 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  [ROUTES.systemStatus]: {
    motion: "pulse",
    node: (
      <Svg>
        <path d="M5 13h3l2-6 4 10 2-4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="m-pulse" cx="19" cy="7" r="2" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.news]: {
    motion: "tilt",
    node: (
      <Svg>
        <path className="m-tilt" d="M5 6h11v13H7a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10h5M8 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.referralProgram]: {
    motion: "bounce",
    node: (
      <Svg>
        <circle className="m-bounce" cx="9" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.5" />
        <circle className="m-bounce" cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.5 18c.5-2.4 2.4-3.8 4.5-3.8s4 1.4 4.5 3.8" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [ROUTES.partnerProgram]: {
    motion: "wiggle",
    node: (
      <Svg>
        <path className="m-wiggle" d="M8 13c-2 0-3.5 1.2-3.5 3v1h7v-1c0-1.8-1.5-3-3.5-3Zm8 0c-2 0-3.5 1.2-3.5 3v1h7v-1c0-1.8-1.5-3-3.5-3Z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="16" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      </Svg>
    ),
  },
  [ROUTES.dashboardArtist]: {
    motion: "bounce",
    node: (
      <Svg>
        <path className="m-bounce" d="M12 15.5a3 3 0 0 1-3-3V7a3 3 0 0 1 6 0v5.5a3 3 0 0 1-3 3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 12.5a5 5 0 0 0 10 0M12 18.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.dashboardDisputes]: {
    motion: "tilt",
    node: (
      <Svg>
        <path d="M12 4 5 20h14L12 4Z" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-tilt" d="M12 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.8" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.dashboardStatements]: {
    motion: "slide",
    node: (
      <Svg>
        <path className="m-slide" d="M7 4h8l4 4v12H7V4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15 4v4h4M9 13h6M9 16h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.trust]: {
    motion: "pulse",
    node: (
      <Svg>
        <path d="M12 4 6 7v5c0 4 2.6 6.6 6 8 3.4-1.4 6-4 6-8V7l-6-3Z" stroke="currentColor" strokeWidth="1.5" />
        <circle className="m-pulse" cx="12" cy="12" r="2" fill="currentColor" />
      </Svg>
    ),
  },
  [profileDashboardHref("overview")]: {
    motion: "bounce",
    node: (
      <Svg>
        <circle className="m-bounce" cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 19c1-3.2 3.4-5 7-5s6 1.8 7 5" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [profileDashboardHref("verification")]: {
    motion: "pulse",
    node: (
      <Svg>
        <path d="M12 4 6 7v5c0 4 2.6 6.6 6 8 3.4-1.4 6-4 6-8V7l-6-3Z" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-pulse" d="M9.5 12.2 11.2 14l3.4-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </Svg>
    ),
  },
  [profileDashboardHref("security")]: {
    motion: "wiggle",
    node: (
      <Svg>
        <rect className="m-wiggle" x="7" y="11" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 11V8.5a3 3 0 0 1 6 0V11" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [profileDashboardHref("settings")]: {
    motion: "spin",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-spin" d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.3 6.3l1.6 1.6M16.1 16.1l1.6 1.6M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  [ROUTES.login]: {
    motion: "slide",
    node: (
      <Svg>
        <path className="m-slide" d="M10 7 5 12l5 5M5 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 5h3v14h-3" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [ROUTES.support]: {
    motion: "wiggle",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-wiggle" d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.7.3-1.3.9-1.3 1.7V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.8" fill="currentColor" />
      </Svg>
    ),
  },
  [ROUTES.dashboardSupport]: {
    motion: "tilt",
    node: (
      <Svg>
        <path className="m-tilt" d="M5 7h14v10H8l-3 3V7Z" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
  [`${ROUTES.dashboardProfile}?tab=security`]: {
    motion: "wiggle",
    node: (
      <Svg>
        <path className="m-wiggle" d="M12 4 6 7v5c0 4 2.6 6.6 6 8 3.4-1.4 6-4 6-8V7l-6-3Z" stroke="currentColor" strokeWidth="1.5" />
      </Svg>
    ),
  },
};

const FALLBACK = {
  motion: "pulse" as Motion,
  node: (
    <Svg>
      <circle className="m-pulse" cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  ),
};

export function MegamenuItemIcon({ href, className }: { href: string; className?: string }) {
  const item = ICONS[href] ?? FALLBACK;
  return (
    <span className={cn("megamenu-ico", className)} data-motion={item.motion}>
      {item.node}
    </span>
  );
}

export type HeaderChromeKind = "help" | "user" | "menu" | "close" | "chevron" | "bell";

const HEADER_ICONS: Record<HeaderChromeKind, { motion: Motion; node: ReactNode }> = {
  help: {
    motion: "wiggle",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path className="m-wiggle" d="M9.6 9.4a2.4 2.4 0 1 1 3.2 2.3c-.7.3-1.3.9-1.3 1.7V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" />
      </Svg>
    ),
  },
  user: {
    motion: "bounce",
    node: (
      <Svg>
        <circle className="m-bounce" cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 19c.9-3.1 3.2-4.8 6.5-4.8s5.6 1.7 6.5 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  menu: {
    motion: "spread",
    node: (
      <Svg>
        <path className="m-spread-a" d="M5 7h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path className="m-spread-b" d="M5 17h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </Svg>
    ),
  },
  close: {
    motion: "tilt",
    node: (
      <Svg>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path className="m-tilt" d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </Svg>
    ),
  },
  chevron: {
    motion: "nudge",
    node: (
      <Svg>
        <path className="m-nudge" d="M5.5 6.5 12 12.5l6.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  bell: {
    motion: "ring",
    node: (
      <Svg>
        <path className="m-ring" d="M6.5 16h11l-1.2-1.4V11a5.3 5.3 0 0 0-10.6 0v3.6L6.5 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
};

export function HeaderChromeIcon({ kind, className }: { kind: HeaderChromeKind; className?: string }) {
  const item = HEADER_ICONS[kind];
  return (
    <span className={cn("megamenu-ico header-ico", className)} data-motion={item.motion}>
      {item.node}
    </span>
  );
}
