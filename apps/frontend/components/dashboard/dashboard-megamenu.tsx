"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MEGAMENU_CARD_TEXTURE,
  megamenuTexturePosition,
  type DashboardNavBadge,
  type DashboardNavItem,
  type DashboardNavSubItem,
} from "@/components/dashboard/dashboard-nav";
import { MegamenuItemIcon } from "@/components/dashboard/megamenu-item-icons";
import { BRAND } from "@/constants/brand";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useLocalizedProfileMenuItems, useLocalizedSupportMenuItems } from "@/hooks/use-shell-i18n";
import { cn } from "@/lib/utils";

export const DASHBOARD_MEGAMENU_PANEL_ID = "dashboard-header-megamenu";

export const SPLIT_MEGAMENU_IDS = ["catalog", "holdings", "payouts", "misc"] as const;

export function isSplitMegamenuId(id: string): boolean {
  return (SPLIT_MEGAMENU_IDS as readonly string[]).includes(id);
}

/** Волны внутри каждой карточки (нижняя зона) */
function CardInnerWaves({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none text-white/[0.05]", className)}
      viewBox="0 0 120 48"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <path stroke="currentColor" strokeWidth="0.6" d="M0 36 C20 28 40 44 60 32 S100 40 120 28" />
      <path stroke="currentColor" strokeWidth="0.5" opacity="0.7" d="M0 42 C24 34 48 48 72 36 S108 44 120 38" />
    </svg>
  );
}

function MegamenuLineArt({ variant, className }: { variant: number; className?: string }) {
  const v = variant % 5;
  return (
    <svg
      className={cn(
        "pointer-events-none text-white/[0.07] transition-opacity duration-300 group-hover:text-white/[0.12]",
        className
      )}
      viewBox="0 0 100 72"
      fill="none"
      aria-hidden
    >
      {v === 0 ? (
        <>
          {[...Array(14)].map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x2 = 50 + Math.cos(a) * 38;
            const y2 = 36 + Math.sin(a) * 28;
            return (
              <line key={i} x1="50" y1="36" x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.45" opacity={0.35 + (i % 3) * 0.08} />
            );
          })}
          <circle cx="50" cy="36" r="4" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </>
      ) : null}
      {v === 1 ? (
        <>
          {[8, 16, 24, 32, 40].map((r, i) => (
            <ellipse
              key={r}
              cx="50"
              cy="38"
              rx={r * 0.9}
              ry={r * 0.55}
              stroke="currentColor"
              strokeWidth="0.4"
              opacity={0.2 + i * 0.12}
              transform={`rotate(${i * 3} 50 38)`}
            />
          ))}
        </>
      ) : null}
      {v === 2 ? (
        <>
          <path
            d="M4 48 Q22 22 50 36 T96 30"
            stroke="currentColor"
            strokeWidth="0.55"
            strokeDasharray="2 4"
            opacity="0.55"
          />
          <path d="M4 52 L4 48 Q50 34 96 42 L96 52 Z" fill="currentColor" opacity="0.06" />
        </>
      ) : null}
      {v === 3 ? (
        <>
          {[7, 14, 21, 28, 35].map((r, i) => (
            <circle
              key={r}
              cx="50"
              cy="40"
              r={r}
              stroke="currentColor"
              strokeWidth="0.35"
              fill="none"
              opacity={0.12 + i * 0.07}
              transform={`rotate(${i * 11} 50 40)`}
            />
          ))}
        </>
      ) : null}
      {v === 4 ? (
        <>
          <path d="M20 52 L35 38 L50 48 L65 34 L80 46" stroke="currentColor" strokeWidth="0.45" opacity="0.45" />
          <path d="M24 56 L40 44 L52 52 L68 40 L76 50" stroke="currentColor" strokeWidth="0.35" opacity="0.3" />
          <circle cx="50" cy="42" r="3" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
        </>
      ) : null}
    </svg>
  );
}

