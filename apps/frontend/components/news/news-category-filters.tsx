"use client";

import type { NewsCategoryFilterId } from "@/constants/news-mock-data";
import { NEWS_CATEGORY_FILTERS } from "@/constants/news-mock-data";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type NewsCategoryFiltersProps = {
  active: NewsCategoryFilterId;
  onChange: (id: NewsCategoryFilterId) => void;
  className?: string;
};

export function NewsCategoryFilters({ active, onChange, className }: NewsCategoryFiltersProps) {
  const { t } = useI18n();

  return (
    <nav
      className={cn(
        "flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label={t("news.blogTitle")}
    >
      {NEWS_CATEGORY_FILTERS.map((item) => {
        const selected = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-3.5 py-2 text-[13px] font-medium transition",
              selected
                ? "bg-white text-black"
                : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1] hover:text-white",
            )}
            aria-current={selected ? "page" : undefined}
          >
            {t(`news.category.${item.id}`)}
          </button>
        );
      })}
    </nav>
  );
}