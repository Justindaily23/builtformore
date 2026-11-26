const publish = { draft: "Draft", published: "Published", archived: "Archived" };
const registration = { coming_soon: "Registration coming soon", open: "Registration open", closed: "Registration closed" };

export function Badges({
  event,
}: {
  event: { publishStatus: keyof typeof publish; registrationStatus: keyof typeof registration; isFeatured: boolean };
}) {
  const base = "rounded-full px-3 py-1 text-sm font-semibold";
  return (
    <span className="flex flex-wrap gap-2">
      <span className={`${base} ${event.publishStatus === "published" ? "bg-plum text-ivory" : "border border-plum/40"}`}>
        {publish[event.publishStatus]}
      </span>
      {event.isFeatured && <span className={`${base} bg-gold-light`}>Featured</span>}
      <span className={`${base} bg-rose-light`}>{registration[event.registrationStatus]}</span>
    </span>
  );
}
