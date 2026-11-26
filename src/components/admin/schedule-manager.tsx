"use client";

import { useActionState } from "react";
import {
  deleteDayAction, deleteSessionAction, saveDayAction, saveScheduleNoteAction, saveSessionAction, setScheduleVisibleAction,
} from "@/app/admin/(panel)/events/programme-actions";
import { emptyState } from "@/lib/form-state";
import { formatDay, formatTimeRange, toTimeInput } from "@/lib/time";
import { ConfirmButton } from "./confirm-button";
import { Check, Field, Message, Select, keepValues, primaryButton, secondaryButton } from "./form-parts";

export type Session = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  sortOrder: number;
  isVisible: boolean;
  speakerIds: string[];
};

export type Day = {
  id: string;
  date: string;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  sessions: Session[];
};

export type Person = { id: string; label: string };

type EventInfo = { id: string; startDate: string; endDate: string; showSchedule: boolean; scheduleNote: string | null };

const box = "rounded-xl border border-plum/20 p-4";
const submit = `w-full sm:w-auto ${primaryButton}`;

function Visibility({ event }: { event: EventInfo }) {
  const [state, action, pending] = useActionState(saveScheduleNoteAction.bind(null, event.id), emptyState);
  return (
    <div className="space-y-4 rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
      <div className="space-y-3">
        <p className="font-semibold">
          {event.showSchedule ? "The schedule is shown on the event page." : "The schedule is hidden from visitors."}
        </p>
        <p className="text-sm">
          While it is shown, changes you save below are visible to visitors as soon as the event is published.
        </p>
        {/* The key clears the last message when the status flips. */}
        <ConfirmButton key={String(event.showSchedule)}
          label={event.showSchedule ? "Hide schedule" : "Show schedule to visitors"}
          className={event.showSchedule ? secondaryButton : primaryButton}
          question={event.showSchedule ? undefined : "Show the schedule to visitors? Check that it is approved."}
          run={() => setScheduleVisibleAction(event.id, !event.showSchedule)} />
      </div>
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="space-y-3 border-t border-plum/15 pt-4">
        <Field errors={state.errors} idPrefix="note" label="Note above the schedule" name="scheduleNote"
          defaultValue={event.scheduleNote} hint="e.g. Proposed programme, subject to change. May be left blank." />
        <button type="submit" disabled={pending} className={`w-full sm:w-auto ${secondaryButton}`}>
          {pending ? "Saving…" : "Save note"}
        </button>
      </form>
      <Message state={state} />
    </div>
  );
}

function DayForm({ event, day, suggestedDate }: { event: EventInfo; day?: Day; suggestedDate?: string }) {
  const [state, action, pending] = useActionState(saveDayAction.bind(null, event.id, day?.id ?? null), emptyState);
  const shared = { errors: state.errors, idPrefix: day?.id ?? "new-day" };
  return (
    <div className="mt-4 space-y-3">
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="grid gap-4 md:grid-cols-2">
        <Field key={day ? "saved" : suggestedDate} {...shared} label="Date" name="date" type="date" required defaultValue={day?.date ?? suggestedDate} />
        <Field {...shared} label="Day title" name="title" defaultValue={day?.title} hint="e.g. The Awakening. Optional." />
        <Field {...shared} label="Day starts" name="startTime" type="time" defaultValue={toTimeInput(day?.startTime ?? null)} />
        <Field {...shared} label="Day ends" name="endTime" type="time" defaultValue={toTimeInput(day?.endTime ?? null)} />
        <div className="md:col-span-2">
          <button type="submit" disabled={pending} className={submit}>{pending ? "Saving…" : day ? "Save day" : "Add day"}</button>
        </div>
      </form>
      <Message state={state} />
    </div>
  );
}

