"use client";

import NextImage from "next/image";

import { cn } from "@/lib/utils";

const WALLETS = [
  { id: "metamask", label: "MetaMask", src: "/images/landing/wallets/metamask.svg" },
  { id: "trust", label: "Trust Wallet", src: "/images/landing/wallets/trustwallet.svg" },
  { id: "walletconnect", label: "WalletConnect", src: "/images/landing/wallets/walletconnect.svg" },
  { id: "coinbase", label: "Coinbase", src: "/images/landing/wallets/coinbase.svg" },
  { id: "tether", label: "USDT", src: "/images/landing/wallets/tether.svg" },
  { id: "tron", label: "TRON", src: "/images/landing/wallets/tron.svg" },
  { id: "binance", label: "Binance", src: "/images/landing/wallets/binance.svg" },
  { id: "okx", label: "OKX", src: "/images/landing/wallets/okx.svg" },
] as const;

export function DashboardLandingLogoStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:gap-x-10 sm:overflow-visible md:gap-x-12 lg:gap-x-14 [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="Supported wallets and rails"
    >
      {WALLETS.map((w) => (
        <div
          key={w.id}
          className="flex h-7 shrink-0 items-center gap-2 opacity-[0.72] transition hover:opacity-100 sm:h-8"
          title={w.label}
        >
          <NextImage
            src={w.src}
            alt={w.label}
            width={28}
            height={28}
            className="size-5 object-contain sm:size-6"
            unoptimized
          />
          <span className="hidden text-[13px] font-[510] tracking-[-0.012em] text-white/[0.88] sm:inline [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]">
            {w.label}
          </span>
        </div>
      ))}
    </div>
  );
}