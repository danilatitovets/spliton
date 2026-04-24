type PayoutsSubpageHeroProps = {
  eyebrow: string;
  title: string;
  /** Дополнительный абзац под заголовком; если не передан — не рендерится. */
  description?: string;
};

export function PayoutsSubpageHero({ eyebrow, title, description }: PayoutsSubpageHeroProps) {
  return (
    <header className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{eyebrow}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]">{title}</h1>
      {description ? <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">{description}</p> : null}
    </header>
  );
}
