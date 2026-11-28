import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/content/brand";
import { getCurrentAdmin } from "@/server/auth/session";

async function LoginOrRedirect() {
  if (await getCurrentAdmin()) redirect("/admin");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-plum px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 sm:p-8">
        <div className="mb-6 flex justify-center">
          <Logo name={brand.name} />
        </div>
        <h1 className="mb-6 font-display text-3xl">Admin sign in</h1>
        <Suspense fallback={<p>Loading…</p>}>
          <LoginOrRedirect />
        </Suspense>
      </div>
      <Link href="/" className="mt-6 py-3 text-ivory/85 underline underline-offset-4">
        Back to the website
      </Link>
    </main>
  );
}
