// Image rules and links. Safe to use in the browser: nothing secret here.

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const marker = "/image/upload/";

/** Only our own files and Cloudinary are ever shown. */
export function isShowableImage(url: string | null | undefined): url is string {
  if (!url) return false;
  if (url.startsWith("https://res.cloudinary.com/")) return true;
  return url.startsWith("/") && !url.startsWith("//");
}

/**
 * Asks Cloudinary for a smaller copy, e.g. "c_limit,w_800". f_auto and q_auto
 * pick a suitable format and quality. Other links are returned unchanged.
 */
export function imageVariant(url: string, transformation: string): string {
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes(marker)) return url;
  return url.replace(marker, `${marker}${transformation}/f_auto,q_auto/`);
}
