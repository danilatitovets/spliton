import { ROUTES } from "@/constants/routes";

export const GUIDE_CATALOG_HREF = ROUTES.dashboardCatalog;

/** Sticky TOC / in-page anchors for the OKX-style article. */
export const GUIDE_IN_PAGE_NAV = [
  { id: "checklist", labelKey: "guide.nav.checklist" },
  { id: "look", labelKey: "guide.nav.look" },
  { id: "video", labelKey: "guide.nav.video" },
  { id: "buy", labelKey: "guide.nav.buy" },
  { id: "factors", labelKey: "guide.nav.factors" },
  { id: "payouts", labelKey: "guide.nav.payouts" },
  { id: "risks", labelKey: "guide.nav.risks" },
  { id: "faq", labelKey: "guide.nav.faq" },
] as const;

export const GUIDE_ARTICLE_ICONS = {
  checklist: "/images/guide/selection/cut-rings.png",
  look: "/images/guide/selection/cut-globe.png",
  video: "/images/guide/selection/cut-video.png",
  buy: "/images/guide/selection/cut-buy.png",
  payout: "/images/guide/selection/cut-chart.png",
  risk: "/images/guide/selection/cut-risk.png",
} as const;

/** Kept for catalog megamenu / legacy imports. */
export type GuideTopicIconId = "checklist" | "release" | "factors" | "deal" | "payouts" | "risks";

export const GUIDE_TOPIC_CARDS = [
  { anchor: "checklist", icon: "checklist" as const, titleKey: "guide.topic.checklist.title", descKey: "guide.topic.checklist.desc" },
  {
    anchor: "look",
    href: GUIDE_CATALOG_HREF,
    icon: "release" as const,
    titleKey: "guide.topic.releaseCard.title",
    descKey: "guide.topic.releaseCard.desc",
  },
  { anchor: "factors", icon: "factors" as const, titleKey: "guide.topic.factors.title", descKey: "guide.topic.factors.desc" },
  { anchor: "buy", icon: "deal" as const, titleKey: "guide.topic.deal.title", descKey: "guide.topic.deal.desc" },
  { anchor: "payouts", icon: "payouts" as const, titleKey: "guide.topic.payouts.title", descKey: "guide.topic.payouts.desc" },
  { anchor: "risks", icon: "risks" as const, titleKey: "guide.topic.risks.title", descKey: "guide.topic.risks.desc" },
] as const;

export const GUIDE_FACTOR_IDS = ["yield", "deal", "history", "demand", "secondary"] as const;
export type GuideFactorId = (typeof GUIDE_FACTOR_IDS)[number];

export const GUIDE_RISK_ITEM_IDS = ["1", "2", "3", "4", "5"] as const;
export const GUIDE_CHECKLIST_STEP_IDS = ["1", "2", "3", "4", "5"] as const;
export const GUIDE_RELEASE_CARD_STEP_IDS = ["status", "yield", "progress", "price", "liquidity"] as const;
export type GuideReleaseCardStepId = (typeof GUIDE_RELEASE_CARD_STEP_IDS)[number];

export const GUIDE_COMPARISON_RELEASE_IDS = ["a", "b"] as const;
export type GuideComparisonReleaseId = (typeof GUIDE_COMPARISON_RELEASE_IDS)[number];

export const GUIDE_COMPARISON_RELEASES = [
  { id: "a" as const, cover: "/images/hero-journey/1.webp" },
  { id: "b" as const, cover: "/images/hero-journey/2.webp" },
] as const;

export const GUIDE_COMPARISON_ROW_IDS = ["yield", "frequency", "holderShare", "demand", "liquidity"] as const;

export const GUIDE_COMPARISON_ROWS = [
  { id: "yield" as const, highlight: -1 },
  { id: "frequency" as const, highlight: -1 },
  { id: "holderShare" as const, highlight: 0 },
  { id: "demand" as const, highlight: -1 },
  { id: "liquidity" as const, highlight: 0 },
] as const;

export const GUIDE_PAYOUT_SERIES = [
  { monthKey: "guide.payouts.month.jan", amountKey: "guide.payouts.amount.jan", amountUsdt: 84.2, status: "released" as const },
  { monthKey: "guide.payouts.month.feb", amountKey: "guide.payouts.amount.feb", amountUsdt: 79.4, status: "released" as const },
  { monthKey: "guide.payouts.month.mar", amountKey: "guide.payouts.amount.mar", amountUsdt: 92.1, status: "released" as const },
  { monthKey: "guide.payouts.month.apr", amountKey: "guide.payouts.amount.apr", amountUsdt: 88.3, status: "accrued" as const },
] as const;
