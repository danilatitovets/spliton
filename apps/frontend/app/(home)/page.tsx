import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-6 py-16 text-center text-white">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">RevShare</p>
        <p className="max-w-sm text-sm text-white/60">
          Платформа revenue share для музыкальных треков. Вход доступен по ссылке ниже.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={ROUTES.dashboard}
          className="rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-100 transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/25"
        >
          Открыть кабинет
        </Link>
        <Link
          href={ROUTES.login}
          className="rounded-xl border border-white/15 bg-white/6 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
        >
          Вход
        </Link>
      </div>
    </main>
  );
}
