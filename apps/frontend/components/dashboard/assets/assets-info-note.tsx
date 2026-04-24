import { Info } from "lucide-react";

export function AssetsInfoNote() {
  return (
    <section
      className="flex gap-3 rounded-2xl bg-neutral-50/90 px-4 py-4 ring-1 ring-neutral-200/80 sm:px-5 sm:py-4"
      aria-label="Примечание по учёту"
    >
      <span className="mt-0.5 inline-flex shrink-0 text-neutral-400" aria-hidden>
        <Info className="size-4" strokeWidth={2} />
      </span>
      <p className="text-xs leading-relaxed text-neutral-600 sm:text-sm">
        Positions и units учитываются в системе RevShare. Баланс USDT (TRC20) используется для операций с релизами через
        manual deposit или внешнего on-ramp provider. Платформа не обрабатывает fiat напрямую.
      </p>
    </section>
  );
}
