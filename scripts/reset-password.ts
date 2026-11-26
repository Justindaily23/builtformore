// Sets a new password and signs that admin out everywhere:
//   npm run admin:reset-password
import { loadEnvConfig } from "@next/env";
import { hashPassword } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";
import { createDb } from "../src/server/db/client";
import { activityLog, adminUsers, authAccounts, authSessions } from "../src/server/db/schema";
import { createPrompter } from "./_prompt";

loadEnvConfig(process.cwd(), true);

async function main() {
  const { db, pool } = createDb(process.env.DATABASE_URL);
  let prompt: ReturnType<typeof createPrompter> | undefined;

  try {
    prompt = createPrompter();
    const email = (await prompt.ask("Admin's email address: ")).trim().toLowerCase();
    const [admin] = await db.select({ id: adminUsers.id }).from(adminUsers).where(sql`lower(${adminUsers.email}) = ${email}`);
    if (!admin) throw new Error("No admin has that email.");
    const password = await hashPassword(await prompt.newPassword());

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(authAccounts)
        .set({ password })
        .where(and(eq(authAccounts.userId, admin.id), eq(authAccounts.providerId, "credential")))
        .returning({ id: authAccounts.id });
      if (!updated.length) throw new Error("This admin has no password login.");
      await tx.delete(authSessions).where(eq(authSessions.userId, admin.id));
      await tx.insert(activityLog).values({
        action: "admin.password_reset", entityType: "admin_user", entityId: admin.id, details: { via: "terminal" },
      });
    });
    console.log("Password changed. That admin has been signed out everywhere.");
  } finally {
    prompt?.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
