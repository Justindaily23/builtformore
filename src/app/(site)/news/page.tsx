import type { Metadata } from "next";
import { Band, PageHeader, Prose, TickList } from "@/components/page/parts";
import { newsTopics } from "@/content/partnerships";

export const metadata: Metadata = {
  title: "News & Updates",
  // Not worth listing in search until there is news.
  robots: { index: false },
};

export default function NewsPage() {
  return (
    <>
      <PageHeader title="News & Updates" strap="Stay connected. Stay inspired." />
      <Band title="Coming soon">
        <Prose paragraphs={["Keep up with announcements, speaker reveals, conference updates, insights and stories from the BUILT FOR MORE community. Our updates will feature:"]} />
        <div className="mt-4"><TickList items={newsTopics} /></div>
      </Band>
    </>
  );
}
