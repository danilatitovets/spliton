import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const TITLE_DEFAULT = "text-xl font-semibold tracking-tight text-white md:text-2xl";

/** Единый размер заголовка секции на плотных экранах (листинг и т.п.). */
export const DETAIL_SECTION_TITLE_COMPACT = "text-lg font-semibold tracking-tight text-white md:text-xl";

export function DetailSection({
  eyebrow,
  title,
  titleAside,
  titleClassName,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  /** Элемент справа от заголовка (например, кнопка-ссылка). */
  titleAside?: ReactNode;
  /** Переопределение размера/стиля заголовка (последним в `cn`, перебивает дефолт). */
  titleClassName?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-10 border-t border-white/8 pt-8 md:mt-12 md:pt-10", className)}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
      ) : null}
      {titleAside ? (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
            eyebrow ? "mt-2" : undefined,
          )}
        >
          <h2 className={cn("min-w-0 flex-1", TITLE_DEFAULT, titleClassName)}>{title}</h2>
          <div className="shrink-0">{titleAside}</div>
        </div>
      ) : (
        <h2 className={cn(TITLE_DEFAULT, eyebrow ? "mt-2" : undefined, titleClassName)}>{title}</h2>
      )}
      {description ? <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-zinc-500">{description}</p> : null}
      <div className={cn(description ? "mt-6" : "mt-5")}>{children}</div>
    </section>
  );
}
