import { describe, it, expect } from "vitest";
import { assignCore } from "../logic/assignCore";
import { validate } from "../logic/validate";
import staff from "../data/staff.json";
import rules from "../data/rules.json";
import demand from "../data/demand.json";

const month = "2025-11";

function getSlot(daySlots: { start: string; end: string; staffIds: string[] }[], start: string, end: string) {
  const slot = daySlots.find((item) => item.start === start && item.end === end);
  if (!slot) {
    throw new Error(`Slot ${start}-${end} not found`);
  }
  return slot;
}

describe("assignCore night scheduling", () => {
  it("全日 21–23 はちょうど2名", () => {
    const schedule = assignCore({ staff, rules, demand, month });
    schedule.forEach((day) => {
      const slot = getSlot(day.slots, "21:00", "23:00");
      expect(slot.staffIds).toHaveLength(2);
      expect(new Set(slot.staffIds).size).toBe(2);
    });
  });

  it("全日 00–07 はちょうど2名", () => {
    const schedule = assignCore({ staff, rules, demand, month });
    schedule.forEach((day) => {
      const slot = getSlot(day.slots, "00:00", "07:00");
      expect(slot.staffIds).toHaveLength(2);
      expect(new Set(slot.staffIds).size).toBe(2);
    });
  });

  it("意図的に1人に改変すると validate が違反を1件検出", () => {
    const schedule = assignCore({ staff, rules, demand, month });
    const firstDay = schedule[0];
    const slot = getSlot(firstDay.slots, "21:00", "23:00");
    slot.staffIds = slot.staffIds.slice(0, 1);

    const result = validate(schedule, rules);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatchObject({
      id: "A_night_21_23_exact2",
      date: firstDay.date,
      start: "21:00",
      end: "23:00",
      priority: "A",
    });
  });
});
