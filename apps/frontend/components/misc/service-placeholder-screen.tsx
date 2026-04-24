import { DashboardHeader } from "@/components/dashboard/dashboard-header";

type ServicePlaceholderScreenProps = {
  title: string;
  description: string;
};

/** Единая заглушка для страниц из вкладки «Сервисы» в хедере. */
export function ServicePlaceholderScreen({ title, description }: ServicePlaceholderScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200/90 bg-white px-5 py-7 shadow-sm sm:px-7 sm:py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Сервисы</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">{description}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
