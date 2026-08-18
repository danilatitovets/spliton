"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardMobileMenu } from "@/components/dashboard/dashboard-mobile-menu";
import { useMobileTabBarShell } from "@/components/layout/mobile-tab-bar-shell";
import { useDashboardHeaderOverlay } from "@/components/layout/dashboard-header-overlay-context";
import { DashboardHeaderNavMenu } from "@/components/dashboard/dashboard-header-nav-menu";
import {
  DASHBOARD_PROFILE_MEGAMENU_ID,
  DASHBOARD_SUPPORT_MEGAMENU_ID,
  ProfileMegamenuFlyout,
  SupportMegamenuFlyout,
} from "@/components/dashboard/dashboard-megamenu";
import { HeaderChromeIcon } from "@/components/dashboard/megamenu-item-icons";
import {
  DashboardHeaderSearchInline,
} from "@/components/dashboard/dashboard-header-search";
import {
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-nav";
import { SplitonLogo } from "@/components/dashboard/revshare-logo";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DASHBOARD_MISC_PATHS, ROUTES } from "@/constants/routes";
import { CabinetDemoDataToggle } from "@/components/dashboard/cabinet-demo-data-toggle";
import { useHeaderWalletBalance } from "@/hooks/use-header-wallet-balance";
import { useLocalizedNavItems } from "@/hooks/use-localized-nav";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const DEPOSIT_HREF = `${ROUTES.dashboardPayouts}/deposit`;
const PAYOUTS_HISTORY_HREF = ROUTES.dashboardPayoutsHistory;

/** Desktop chrome (full nav + utilities) — tablets stay on compact/mobile header. */
const HEADER_DESKTOP_MQ = "(min-width: 1280px)";

function HeaderDivider({ className }: { className?: string }) {
  return (
    <span
      className={cn("hidden h-5 w-px shrink-0 bg-white/12 xl:block", className)}
      aria-hidden
    />
  );
}

const headerIconShellClass =
  "group flex size-9 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/8 hover:text-white";

function navItemActive(item: DashboardNavItem, pathname: string, hash: string) {
  if (item.href === ROUTES.dashboard) {
    return pathname === ROUTES.dashboard && (!hash || hash === "");
  }
  if (item.href === ROUTES.myAssetsOverview) {
    return pathname.startsWith("/assets/overview") ||
      pathname.startsWith("/assets/sell/") ||
      pathname.startsWith("/assets/metrics") ||
      pathname.startsWith("/assets/positions") ||
      pathname.startsWith("/assets/activity") ||
      pathname.startsWith("/dashboard/overview") ||
      pathname.startsWith("/dashboard/metrics") ||
      pathname.startsWith("/dashboard/positions") ||
      pathname.startsWith("/dashboard/activity");
  }
  if (item.href === ROUTES.dashboardPayouts) {
    return pathname === ROUTES.dashboardPayouts || pathname.startsWith(`${ROUTES.dashboardPayouts}/`) || pathname.startsWith("/dashboard/payouts");
  }
  if (item.href === ROUTES.dashboardCatalog || item.href.startsWith(`${ROUTES.dashboardCatalog}?`)) {
    return (
      pathname === ROUTES.dashboardCatalog ||
      pathname.startsWith(`${ROUTES.dashboardCatalog}/`) ||
      pathname === ROUTES.analyticsReleases ||
      pathname.startsWith(`${ROUTES.analyticsReleases}/`) ||
      pathname === ROUTES.guideSelection ||
      pathname.startsWith(`${ROUTES.guideSelection}/`)
    );
  }
  if (item.href === ROUTES.dashboardSecondaryMarket) {
    return (
      pathname === ROUTES.dashboardSecondaryMarket ||
      pathname.startsWith(`${ROUTES.dashboardSecondaryMarket}/`)
    );
  }
  if (item.id === "misc") {
    const p = pathname.replace(/\/$/, "") || "/";
    return DASHBOARD_MISC_PATHS.includes(p);
  }
  const frag = item.href.includes("#") ? `#${item.href.split("#")[1]}` : "";
  return pathname === ROUTES.dashboard && frag !== "" && hash === frag;
}

type DashboardHeaderProps = {
  /**
   * When false, the bar participates in normal document scroll (e.g. secondary market:
   * primary header scrolls away, tab row becomes the sticky top bar).
   * @default true
   */
  sticky?: boolean;
  /**
   * Enables scroll elevation (drop shadow + blur) after initial scroll.
   * @default true
   */
  elevatedOnScroll?: boolean;
  /** Убирает нижний border у шапки — линия задаётся снаружи (каталог и т.п.). */
  flushBottom?: boolean;
};

