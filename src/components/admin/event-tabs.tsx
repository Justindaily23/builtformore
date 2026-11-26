import Link from "next/link";

const tabs = [
  { key: "details", label: "Details", path: "" },
  { key: "speakers", label: "Speakers", path: "/speakers" },
  { key: "schedule", label: "Schedule", path: "/schedule" },
] as const;

export function EventTabs({ eventId, current }: { eventId: string; current: (typeof tabs)[number]["key"] }) {
  return (
    <nav aria-label="Event sections">
      <ul className="flex flex-wrap gap-2 border-b border-plum/20 pb-3">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <Link
              href={`/admin/events/${eventId}${tab.path}`}
              aria-current={tab.key === current ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-full border border-plum/40 px-5 font-semibold aria-[current=page]:border-plum aria-[current=page]:bg-plum aria-[current=page]:text-ivory"
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
