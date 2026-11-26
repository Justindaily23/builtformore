import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function EventNotFound() {
  return (
    <Container className="py-20">
      <h1 className="font-display text-4xl">We couldn&apos;t find that event</h1>
      <p className="mt-3 text-lg">The link may have changed, or the event is no longer listed.</p>
      <Link href="/events" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-plum px-7 font-semibold text-ivory">
        See all events
      </Link>
    </Container>
  );
}
