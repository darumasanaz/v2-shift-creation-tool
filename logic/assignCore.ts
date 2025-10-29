export type Slot = { start: string; end: string; staffIds: string[] };
export type Day = { date: string; slots: Slot[] };

type Input = {
  staff: any[];
  rules: any;
  demand: any;
  month: string; // "2025-11"
  dayTypeByDate?: Record<string, "wednesday" | "normalDay" | "bathDay">;
};

const EVENING_SLOT: Pick<Slot, "start" | "end"> = {
  start: "18:00",
  end: "21:00",
};

const NIGHT_SLOTS: Array<Pick<Slot, "start" | "end">> = [
  { start: "21:00", end: "23:00" },
  { start: "00:00", end: "07:00" },
];

export type StaffMember = {
  id: string;
  roles?: string[];
  preferredDaysOff?: string[];
};

function isPreferredDayOff(member: StaffMember, date: string) {
  return Array.isArray(member.preferredDaysOff)
    ? member.preferredDaysOff.includes(date)
    : false;
}

type RotationResult = { assigned: string[]; nextIndex: number };

function assignWithRotation(
  pool: StaffMember[],
  rotationIndex: number,
  min: number,
  max: number
): RotationResult {
  if (pool.length === 0) {
    return { assigned: [], nextIndex: rotationIndex };
  }

  const cappedMax = Math.min(max, pool.length);
  const assignCount = cappedMax >= min ? cappedMax : pool.length;
  const assigned: string[] = [];

  for (let offset = 0; offset < assignCount; offset += 1) {
    const member = pool[(rotationIndex + offset) % pool.length];
    if (member && !assigned.includes(member.id)) {
      assigned.push(member.id);
    }
  }

  const nextIndex = (rotationIndex + 1) % pool.length;
  return { assigned, nextIndex };
}

export function assignCore(input: Input): Day[] {
  const { staff, month } = input;

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    return [];
  }

  const lastDate = new Date(year, monthIndex + 1, 0).getDate();

  const nightStaff: StaffMember[] = staff.filter((member) =>
    Array.isArray(member.roles) ? member.roles.includes("night") : false
  );
  const eveningStaff: StaffMember[] = staff.filter((member) => {
    if (!Array.isArray(member.roles)) {
      return false;
    }
    return member.roles.includes("day") || member.roles.includes("night");
  });

  let nightRotationIndex = 0;
  let eveningRotationIndex = 0;

  const days: Day[] = [];
  for (let day = 1; day <= lastDate; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const slots: Slot[] = [];

    const availableEveningStaff = eveningStaff.filter(
      (member) => !isPreferredDayOff(member, date)
    );
    const eveningPool =
      availableEveningStaff.length >= 2 ? availableEveningStaff : eveningStaff;
    const eveningAssignment = assignWithRotation(
      eveningPool,
      eveningRotationIndex,
      2,
      3
    );
    eveningRotationIndex = eveningAssignment.nextIndex;
    slots.push({
      start: EVENING_SLOT.start,
      end: EVENING_SLOT.end,
      staffIds: eveningAssignment.assigned,
    });

    NIGHT_SLOTS.forEach(({ start, end }) => {
      const availableNightStaff = nightStaff.filter(
        (member) => !isPreferredDayOff(member, date)
      );
      const nightPool =
        availableNightStaff.length >= 2 ? availableNightStaff : nightStaff;
      const assignment = assignWithRotation(nightPool, nightRotationIndex, 2, 2);
      nightRotationIndex = assignment.nextIndex;
      slots.push({ start, end, staffIds: assignment.assigned });
    });

    days.push({ date, slots });
  }

  return days;
}
