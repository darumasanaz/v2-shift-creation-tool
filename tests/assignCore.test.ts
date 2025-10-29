import { describe, it, expect } from "vitest";
import { assignCore } from "../logic/assignCore";
import { validate } from "../logic/validate";
import staff from "../data/staff.json";
import rules from "../data/rules.json";
import demand from "../data/demand.json";

describe("bootstrap", () => {
  it("空スケジュールでもvalidateが動く", () => {
    const schedule = assignCore({ staff, rules, demand, month: "2025-11" });
    const result = validate(schedule, rules);
    expect(Array.isArray(result.violations)).toBe(true);
  });
});
