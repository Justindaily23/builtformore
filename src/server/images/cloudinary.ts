// Talks to Cloudinary using signed requests. The secret stays on the server.
// Do not log the settings or the request fields.
import { createHash, randomUUID } from "node:crypto";
import { RuleError } from "@/server/events/service";

/** Everything this site uploads lives here, and only this is ever deleted. */
const ROOT = "builtformore/";
export type ImageFolder = "events" | "speakers" | "team";
export type StoredImage = { url: string; publicId: string };

function readConfig() {
  try {
    const url = new URL(process.env.CLOUDINARY_URL ?? "");
    const config = {
      cloud: url.hostname,
      key: decodeURIComponent(url.username),
      secret: decodeURIComponent(url.password),
    };
    if (url.protocol !== "cloudinary:" || !config.cloud || !config.key || !config.secret) return null;
    return config;
  } catch {
    return null;
  }
}

export const uploadsAreSetUp = () => readConfig() !== null;

/** Cloudinary's rule: sorted name=value pairs joined by "&", then the secret. */
export function sign(params: Record<string, string>, secret: string) {
  const text = Object.keys(params).sort().map((name) => `${name}=${params[name]}`).join("&");
  return createHash("sha1").update(text + secret).digest("hex");
}

async function call(action: "upload" | "destroy", params: Record<string, string>, file?: Blob) {
  const config = readConfig();
  if (!config) throw new RuleError("Picture uploads are not set up. Add CLOUDINARY_URL on the server.");
  const signed = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
  const body = new FormData();
  for (const [name, value] of Object.entries(signed)) body.set(name, value);
  body.set("api_key", config.key);
  body.set("signature", sign(signed, config.secret));
  if (file) body.set("file", file, "upload");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloud)}/image/${action}`, {
    method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(30_000),
  });
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !data) {
    const reason = (data?.error as { message?: string } | undefined)?.message;
    console.error(`Cloudinary ${action} failed with status ${response.status}${reason ? `: ${reason.slice(0, 200)}` : ""}`);
    throw new RuleError(
      response.status === 401
        ? "Cloudinary rejected the server's key. Check CLOUDINARY_URL."
        : "The picture service could not complete the request. Please try again.",
    );
  }
  return data;
}

export async function uploadImage(file: Blob, folder: ImageFolder): Promise<StoredImage> {
  let data;
  try {
    data = await call("upload", {
      public_id: `${ROOT}${folder}/${randomUUID()}`,
      // Very large pictures are scaled down before they are stored.
      transformation: "c_limit,h_2000,w_2000",
    }, file);
  } catch (error) {
    if (error instanceof RuleError) throw error;
    console.error("Cloudinary could not be reached:", error instanceof Error ? error.name : "unknown error");
    throw new RuleError("The picture service could not be reached. Please try again.");
  }
  const { secure_url: url, public_id: publicId } = data;
  if (typeof url !== "string" || !url.startsWith("https://res.cloudinary.com/") || typeof publicId !== "string") {
    throw new RuleError("The picture service sent an unexpected reply. Please try again.");
  }
  return { url, publicId };
}

/** Best effort: a leftover file must not undo a change that is already saved. */
export async function deleteImage(publicId: string | null | undefined) {
  if (!publicId?.startsWith(ROOT)) return;
  try {
    await call("destroy", { public_id: publicId, invalidate: "true" });
  } catch {
    console.error(`An old picture could not be deleted from Cloudinary: ${publicId}`);
  }
}
