import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";

export default function SecondaryMarketListingNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-black text-white antialiased">
      <DashboardHeader sticky={false} />
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Вторичный рынок</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Лот не найден</h1>
        <p className="mt-2 text-sm text-zinc-500">Проверьте ссылку или вернитесь к списку предложений на вторичке.</p>
        <Link
          href={secondaryMarketHref("market")}
          className="mx-auto mt-8 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold text-black hover:opacity-90"
        >
          На рынок
        </Link>
      </div>
    </div>
  );
}
