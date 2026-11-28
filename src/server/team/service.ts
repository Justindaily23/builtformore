// Team changes. Callers MUST check permission first.
import { eq } from "drizzle-orm";
import { teamMembers } from "@/server/db/schema";
import { constraintOf, log, RuleError, type Db } from "@/server/events/service";
import type { MemberInput } from "./validation";

/** memberId is null for a new person. */
export async function saveMember(db: Db, adminId: string, memberId: string | null, input: MemberInput) {
  try {
    await db.transaction(async (tx) => {
      let id = memberId;
      if (!id) [{ id }] = await tx.insert(teamMembers).values(input).returning({ id: teamMembers.id });
      else {
        const [row] = await tx.update(teamMembers).set(input).where(eq(teamMembers.id, id)).returning({ id: teamMembers.id });
        if (!row) throw new RuleError("This person no longer exists. Reload the page.");
      }
      await log(tx, adminId, memberId ? "team.updated" : "team.added", "team_member", id!, {
        name: input.name, isVisible: input.isVisible, isFounder: input.isFounder,
      });
    });
  } catch (error) {
    if (constraintOf(error) === "team_members_one_founder") {
      throw new RuleError("Someone is already marked as Founder. Untick it on that person first.", "isFounder");
    }
    throw error;
  }
}

/** Returns the photo ID, for the caller to delete. */
export function deleteMember(db: Db, adminId: string, memberId: string) {
  return db.transaction(async (tx) => {
    const [gone] = await tx.delete(teamMembers).where(eq(teamMembers.id, memberId))
      .returning({ name: teamMembers.name, photoPublicId: teamMembers.photoPublicId });
    if (!gone) throw new RuleError("This person no longer exists. Reload the page.");
    await log(tx, adminId, "team.removed", "team_member", memberId, { name: gone.name });
    return gone.photoPublicId;
  });
}
