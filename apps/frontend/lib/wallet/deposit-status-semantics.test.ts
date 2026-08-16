import { describe, expect, it } from "vitest";

import {
  depositStatusLabel,
  depositStatusToneClass,
  isDepositCreditedForUi,
} from "@/lib/wallet/status-labels";

describe("deposit status semantics", () => {
  it("does not treat CONFIRMED as credited/completed", () => {
    expect(isDepositCreditedForUi("confirmed")).toBe(false);
    expect(isDepositCreditedForUi("confirmed_waiting_credit")).toBe(false);
    expect(isDepositCreditedForUi("CONFIRMED")).toBe(false);
    expect(isDepositCreditedForUi("completed")).toBe(true);
    expect(isDepositCreditedForUi("credited")).toBe(true);
  });

  it("labels confirmed as awaiting credit, not completed", () => {
    expect(depositStatusLabel("confirmed_waiting_credit")).not.toBe("Зачислено");
    expect(depositStatusLabel("confirmed_waiting_credit")).toMatch(/ожидает/i);
    expect(depositStatusLabel("completed")).toBe("Зачислено");
    expect(depositStatusToneClass("confirmed_waiting_credit")).toBe("pending");
    expect(depositStatusToneClass("completed")).toBe("completed");
  });
});
