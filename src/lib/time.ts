// Programme times are the local time at the venue, so they are never converted.

/** "14:00:00" from the database becomes "14:00" for a time box. */
export const toTimeInput = (value: string | null) => value?.slice(0, 5) ?? "";

/** "14:00:00" becomes "2:00 pm". */
export function formatTime(value: string): string {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
}

export function formatTimeRange(start: string | null, end: string | null): string | null {
  if (start && end) return `${formatTime(start)} – ${formatTime(end)}`;
  if (start) return `From ${formatTime(start)}`;
  if (end) return `Until ${formatTime(end)}`;
  return null;
}

/** "2027-09-15" becomes "Wednesday, 15 September 2027". */
export const formatDay = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
