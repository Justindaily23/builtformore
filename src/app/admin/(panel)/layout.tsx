// The frame around signed-in admin pages. It is not the security check:
// every page inside must call requireAdmin() itself.
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/content/brand";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-plum text-ivory">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="py-2">
            <Logo name={brand.name} />
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    </>
  );
}
