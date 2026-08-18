import { describe, expect, it } from "vitest";

import { pickProfileMusicAvatarVariant, profileAvatarSeed } from "@/lib/profile/profile-music-avatar";

describe("profile music avatar", () => {
  it("picks a stable variant for the same user id", () => {
    const id = "53b0147c-851b-43d1-b782-2bcef41593fe";
    expect(pickProfileMusicAvatarVariant(id, null)).toBe(pickProfileMusicAvatarVariant(id, null));
  });

  it("falls back to email when id is missing", () => {
    expect(pickProfileMusicAvatarVariant(null, "admin@spliton.io")).toBe(
      pickProfileMusicAvatarVariant(undefined, "admin@spliton.io"),
    );
  });

  it("returns one of the halftone music variants", () => {
    const variant = pickProfileMusicAvatarVariant("user-1", "user@spliton.io");
    expect(["halftoneS", "halftoneVinyl", "halftoneWave", "halftoneOrbit"]).toContain(variant);
    expect(profileAvatarSeed("user-1")).toBeGreaterThan(0);
  });
});
