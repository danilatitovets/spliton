"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import type { LegalDocumentHeading } from "@/lib/legal/legal-document-markdown";
import { formatLegalTocTitle, legalDocumentTocHeadings } from "@/lib/legal/legal-document-markdown";
import { useLegalDocumentScrollSpy } from "@/lib/legal/use-legal-document-scroll-spy";
import { cn } from "@/lib/utils";

type LegalDocumentInPageNavProps = {
  headings: LegalDocumentHeading[];
  className?: string;
  variant?: "all" | "mobile" | "desktop";
};

function TocList({
  headings,
  active,
  onSelect,
}: {
  headings: LegalDocumentHeading[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="min-w-0 list-none">
      {headings.map((item, idx) => {
        const isActive = active === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                onSelect(item.id);
              }}
              className={cn(
                "block py-1.5 text-[13px] leading-5 transition-colors",
                isActive ? "font-semibold text-neutral-950" : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              {formatLegalTocTitle(item.title, idx)}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function LegalDocumentInPageNav({
  headings,
  className,
  variant = "all",
}: LegalDocumentInPageNavProps) {
  const { t } = useI18n();
  const tocHeadings = legalDocumentTocHeadings(headings);
  const sectionIds = tocHeadings.map((item) => item.id);
  const { active, scrollToSection } = useLegalDocumentScrollSpy(sectionIds);

  if (tocHeadings.length === 0) return null;

  const showMobile = variant === "all" || variant === "mobile";
  const showDesktop = variant === "all" || variant === "desktop";
  const label = t("profile.legal.tocLabel");

  return (
    <>
      {showMobile ? (
        <nav
          aria-label={label}
          className={cn(
            "sticky top-[var(--profile-sticky-offset,4.75rem)] z-20 -mx-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden",
            className,
          )}
        >
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-neutral-500">{label}</p>
          <TocList headings={tocHeadings} active={active} onSelect={scrollToSection} />
        </nav>
      ) : null}

      {showDesktop ? (
        <nav
          aria-label={label}
          className={cn(
            "sticky top-[calc(var(--profile-sticky-offset,4.75rem)+0.75rem)] hidden max-h-[calc(100dvh-var(--profile-sticky-offset,4.75rem)-1.5rem)] overflow-y-auto overscroll-contain md:block",
            className,
          )}
        >
          <p className="mb-2 text-[13px] font-semibold text-neutral-900">{label}</p>
          <TocList headings={tocHeadings} active={active} onSelect={scrollToSection} />
        </nav>
      ) : null}
    </>
  );
}
