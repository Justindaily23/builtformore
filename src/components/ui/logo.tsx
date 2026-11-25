// Placeholder wordmark. Replace with the real logo when it is available.
export function Logo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-end gap-2.5">
      <svg viewBox="0 0 24 24" className="mb-1 size-6 shrink-0 fill-gold" aria-hidden="true">
        <rect x="0" y="16" width="6" height="8" />
        <rect x="9" y="9" width="6" height="15" />
        <rect x="18" y="0" width="6" height="24" />
      </svg>
      <span className="font-display text-xl leading-none whitespace-nowrap sm:text-2xl">{name}</span>
    </span>
  );
}