function SubnavBadge({
  badge,
  variant = "dark",
}: {
  badge: DashboardNavBadge;
  variant?: "dark" | "light";
}) {
  const { t } = useI18n();
  const styles: Record<DashboardNavBadge, string> =
    variant === "light"
      ? {
          new: "border border-zinc-200 bg-zinc-100 text-[10px] font-bold uppercase tracking-wide text-zinc-800",
          free: "border border-zinc-200 bg-white text-[10px] font-semibold uppercase tracking-wide text-zinc-700",
          hot: "border border-amber-300/60 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide text-amber-800",
        }
      : {
          new: "border border-white/18 bg-white/[0.1] text-[10px] font-bold uppercase tracking-wide text-zinc-100",
          free: "border border-white/10 bg-zinc-900 text-[10px] font-semibold uppercase tracking-wide text-white/85",
          hot: "border border-amber-400/22 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-100/95",
        };
  const text: Record<DashboardNavBadge, string> = {
    new: t("navigation.badge.new"),
    free: t("navigation.badge.free"),
    hot: t("navigation.badge.hot"),
  };
  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5", styles[badge])} aria-hidden>
      {text[badge]}
    </span>
  );
}

function SubItemIcon({ sub, className }: { sub: DashboardNavSubItem; className?: string }) {
  const hint = (sub.iconHint ?? sub.label).slice(0, 2).toUpperCase();

  if (sub.iconSrc) {
    return (
      <div
        className={cn(
          "relative z-[2] h-[96px] w-[92%] overflow-hidden",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- произвольные пути из public */}
        <img
          src={sub.iconSrc}
          alt=""
          className={cn(
            "h-full w-full object-center",
            sub.iconFit === "contain" ? "object-contain p-1" : "object-cover",
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative z-[2] flex size-11 items-center justify-center rounded-xl border border-dashed border-white/18 bg-white/[0.03] text-[11px] font-bold tracking-tight text-white/30 transition-colors duration-150 group-hover:border-white/28 group-hover:bg-white/[0.06] group-hover:text-white/50",
        className
      )}
      aria-hidden
    >
      {hint}
    </div>
  );
}

const cardShell =
  "group relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-xl bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition-colors duration-150 sm:min-h-[236px]";

const cardHover = "hover:bg-zinc-950";

const SPLITON_TEXTURE = "/images/landing/footer-spliton-texture-fill-bw.png";

function MegamenuCardTexture({
  position,
  watermark = false,
}: {
  position?: string;
  watermark?: boolean;
}) {
  return (
    <>
      <div
        className="megamenu-featured-media pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${MEGAMENU_CARD_TEXTURE}')`,
          backgroundSize: "cover",
          backgroundPosition: position ?? "center",
          opacity: 0.88,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />
      {watermark ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden sm:justify-end" aria-hidden>
          <p
            className="select-none whitespace-nowrap bg-clip-text font-bold leading-[0.78] tracking-[-0.06em] text-transparent"
            style={{
              fontSize: "clamp(3.2rem, 22vw, 9rem)",
              backgroundImage: `url('${SPLITON_TEXTURE}')`,
              backgroundSize: "140% auto",
              backgroundPosition: "48% 42%",
              backgroundRepeat: "no-repeat",
              WebkitTextStroke: "0.5px rgba(255,255,255,0.1)",
            }}
          >
            {BRAND.name}
          </p>
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/85 via-black/35 to-transparent"
        aria-hidden
      />
    </>
  );
}

function MegamenuIntroCard({
  title,
  description,
  href,
  onNavigate,
  textureId,
}: {
  title: string;
  description?: string;
  href: string;
  onNavigate: () => void;
  textureId?: string;
}) {
  return (
    <Link href={href} onClick={onNavigate} className={cn(cardShell, cardHover, "megamenu-featured-card p-3 sm:p-3.5")}>
      <MegamenuCardTexture position={megamenuTexturePosition(textureId ?? "catalog")} watermark />
      <div className="relative z-[2] mt-auto flex min-h-0 flex-1 flex-col justify-end">
        <h2 className="text-sm font-bold leading-tight tracking-tight text-white sm:text-[15px]">{title}</h2>
        {description ? (
          <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-zinc-400 sm:text-xs">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}

function MegamenuLinkCard({
  sub,
  index,
  onNavigate,
}: {
  sub: DashboardNavSubItem;
  index: number;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const danger = Boolean(sub.danger);
  const handleDangerClick = async () => {
    if (!danger) {
      return;
    }
    await logout();
    onNavigate();
    router.push(ROUTES.login);
  };

  if (danger) {
    return (
      <div className="h-full w-full">
        <button
          type="button"
          onClick={handleDangerClick}
          className={cn(
            cardShell,
            "w-full text-left border-fuchsia-500/15 p-3 sm:p-3.5 hover:border-fuchsia-400/30 hover:bg-zinc-950",
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-25">
            <CardInnerWaves className="size-full" />
          </div>
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 text-[13px] font-bold leading-snug text-fuchsia-200/95 sm:text-sm">
                {sub.label}
              </h3>
              {sub.badge ? <SubnavBadge badge={sub.badge} /> : null}
            </div>
            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-fuchsia-200/50 sm:text-xs">
              {sub.description}
            </p>
            <div className="relative mt-2 flex min-h-[88px] flex-1 flex-col justify-end overflow-hidden rounded-lg bg-fuchsia-950/20 py-3">
              <MegamenuLineArt variant={index} className="absolute inset-0 size-full opacity-75" />
              <div className="relative flex flex-1 items-center justify-center py-3">
                <SubItemIcon sub={sub} />
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Link
        href={sub.href}
        onClick={onNavigate}
        className={cn(
          cardShell,
          cardHover,
          "p-3 sm:p-3.5",
        )}
      >
        <MegamenuCardTexture />
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-[13px] font-bold leading-snug text-white sm:text-sm">
              {sub.label}
            </h3>
            {sub.badge ? <SubnavBadge badge={sub.badge} /> : null}
          </div>
          <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
            {sub.description}
          </p>
          <div className="relative mt-2 flex min-h-[88px] flex-1 flex-col justify-end overflow-hidden py-1">
            <div className="relative flex flex-1 items-center justify-center py-2">
              <SubItemIcon sub={sub} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export const DASHBOARD_PROFILE_MEGAMENU_ID = "dashboard-profile-megamenu";
export const DASHBOARD_SUPPORT_MEGAMENU_ID = "dashboard-support-megamenu";

/** Пункты меню профиля — те же карточки, что и в mega-menu разделов. */
export const PROFILE_MEGAMENU_ITEMS: DashboardNavSubItem[] = [
  {
    label: "",
    description: "",
    href: profileDashboardHref("overview"),
    iconSrc: "/images/profile-menu/profile-menu-overview.png?v=1",
    iconFit: "contain",
    iconHint: "PR",
  },
  {
    label: "",
    description: "",
    href: profileDashboardHref("verification"),
    iconSrc: "/images/profile-menu/profile-menu-verification.png?v=1",
    iconFit: "contain",
    iconHint: "KYC",
  },
  {
    label: "",
    description: "",
    href: profileDashboardHref("security"),
    iconSrc: "/images/profile-menu/profile-menu-security.png?v=1",
    iconFit: "contain",
    iconHint: "2F",
  },
  {
    label: "",
    description: "",
    href: profileDashboardHref("settings"),
    iconSrc: "/images/profile-menu/profile-menu-settings.png?v=1",
    iconFit: "contain",
    iconHint: "NS",
  },
  {
    label: "",
    description: "",
    href: ROUTES.login,
    iconSrc: "/images/profile-menu/profile-menu-logout.png?v=1",
    iconFit: "contain",
    iconHint: "OUT",
    danger: true,
  },
];

const SERVICE_MENU_SECTIONS: { title: string; hrefs: string[] }[] = [
  {
    title: "Платформа",
    hrefs: [ROUTES.calculator, ROUTES.fees, ROUTES.systemStatus, ROUTES.news],
  },
  {
    title: "Программы",
    hrefs: [ROUTES.referralProgram, ROUTES.partnerProgram, ROUTES.dashboardArtist],
  },
  {
    title: "Документы и доверие",
    hrefs: [ROUTES.dashboardDisputes, ROUTES.dashboardStatements, ROUTES.trust],
  },
];

export const SUPPORT_MEGAMENU_ITEMS: DashboardNavSubItem[] = [
  {
    label: "",
    description: "",
    href: ROUTES.support,
    iconSrc: "/images/support-menu/support-hub.png?v=1",
    iconFit: "contain",
    iconHint: "HC",
  },
  {
    label: "",
    description: "",
    href: ROUTES.dashboardSupport,
    iconSrc: "/images/support-menu/support-ticket.png?v=1",
    iconFit: "contain",
    iconHint: "TK",
  },
  {
    label: "",
    description: "",
    href: ROUTES.systemStatus,
    iconSrc: "/images/support-menu/support-status.png?v=1",
    iconFit: "contain",
    iconHint: "ST",
  },
  {
    label: "",
    description: "",
    href: `${ROUTES.dashboardProfile}?tab=security`,
    iconSrc: "/images/support-menu/support-security.png?v=1",
    iconFit: "contain",
    iconHint: "SC",
  },
];

function SplitMegamenuNavRow({
  sub,
  onNavigate,
  dangerAction,
  comfortable = false,
}: {
  sub: DashboardNavSubItem;
  onNavigate: () => void;
  dangerAction?: () => void | Promise<void>;
  comfortable?: boolean;
}) {
  const danger = Boolean(sub.danger);
  const shell = cn(
    "group flex w-full items-start text-left transition-colors duration-150",
    "bg-transparent hover:bg-white/[0.06] focus-visible:bg-white/[0.06]",
    comfortable
      ? "gap-3.5 rounded-xl px-3 py-3"
      : "gap-3 rounded-xl px-3 py-2.5 sm:px-3.5 sm:py-3",
  );
  const labelClass = cn(
    "font-semibold leading-snug tracking-[-0.01em] transition-colors duration-150",
    comfortable ? "text-[15px]" : "text-[14px]",
    danger ? "text-red-300" : "text-white",
  );
  const inner = (
    <>
      <span
        className={cn(
          "mt-0.5 grid shrink-0 place-items-center rounded-lg bg-white/[0.06] transition-colors duration-150 group-hover:bg-white/[0.1]",
          comfortable ? "size-10" : "size-9",
        )}
      >
        <MegamenuItemIcon href={sub.href} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={labelClass}>{sub.label}</span>
          {sub.badge ? <SubnavBadge badge={sub.badge} variant="dark" /> : null}
        </span>
        {sub.description ? (
          <p
            className={cn(
              "mt-0.5 line-clamp-2 leading-snug text-zinc-500",
              comfortable ? "text-[13px]" : "text-[12px]",
            )}
          >
            {sub.description}
          </p>
        ) : null}
      </span>
    </>
  );

  if (danger && dangerAction) {
    return (
      <button type="button" onClick={dangerAction} className={shell}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={sub.href} onClick={onNavigate} className={shell}>
      {inner}
    </Link>
  );
}

export function SplitMegamenuList({
  openItem,
  onNavigate,
  comfortable = false,
  className,
}: {
  openItem: DashboardNavItem;
  onNavigate: () => void;
  comfortable?: boolean;
  className?: string;
}) {
  const children = openItem.children ?? [];

  if (!children.length) return null;

  const sections =
    openItem.id === "misc"
      ? SERVICE_MENU_SECTIONS.map((section) => ({
          title: section.title,
          items: section.hrefs
            .map((href) => children.find((c) => c.href === href) ?? null)
            .filter((x): x is DashboardNavSubItem => x != null),
        })).filter((s) => s.items.length > 0)
      : null;

  const renderRow = (sub: DashboardNavSubItem) => (
    <li key={sub.href} className="shrink-0">
      <SplitMegamenuNavRow sub={sub} onNavigate={onNavigate} comfortable={comfortable} />
    </li>
  );

  const links = (
    <ul
      className={cn(
        "flex flex-col overflow-y-auto [scrollbar-color:rgb(63_63_70)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar]:w-1.5",
        comfortable ? "max-h-[min(420px,calc(100dvh-7rem))] gap-0.5" : "max-h-[min(640px,calc(100dvh-5.5rem))] gap-0.5",
      )}
    >
      {sections
        ? sections.map((section) => (
            <li key={section.title} className="shrink-0">
              <p className="px-3 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-500">
                {section.title}
              </p>
              <ul className="flex flex-col gap-0.5">{section.items.map((sub) => renderRow(sub))}</ul>
            </li>
          ))
        : children.map((sub) => renderRow(sub))}
    </ul>
  );

  if (!comfortable) {
    return <div className={cn("p-2", className)}>{links}</div>;
  }

  return (
    <div
      className={cn(
        "grid gap-2 p-2 sm:w-[28rem] lg:w-[34rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]",
        className,
      )}
    >
      <Link
        href={openItem.href}
        onClick={onNavigate}
        className="megamenu-featured-card relative isolate flex min-h-[13.5rem] flex-col justify-end overflow-hidden rounded-xl bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/20 lg:min-h-full"
      >
        <MegamenuCardTexture position={megamenuTexturePosition(openItem.id)} watermark />
        <div className="relative z-[2] p-5">
          <p className="text-[18px] font-semibold tracking-tight text-white">{openItem.label}</p>
          {openItem.megaTeaser ? (
            <p className="mt-2 line-clamp-4 text-[13px] leading-snug text-zinc-400">{openItem.megaTeaser}</p>
          ) : null}
        </div>
      </Link>
      {links}
    </div>
  );
}

/** Одноколоночный flyout — только список ссылок (OKX), без превью справа. */
export function SplitMegamenuFlyout({
  openItem,
  onNavigate,
  className,
}: {
  openItem: DashboardNavItem;
  onNavigate: () => void;
  className?: string;
}) {
  if (!openItem.children?.length) return null;

  return (
    <div
      id={DASHBOARD_MEGAMENU_PANEL_ID}
      role="region"
      aria-labelledby={`nav-trigger-${openItem.id}`}
      className={cn("pointer-events-auto", className)}
    >
      <div className="w-[min(calc(100vw-1.5rem),380px)] overflow-hidden rounded-2xl bg-[#111111] shadow-[0_20px_60px_-16px_rgba(0,0,0,0.75)]">
        <SplitMegamenuList openItem={openItem} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/** @deprecated Используйте {@link SplitMegamenuFlyout}. */
export function ServicesSplitMegamenuFlyout({
  openItem,
  onNavigate,
  className,
}: {
  openItem: DashboardNavItem;
  onNavigate: () => void;
  className?: string;
}) {
  return <SplitMegamenuFlyout openItem={openItem} onNavigate={onNavigate} className={className} />;
}

export function ProfileMegamenuFlyout({
  onNavigate,
  className,
}: {
  onNavigate: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { logout } = useAuth();
  const profileItems = useLocalizedProfileMenuItems();

  const handleLogout = async () => {
    await logout();
    onNavigate();
    router.push(ROUTES.login);
  };

  if (!profileItems.length) return null;

  return (
    <div
      id={DASHBOARD_PROFILE_MEGAMENU_ID}
      role="region"
      aria-label={t("navigation.megamenu.profileAria")}
      className={cn("pointer-events-auto", className)}
    >
      <div className="w-[min(calc(100vw-1.5rem),380px)] overflow-hidden rounded-2xl bg-[#111111] shadow-[0_20px_60px_-16px_rgba(0,0,0,0.75)]">
        <ul className="flex max-h-[min(560px,calc(100dvh-5.5rem))] flex-col gap-0.5 overflow-y-auto p-2 [scrollbar-color:rgb(63_63_70)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar]:w-1.5">
          {profileItems.map((sub) => (
            <li key={sub.href} className="shrink-0">
              <SplitMegamenuNavRow
                sub={sub}
                onNavigate={onNavigate}
                dangerAction={sub.danger ? handleLogout : undefined}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SupportMegamenuFlyout({
  onNavigate,
  className,
}: {
  onNavigate: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const supportItems = useLocalizedSupportMenuItems();

  if (!supportItems.length) return null;

  return (
    <div
      id={DASHBOARD_SUPPORT_MEGAMENU_ID}
      role="region"
      aria-label={t("navigation.header.help")}
      className={cn("pointer-events-auto", className)}
    >
      <div className="w-[min(calc(100vw-1.5rem),380px)] overflow-hidden rounded-2xl bg-[#111111] shadow-[0_20px_60px_-16px_rgba(0,0,0,0.75)]">
        <ul className="flex max-h-[min(560px,calc(100dvh-5.5rem))] flex-col gap-0.5 overflow-y-auto p-2 [scrollbar-color:rgb(63_63_70)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar]:w-1.5">
          {supportItems.map((sub) => (
            <li key={sub.href} className="shrink-0">
              <SplitMegamenuNavRow sub={sub} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** @deprecated Используйте {@link ProfileMegamenuFlyout}. */
export function DashboardProfileMegamenuPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <ProfileMegamenuFlyout
      onNavigate={onNavigate}
      className="border-t border-white/[0.05] bg-black/90 backdrop-blur-md supports-backdrop-filter:bg-black/80"
    />
  );
}

function MobileMegamenuScroll({
  openItem,
  onNavigate,
}: {
  openItem: DashboardNavItem;
  onNavigate: () => void;
}) {
  const { t } = useI18n();
  const showIntro = true;
  const introTitle =
    openItem.id === "catalog"
      ? t("navigation.megamenu.catalogCta")
      : openItem.id === "holdings"
        ? t("navigation.megamenu.holdingsCta")
        : openItem.label;

  return (
    <div className="w-full px-3 py-2 sm:px-4 sm:py-2">
      <div
        key={openItem.id}
        className="relative z-[1] flex snap-x snap-mandatory gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {showIntro ? (
          <div className="w-[min(260px,85vw)] flex-none snap-start">
            <MegamenuIntroCard
              title={introTitle}
              description={openItem.megaTeaser}
              href={openItem.href}
              onNavigate={onNavigate}
              textureId={openItem.id}
            />
          </div>
        ) : null}
        {openItem.children?.map((sub, i) => (
          <div key={sub.label} className="w-[min(240px,78vw)] flex-none snap-start">
            <MegamenuLinkCard sub={sub} index={i} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardMegamenuPanel({
  openItem,
  onNavigate,
}: {
  openItem: DashboardNavItem | undefined;
  onNavigate: () => void;
}) {
  const { t } = useI18n();

  if (!openItem?.children?.length) return null;

  /** Split flyout на desktop — полноширинная панель только на mobile (кроме «Сервисы»). */
  if (isSplitMegamenuId(openItem.id)) {
    if (openItem.id === "misc") return null;

    return (
      <div
        id={DASHBOARD_MEGAMENU_PANEL_ID}
        role="region"
        aria-labelledby={`nav-trigger-${openItem.id}`}
        className="border-t border-white/[0.05] bg-black/90 backdrop-blur-md supports-backdrop-filter:bg-black/80 lg:hidden"
      >
        <MobileMegamenuScroll openItem={openItem} onNavigate={onNavigate} />
      </div>
    );
  }

  const showIntro = true;
  const introTitle =
    openItem.id === "catalog"
      ? t("navigation.megamenu.catalogCta")
      : openItem.id === "holdings"
        ? t("navigation.megamenu.holdingsCta")
        : openItem.label;

  const count = openItem.children.length;
  /** Одна строка, равные колонки — без отдельного большого «второго» контейнера */
  const gridCols = `repeat(${showIntro ? 1 + count : count}, minmax(0, 1fr))`;

  return (
    <div
      id={DASHBOARD_MEGAMENU_PANEL_ID}
      role="region"
      aria-labelledby={`nav-trigger-${openItem.id}`}
      className="border-t border-white/[0.05] bg-black/90 backdrop-blur-md supports-backdrop-filter:bg-black/80"
    >
      <div className="w-full px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5">
        <div
          key={openItem.id}
          className="relative z-[1] hidden gap-2 lg:grid"
          style={{ gridTemplateColumns: gridCols }}
        >
          {showIntro ? (
            <MegamenuIntroCard
              title={introTitle}
              description={openItem.megaTeaser}
              href={openItem.href}
              onNavigate={onNavigate}
              textureId={openItem.id}
            />
          ) : null}
          {openItem.children.map((sub, i) => (
            <MegamenuLinkCard key={sub.label} sub={sub} index={i} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="relative z-[1] flex snap-x snap-mandatory gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {showIntro ? (
            <div className="w-[min(260px,85vw)] flex-none snap-start">
              <MegamenuIntroCard
                title={introTitle}
                description={openItem.megaTeaser}
                href={openItem.href}
                onNavigate={onNavigate}
                textureId={openItem.id}
              />
            </div>
          ) : null}
          {openItem.children.map((sub, i) => (
            <div key={sub.label} className="w-[min(240px,78vw)] flex-none snap-start">
              <MegamenuLinkCard sub={sub} index={i} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
