import { EventTabs } from "./event-tabs";

export function EventHeading({ event, current }: { event: { id: string; title: string }; current: "speakers" | "schedule" }) {
  return (
    <>
      <h1 className="font-display text-3xl wrap-anywhere sm:text-4xl">{event.title}</h1>
      <EventTabs eventId={event.id} current={current} />
    </>
  );
}
