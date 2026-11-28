import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { Suspense } from "react";
import { TeamManager } from "@/components/admin/team-manager";
import { requirePermission } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { teamMembers } from "@/server/db/schema";
import { uploadsAreSetUp } from "@/server/images/cloudinary";

export const metadata: Metadata = { title: "Founder and team" };

async function Editor() {
  await requirePermission("manage_content");
  const rows = await getDb().select().from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt));
  return (
    <TeamManager uploadsReady={uploadsAreSetUp()}
      members={rows.map(({ id, name, position, bio, photoUrl, isFounder, isVisible, sortOrder }) =>
        ({ id, name, position, bio, photoUrl, isFounder, isVisible, sortOrder }))} />
  );
}

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl sm:text-4xl">Founder and leadership team</h1>
      <p className="mt-2 mb-6">These people appear on the About page. This is separate from event speakers.</p>
      <Suspense fallback={<p>Loading team…</p>}>
        <Editor />
      </Suspense>
    </div>
  );
}
