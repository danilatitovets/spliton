export function AccountStatementCard() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-neutral-900">Выписка по аккаунту</h2>

      <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-neutral-300 text-neutral-500">
          !
        </div>
        <p className="text-lg font-semibold text-neutral-900">Записей пока нет</p>
        <p className="mt-1 text-sm text-neutral-500">История появится после первой операции.</p>
      </div>
    </section>
  );
}
