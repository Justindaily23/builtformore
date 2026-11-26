// Converts between a <input type="datetime-local"> value, which has no
// timezone, and a real moment in the event's timezone.

function wallClock(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function toLocalInput(date: Date | null, timeZone: string): string {
  return date ? wallClock(date, timeZone) : "";
}

export function fromLocalInput(value: string, timeZone: string): Date {
  const asUtc = new Date(`${value}:00Z`).getTime();
  const offset = new Date(`${wallClock(new Date(asUtc), timeZone)}:00Z`).getTime() - asUtc;
  return new Date(asUtc - offset);
}
