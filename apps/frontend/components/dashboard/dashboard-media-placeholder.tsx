import NextImage from "next/image";

import { cn } from "@/lib/utils";

/** White Spliton wordmark — not the black-on-white square tile. */
export const SPLITON_COVER_PLACEHOLDER = "/images/LOGO/white-logo.png";

type MediaPlaceholderProps = {
  label?: string;
  className?: string;
  frameless?: boolean;
  aspectClassName?: string;
  showLabel?: boolean;
};

/** Dark cover when photography is missing — white Spliton logo on smoky glow. */
export function MediaPlaceholder({
  label,
  className,
  frameless = false,
  aspectClassName = "aspect-[4/3]",
  showLabel = false,
}: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black",
        !frameless && "border border-white/[0.06]",
        aspectClassName,
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 size-[70%] rounded-full bg-[#3a6cff]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 size-[65%] rounded-full bg-[#c47a2c]/20 blur-3xl"
      />
      <div className="absolute inset-0 flex items-center justify-center p-[18%]">
        <NextImage
          src={SPLITON_COVER_PLACEHOLDER}
          alt=""
          width={480}
          height={160}
          className="h-auto w-full max-w-[220px] object-contain opacity-95"
        />
      </div>
      {showLabel && label ? (
        <span className="absolute inset-x-0 bottom-2 z-10 px-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
          {label}
        </span>
      ) : null}
      <span className="sr-only">{label ?? "Spliton"}</span>
    </div>
  );
}
