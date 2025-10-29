import type { Day } from "./assignCore";

export type Violation = {
  id: string;
  date: string;
  start: string;
  end: string;
  detail?: string;
  priority: "A" | "B" | "C";
};

type RuleA = {
  id: string;
  start: string;
  end: string;
  exact: number;
};

type RuleB = {
  id: string;
  start: string;
  end: string;
  min: number;
  max: number;
};

export function validate(schedule: Day[], rules: any) {
  const violations: Violation[] = [];

  const ruleAList: RuleA[] = Array.isArray(rules?.A) ? rules.A : [];
  const ruleBList: RuleB[] = Array.isArray(rules?.B) ? rules.B : [];

  schedule.forEach((day) => {
    ruleAList.forEach((rule) => {
      const slot = day.slots.find(
        (candidate) =>
          candidate.start === rule.start && candidate.end === rule.end
      );

      const assignedCount = slot?.staffIds?.length ?? 0;
      if (assignedCount !== rule.exact) {
        violations.push({
          id: rule.id,
          date: day.date,
          start: rule.start,
          end: rule.end,
          priority: "A",
          detail: `expected ${rule.exact}, actual ${assignedCount}`,
        });
      }
    });

    ruleBList.forEach((rule) => {
      const slot = day.slots.find(
        (candidate) =>
          candidate.start === rule.start && candidate.end === rule.end
      );

      const assignedCount = slot?.staffIds?.length ?? 0;
      if (assignedCount < rule.min || assignedCount > rule.max) {
        violations.push({
          id: rule.id,
          date: day.date,
          start: rule.start,
          end: rule.end,
          priority: "B",
          detail: `expected between ${rule.min}-${rule.max}, actual ${assignedCount}`,
        });
      }
    });
  });

  return { violations };
}
