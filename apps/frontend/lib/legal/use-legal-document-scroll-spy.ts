import { useCallback, useEffect, useState } from "react";

const SCROLL_OFFSET_PX = 112;
const BOTTOM_THRESHOLD_PX = 64;

function resolveActiveSection(sectionIds: string[]): string {
  if (sectionIds.length === 0) return "";

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((node): node is HTMLElement => node != null);

  if (sections.length === 0) return sectionIds[0] ?? "";

  const doc = document.documentElement;
  const nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - BOTTOM_THRESHOLD_PX;
  if (nearBottom) {
    return sections[sections.length - 1]!.id;
  }

  const marker = window.scrollY + SCROLL_OFFSET_PX;
  let active = sections[0]!.id;

  for (const section of sections) {
    if (section.offsetTop <= marker) {
      active = section.id;
    } else {
      break;
    }
  }

  return active;
}

export function useLegalDocumentScrollSpy(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0] ?? "");
  const [scrollProgress, setScrollProgress] = useState(0);

  const syncActive = useCallback(() => {
    setActive((prev) => {
      const next = resolveActiveSection(sectionIds);
      return prev === next ? prev : next;
    });

    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const nextProgress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    setScrollProgress((prev) => (Math.abs(prev - nextProgress) < 0.001 ? prev : nextProgress));
  }, [sectionIds]);

  useEffect(() => {
    setActive(sectionIds[0] ?? "");
  }, [sectionIds]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [syncActive]);

  const scrollToSection = useCallback((id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    const top = Math.max(0, section.offsetTop - SCROLL_OFFSET_PX + 8);
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  }, []);

  return { active, scrollToSection, scrollProgress };
}