function HeaderHelpLink({
  className,
  label,
  active,
  expanded,
  controlsId,
  onMouseEnter,
  onFocus,
  onClick,
}: {
  className?: string;
  label: string;
  active?: boolean;
  expanded?: boolean;
  controlsId?: string;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
}) {
  return (
    <Link
      href={ROUTES.support}
      className={cn(headerIconShellClass, active && "text-white bg-white/12", className)}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-haspopup="true"
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onClick={(e) => {
        onClick?.();
        if (expanded) e.preventDefault();
      }}
    >
      <HeaderChromeIcon kind="help" />
    </Link>
  );
}

export function DashboardHeader({
  sticky = true,
  elevatedOnScroll = false,
  flushBottom = false,
}: DashboardHeaderProps = {}) {
  const { t } = useI18n();
  const wallet = useHeaderWalletBalance();
  const navItems = useLocalizedNavItems();
  const pathname = usePathname();
  const [hash, setHash] = React.useState("");
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [headerElevated, setHeaderElevated] = React.useState(false);
  const { profileOpen: mobileProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, setTabBarHidden } =
    useMobileTabBarShell();
  const { setOverlayOpen } = useDashboardHeaderOverlay();
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const closeMenuTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const t = window.requestAnimationFrame(() => setPortalReady(true));
    return () => window.cancelAnimationFrame(t);
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia(HEADER_DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const cancelCloseMenuTimer = React.useCallback(() => {
    if (closeMenuTimerRef.current != null) {
      window.clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
  }, []);

  const scheduleCloseMenu = React.useCallback(() => {
    cancelCloseMenuTimer();
    closeMenuTimerRef.current = window.setTimeout(() => {
      setProfileOpen(false);
      setSupportOpen(false);
      closeMenuTimerRef.current = null;
    }, 200);
  }, [cancelCloseMenuTimer]);

  React.useEffect(() => {
    const read = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    read();
    const onHashChange = () => {
      read();
      if (closeMenuTimerRef.current != null) {
        window.clearTimeout(closeMenuTimerRef.current);
        closeMenuTimerRef.current = null;
      }
      setExpandedKey(null);
      setProfileOpen(false);
      setSupportOpen(false);
      setMobileMenuOpen(false);
      closeProfileDrawer();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [closeProfileDrawer]);

  const onNavValueChange = React.useCallback((next: string | null) => {
    cancelCloseMenuTimer();
    setExpandedKey(next);
    if (next) {
      setProfileOpen(false);
      setSupportOpen(false);
    }
  }, [cancelCloseMenuTimer]);

  const closeSubnav = React.useCallback(() => {
    cancelCloseMenuTimer();
    setExpandedKey(null);
    setProfileOpen(false);
    setSupportOpen(false);
    setMobileMenuOpen(false);
    closeProfileDrawer();
  }, [cancelCloseMenuTimer, closeProfileDrawer]);

  const closeMobileMenu = React.useCallback(() => setMobileMenuOpen(false), []);

  const headerOverlayOpen = expandedKey != null || profileOpen || supportOpen || mobileMenuOpen;

  React.useLayoutEffect(() => {
    setOverlayOpen(headerOverlayOpen);
  }, [headerOverlayOpen, setOverlayOpen]);

  React.useEffect(() => {
    return () => setOverlayOpen(false);
  }, [setOverlayOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelCloseMenuTimer();
        setExpandedKey(null);
        setProfileOpen(false);
        setSupportOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelCloseMenuTimer]);

  React.useEffect(() => {
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = headerRef.current;
      if (!el || (!profileOpen && !supportOpen)) return;
      const target = e.target as Node;
      if (!el.contains(target)) {
        cancelCloseMenuTimer();
        setProfileOpen(false);
        setSupportOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [profileOpen, supportOpen, cancelCloseMenuTimer]);

  React.useEffect(() => {
    return () => {
      if (closeMenuTimerRef.current != null) {
        window.clearTimeout(closeMenuTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    closeProfileDrawer();
  }, [pathname, closeProfileDrawer]);

  React.useEffect(() => {
    setTabBarHidden(mobileMenuOpen);
  }, [mobileMenuOpen, setTabBarHidden]);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const onScroll = () => {
      setHeaderElevated(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileMenuLayer =
    portalReady
      ? createPortal(
          <DashboardMobileMenu
            open={mobileMenuOpen}
            navItems={navItems}
            pathname={pathname}
            hash={hash}
            onClose={closeMobileMenu}
            navItemActive={navItemActive}
            t={t}
            isAuthenticated={wallet.isAuthenticated}
            authPending={wallet.isAuthPending}
            balanceShort={wallet.balanceShort}
            balanceError={wallet.error}
            depositHref={DEPOSIT_HREF}
            loginHref={ROUTES.login}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {mobileMenuLayer}
      <header
        ref={headerRef}
        className={cn(
          flushBottom ? "border-b-0" : "border-b border-transparent",
          "!bg-black transition-colors duration-150 ease-out",
          sticky ? "sticky top-0 z-[110]" : "relative z-[110] shrink-0",
          elevatedOnScroll && headerElevated && "shadow-[0_8px_30px_rgba(0,0,0,0.38)]",
        )}
        onMouseEnter={cancelCloseMenuTimer}
        onMouseLeave={scheduleCloseMenu}
      >
      <div className="w-full">
      <div className="flex h-12 w-full items-center gap-2 px-3 sm:h-14 sm:gap-3 sm:px-4 xl:h-[64px] xl:px-5">
        {/* Brand + nav */}
        <div className="flex min-w-0 flex-1 items-center gap-0 sm:gap-1">
          <div className="flex shrink-0 items-center pr-0">
            <SplitonLogo />
          </div>

          <HeaderDivider className="mx-1 hidden xl:block" />

          <DashboardHeaderNavMenu
            items={navItems}
            value={expandedKey}
            onValueChange={onNavValueChange}
            onNavigate={closeSubnav}
            ariaLabel={t("navigation.header.mainNav")}
            isItemActive={(item) => navItemActive(item, pathname, hash)}
          />
        </div>

        <DashboardHeaderSearchInline />

        {/* Actions + utilities */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <CabinetDemoDataToggle />
          {wallet.isAuthPending ? (
            <span
              className="hidden h-9 w-[5.5rem] animate-pulse rounded-lg bg-white/10 xl:inline-flex"
              aria-hidden
            />
          ) : wallet.isAuthenticated ? (
            <Link
              href={DEPOSIT_HREF}
              className="hidden h-9 shrink-0 items-center rounded-full bg-white/10 px-4 text-[12px] font-medium text-white transition hover:bg-white/16 active:scale-[0.98] xl:inline-flex"
            >
              {t("navigation.header.depositUsdt")}
            </Link>
          ) : (
            <Link
              href={ROUTES.login}
              className="hidden h-9 shrink-0 items-center rounded-lg bg-white/10 px-3.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-white/16 xl:inline-flex"
            >
              {t("navigation.header.login")}
            </Link>
          )}

          {wallet.isAuthenticated ? (
            <details className="group relative hidden 2xl:block">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-white/85 transition-colors marker:hidden hover:bg-white/8 [&::-webkit-details-marker]:hidden">
                <span className="max-w-[8rem] truncate tabular-nums">
                  {wallet.balanceShort ?? (wallet.error ? "—" : "…")}
                </span>
                <span className="text-white/65">USDT</span>
                <HeaderChromeIcon kind="chevron" className="header-ico-sm text-white/65" />
              </summary>
              <div className="absolute right-0 z-50 mt-1.5 w-56 overflow-hidden rounded-xl bg-[#0a0a0a] py-1 shadow-2xl">
                <div className="px-3 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    {t("nav.balance")}
                  </p>
                  <p className="mt-0.5 tabular-nums text-base font-semibold text-white">
                    {wallet.balanceLabel ?? "—"}
                  </p>
                  {wallet.error ? (
                    <p className="mt-1 text-[11px] text-red-300">{wallet.error}</p>
                  ) : null}
                </div>
                <Link
                  href={DEPOSIT_HREF}
                  className="block px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.05]"
                >
                  {t("navigation.header.depositShort")}
                </Link>
                <Link
                  href={PAYOUTS_HISTORY_HREF}
                  className="block px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.05]"
                >
                  {t("navigation.header.payoutHistory")}
                </Link>
              </div>
            </details>
          ) : null}

          {wallet.isAuthPending ? (
            <span
              className={cn(headerIconShellClass, "xl:hidden")}
              aria-hidden
            >
              <span className="size-[18px] animate-pulse rounded-full bg-white/20" />
            </span>
          ) : wallet.isAuthenticated ? (
            <button
              type="button"
              className={cn(
                headerIconShellClass,
                "xl:hidden",
                mobileProfileDrawerOpen && "bg-white/12 text-white",
              )}
              aria-label={t("navigation.header.profile")}
              aria-expanded={mobileProfileDrawerOpen}
              onClick={() => {
                setExpandedKey(null);
                setProfileOpen(false);
                setMobileMenuOpen(false);
                openProfileDrawer();
              }}
            >
              <HeaderChromeIcon kind="user" />
            </button>
          ) : (
            <Link
              href={ROUTES.login}
              className={cn(headerIconShellClass, "xl:hidden")}
              aria-label={t("navigation.header.login")}
            >
              <HeaderChromeIcon kind="user" />
            </Link>
          )}

          <div className="h-4 w-px bg-white/10 xl:hidden" aria-hidden />

          <button
            type="button"
            className={cn(
              headerIconShellClass,
              "xl:hidden",
              mobileMenuOpen && "bg-white/12 text-white",
            )}
            aria-label={
              mobileMenuOpen
                ? t("navigation.header.mobileMenuClose")
                : t("navigation.header.mobileMenuOpen")
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-dashboard-menu"
            onClick={() => {
              setExpandedKey(null);
              setProfileOpen(false);
              setMobileMenuOpen((prev) => !prev);
            }}
          >
            {mobileMenuOpen ? <HeaderChromeIcon kind="close" /> : <HeaderChromeIcon kind="menu" />}
          </button>

          <div
            className="relative hidden shrink-0 xl:block"
            onMouseEnter={() => {
              cancelCloseMenuTimer();
              setExpandedKey(null);
              setSupportOpen(false);
              setProfileOpen(true);
            }}
          >
            <button
              type="button"
              className={cn(
                "group relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/8 hover:text-white",
                profileOpen && "bg-white/12 text-white",
              )}
              aria-label={t("navigation.header.profile")}
              aria-expanded={profileOpen}
              aria-controls={DASHBOARD_PROFILE_MEGAMENU_ID}
              aria-haspopup="true"
              onFocus={() => {
                cancelCloseMenuTimer();
                setExpandedKey(null);
                setProfileOpen(true);
              }}
              onClick={() => {
                cancelCloseMenuTimer();
                setExpandedKey(null);
                setProfileOpen((p) => !p);
              }}
            >
              <HeaderChromeIcon kind="user" />
            </button>

            {profileOpen && isDesktop ? (
              <ProfileMegamenuFlyout
                onNavigate={closeSubnav}
                className="absolute right-0 top-full z-[120] hidden pt-2 xl:block"
              />
            ) : null}
          </div>

          <HeaderDivider className="mx-0.5 hidden xl:block" />

          <div className="hidden items-center xl:flex">
            <NotificationBell
              apiBasePath="/api/v1/notifications"
              allHref={ROUTES.dashboardNotifications}
              className={headerIconShellClass}
              iconClassName="size-[18px]"
            />
            <div
              className="relative"
              onMouseEnter={() => {
                cancelCloseMenuTimer();
                setExpandedKey(null);
                setProfileOpen(false);
                setSupportOpen(true);
              }}
            >
              <HeaderHelpLink
                label={t("navigation.header.help")}
                active={supportOpen || pathname === ROUTES.support}
                expanded={supportOpen}
                controlsId={DASHBOARD_SUPPORT_MEGAMENU_ID}
                onFocus={() => {
                  cancelCloseMenuTimer();
                  setExpandedKey(null);
                  setProfileOpen(false);
                  setSupportOpen(true);
                }}
                onClick={() => {
                  cancelCloseMenuTimer();
                  setExpandedKey(null);
                  setProfileOpen(false);
                  setSupportOpen((open) => !open);
                }}
              />
              {supportOpen && isDesktop ? (
                <SupportMegamenuFlyout
                  onNavigate={closeSubnav}
                  className="absolute right-0 top-full z-[120] hidden pt-2 xl:block"
                />
              ) : null}
            </div>
            <LanguageSelector
              variant="dark"
              hideLocaleName
              buttonClassName="border-0 bg-transparent hover:bg-white/8"
            />
          </div>
        </div>
      </div>
      </div>
    </header>
    </>
  );
}
