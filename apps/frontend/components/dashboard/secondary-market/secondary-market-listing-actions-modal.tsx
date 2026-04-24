"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { secondaryMarketBookHref, secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleaseDetailPath, secondaryMarketListingInfoPath } from "@/constants/routes";
import { cn } from "@/lib/utils";

type SecondaryMarketListingActionsModalProps = {
  listingId: string;
  /** Id строки `/analytics/releases/[id]` — карточка актива (выплаты, доходность), не торговая вкладка вторички. */
  analyticsCatalogId: string;
  symbol: string;
  track: string;
  artist: string;
  bookId: string | null;
  compactTrigger?: boolean;
};

export function SecondaryMarketListingActionsModal({
  listingId,
  analyticsCatalogId,
  symbol,
  track,
  artist,
  bookId,
  compactTrigger = false,
}: SecondaryMarketListingActionsModalProps) {
  const router = useRouter();

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-white/15 text-[11px] font-medium text-zinc-300 transition hover:border-white/25 hover:text-white",
          compactTrigger ? "h-7 px-2.5" : "h-8 px-3",
        )}
      >
        Действия
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-120 bg-black/70 backdrop-blur-[2px]",
            "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-121 w-[min(100vw-1.5rem,420px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-[#101010] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 md:p-6",
            "transition-[opacity,transform] duration-200",
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          )}
        >
          <Dialog.Close
            aria-label="Закрыть"
            className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
          >
            <X className="size-4" />
          </Dialog.Close>

          <Dialog.Title className="pr-10 text-[17px] font-semibold tracking-tight text-white">Действия с лотом</Dialog.Title>
          <Dialog.Description className="mt-1 text-[12px] leading-relaxed text-zinc-500">
            <span className="block">{track} · {artist} · {symbol}</span>
            <span className="mt-1.5 block text-[11px] text-zinc-600">
              Публичное предложение на вторичке — не страница вашей продажи.
            </span>
          </Dialog.Description>

          <div className="mt-5 space-y-2">
            {bookId ? (
              <button
                type="button"
                title="Экран заявок: покупка и продажа units по инструменту"
                onClick={() => router.replace(secondaryMarketBookHref(bookId), { scroll: false })}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
              >
                Открыть стакан
              </button>
            ) : (
              <Link
                href={secondaryMarketHref("market")}
                title="Перейти к рынку заявок"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
              >
                Открыть рынок
              </Link>
            )}

            <Link
              href={`${analyticsReleaseDetailPath(analyticsCatalogId)}?from=secondary`}
              scroll={false}
              title="Выплаты, доходность, revenue share и performance — карточка актива"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 text-[13px] font-semibold text-zinc-200 transition hover:border-white/25 hover:text-white"
            >
              Открыть релиз
            </Link>

            <Link
              href={secondaryMarketListingInfoPath(listingId)}
              title="Цена за unit, объём, лента сделок по этому лоту"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 text-[13px] font-semibold text-zinc-300 transition hover:border-white/20 hover:text-zinc-100"
            >
              Подробнее о лоте
            </Link>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
            <span className="font-medium text-zinc-500">Стакан</span> — сделки по units ·{" "}
            <span className="font-medium text-zinc-500">Лот</span> — условия предложения ·{" "}
            <span className="font-medium text-zinc-500">Релиз</span> — сам актив, не лот.
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
