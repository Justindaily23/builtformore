// Saving website wording. Callers MUST check permission first.
import { createHash } from "node:crypto";
import { inArray, sql } from "drizzle-orm";
import { contentGroups, originalContent, type ContentGroupId, type SiteContent } from "@/content/editable";
import { siteContent } from "@/server/db/schema";
import { log, RuleError, type Db, type Tx } from "@/server/events/service";

const keysOf = (groupId: ContentGroupId) => contentGroups.find((g) => g.id === groupId)!.fields.map((f) => f.key);

/** The original wording, with saved changes on top. */
export async function readContent(db: Db | Tx): Promise<SiteContent> {
  const rows = await db.select({ key: siteContent.key, value: siteContent.value }).from(siteContent);
  const result: SiteContent = { ...originalContent };
  for (const { key, value } of rows) if (Object.hasOwn(result, key)) result[key as keyof SiteContent] = value;
  return result;
}

/** Changes whenever a section changes, to catch two people editing at once. */
export function versionOf(content: SiteContent, groupId: ContentGroupId) {
  return createHash("sha256").update(JSON.stringify(keysOf(groupId).map((k) => content[k]))).digest("hex").slice(0, 16);
}

/** An empty value, or the original wording, removes the saved change. */
export function saveContent(
  db: Db, adminId: string, groupId: ContentGroupId, version: string, values: Partial<SiteContent>,
) {
  return db.transaction(async (tx) => {
    // One content save at a time.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('site_content'))`);
    const current = await readContent(tx);
    if (versionOf(current, groupId) !== version) {
      throw new RuleError("This section was changed somewhere else after you opened it. Copy your edits, reload the page, then try again.");
    }
    const changed: string[] = [];
    const restore: string[] = [];
    for (const key of keysOf(groupId)) {
      const value = values[key] || originalContent[key];
      if (value === current[key]) continue;
      changed.push(key);
      if (value === originalContent[key]) restore.push(key);
      else {
        await tx.insert(siteContent).values({ key, value })
          .onConflictDoUpdate({ target: siteContent.key, set: { value, updatedAt: new Date() } });
      }
    }
    if (restore.length) await tx.delete(siteContent).where(inArray(siteContent.key, restore));
    // Item names only: contact details are not copied into the log.
    if (changed.length) await log(tx, adminId, "content.updated", "site_content", groupId, { changed });
    return changed.length;
  });
}
