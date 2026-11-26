// Better Auth setup. Server only.
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { adminUsers, authAccounts, authRateLimits, authSessions, authVerifications } from "@/server/db/schema";
import { MIN_PASSWORD_LENGTH } from "./password-rules";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be set and at least 32 characters. See .env.example.");
  }
  if (!process.env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL must be set to the site's address. See .env.example.");
  }
  const db = getDb();

  return betterAuth({
    secret,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: adminUsers,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
        rateLimit: authRateLimits,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Admins are created from the terminal only.
      disableSignUp: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
    },
    // A login lasts 12 hours, then the admin signs in again.
    session: { expiresIn: 60 * 60 * 12, disableSessionRefresh: true },
    // Limits password guessing from one network address.
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: { "/sign-in/email": { window: 60, max: 5 } },
    },
    databaseHooks: {
      session: {
        create: {
          // A deactivated admin cannot sign in.
          before: async (session) => {
            const [admin] = await db
              .select({ isActive: adminUsers.isActive })
              .from(adminUsers)
              .where(eq(adminUsers.id, session.userId));
            if (!admin?.isActive) return false;
          },
        },
      },
    },
    advanced: { database: { generateId: "uuid" } },
    telemetry: { enabled: false },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

// A function, so the build does not need the secret or a database.
export function getAuth() {
  return (instance ??= createAuth());
}
