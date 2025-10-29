# JSON Schemas（暫定 v0）
## staff.json
- staff: { id: string, name: string, roles: ("day"|"night")[], maxHoursPerWeek?: number }

## rules.json
- priorities: "A" | "B" | "C"
- A: 固定厳守ルール（例：21–23=2名ちょうど、0–7=2名ちょうど）
- B: 準必須（例：18–21は2–3名）
- C: 望ましい（公平性など）

## demand.json
- dayType: "wednesday" | "normalDay" | "bathDay"
- slots: [{ start:"HH:mm", end:"HH:mm", min:number, max?:number }]
