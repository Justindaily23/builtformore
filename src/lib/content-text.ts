/** Blank lines separate paragraphs. */
export const toParagraphs = (value: string) => value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** "Title: text" on each line. */
export const toPairs = (value: string) =>
  value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const at = line.indexOf(":");
    return at < 0 ? { title: line, text: "" } : { title: line.slice(0, at).trim(), text: line.slice(at + 1).trim() };
  });
