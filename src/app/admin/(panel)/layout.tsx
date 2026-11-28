// The frame around signed-in admin pages. It is not the security check:
// every page inside must call requireAdmin() itself.
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/content/brand";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-plum/15 bg-white">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="py-2">
            <Logo name={brand.name} />
          </Link>
          <LogoutButton />
        </div>
      </header>
      <nav aria-label="Admin" className="border-b border-plum/15 bg-white">
        <ul className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-6 px-5 sm:gap-x-8 sm:px-8">
          <li><Link href="/admin" className="block py-3 font-semibold underline-offset-8 hover:underline">Dashboard</Link></li>
          <li><Link href="/admin/events" className="block py-3 font-semibold underline-offset-8 hover:underline">Events</Link></li>
          <li><Link href="/admin/content" className="block py-3 font-semibold underline-offset-8 hover:underline">Wording</Link></li>
          <li><Link href="/admin/team" className="block py-3 font-semibold underline-offset-8 hover:underline">Team</Link></li>
        </ul>
      </nav>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    </>
  );
}
