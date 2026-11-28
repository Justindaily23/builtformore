// The website's wording for visitors.
import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { originalContent, type SiteContent } from "@/content/editable";
import { readContent } from "@/server/content/service";
import { getDb } from "@/server/db";

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  // Read on each visit, never while building.
  await connection();
  try {
    return await readContent(getDb());
  } catch (error) {
    // The pages still show, with the original wording.
    console.error("Could not load website wording:", error instanceof Error ? error.message.slice(0, 200) : "unknown error");
    return originalContent;
  }
});
