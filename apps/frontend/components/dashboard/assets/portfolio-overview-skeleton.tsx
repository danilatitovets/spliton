"use client";

export function PortfolioOverviewSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5" aria-hidden>
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

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-neutral-50 px-3.5 py-3">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200/80" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-neutral-200/80" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,22rem)]">
        <div className="rounded-2xl bg-neutral-50 px-4 py-4">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200/80" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-50 px-4 py-4">
          <div className="h-5 w-48 animate-pulse rounded bg-neutral-200/80" />
          <div className="mt-8 flex flex-col items-center">
            <div className="size-11 animate-pulse rounded-full bg-neutral-200/80" />
            <div className="mt-3 h-9 w-32 animate-pulse rounded-full bg-neutral-200/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
