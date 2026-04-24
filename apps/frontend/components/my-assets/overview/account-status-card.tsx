import { accountStatuses } from "@/components/my-assets/overview/mock-data";

export function AccountStatusCard() {
  return (
    <section className="rounded-md border border-neutral-200 bg-white">
      <header className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Статусы аккаунта</h3>
      </header>

      <div className="space-y-2 p-4">
        {accountStatuses.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-white px-3 py-2"
          >
            <span className="text-xs text-neutral-500">{item.label}</span>
            <span className={item.tone === "ok" ? "text-xs font-medium text-lime-700" : "text-xs font-medium text-neutral-900"}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
