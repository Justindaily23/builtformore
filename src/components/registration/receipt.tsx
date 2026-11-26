"use client";

import { useEffect, useRef } from "react";
import { formatNaira } from "@/lib/money";
import type { Receipt } from "@/server/registration/service";

export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "center" });
  }, []);

  const confirmed = receipt.status === "confirmed";
  const payBy = receipt.holdExpiresAt
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: receipt.timezone }).format(new Date(receipt.holdExpiresAt))
    : null;
  const contacts = [
    ["Email", receipt.contacts.email], ["Phone", receipt.contacts.phone], ["WhatsApp", receipt.contacts.whatsapp],
  ].filter((c) => c[1]);

  return (
    <div className="space-y-6 wrap-anywhere">
      <div>
        <h2 ref={heading} tabIndex={-1} className="font-display text-3xl">
          {receipt.status === "pending" ? "Registration received" : confirmed ? "You are registered" : "Registration on record"}
        </h2>
        <p className="mt-2">
          {receipt.status === "pending"
            ? "Your place is not confirmed until your payment has been checked."
            : confirmed ? "Your place is confirmed."
            : "This registration is no longer active. Contact the organisers."}
        </p>
      </div>

      <div className="rounded-2xl bg-plum p-5 text-ivory">
        <p>Your reference</p>
        <p className="font-mono text-2xl font-bold tracking-wide select-all">{receipt.reference}</p>
        <p className="mt-3 font-semibold">Take a screenshot or write this down now.</p>
        <p className="text-sm">This page will not be available after you leave it, and we do not send a confirmation email yet.</p>
      </div>

      <dl className="space-y-2">
        <div><dt className="text-sm">Event</dt><dd className="font-semibold">{receipt.eventTitle}</dd></div>
        <div><dt className="text-sm">Option</dt><dd className="font-semibold">{receipt.ticketName}</dd></div>
        <div><dt className="text-sm">Amount</dt><dd className="font-semibold">{receipt.amountKobo ? formatNaira(receipt.amountKobo) : "Free"}</dd></div>
        <div><dt className="text-sm">Registered email</dt><dd className="font-semibold">{receipt.email}</dd></div>
      </dl>

      {receipt.paymentInstructions && (
        <div className="rounded-2xl border-2 border-gold bg-white p-5">
          <h3 className="font-display text-2xl">How to pay by bank transfer</h3>
          <p className="mt-3 whitespace-pre-line">{receipt.paymentInstructions}</p>
          <p className="mt-3">Use your reference <strong>{receipt.reference}</strong> as the payment description, and keep your proof of payment.</p>
          {payBy && (
            <p className="mt-3">Your place is held until <strong>{payBy}</strong> (venue time). After that it may be given to someone else.</p>
          )}
        </div>
      )}

      {contacts.length > 0 && (
        <div>
          <h3 className="font-semibold">Questions?</h3>
          {contacts.map(([label, value]) => <p key={label}>{label}: {value}</p>)}
        </div>
      )}
    </div>
  );
}
