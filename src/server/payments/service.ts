import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { payments, registrations, ticketOptions } from "@/server/db/schema";
import { isFull, placesTaken } from "@/server/registration/rules";
import { constraintOf, lockEvent, log, RuleError, type Db } from "@/server/events/service";
import type { BankTransferConfirmation } from "./validation";

export async function confirmBankTransfer(
  db: Db,
  adminId: string,
  eventId: string,
  registrationId: string,
  input: BankTransferConfirmation,
): Promise<{ alreadyConfirmed: boolean }> {
  try {
    return await db.transaction(async (tx) => {
      const event = await lockEvent(tx, eventId);
      const [registration] = await tx.select().from(registrations)
        .where(and(eq(registrations.id, registrationId), eq(registrations.eventId, eventId)))
        .for("update");
      if (!registration) throw new RuleError("This registration no longer exists.");

      const [existingPayment] = await tx.select({
        id: payments.id,
        bankReference: payments.bankReference,
      }).from(payments).where(and(
        eq(payments.registrationId, registrationId),
        eq(payments.status, "successful"),
      )).limit(1);
      if (existingPayment) {
        if (existingPayment.bankReference === input.bankReference) return { alreadyConfirmed: true };
        throw new RuleError("A successful payment is already recorded for this registration.");
      }

      if (registration.status !== "pending" && registration.status !== "expired") {
        throw new RuleError("This registration is not awaiting a bank transfer.");
      }
      if (registration.amountKobo <= 0) {
        throw new RuleError("This is a free registration and does not need payment confirmation.");
      }
      if (!input.verified) {
        throw new RuleError("Confirm that you checked the transfer in the bank account.", "verified");
      }

      const now = new Date();
      const late = registration.status === "expired" ||
        (registration.holdExpiresAt !== null && registration.holdExpiresAt <= now);
      if (late) {
        const [ticket] = await tx.select().from(ticketOptions).where(and(
          eq(ticketOptions.id, registration.ticketOptionId),
          eq(ticketOptions.eventId, eventId),
        ));
        if (!ticket) throw new RuleError("The ticket for this registration no longer exists.");
        if (isFull(event, ticket, await placesTaken(tx, eventId, now))) {
          throw new RuleError(
            "This registration's hold has expired and no place is currently available. Do not confirm it; contact the organiser to resolve the payment.",
          );
        }
      }

      const [payment] = await tx.insert(payments).values({
        registrationId,
        method: "bank_transfer",
        status: "successful",
        amountKobo: registration.amountKobo,
        reference: `MANUAL-${randomUUID()}`,
        bankReference: input.bankReference,
        note: input.note,
        confirmedByAdminId: adminId,
        paidAt: now,
      }).returning({ id: payments.id });

      await tx.update(registrations).set({
        status: "confirmed",
        confirmedAt: now,
        holdExpiresAt: null,
      }).where(eq(registrations.id, registrationId));

      await log(tx, adminId, "payment.bank_transfer_confirmed", "payment", payment.id, {
        eventId,
        registrationId,
        amountKobo: registration.amountKobo,
        lateConfirmation: late,
      });

      return { alreadyConfirmed: false };
    });
  } catch (error) {
    switch (constraintOf(error)) {
      case "payments_bank_reference_unique":
        throw new RuleError("That bank transaction reference is already recorded. Check for a duplicate; nothing was confirmed.");
      case "registrations_one_active_per_email":
        throw new RuleError("Another active registration already uses this email. Review it before confirming this one.");
      default:
        throw error;
    }
  }
}
