"use client";

export function PortfolioOverviewSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6" aria-hidden>
      <div className="rounded-[1.35rem] bg-black px-5 py-6 sm:px-7 sm:py-8">
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-12 w-44 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-3 h-4 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-11 flex-1 animate-pulse rounded-full bg-white/10 sm:flex-none sm:w-28" />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5">
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-200/80" />
            <div className="mt-3 h-5 w-28 animate-pulse rounded bg-neutral-200/80" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
        <div className="rounded-2xl bg-neutral-50 px-4 py-5 sm:px-5">
          <div className="h-5 w-28 animate-pulse rounded bg-neutral-200/80" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-50 px-4 py-5 sm:px-5">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200/80" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
