// The team for visitors: only people marked visible, and only public fields.
import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { teamMembers } from "@/server/db/schema";

export function getVisibleTeam() {
  return getDb().select({
    name: teamMembers.name, position: teamMembers.position, bio: teamMembers.bio,
    photoUrl: teamMembers.photoUrl, isFounder: teamMembers.isFounder,
  }).from(teamMembers).where(eq(teamMembers.isVisible, true))
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt));
}
