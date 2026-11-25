/** "2027-09-15", "2027-09-18" -> "15–18 September 2027" */
export function formatDateRange(start: string, end: string): string {
  const full = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return full.formatRange(new Date(start), new Date(end)).replace(/\s*–\s*/, "–");
}
