import { describe, expect, it } from "vitest";

import { isConfirmControlReached } from "@/lib/legal/is-confirm-control-reached";

describe("isConfirmControlReached", () => {
  it("unlocks when the confirm control has entered the viewport", () => {
    const el = {
      getBoundingClientRect: () => ({ top: 700, bottom: 760, left: 0, right: 0, width: 0, height: 60 }),
    } as unknown as Element;

    expect(isConfirmControlReached(el, 800)).toBe(true);
  });

  it("stays locked while the confirm control is still below the viewport", () => {
    const el = {
      getBoundingClientRect: () => ({ top: 960, bottom: 1020, left: 0, right: 0, width: 0, height: 60 }),
    } as unknown as Element;

    expect(isConfirmControlReached(el, 800)).toBe(false);
  });

  it("does not require the page footer to be scrolled into view", () => {
    const el = {
      getBoundingClientRect: () => ({ top: 500, bottom: 560, left: 0, right: 0, width: 0, height: 60 }),
    } as unknown as Element;

    expect(isConfirmControlReached(el, 800)).toBe(true);
  });

  it("returns false without an element", () => {
    expect(isConfirmControlReached(null, 800)).toBe(false);
  });
});
