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
      <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h2>
      {subtitle ? (
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 md:text-sm">{subtitle}</p>
      ) : null}
    </div>
  );
}
