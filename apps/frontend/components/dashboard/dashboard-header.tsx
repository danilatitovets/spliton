"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Globe,
  MessageCircle,
  Search,
  User,
} from "lucide-react";

import {
  DASHBOARD_MEGAMENU_PANEL_ID,
  DASHBOARD_PROFILE_MEGAMENU_ID,
  DashboardMegamenuPanel,
  DashboardProfileMegamenuPanel,
} from "@/components/dashboard/dashboard-megamenu";
import { DashboardHeaderSearchLayer } from "@/components/dashboard/dashboard-header-search";
import { DashboardProfileMobileLinks } from "@/components/dashboard/dashboard-profile-subheader";
import {
  dashboardNavItems,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-nav";
import { RevShareLogo } from "@/components/dashboard/revshare-logo";
import { DASHBOARD_MISC_PATHS, ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function HeaderDivider({ className }: { className?: string }) {
  return (
    <span
      className={cn("hidden h-5 w-px shrink-0 bg-white/12 sm:block", className)}
      aria-hidden
    />
  );
}

const headerIconShellClass =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-100";

function IconToolButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={headerIconShellClass} aria-label={label}>
      {children}
    </button>
  );
}

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

function NavTrigger({
  item,
  pathname,
  hash,
  expandedKey,
  onToggle,
  onHoverOpen,
  onNavigate,
  isDesktop,
  size = "desktop",
}: {
  item: DashboardNavItem;
  pathname: string;
  hash: string;
  expandedKey: string | null;
  onToggle: (id: string) => void;
  onHoverOpen: (id: string) => void;
  /** Закрыть мегаменю при переходе по ссылке пункта */
  onNavigate: () => void;
  isDesktop: boolean;
  size?: "desktop" | "mobile";
}) {
  const isOpen = expandedKey === item.id;
  const isActive = navItemActive(item, pathname, hash) || isOpen;
  const hasMenu = Boolean(item.children?.length);

  const shellDesktop =
    "flex shrink-0 items-center rounded-md text-[11px] font-semibold uppercase tracking-[0.1em] leading-none transition-colors lg:px-0";
  const shellMobile = "flex shrink-0 items-center whitespace-nowrap rounded-md text-xs font-medium";
  const shell = size === "desktop" ? shellDesktop : shellMobile;
  const activeShell = isActive
    ? "bg-white/[0.08] text-white ring-1 ring-white/10"
    : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-100";
  const linkPad =
    size === "desktop"
      ? "flex items-center rounded-l-md px-2.5 py-2 lg:pl-3 lg:pr-1.5"
      : "flex items-center rounded-l-md px-2.5 py-1.5 pr-1";
  const btnPad =
    size === "desktop" ? "flex items-center justify-center rounded-r-md py-2 pr-2 pl-0.5" : "flex items-center rounded-r-md py-1.5 pr-2 pl-0.5";

  if (!hasMenu) {
    return (
      <Link
        href={item.href}
        className={cn(
          size === "desktop"
            ? "flex shrink-0 items-center gap-1 rounded-md px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] leading-none text-zinc-500 transition-colors lg:px-3"
            : "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500",
          isActive ? "bg-white/[0.08] text-white ring-1 ring-white/10" : "hover:bg-white/[0.05] hover:text-zinc-100",
        )}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div
      className={cn(shell, activeShell)}
      onMouseEnter={() => {
        if (isDesktop) onHoverOpen(item.id);
      }}
    >
      <Link href={item.href} onClick={onNavigate} className={cn(linkPad, "min-w-0 hover:text-zinc-100")}>
        <span className="truncate">{item.label}</span>
      </Link>
      <button
        type="button"
        id={`nav-trigger-${item.id}`}
        aria-expanded={isOpen}
        aria-controls={DASHBOARD_MEGAMENU_PANEL_ID}
        aria-label={`Меню: ${item.label}`}
        onClick={(e) => {
          e.preventDefault();
          onToggle(item.id);
        }}
        className={cn(btnPad, "text-inherit hover:text-zinc-100")}
      >
        <ChevronDown
          className={cn(
            size === "desktop" ? "size-3.5" : "size-3",
            "opacity-70 transition-transform duration-200",
            isOpen && "-rotate-180"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </div>
  );
}

type DashboardHeaderProps = {
  /**
   * When false, the bar participates in normal document scroll (e.g. secondary market:
   * primary header scrolls away, tab row becomes the sticky top bar).
   * @default true
   */
  sticky?: boolean;
};

function HeaderHelpLink({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.support}
      className={cn(headerIconShellClass, className)}
      aria-label="Поддержка и база знаний"
    >
      <CircleHelp className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}

export function DashboardHeader({ sticky = true }: DashboardHeaderProps = {}) {
  const pathname = usePathname();
  const [hash, setHash] = React.useState("");
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const closeMenuTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const t = window.requestAnimationFrame(() => setPortalReady(true));
    return () => window.cancelAnimationFrame(t);
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
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
      setExpandedKey(null);
      setProfileOpen(false);
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
      setSearchOpen(false);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const onHoverOpen = React.useCallback((id: string) => {
    cancelCloseMenuTimer();
    setProfileOpen(false);
    setExpandedKey(id);
  }, [cancelCloseMenuTimer]);

  const onToggle = React.useCallback((id: string) => {
    cancelCloseMenuTimer();
    setProfileOpen(false);
    setExpandedKey((k) => (k === id ? null : id));
  }, [cancelCloseMenuTimer]);

  const closeSubnav = React.useCallback(() => {
    cancelCloseMenuTimer();
    setExpandedKey(null);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [cancelCloseMenuTimer]);

  const closeSearch = React.useCallback(() => setSearchOpen(false), []);

  const openSearch = React.useCallback(() => {
    cancelCloseMenuTimer();
    setExpandedKey(null);
    setProfileOpen(false);
    setSearchOpen(true);
  }, [cancelCloseMenuTimer]);

  const toggleSearch = React.useCallback(() => {
    cancelCloseMenuTimer();
    setExpandedKey(null);
    setProfileOpen(false);
    setSearchOpen((s) => !s);
  }, [cancelCloseMenuTimer]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelCloseMenuTimer();
        setExpandedKey(null);
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelCloseMenuTimer]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, textarea, [contenteditable=true]") && !searchOpen) return;
      e.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, searchOpen]);

  React.useEffect(() => {
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = headerRef.current;
      if (!el || (!expandedKey && !profileOpen)) return;
      const target = e.target as Node;
      if (!el.contains(target)) {
        cancelCloseMenuTimer();
        setExpandedKey(null);
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expandedKey, profileOpen, cancelCloseMenuTimer]);

  React.useEffect(() => {
    return () => {
      if (closeMenuTimerRef.current != null) {
        window.clearTimeout(closeMenuTimerRef.current);
      }
    };
  }, []);

  const openItem = dashboardNavItems.find((i) => i.id === expandedKey);

  /** Портальный фон: как под mega-menu разделов (blur 40px + darken). */
  const headerFlyoutBackdrop =
    portalReady && (expandedKey || profileOpen) && !searchOpen ? (
      <div
        role="presentation"
        aria-hidden
        className="fixed inset-0 z-[105] animate-dashboard-megamenu-in bg-black/60 motion-reduce:animate-none"
        style={{
          WebkitBackdropFilter: "blur(40px) brightness(0.42) saturate(0.92)",
          backdropFilter: "blur(40px) brightness(0.42) saturate(0.92)",
        }}
        onClick={closeSubnav}
      />
    ) : null;

  return (
    <>
      {headerFlyoutBackdrop ? createPortal(headerFlyoutBackdrop, document.body) : null}
      <DashboardHeaderSearchLayer open={searchOpen} onClose={closeSearch} />
      <header
        ref={headerRef}
        className={cn(
          "border-b border-white/6 bg-[#070707]",
          sticky ? "sticky top-0 z-[110]" : "relative z-[110] shrink-0",
        )}
        onMouseEnter={cancelCloseMenuTimer}
        onMouseLeave={scheduleCloseMenu}
      >
      <div className="w-full">
      <div className="flex h-11 w-full items-center gap-2 px-3 sm:h-12 sm:gap-3 sm:px-4 lg:h-[52px] lg:px-5">
        {/* Brand + nav */}
        <div className="flex min-w-0 flex-1 items-center gap-0 sm:gap-1">
          <div className="flex shrink-0 items-center pr-3 sm:pr-4">
            <RevShareLogo />
          </div>

          <HeaderDivider className="mx-1 hidden sm:block" />

          <nav
            className="hidden min-w-0 items-center gap-0.5 overflow-x-auto sm:flex lg:gap-1"
            aria-label="Основная навигация"
          >
            {dashboardNavItems.map((item) => (
              <NavTrigger
                key={item.id}
                item={item}
                pathname={pathname}
                hash={hash}
                expandedKey={expandedKey}
                onToggle={onToggle}
                onHoverOpen={onHoverOpen}
                onNavigate={closeSubnav}
                isDesktop={isDesktop}
                size="desktop"
              />
            ))}
          </nav>
        </div>

        {/* Actions + utilities */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            className={cn(
              headerIconShellClass,
              searchOpen && "bg-white/6 text-white ring-1 ring-white/12",
            )}
            aria-label="Поиск по платформе"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            onClick={toggleSearch}
          >
            <Search className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </button>

          <Link
            href={`${ROUTES.dashboard}#deposit`}
            className="hidden h-9 shrink-0 items-center rounded-lg border border-white/12 bg-white/[0.04] px-3.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-100 transition hover:border-white/18 hover:bg-white/[0.07] active:scale-[0.98] sm:inline-flex"
          >
            Пополнить USDT
          </Link>

          <details className="relative hidden sm:block">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-zinc-300 transition-colors marker:hidden hover:bg-white/[0.05] [&::-webkit-details-marker]:hidden">
              <span className="hidden tabular-nums lg:inline">1&nbsp;240,58</span>
              <span className="tabular-nums lg:hidden">1&nbsp;240</span>
              <span className="text-zinc-500">USDT</span>
              <ChevronDown className="size-3.5 text-zinc-500" strokeWidth={2} aria-hidden />
            </summary>
            <div className="absolute right-0 z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0a0a] py-1 shadow-2xl ring-1 ring-black/60">
              <div className="border-b border-white/[0.06] px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Баланс
                </p>
                <p className="mt-0.5 tabular-nums text-base font-semibold text-white">
                  1&nbsp;240,58 <span className="text-sm font-medium text-neutral-500">USDT</span>
                </p>
              </div>
              <Link
                href={`${ROUTES.dashboard}#deposit`}
                className="block px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.05]"
              >
                Пополнить
              </Link>
              <Link
                href={`${ROUTES.dashboard}#payouts`}
                className="block px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.05]"
              >
                История выплат
              </Link>
            </div>
          </details>

          <details className="relative sm:hidden">
            <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-zinc-500 transition-colors marker:hidden hover:bg-white/5 hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
              <User className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </summary>
            <div className="absolute right-0 z-50 mt-1.5 w-[min(calc(100vw-1.5rem),18rem)] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0a0a] py-1 shadow-2xl ring-1 ring-black/60">
              <div className="border-b border-white/[0.06] px-3 py-2.5">
                <p className="text-sm font-medium text-white">Аккаунт</p>
                <p className="text-xs text-neutral-500">danila@…</p>
              </div>
              <DashboardProfileMobileLinks onNavigate={closeSubnav} />
            </div>
          </details>

          <button
            type="button"
            className={cn(
              "relative z-[1] hidden size-9 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-100 sm:flex",
              profileOpen && "bg-white/[0.07] text-white ring-1 ring-white/12",
            )}
            aria-label="Профиль и настройки аккаунта"
            aria-expanded={profileOpen}
            aria-controls={DASHBOARD_PROFILE_MEGAMENU_ID}
            aria-haspopup="true"
            onMouseEnter={() => {
              cancelCloseMenuTimer();
              setExpandedKey(null);
              setProfileOpen(true);
            }}
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
            <User className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </button>

          <HeaderDivider className="mx-0.5 hidden sm:block" />

          <div className="hidden items-center sm:flex">
            <IconToolButton label="Сообщения">
              <MessageCircle className="size-[18px]" strokeWidth={1.75} />
            </IconToolButton>
            <IconToolButton label="Уведомления">
              <Bell className="size-[18px]" strokeWidth={1.75} />
            </IconToolButton>
            <HeaderHelpLink
              className={pathname === ROUTES.support ? "text-white ring-1 ring-white/12 bg-white/[0.06]" : undefined}
            />
            <IconToolButton label="Язык и регион">
              <Globe className="size-[18px]" strokeWidth={1.75} />
            </IconToolButton>
          </div>
        </div>
      </div>
      {profileOpen ? <DashboardProfileMegamenuPanel onNavigate={closeSubnav} /> : null}
      </div>

      {/* Mobile: nav scroll + compact row */}
      <div className="border-t border-white/6 sm:hidden">
        <nav
          className="flex gap-0.5 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Основная навигация"
        >
          {dashboardNavItems.map((item) => (
            <NavTrigger
              key={item.id}
              item={item}
              pathname={pathname}
              hash={hash}
              expandedKey={expandedKey}
              onToggle={onToggle}
              onHoverOpen={onHoverOpen}
              onNavigate={closeSubnav}
              isDesktop={false}
              size="mobile"
            />
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-2">
          <span className="tabular-nums text-xs font-medium text-zinc-500">1&nbsp;240,58 USDT</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={cn(
                headerIconShellClass,
                searchOpen && "bg-white/6 text-white ring-1 ring-white/12",
              )}
              aria-label="Поиск по платформе"
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
              onClick={toggleSearch}
            >
              <Search className="size-[17px]" strokeWidth={1.75} aria-hidden />
            </button>
            <IconToolButton label="Уведомления">
              <Bell className="size-[17px]" strokeWidth={1.75} />
            </IconToolButton>
            <HeaderHelpLink
              className={pathname === ROUTES.support ? "text-white ring-1 ring-white/12 bg-white/[0.06]" : undefined}
            />
            <Link
              href={`${ROUTES.dashboard}#deposit`}
              className="flex h-8 items-center rounded-lg border border-white/12 bg-white/[0.04] px-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-100"
            >
              Пополнить
            </Link>
          </div>
        </div>
      </div>

      <DashboardMegamenuPanel openItem={openItem} onNavigate={closeSubnav} />
    </header>
    </>
  );
}
