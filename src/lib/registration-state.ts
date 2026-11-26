/** "Open" turns into "closed" by itself once the deadline passes. */
export function currentRegistrationStatus(
  event: { registrationStatus: "coming_soon" | "open" | "closed"; registrationDeadline: Date | null },
  now = new Date(),
) {
  if (event.registrationStatus === "open" && event.registrationDeadline && event.registrationDeadline <= now) return "closed" as const;
  return event.registrationStatus;
}
