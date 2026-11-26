/** Today's date (YYYY-MM-DD) where the event takes place. */
export function todayIn(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** An event is past the day AFTER its end date. Registration status does not matter. */
export function hasEnded(event: { endDate: string; timezone: string }, now = new Date()): boolean {
  return event.endDate < todayIn(event.timezone, now);
}
