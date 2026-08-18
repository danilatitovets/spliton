"use client";

export function PortfolioOverviewSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4" aria-hidden>
      <div className="rounded-[1.5rem] bg-black px-5 py-6 sm:px-7">
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-12 w-44 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-3 h-4 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-8 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[5.25rem] animate-pulse rounded-[1.15rem] bg-white/10" />
          ))}
        </div>
      </div>

      <div className="rounded-[1.35rem] bg-[#1C1C1C] p-5">
        <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-9 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[1.25rem] bg-[#111111] px-5 py-4">
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] bg-[#111111] px-5 py-4">
          <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
