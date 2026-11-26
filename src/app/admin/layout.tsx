import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  // Keeps admin pages out of search results. Access is protected separately.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
