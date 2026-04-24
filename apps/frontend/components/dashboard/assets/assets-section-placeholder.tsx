export function AssetsSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{description}</p>
    </section>
  );
}
