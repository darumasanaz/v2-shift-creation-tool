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
  it("全日 18–21 は 2〜3名の範囲", () => {
    const schedule = assignCore({ staff, rules, demand, month });
    schedule.forEach((day) => {
      const slot = getSlot(day.slots, "18:00", "21:00");
      expect(slot.staffIds.length).toBeGreaterThanOrEqual(2);
      expect(slot.staffIds.length).toBeLessThanOrEqual(3);
      expect(new Set(slot.staffIds).size).toBe(slot.staffIds.length);
    });
  });

  it("18–21 のスタッフ数を1名に減らすと validate が違反を出す", () => {
    const schedule = assignCore({ staff, rules, demand, month });
    const firstDay = schedule[0];
    const slot = getSlot(firstDay.slots, "18:00", "21:00");
    slot.staffIds = slot.staffIds.slice(0, 1);

    const result = validate(schedule, rules, staff);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "B_evening_18_21_range",
          date: firstDay.date,
          start: "18:00",
          end: "21:00",
          priority: "B",
        }),
      ])
    );
  });

  it("18–21 のスタッフ数を4名に増やすと validate が違反を出す", () => {
    const schedule = assignCore({ staff, rules, demand, month });
    const firstDay = schedule[0];
    const slot = getSlot(firstDay.slots, "18:00", "21:00");
    slot.staffIds = [...slot.staffIds, "extra-1", "extra-2"];

    const result = validate(schedule, rules, staff);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "B_evening_18_21_range",
          date: firstDay.date,
          start: "18:00",
          end: "21:00",
          priority: "B",
        }),
      ])
    );
  });

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

    const result = validate(schedule, rules, staff);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "A_night_21_23_exact2",
          date: firstDay.date,
          start: "21:00",
          end: "23:00",
          priority: "A",
        }),
      ])
    );
  });

  it("希望休が尊重される（十分なスタッフがいる場合）", () => {
    const customStaff = [
      {
        id: "A",
        name: "Alice",
        roles: ["day", "night"],
        preferredDaysOff: ["2025-11-01"],
      },
      { id: "B", name: "Bob", roles: ["day", "night"] },
      { id: "C", name: "Carol", roles: ["day", "night"] },
    ];

    const schedule = assignCore({ staff: customStaff, rules, demand, month });
    const targetDay = schedule.find((day) => day.date === "2025-11-01");
    expect(targetDay).toBeDefined();
    targetDay?.slots.forEach((slot) => {
      expect(slot.staffIds).not.toContain("A");
    });
  });

  it("希望休が満たせない場合は違反を検出", () => {
    const shortageStaff = [
      {
        id: "A",
        name: "Alice",
        roles: ["day", "night"],
        preferredDaysOff: ["2025-11-01"],
      },
      { id: "B", name: "Bob", roles: ["day", "night"] },
    ];

    const schedule = assignCore({ staff: shortageStaff, rules, demand, month });
    const targetDay = schedule.find((day) => day.date === "2025-11-01");
    expect(targetDay).toBeDefined();
    expect(
      targetDay?.slots.some((slot) => slot.staffIds.includes("A"))
    ).toBe(true);

    const result = validate(schedule, rules, shortageStaff);
    expect(result.violations).toEqual([
      expect.objectContaining({
        id: "C_day_off_violation",
        date: "2025-11-01",
        staffId: "A",
        detail: "希望休違反",
        priority: "C",
      }),
    ]);
  });
});
