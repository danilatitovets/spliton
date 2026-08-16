"use client";

export function MetricsPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5" aria-hidden>
      <div className="rounded-[1.5rem] bg-black px-5 py-6 sm:px-6">
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-7 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-6 grid gap-2 sm:grid-cols-3 sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[5.5rem] animate-pulse rounded-[1.15rem] bg-[#1c1c1e]" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-[22rem] animate-pulse rounded-2xl bg-neutral-50" />
        ))}
      </div>

      <div className="h-[18rem] max-w-xl animate-pulse rounded-2xl bg-neutral-50" />
    </div>
  );
}
