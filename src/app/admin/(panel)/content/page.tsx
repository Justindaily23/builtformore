import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContentForm } from "@/components/admin/content-form";
import { contentGroups } from "@/content/editable";
import { requirePermission } from "@/server/auth/session";
import { readContent, versionOf } from "@/server/content/service";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Website wording" };

async function Editor() {
  await requirePermission("manage_content");
  const content = await readContent(getDb());
  return (
    <div className="space-y-3">
      {contentGroups.map((group) => (
        <details key={group.id} className="rounded-xl border border-plum/20 bg-white p-4 sm:p-6">
          <summary className="cursor-pointer py-1 font-display text-2xl">{group.title}</summary>
          <ContentForm groupId={group.id} version={versionOf(content, group.id)}
            values={Object.fromEntries(group.fields.map((f) => [f.key, content[f.key]]))} />
        </details>
      ))}
    </div>
  );
}

export default function ContentPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl sm:text-4xl">Website wording and contacts</h1>
      <p className="mt-2 mb-6">
        Changes show on the website as soon as you save. Each section saves separately.{" "}
        <Link href="/" target="_blank" className="underline underline-offset-4">View the website (new tab)</Link>
      </p>
      <Suspense fallback={<p>Loading wording…</p>}>
        <Editor />
      </Suspense>
    </div>
  );
}
