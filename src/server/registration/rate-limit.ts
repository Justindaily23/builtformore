// A simple limit on how often one network address can submit. It slows abuse; it
// does not stop a determined attacker. Many mobile users can share an address,
// so the limit is generous.
import { createHmac } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { formRateLimits } from "@/server/db/schema";
import type { Db } from "@/server/events/service";

export const LIMIT = 20;
const WINDOW_MINUTES = 10;

/** Returns false when this sender has tried too often. */
export async function allowSubmission(db: Db, address: string, secret: string) {
  const key = createHmac("sha256", secret).update(`register:${address}`).digest("hex");
  const expired = sql`${formRateLimits.windowStart} < now() - make_interval(mins => ${WINDOW_MINUTES})`;
  await db.delete(formRateLimits).where(lt(formRateLimits.windowStart, sql`now() - interval '1 day'`));
  const [row] = await db
    .insert(formRateLimits)
    .values({ key, count: 1, windowStart: sql`now()` })
    .onConflictDoUpdate({
      target: formRateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${formRateLimits.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${formRateLimits.windowStart} end`,
      },
    })
    .returning({ count: formRateLimits.count });
  return row.count <= LIMIT;
}