function SessionForm({ eventId, days, dayId, session, people, nextOrder }: {
  eventId: string; days: Day[]; dayId: string; session?: Session; people: Person[]; nextOrder: number;
}) {
  const [state, action, pending] = useActionState(saveSessionAction.bind(null, eventId, session?.id ?? null), emptyState);
  const idPrefix = session?.id ?? `new-${dayId}`;
  const shared = { errors: state.errors, idPrefix };
  return (
    <div className="mt-4 space-y-3">
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="grid gap-4 md:grid-cols-2">
        <Field {...shared} className="md:col-span-2" label="Session title" name="title" required defaultValue={session?.title} />
        <Field {...shared} label="Starts" name="startTime" type="time" defaultValue={toTimeInput(session?.startTime ?? null)} />
        <Field {...shared} label="Ends" name="endTime" type="time" defaultValue={toTimeInput(session?.endTime ?? null)} />
        <Field {...shared} label="Room or location" name="location" defaultValue={session?.location} />
        <Field key={session ? "saved" : nextOrder} {...shared} label="Order in the day" name="sortOrder" inputMode="numeric" required
          defaultValue={session?.sortOrder ?? nextOrder} hint="Lower numbers appear first, whatever the time." />
        <Field {...shared} className="md:col-span-2" label="Description" name="description" rows={3} defaultValue={session?.description} />
        <Select {...shared} className="md:col-span-2" label="Day" name="dayId" defaultValue={dayId}
          options={days.map((d) => ({ value: d.id, label: formatDay(d.date) }))} />
        <fieldset className="md:col-span-2">
          <legend className="font-semibold">People in this session</legend>
          {people.length === 0 ? (
            <p className="text-sm">Add people on the Speakers tab first.</p>
          ) : (
            <div className="mt-1 grid gap-x-4 sm:grid-cols-2">
              {people.map((p) => (
                <label key={p.id} className="flex min-h-11 items-center gap-3">
                  <input type="checkbox" name="speakerIds" value={p.id} className="size-5 shrink-0 accent-plum"
                    defaultChecked={session?.speakerIds.includes(p.id)} />
                  <span className="wrap-anywhere">{p.label}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="md:col-span-2">
          <Check name="isVisible" label="Include in the public schedule" hint="Untick to keep this session private."
            checked={session?.isVisible ?? true} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={pending} className={submit}>
            {pending ? "Saving…" : session ? "Save session" : "Add session"}
          </button>
        </div>
      </form>
      <Message state={state} />
      {session && (
        <ConfirmButton label="Delete session" busyLabel="Deleting…"
          question={`Delete the session "${session.title}"? This cannot be undone.`}
          run={() => deleteSessionAction(eventId, session.id)} />
      )}
    </div>
  );
}

/** The first date of the event that has no day yet. */
function firstFreeDate(start: string, end: string, used: string[]) {
  for (let d = new Date(`${start}T00:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const value = d.toISOString().slice(0, 10);
    if (!used.includes(value)) return value;
  }
}

export function ScheduleManager({ event, days, people }: { event: EventInfo; days: Day[]; people: Person[] }) {
  const suggestedDate = firstFreeDate(event.startDate, event.endDate, days.map((d) => d.date));
  return (
    <section aria-labelledby="schedule-title" className="space-y-5">
      <div>
        <h2 id="schedule-title" className="font-display text-2xl">Schedule</h2>
        <p className="mt-1">Times are the local time at the venue.</p>
      </div>
      <Visibility event={event} />

      {days.length === 0 && <p>No days yet. Add one below.</p>}
      {days.map((day) => {
        const nextOrder = Math.min(999, Math.max(0, ...day.sessions.map((s) => s.sortOrder)) + 1);
        const outside = day.date < event.startDate || day.date > event.endDate;
        return (
          <div key={day.id} data-day={day.date} className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
            <h3 className="font-display text-xl">{formatDay(day.date)}</h3>
            <p className="wrap-anywhere">
              {[day.title, formatTimeRange(day.startTime, day.endTime)].filter(Boolean).join(", ")}
            </p>
            {outside && <p className="mt-1 font-semibold text-red-800">Outside the event dates. Change the date or delete this day.</p>}

            <ul className="mt-4 space-y-2">
              {day.sessions.map((s) => (
                <li key={s.id}>
                  <details className={box}>
                    <summary className="cursor-pointer py-1">
                      <span className="font-semibold wrap-anywhere">{s.title}</span>
                      <span className="mt-1 block text-sm">
                        {formatTimeRange(s.startTime, s.endTime) ?? "No time set"}
                        {s.isVisible ? "" : ", private"}
                      </span>
                    </summary>
                    <SessionForm eventId={event.id} days={days} dayId={day.id} session={s} people={people} nextOrder={nextOrder} />
                  </details>
                </li>
              ))}
            </ul>

            <details className={`${box} mt-2 border-dashed`}>
              <summary className="cursor-pointer py-1 font-semibold">Add a session</summary>
              <SessionForm eventId={event.id} days={days} dayId={day.id} people={people} nextOrder={nextOrder} />
            </details>
            <details className={`${box} mt-2`}>
              <summary className="cursor-pointer py-1 font-semibold">Edit or delete this day</summary>
              <DayForm event={event} day={day} />
              <div className="mt-3">
                <ConfirmButton label="Delete day" busyLabel="Deleting…"
                  question={`Delete ${formatDay(day.date)} and its ${day.sessions.length} session(s)? This cannot be undone.`}
                  run={() => deleteDayAction(event.id, day.id)} />
              </div>
            </details>
          </div>
        );
      })}

      <details className={`${box} border-dashed bg-white`}>
        <summary className="cursor-pointer py-1 font-semibold">Add a day</summary>
        <DayForm event={event} suggestedDate={suggestedDate} />
      </details>
    </section>
  );
}
