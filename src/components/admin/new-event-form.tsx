"use client";

import { useRouter } from "next/navigation";
import { createEventAction } from "@/app/admin/(panel)/events/actions";
import { EventForm } from "./event-form";

export function NewEventForm() {
  // A new key on each visit, so the previous event's details do not linger.
  const { bfcacheId } = useRouter();
  return <EventForm key={bfcacheId} action={createEventAction} values={{}} submitLabel="Create draft event" />;
}
