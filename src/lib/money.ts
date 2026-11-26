// The database stores money in kobo (₦1 = 100 kobo). Admins type naira.
export const MAX_NAIRA = 100_000_000;

/** "200,000" -> 20000000. Returns null if it is not a valid amount. */
export function nairaToKobo(input: string): number | null {
  const text = input.trim().replace(/^₦\s*/, "");
  // Digits, optionally grouped in threes with commas, up to 2 decimal places.
  const match = /^(\d+|\d{1,3}(?:,\d{3})+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  const naira = Number(match[1].replaceAll(",", ""));
  if (naira > MAX_NAIRA) return null;
  // Whole-number arithmetic only, to avoid rounding errors.
  return naira * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

/** 20000000 -> "₦200,000" */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: kobo % 100 ? 2 : 0 })}`;
}

/** For putting a stored price back into a form field. */
export function koboToInput(kobo: number): string {
  return kobo % 100 ? (kobo / 100).toFixed(2) : String(kobo / 100);
}
