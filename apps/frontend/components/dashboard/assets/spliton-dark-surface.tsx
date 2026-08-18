import type { ReactNode } from "react";

import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

/** Same fill as footer / overview — light marble on black so the wordmark reads. */
const SPLITON_TEXTURE = "/images/landing/footer-spliton-texture-fill-bw.png";

type SplitonDarkSurfaceProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Layer pinned to the rounded shell (ignores content padding). */
  overlay?: ReactNode;
  /** Show giant brand wordmark behind content. */
  watermark?: boolean;
  /** Smaller wordmark that fits fully in narrow cards. */
  watermarkCompact?: boolean;
  /** Large wordmark centered (default docks to the right on desktop). */
  watermarkCentered?: boolean;
  /** Centered / watermark label (defaults to brand name). */
  watermarkText?: string;
  /** Solid white title instead of textured fill — readable on busy video. */
  watermarkSolid?: boolean;
  /** Optional ambient video under the shell (e.g. position-holding-bg). */
  backgroundVideo?: string;
  /**
   * `ambient` — soft darkened plate (default).
   * `crisp` — sharper video, no soft scale, lighter scrim (verification heroes).
   */
  videoClarity?: "ambient" | "crisp";
  /** Accessible name for the surface. */
  "aria-label"?: string;
};

/**
 * Black Spliton bank-card shell — same watermark language as overview hero / footer.
 */
export function SplitonDarkSurface({
  children,
  className,
  contentClassName,
  overlay,
  watermark = true,
  watermarkCompact = false,
  watermarkCentered = false,
  watermarkText = BRAND.name,
  watermarkSolid = false,
  backgroundVideo,
  videoClarity = "ambient",
  "aria-label": ariaLabel,
}: SplitonDarkSurfaceProps) {
  const largeCentered = watermarkCentered && !watermarkCompact;
  const crisp = videoClarity === "crisp";
  const longMark = watermarkText.length > BRAND.name.length + 2;

  return (
    <section
      className={cn(
        "relative isolate w-full overflow-hidden rounded-[1.35rem] bg-black px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:rounded-[1.75rem] sm:px-6 sm:py-6",
        className,
      )}
      aria-label={ariaLabel}
    >
      {backgroundVideo ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className={cn(
              "absolute inset-0 h-full w-full object-cover motion-reduce:hidden",
              crisp ? "opacity-70" : "scale-105 opacity-50",
            )}
            src={backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div
            className={cn(
              "absolute inset-0 motion-reduce:bg-black",
              crisp ? "bg-black/35" : "bg-black/50",
            )}
          />
        </div>
      ) : null}

      {watermark ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex overflow-hidden",
            watermarkCompact
              ? "items-end justify-center pb-2"
              : largeCentered
                ? "items-center justify-center px-4"
                : "items-center justify-center sm:justify-end",
          )}
          aria-hidden
        >
          <p
            className={cn(
              "select-none font-bold",
              watermarkSolid
                ? "text-white"
                : "bg-clip-text text-transparent",
              watermarkCompact
                ? "whitespace-nowrap leading-none tracking-[-0.04em]"
                : largeCentered
                  ? cn(
                      "whitespace-nowrap text-center leading-[0.92]",
                      longMark ? "tracking-[-0.035em]" : "tracking-[-0.06em]",
                    )
                  : "whitespace-nowrap leading-[0.78] tracking-[-0.06em] max-sm:translate-y-[-4%] sm:absolute sm:inset-y-0 sm:right-[-8%] sm:left-[14%] sm:flex sm:translate-y-0 sm:items-center sm:justify-end",
            )}
            style={{
              fontSize: watermarkCompact
                ? "clamp(1.5rem, 9vw, 2.35rem)"
                : largeCentered
                  ? longMark
                    ? "clamp(1.35rem, 5.2vw, 3.1rem)"
                    : "clamp(3.6rem, 18vw, 9.5rem)"
                  : "clamp(3.2rem, 20vw, 14rem)",
              ...(watermarkSolid
                ? {
                    textShadow: "0 1px 18px rgba(0,0,0,0.75)",
                  }
                : {
                    backgroundImage: `url('${SPLITON_TEXTURE}')`,
                    backgroundSize: watermarkCompact ? "160% auto" : longMark ? "120% auto" : "145% auto",
                    backgroundPosition: "48% 40%",
                    backgroundRepeat: "no-repeat",
                    WebkitTextStroke: watermarkCompact
                      ? "0.4px rgba(255,255,255,0.18)"
                      : "0.6px rgba(255,255,255,0.12)",
                  }),
              maxWidth: watermarkCompact || largeCentered ? "100%" : undefined,
            }}
          >
            {watermarkText}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          crisp
            ? "bg-[radial-gradient(120%_90%_at_50%_35%,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.45)_100%)]"
            : "bg-[radial-gradient(115%_85%_at_18%_20%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.4)_100%)]",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0",
          crisp
            ? "h-[42%] bg-gradient-to-t from-black/75 via-black/25 to-transparent"
            : "h-[36%] bg-gradient-to-t from-black/80 via-black/35 to-transparent",
        )}
        aria-hidden
      />

      {overlay ? <div className="pointer-events-none absolute inset-0 z-20">{overlay}</div> : null}

      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  );
}
