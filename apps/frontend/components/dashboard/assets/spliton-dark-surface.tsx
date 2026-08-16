import type { ReactNode } from "react";

import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

/** Same fill as footer / overview — light marble on black so the wordmark reads. */
const SPLITON_TEXTURE = "/images/landing/footer-spliton-texture-fill-bw.png";
const FILL_TILE = { w: 340, h: 72 } as const;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Repeating phrase used as the wordmark fill instead of the marble photo. */
function watermarkPhraseFill(phrase: string) {
  const text = escapeXml(phrase);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${FILL_TILE.w}" height="${FILL_TILE.h}" viewBox="0 0 ${FILL_TILE.w} ${FILL_TILE.h}"><g fill="#e8e8e8" font-family="ui-sans-serif,system-ui,sans-serif" font-size="17" font-weight="600" letter-spacing="0.04em"><text x="0" y="28">${text}</text><text x="-96" y="62">${text}</text></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

type SplitonDarkSurfaceProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Show giant brand wordmark behind content. */
  watermark?: boolean;
  /** Smaller wordmark that fits fully in narrow cards. */
  watermarkCompact?: boolean;
  /** Large wordmark centered (default docks to the right on desktop). */
  watermarkCentered?: boolean;
  /** Clip this phrase into the giant wordmark as a tiled fill. */
  watermarkFillText?: string;
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
  watermark = true,
  watermarkCompact = false,
  watermarkCentered = false,
  watermarkFillText,
  backgroundVideo,
  videoClarity = "ambient",
  "aria-label": ariaLabel,
}: SplitonDarkSurfaceProps) {
  const largeCentered = watermarkCentered && !watermarkCompact;
  const crisp = videoClarity === "crisp";
  const phraseFill = watermarkFillText ? watermarkPhraseFill(watermarkFillText) : null;

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
                ? "items-center justify-center"
                : "items-center justify-center sm:justify-end",
          )}
          aria-hidden
        >
          <p
            className={cn(
              "select-none whitespace-nowrap bg-clip-text font-bold text-transparent",
              watermarkCompact
                ? "leading-none tracking-[-0.04em]"
                : largeCentered
                  ? "leading-[0.78] tracking-[-0.06em]"
                  : "leading-[0.78] tracking-[-0.06em] max-sm:translate-y-[-4%] sm:absolute sm:inset-y-0 sm:right-[-8%] sm:left-[14%] sm:flex sm:translate-y-0 sm:items-center sm:justify-end",
            )}
            style={{
              fontSize: watermarkCompact
                ? "clamp(1.5rem, 9vw, 2.35rem)"
                : largeCentered
                  ? "clamp(3.6rem, 18vw, 9.5rem)"
                  : "clamp(3.2rem, 20vw, 14rem)",
              backgroundImage: phraseFill ?? `url('${SPLITON_TEXTURE}')`,
              backgroundSize: phraseFill
                ? `${FILL_TILE.w}px ${FILL_TILE.h}px`
                : watermarkCompact
                  ? "160% auto"
                  : "145% auto",
              backgroundPosition: phraseFill ? "center" : "48% 40%",
              backgroundRepeat: phraseFill ? "repeat" : "no-repeat",
              WebkitTextStroke: watermarkCompact
                ? "0.4px rgba(255,255,255,0.18)"
                : "0.6px rgba(255,255,255,0.12)",
              maxWidth: watermarkCompact || largeCentered ? "100%" : undefined,
              textAlign: watermarkCompact || largeCentered ? "center" : undefined,
            }}
          >
            {BRAND.name}
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

      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  );
}
