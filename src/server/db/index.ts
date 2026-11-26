// The database for app code. "server-only" makes the build fail if a Client
// Component ever imports this file.
import "server-only";
import { createDb } from "./client";

type Db = ReturnType<typeof createDb>["db"];

// Reused across hot reloads in development, so connections do not pile up.
const store = globalThis as unknown as { bfmDb?: Db };

// A function, so that nothing connects until the database is actually needed.
export function getDb(): Db {
  return (store.bfmDb ??= createDb(process.env.DATABASE_URL).db);
}
