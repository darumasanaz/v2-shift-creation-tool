export type Slot = { start: string; end: string; staffIds: string[] };
export type Day = { date: string; slots: Slot[] };

type Input = {
  staff: any[];
  rules: any;
  demand: any;
  month: string; // "2025-11"
  dayTypeByDate?: Record<string, "wednesday" | "normalDay" | "bathDay">;
};

// とりあえず空のスケジュールを返す（後で実装）
export function assignCore(_input: Input): Day[] {
  const days: Day[] = [];
  return days;
}
