export type Slot = { start: string; end: string; staffIds: string[] };
export type Day = { date: string; slots: Slot[] };

type Input = {
  staff: any[];
  rules: any;
  demand: any;
  month: string; // "2025-11"
  dayTypeByDate?: Record<string, "wednesday" | "normalDay" | "bathDay">;
};

const NIGHT_SLOTS: Array<Pick<Slot, "start" | "end">> = [
  { start: "21:00", end: "23:00" },
  { start: "00:00", end: "07:00" },
];

export function assignCore(input: Input): Day[] {
  const { staff, month } = input;

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    return [];
  }

  const lastDate = new Date(year, monthIndex + 1, 0).getDate();

  const nightStaff = staff.filter((member) =>
    Array.isArray(member.roles) ? member.roles.includes("night") : false
  );

  let rotationIndex = 0;

  const days: Day[] = [];
  for (let day = 1; day <= lastDate; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const slots: Slot[] = NIGHT_SLOTS.map(({ start, end }) => {
      const assigned: string[] = [];
      const assignableCount = Math.min(2, nightStaff.length);

      for (let offset = 0; offset < assignableCount; offset += 1) {
        const staffMember = nightStaff[(rotationIndex + offset) % nightStaff.length];
        if (staffMember && !assigned.includes(staffMember.id)) {
          assigned.push(staffMember.id);
        }
      }

      if (assignableCount > 0) {
        rotationIndex = (rotationIndex + 1) % nightStaff.length;
      }

      return { start, end, staffIds: assigned };
    });

    days.push({ date, slots });
  }

  return days;
}
