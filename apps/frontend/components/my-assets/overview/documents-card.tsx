import Link from "next/link";

import { documents } from "@/components/my-assets/overview/mock-data";

export function DocumentsCard() {
  return (
    <section className="rounded-md border border-neutral-200 bg-white">
      <header className="border-b border-neutral-200 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-neutral-900">Документы и материалы</h3>
      </header>

      <div className="divide-y divide-neutral-200">
        {documents.map((item) => (
          <article key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="truncate text-sm text-neutral-900">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                {item.type} - updated {item.updatedAt}
              </p>
            </div>

            <Link
              href={item.href}
              className="inline-flex h-8 shrink-0 items-center rounded-sm border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Открыть
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
