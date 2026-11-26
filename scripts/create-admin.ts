// Creates an admin account:  npm run admin:create           (owner)
//                            npm run admin:create -- --staff
import { loadEnvConfig } from "@next/env";
import { hashPassword } from "better-auth/crypto";
import { sql } from "drizzle-orm";
import { createDb } from "../src/server/db/client";
import { activityLog, adminUsers, authAccounts } from "../src/server/db/schema";
import { createPrompter } from "./_prompt";

loadEnvConfig(process.cwd(), true);

async function main() {
  const staff = process.argv.includes("--staff");
  const role = staff ? "staff" : "owner";
  const { db, pool } = createDb(process.env.DATABASE_URL);
  let prompt: ReturnType<typeof createPrompter> | undefined;

  try {
    prompt = createPrompter();
    console.log(`Creating a new ${role} account.`);
    const name = (await prompt.ask("Full name: ")).trim();
    const email = (await prompt.ask("Email address: ")).trim().toLowerCase();
    if (!name) throw new Error("A name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

    const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(sql`lower(${adminUsers.email}) = ${email}`);
    if (existing) throw new Error("An admin with that email already exists. Use admin:reset-password if needed.");

    const canConfirmPayments = staff
      ? (await prompt.ask("May this person confirm payments? (y/N): ")).trim().toLowerCase() === "y"
      : false;
    const password = await hashPassword(await prompt.newPassword());

    await db.transaction(async (tx) => {
      const [admin] = await tx
        .insert(adminUsers)
        .values({ name, email, role, canConfirmPayments })
        .returning({ id: adminUsers.id });
      await tx.insert(authAccounts).values({ userId: admin.id, accountId: admin.id, providerId: "credential", password });
      // adminId is empty: this was done from the terminal.
      await tx.insert(activityLog).values({
        action: "admin.created", entityType: "admin_user", entityId: admin.id,
        details: { role, canConfirmPayments, via: "terminal" },
      });
    });
    console.log(`Done. The ${role} can now sign in at /admin/login.`);
  } finally {
    prompt?.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
