// Creates a registration. This is the only public way to write personal data.
import { randomInt } from "node:crypto";
import { and, eq, lt } from "drizzle-orm";
import { privacyNotice } from "@/content/privacy";
import { OUTSIDE_NIGERIA } from "@/lib/locations";
import { events, registrations, ticketOptions } from "@/server/db/schema";
import { constraintOf, RuleError, type Db } from "@/server/events/service";
import { isFull, offeredTickets, placesTaken, setupProblems } from "./rules";
import type { RegistrationInput } from "./validation";

// No 0/O or 1/I/L, so a code is easy to read out over the phone.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const newReference = () => `BFM-${Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

/** What the person is told after registering. */
function receipt(row: typeof registrations.$inferSelect, event: typeof events.$inferSelect) {
  return {
    reference: row.reference,
    email: row.email,
    ticketName: row.ticketName,
    amountKobo: row.amountKobo,
    status: row.status,
    holdExpiresAt: row.holdExpiresAt,
    eventTitle: event.title,
    timezone: event.timezone,
    // Bank details are only given when there is something to pay.
    paymentInstructions: row.status === "pending" ? event.paymentInstructions : null,
    contacts: { email: event.contactEmail, phone: event.contactPhone, whatsapp: event.contactWhatsapp },
  };
}

export type Receipt = ReturnType<typeof receipt>;

export async function register(db: Db, slug: string, input: RegistrationInput): Promise<Receipt> {
  try {
    return await db.transaction(async (tx) => {
      // Locking the event makes registrations queue up one at a time, so two
      // people cannot both take the last place.
      const [event] = await tx.select().from(events).where(eq(events.slug, slug)).for("update");
      if (!event || event.publishStatus !== "published") throw new RuleError("Registration is not available for this event.");

      const [earlier] = await tx.select().from(registrations).where(eq(registrations.id, input.submissionId));
      if (earlier) {
        // The same form sent again, e.g. after a lost connection.
        if (earlier.eventId === event.id && earlier.email === input.email) return receipt(earlier, event);
        throw new RuleError("Please reload the page and try again.");
      }

      const now = new Date();
      const tickets = await tx.select().from(ticketOptions).where(eq(ticketOptions.eventId, event.id));
      if (event.registrationStatus !== "open" || setupProblems(event, tickets, now).length) {
        throw new RuleError("Registration is not open for this event.");
      }
      const ticket = offeredTickets(tickets).find((t) => t.id === input.ticketId);
      if (!ticket) throw new RuleError("That option is no longer available. Reload the page and choose again.", "ticketId");
      if (ticket.priceKobo !== input.shownAmount) {
        throw new RuleError("The price changed while you were filling the form. Reload the page to see the new price.", "ticketId");
      }

      // Release places whose holding time has run out.
      await tx.update(registrations).set({ status: "expired" }).where(and(
        eq(registrations.eventId, event.id), eq(registrations.status, "pending"), lt(registrations.holdExpiresAt, now),
      ));
      if (isFull(event, ticket, await placesTaken(tx, event.id, now))) {
        throw new RuleError("Sorry, there are no places left for that option.", "ticketId");
      }

      const free = ticket.priceKobo === 0;
      const [row] = await tx.insert(registrations).values({
        id: input.submissionId,
        reference: newReference(),
        eventId: event.id,
        ticketOptionId: ticket.id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        state: input.state,
        city: input.city || null,
        country: input.state === OUTSIDE_NIGERIA ? input.country : "Nigeria",
        ageConfirmedAt: now,
        ticketName: ticket.name,
        amountKobo: ticket.priceKobo,
        // Nothing to pay means the place is confirmed straight away.
        status: free ? "confirmed" : "pending",
        confirmedAt: free ? now : null,
        holdExpiresAt: free ? null : new Date(now.getTime() + event.transferHoldHours * 3_600_000),
        privacyConsentAt: now,
        privacyNoticeVersion: privacyNotice.version,
        marketingConsentAt: input.marketingConsent ? now : null,
      }).returning();
      return receipt(row, event);
    });
  } catch (error) {
    if (constraintOf(error) === "registrations_one_active_per_email") {
      throw new RuleError("We couldn't create a new registration with this email address. If you have registered before, contact the organisers.", "email");
    }
    throw error;
  }
}
