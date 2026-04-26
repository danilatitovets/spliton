"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import type { PositionPreviewItem } from "@/components/dashboard/assets/assets-mock-data";
import {
  ROUTES,
  assetsSellUnitsPath,
  catalogBuyUnitsPath,
  catalogMarketOverviewReleaseAnalyticsPath,
  catalogMarketOverviewReleaseTablePath,
} from "@/constants/routes";
import { cn } from "@/lib/utils";

type PositionActionsModalProps = {
  row: PositionPreviewItem;
};

export function PositionActionsModal({ row }: PositionActionsModalProps) {
  const hasCatalogId = Boolean(row.catalogReleaseId);
  const catalogId = row.catalogReleaseId ?? "";
  const ownedUnits = typeof row.heldUnits === "number" && Number.isFinite(row.heldUnits)
    ? row.heldUnits
    : Number(row.units.replace(/\s/g, ""));

  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-neutral-900 px-3 text-xs font-semibold text-white transition hover:bg-neutral-800">
        Действия
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-120 bg-black/60 backdrop-blur-[2px]",
            "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />

        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-121 w-[min(100vw-1.5rem,420px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] ring-1 ring-black/5 md:p-6",
            "transition-[opacity,transform] duration-200",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          )}
        >
          <Dialog.Close
            aria-label="Закрыть"
            className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <X className="size-4" />
          </Dialog.Close>

          <Dialog.Title className="text-[18px] font-semibold tracking-tight text-zinc-950">Действия по позиции</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] text-zinc-600">
            {row.release} · {row.artist}
          </Dialog.Description>
          <p className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-[12px] text-zinc-600">
            Ваши units: <span className="font-mono font-semibold text-zinc-900">{ownedUnits.toLocaleString("ru-RU")}</span>
            {hasCatalogId ? (
              <>
                {" "}
                · ID релиза: <span className="font-mono font-semibold text-zinc-900">{catalogId}</span>
              </>
            ) : null}
          </p>

          <div className="mt-5 space-y-2">
            {hasCatalogId ? (
              <>
                <Link
                  href={assetsSellUnitsPath(catalogId)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-[13px] font-semibold text-white transition hover:bg-neutral-800"
                >
                  Продать UNT
                </Link>
                <Link
                  href={catalogBuyUnitsPath(catalogId)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-[13px] font-semibold text-neutral-800 transition hover:bg-neutral-100"
                >
                  Купить ещё
                </Link>
                <Link
                  href={catalogMarketOverviewReleaseAnalyticsPath(catalogId)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Аналитика релиза
                </Link>
                <Link
                  href={catalogMarketOverviewReleaseTablePath(catalogId)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Открыть рынок
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.dashboardCatalog}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-[13px] font-semibold text-white transition hover:bg-neutral-800"
                >
                  Открыть каталог
                </Link>
                <Link
                  href={ROUTES.catalogReleaseParameters}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-[13px] font-semibold text-neutral-800 transition hover:bg-neutral-100"
                >
                  Параметры релиза
                </Link>
              </>
            )}
          </div>

        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
