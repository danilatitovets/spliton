export type ProfileMusicAvatarVariant =
  | "halftoneS"
  | "halftoneVinyl"
  | "halftoneWave"
  | "halftoneOrbit";

const VARIANTS: ProfileMusicAvatarVariant[] = [
  "halftoneS",
  "halftoneVinyl",
  "halftoneWave",
  "halftoneOrbit",
];

/** Stable FNV-1a hash for deterministic avatar selection. */
export function profileAvatarSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickProfileMusicAvatarVariant(
  userId: string | null | undefined,
  email: string | null | undefined,
): ProfileMusicAvatarVariant {
  const key = userId?.trim() || email?.trim() || "spliton";
  return VARIANTS[profileAvatarSeed(key) % VARIANTS.length]!;
}
