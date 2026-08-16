"use client";

import Image from "next/image";

import {
  ASSETS_EMPTY_SITUATIONS,
  type AssetsEmptySituation,
} from "@/constants/assets/assets-empty-icons";
import { cn } from "@/lib/utils";

type AssetsEmptyIllustrationProps = {
  situation: AssetsEmptySituation;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** light = gray art on pale surfaces; dark = soft white art on black panels */
  tone?: "light" | "dark";
};

const sizeClass = {
  sm: "max-w-[96px]",
  md: "max-w-[128px]",
  lg: "max-w-[160px]",
} as const;

/**
 * Empty-state icons: knock out the PNG black plate.
 * light — soft gray on pale UI; dark — soft white on black panels.
 */
export function AssetsEmptyIllustration({
  situation,
  className,
  size = "md",
  tone = "light",
}: AssetsEmptyIllustrationProps) {
  const src = ASSETS_EMPTY_SITUATIONS[situation];

  return (
    <div className={cn("mx-auto w-full", sizeClass[size], className)} aria-hidden>
      <Image
        src={src}
        alt=""
        width={320}
        height={320}
        className={cn(
          "h-auto w-full object-contain",
          tone === "dark"
            ? "invert opacity-55"
            : "invert mix-blend-multiply opacity-40",
        )}
        sizes={size === "lg" ? "160px" : size === "sm" ? "96px" : "128px"}
      />
    </div>
  );
}