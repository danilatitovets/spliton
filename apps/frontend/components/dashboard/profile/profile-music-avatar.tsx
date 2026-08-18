"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import {
  pickProfileMusicAvatarVariant,
  type ProfileMusicAvatarVariant,
} from "@/lib/profile/profile-music-avatar";

type ProfileMusicAvatarProps = {
  userId?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
};

function HalftoneDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <pattern id={`${prefix}-dense`} width="3.4" height="3.4" patternUnits="userSpaceOnUse">
        <circle cx="1.7" cy="1.7" r="1.02" fill="#0a0a0a" />
      </pattern>
      <pattern id={`${prefix}-soft`} width="4.6" height="4.6" patternUnits="userSpaceOnUse">
        <circle cx="2.3" cy="2.3" r="0.72" fill="#0a0a0a" opacity="0.42" />
      </pattern>
      <radialGradient id={`${prefix}-fade`} cx="50%" cy="42%" r="58%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="100%" stopColor="#f4f4f4" stopOpacity="1" />
      </radialGradient>
    </defs>
  );
}

function HalftoneFill({
  prefix,
  maskId,
  density = "dense",
}: {
  prefix: string;
  maskId: string;
  density?: "dense" | "soft";
}) {
  return (
    <>
      <rect width="64" height="64" fill={`url(#${prefix}-${density})`} mask={`url(#${maskId})`} />
      <rect width="64" height="64" fill={`url(#${prefix}-soft)`} mask={`url(#${maskId})`} opacity="0.35" />
    </>
  );
}

function HalftoneSArt({ prefix }: { prefix: string }) {
  const maskId = `${prefix}-mask-s`;
  return (
    <>
      <HalftoneDefs prefix={prefix} />
      <circle cx="32" cy="32" r="30" fill={`url(#${prefix}-fade)`} />
      <mask id={maskId}>
        <rect width="64" height="64" fill="black" />
        <path
          d="M42 18c-8-2-15 3-15 11 0 6 5 9 11 10-5 1-9 5-9 11 0 7 8 12 16 10 4-1 7-3 9-6l-6-4c-1 2-3 3-5 3-3 0-5-2-5-5 0-4 4-6 9-7 7-1 13-6 13-14 0-9-8-15-18-12z"
          fill="white"
        />
      </mask>
      <HalftoneFill prefix={prefix} maskId={maskId} />
      <circle cx="48" cy="48" r="2.2" fill="#B7F500" />
    </>
  );
}

function HalftoneVinylArt({ prefix }: { prefix: string }) {
  const maskId = `${prefix}-mask-vinyl`;
  return (
    <>
      <HalftoneDefs prefix={prefix} />
      <circle cx="32" cy="32" r="30" fill={`url(#${prefix}-fade)`} />
      <mask id={maskId}>
        <rect width="64" height="64" fill="black" />
        <circle cx="32" cy="32" r="24" fill="white" />
        <circle cx="32" cy="32" r="7" fill="black" />
        <rect x="30" y="10" width="4" height="8" fill="white" />
      </mask>
      <HalftoneFill prefix={prefix} maskId={maskId} />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#0a0a0a" strokeOpacity="0.08" strokeWidth="0.8" />
    </>
  );
}

function HalftoneWaveArt({ prefix }: { prefix: string }) {
  const maskId = `${prefix}-mask-wave`;
  return (
    <>
      <HalftoneDefs prefix={prefix} />
      <circle cx="32" cy="32" r="30" fill={`url(#${prefix}-fade)`} />
      <mask id={maskId}>
        <rect width="64" height="64" fill="black" />
        <path
          d="M12 36c6-14 12-8 18-2s12 10 22-4v18H12z M14 40c5-8 11-4 17 1s13 8 21-2v12H14z"
          fill="white"
        />
        <circle cx="46" cy="22" r="5" fill="white" />
      </mask>
      <HalftoneFill prefix={prefix} maskId={maskId} />
    </>
  );
}

function HalftoneOrbitArt({ prefix }: { prefix: string }) {
  const maskId = `${prefix}-mask-orbit`;
  return (
    <>
      <HalftoneDefs prefix={prefix} />
      <circle cx="32" cy="32" r="30" fill={`url(#${prefix}-fade)`} />
      <mask id={maskId}>
        <rect width="64" height="64" fill="black" />
        <ellipse cx="32" cy="32" rx="22" ry="9" fill="white" transform="rotate(-22 32 32)" />
        <ellipse cx="32" cy="32" rx="22" ry="9" fill="white" transform="rotate(48 32 32)" />
        <circle cx="32" cy="32" r="6.5" fill="white" />
        <circle cx="32" cy="32" r="3" fill="black" />
      </mask>
      <HalftoneFill prefix={prefix} maskId={maskId} />
    </>
  );
}

const ART: Record<ProfileMusicAvatarVariant, typeof HalftoneSArt> = {
  halftoneS: HalftoneSArt,
  halftoneVinyl: HalftoneVinylArt,
  halftoneWave: HalftoneWaveArt,
  halftoneOrbit: HalftoneOrbitArt,
};

export function ProfileMusicAvatar({ userId, email, size, className }: ProfileMusicAvatarProps) {
  const variant = pickProfileMusicAvatarVariant(userId, email);
  const Art = ART[variant];
  const prefix = useId().replace(/:/g, "");

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.08)]",
        size == null && "size-20",
        className,
      )}
      style={size != null ? { width: size, height: size } : undefined}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="size-full" role="presentation">
        <Art prefix={prefix} />
      </svg>
    </div>
  );
}
