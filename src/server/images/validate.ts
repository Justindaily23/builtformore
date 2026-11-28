// Checks an uploaded file on the server. The file's own first bytes are read;
// its name and the type claimed by the browser are not trusted.
import { MAX_UPLOAD_BYTES } from "@/lib/images";
import { RuleError } from "@/server/events/service";

export function detectImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  const starts = (signature: number[], at = 0) => signature.every((b, i) => bytes[at + i] === b);
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

export async function readImageFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) throw new RuleError("Choose a picture first.", "file");
  if (value.size > MAX_UPLOAD_BYTES) throw new RuleError("The picture is too large. The limit is 4 MB.", "file");
  const bytes = new Uint8Array(await value.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) throw new RuleError("Use a JPEG, PNG or WebP picture.", "file");
  return new Blob([bytes], { type });
}
