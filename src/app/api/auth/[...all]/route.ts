import { getAuth } from "@/server/auth/auth";

// Only these Better Auth endpoints are reachable from the web. Everything else
// (sign-up, profile changes, password reset and so on) returns "Not found".
const allowed = new Set(["/api/auth/sign-in/email", "/api/auth/sign-out"]);

export async function POST(request: Request) {
  if (!allowed.has(new URL(request.url).pathname)) {
    return new Response("Not found", { status: 404 });
  }
  return getAuth().handler(request);
}
