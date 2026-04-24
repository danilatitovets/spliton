import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CatalogTrackCard } from "@/components/dashboard/catalog-track-card";
import { ROUTES } from "@/constants/routes";
import { catalogGridClass } from "@/lib/catalog/catalog-filter";
import { catalogItems } from "@/lib/catalog-mock";
import { cn } from "@/lib/utils";

const previewItems = catalogItems.slice(0, 3);

export function DashboardCatalog({ className }: { className?: string }) {
  return (
    <section id="catalog" className={cn("min-w-0 scroll-mt-24", className)}>
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Каталог</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">Выберите проект для входа</h2>
          <p className="mt-2 max-w-lg text-sm text-zinc-500">
            Те же карточки, что в каталоге: быстрый вход в релиз или переход ко всем позициям.
          </p>
        </div>
        <Link
          href={ROUTES.dashboardCatalog}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-zinc-200 transition hover:text-[#d4f570]"
        >
          Смотреть все
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>

      <div className={cn(catalogGridClass("grid"), "max-w-[1600px]")}>
        {previewItems.map((item) => (
          <CatalogTrackCard key={item.id} item={item} variant="card" size="large" />
        ))}
      </div>
      <div className="mt-4">
        <Link
          href={ROUTES.dashboardCatalog}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          Перейти в полный каталог
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
        </div>
    </section>
  );
}
