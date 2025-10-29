import type { Day } from "./assignCore";

export type Violation = {
  id: string;
  date: string;
  start: string;
  end: string;
  detail?: string;
  priority: "A" | "B" | "C";
};

export function validate(schedule: Day[], _rules: any) {
  // まずは“必ず配列を返すだけ”のスタブ
  return { violations: [] as Violation[] };
}
