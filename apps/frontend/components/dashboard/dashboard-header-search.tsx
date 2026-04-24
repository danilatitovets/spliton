"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  LayoutGrid,
  LifeBuoy,
  Newspaper,
  Repeat2,
  Search,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type SectionId = "cabinet" | "trading" | "services";

const SECTION_ORDER: SectionId[] = ["cabinet", "trading", "services"];
const SECTION_LABEL: Record<SectionId, string> = {
  cabinet: "Кабинет",
  trading: "Торговля",
  services: "Сервисы",
};

type SearchLinkItem = {
  id: string;
  title: string;
  hint: string;
  href: string;
  section: SectionId;
  Icon: LucideIcon;
};

const SEARCH_LINKS: SearchLinkItem[] = [
  {
    id: "catalog",
    title: "Каталог",
    hint: "Релизы, раунды и вторичка",
    href: ROUTES.dashboardCatalog,
    section: "cabinet",
    Icon: LayoutGrid,
  },
  {
    id: "assets",
    title: "Мои активы",
    hint: "Обзор, метрики, позиции",
    href: ROUTES.dashboardOverview,
    section: "cabinet",
    Icon: Wallet,
  },
  {
    id: "payouts",
    title: "Выплаты",
    hint: "История и сравнение",
    href: ROUTES.dashboardPayouts,
    section: "cabinet",
    Icon: Banknote,
  },
  {
    id: "profile",
    title: "Профиль",
    hint: "Безопасность и верификация",
    href: ROUTES.dashboardProfile,
    section: "cabinet",
    Icon: UserRound,
  },
  {
    id: "secondary",
    title: "Вторичный рынок",
    hint: "Стакан, заявки, сделки",
    href: ROUTES.dashboardSecondaryMarket,
    section: "trading",
    Icon: Repeat2,
  },
  {
    id: "support",
    title: "Поддержка",
    hint: "База знаний и тикеты",
    href: ROUTES.support,
    section: "services",
    Icon: LifeBuoy,
  },
  {
    id: "news",
    title: "Новости",
    hint: "Лента платформы",
    href: ROUTES.news,
    section: "services",
    Icon: Newspaper,
  },
  {
    id: "referral",
    title: "Реферальная программа",
    hint: "Пригласить инвестора",
    href: ROUTES.referralProgram,
    section: "services",
    Icon: Users,
  },
];

function matchesQuery(q: string, item: SearchLinkItem) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    item.title.toLowerCase().includes(s) ||
    item.hint.toLowerCase().includes(s) ||
    item.id.includes(s)
  );
}

/** Первая подстрока совпадения — аккуратная «метка», как на референсе (тёмная тема). */
function highlightOnce(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  const a = text.slice(0, idx);
  const mid = text.slice(idx, idx + q.length);
  const b = text.slice(idx + q.length);
  return (
    <>
      {a}
      <mark className="rounded-sm bg-amber-400/28 px-0.5 text-white [box-decoration-break:clone]">{mid}</mark>
      {b}
    </>
  );
}

export function DashboardHeaderSearchLayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const filtered = React.useMemo(() => SEARCH_LINKS.filter((item) => matchesQuery(q, item)), [q]);

  const grouped = React.useMemo(() => {
    const buckets = new Map<SectionId, SearchLinkItem[]>();
    for (const id of SECTION_ORDER) buckets.set(id, []);
    for (const item of filtered) buckets.get(item.section)!.push(item);
    return SECTION_ORDER.filter((id) => (buckets.get(id)?.length ?? 0) > 0).map((id) => ({
      id,
      label: SECTION_LABEL[id],
      items: buckets.get(id)!,
    }));
  }, [filtered]);

  const flatOrdered = React.useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const goFirst = React.useCallback(() => {
    const first = flatOrdered[0];
    if (first) {
      router.push(first.href);
      onClose();
    }
  }, [flatOrdered, onClose, router]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goFirst();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-start justify-center px-3 pt-12 sm:px-4 sm:pt-14" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] supports-backdrop-filter:bg-black/70"
        aria-label="Закрыть поиск"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="header-search-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/8 bg-[#121212] text-[15px] text-zinc-200 antialiased shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
          <h2 id="header-search-title" className="text-base font-semibold tracking-tight text-white">
            Поиск
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
            aria-label="Закрыть"
          >
            <X className="size-[18px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <p className="px-5 pb-4 text-[13px] leading-snug text-zinc-500">Разделы и страницы RevShare</p>

        <div className="px-5 pb-5">
          <label htmlFor="header-search-input" className="sr-only">
            Запрос
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-zinc-500"
              strokeWidth={2}
              aria-hidden
            />
            <input
              id="header-search-input"
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Начните вводить…"
              className="h-11 w-full rounded-lg border border-white/10 bg-[#0c0c0c] py-2.5 pl-11 pr-3 text-[15px] text-white outline-none placeholder:text-zinc-600 focus-visible:border-white/18"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain px-5 pb-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-zinc-500">Нет совпадений</p>
          ) : (
            <div className="space-y-6">
              {grouped.map((group, gi) => (
                <section key={group.id} aria-label={group.label}>
                  <h3
                    className={cn(
                      "pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500",
                      gi > 0 && "pt-1",
                    )}
                  >
                    {group.label}
                  </h3>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="flex gap-3 rounded-lg py-2.5 pl-1 pr-2 transition-colors hover:bg-white/4"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-500 ring-1 ring-white/6">
                              <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium leading-snug text-zinc-100">
                                {highlightOnce(item.title, q)}
                              </span>
                              <span className="mt-0.5 block text-[13px] leading-snug text-zinc-500">
                                {highlightOnce(item.hint, q)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/6 px-5 py-3 text-center text-[11px] text-zinc-600">
          <span className="text-zinc-500">Enter</span> — первый пункт · <span className="text-zinc-500">Esc</span> —
          закрыть · <span className="text-zinc-500">Ctrl K</span> / <span className="text-zinc-500">⌘K</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
