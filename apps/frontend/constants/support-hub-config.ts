import type { LucideIcon } from "@/lib/lucide";
import {
  Activity,
  ArrowDownUp,
  MessageSquarePlus,
  PieChart,
  Shield,
  Store,
} from "@/lib/lucide";

import { ROUTES } from "@/constants/routes";
import { SUPPORT_PRODUCT_DOC_ICON_SRC, SUPPORT_QUICK_ACTION_ICON_SRC } from "@/constants/support-icons";

export type SupportQuickActionId =
  | "openTicket"
  | "systemStatus"
  | "depositsWithdrawals"
  | "buyUnits"
  | "secondaryMarket"
  | "accountSecurity";

export type SupportQuickAction = {
  id: SupportQuickActionId;
  titleKey: string;
  descriptionKey: string;
  href: string;
  /** @deprecated Prefer iconSrc orbital assets */
  icon: LucideIcon;
  iconSrc: string;
};

/** Typed navigation shortcuts — no fabricated balances or rates. */
export const SUPPORT_QUICK_ACTIONS: SupportQuickAction[] = [
  {
    id: "openTicket",
    titleKey: "support.quick.openTicket.title",
    descriptionKey: "support.quick.openTicket.description",
    href: ROUTES.dashboardSupport,
    icon: MessageSquarePlus,
    iconSrc: SUPPORT_QUICK_ACTION_ICON_SRC.openTicket,
  },
  {
    id: "systemStatus",
    titleKey: "support.quick.systemStatus.title",
    descriptionKey: "support.quick.systemStatus.description",
    href: ROUTES.systemStatus,
    icon: Activity,
    iconSrc: SUPPORT_QUICK_ACTION_ICON_SRC.systemStatus,
  },
  {
    id: "depositsWithdrawals",
    titleKey: "support.quick.deposits.title",
    descriptionKey: "support.quick.deposits.description",
    href: ROUTES.dashboardPayouts,
    icon: ArrowDownUp,
    iconSrc: SUPPORT_QUICK_ACTION_ICON_SRC.depositsWithdrawals,
  },
  {
    id: "buyUnits",
    titleKey: "support.quick.buyUnits.title",
    descriptionKey: "support.quick.buyUnits.description",
    href: ROUTES.dashboardCatalog,
    icon: PieChart,
    iconSrc: SUPPORT_QUICK_ACTION_ICON_SRC.buyUnits,
  },
  {
    id: "secondaryMarket",
    titleKey: "support.quick.secondary.title",
    descriptionKey: "support.quick.secondary.description",
    href: ROUTES.dashboardSecondaryMarket,
    icon: Store,
    iconSrc: SUPPORT_QUICK_ACTION_ICON_SRC.secondaryMarket,
  },
  {
    id: "accountSecurity",
    titleKey: "support.quick.security.title",
    descriptionKey: "support.quick.security.description",
    href: `${ROUTES.dashboardProfile}?tab=security`,
    icon: Shield,
    iconSrc: SUPPORT_QUICK_ACTION_ICON_SRC.accountSecurity,
  },
];

export type SupportProductDocLink = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  iconSrc?: string;
};

/** Static product & legal links — complements CMS docs category. */
export const SUPPORT_PRODUCT_DOC_LINKS: SupportProductDocLink[] = [
  {
    id: "terms",
    titleKey: "support.docs.terms.title",
    descriptionKey: "support.docs.terms.description",
    href: ROUTES.terms,
    iconSrc: SUPPORT_PRODUCT_DOC_ICON_SRC.terms,
  },
  {
    id: "privacy",
    titleKey: "support.docs.privacy.title",
    descriptionKey: "support.docs.privacy.description",
    href: ROUTES.privacy,
    iconSrc: SUPPORT_PRODUCT_DOC_ICON_SRC.privacy,
  },
  {
    id: "trust",
    titleKey: "support.docs.trust.title",
    descriptionKey: "support.docs.trust.description",
    href: ROUTES.trust,
    iconSrc: SUPPORT_PRODUCT_DOC_ICON_SRC.trust,
  },
  {
    id: "guide-selection",
    titleKey: "support.docs.guideSelection.title",
    descriptionKey: "support.docs.guideSelection.description",
    href: ROUTES.guideSelection,
    iconSrc: SUPPORT_PRODUCT_DOC_ICON_SRC["guide-selection"],
  },
  {
    id: "guide-deal",
    titleKey: "support.docs.guideDeal.title",
    descriptionKey: "support.docs.guideDeal.description",
    href: ROUTES.guideDealStructure,
    iconSrc: SUPPORT_PRODUCT_DOC_ICON_SRC["guide-deal"],
  },
];
