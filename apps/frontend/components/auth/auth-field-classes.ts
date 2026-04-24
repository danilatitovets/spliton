import { cn } from "@/lib/utils";

export const AUTH_FIELD_BORDER = "#E5E5E5";

export const authFieldClassName = cn(
  "h-[52px] w-full rounded-xl border bg-white px-4 text-[15px] text-neutral-900 shadow-none transition-[box-shadow,border-color]",
  "placeholder:text-neutral-400",
  "focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10",
  "aria-invalid:border-rose-400 aria-invalid:ring-[3px] aria-invalid:ring-rose-500/15"
);
