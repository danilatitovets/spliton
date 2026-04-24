import { cn } from "@/lib/utils";

export function GuideSectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        align === "left" && "max-w-3xl text-left",
        className,
      )}
    >
      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-500 md:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}
