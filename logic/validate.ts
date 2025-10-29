import type { Day, StaffMember } from "./assignCore";

export type Violation = {
  id: string;
  date: string;
  start?: string;
  end?: string;
  staffId?: string;
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

export function validate(schedule: Day[], rules: any, staff?: StaffMember[]) {
  const violations: Violation[] = [];

  const ruleAList: RuleA[] = Array.isArray(rules?.A) ? rules.A : [];
  const ruleBList: RuleB[] = Array.isArray(rules?.B) ? rules.B : [];

  const preferredDaysOffByStaff = new Map<string, Set<string>>();
  if (Array.isArray(staff)) {
    staff.forEach((member) => {
      if (Array.isArray(member.preferredDaysOff) && member.preferredDaysOff.length > 0) {
        preferredDaysOffByStaff.set(
          member.id,
          new Set(member.preferredDaysOff)
        );
      }
    });
  }
  const preferredDayOffSeen = new Set<string>();

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

    if (preferredDaysOffByStaff.size > 0) {
      day.slots.forEach((slot) => {
        slot.staffIds?.forEach((staffId) => {
          const preferredDays = preferredDaysOffByStaff.get(staffId);
          if (preferredDays?.has(day.date)) {
            const key = `${day.date}:${staffId}`;
            if (!preferredDayOffSeen.has(key)) {
              preferredDayOffSeen.add(key);
              violations.push({
                id: "C_day_off_violation",
                date: day.date,
                staffId,
                detail: "希望休違反",
                priority: "C",
              });
            }
          }
        });
      });
    }
  });

  return { violations };
}
