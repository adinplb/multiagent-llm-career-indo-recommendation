/**
 * Parse string markdown roadmap ("## Bulan 1-2: ..." dst) jadi array section
 * { title, body } berbasis heading level 2 (##). Tidak menjamin format 100%
 * konsisten karena roadmap adalah output LLM bebas — fallback ke satu section
 * berisi seluruh teks jika tidak ada heading level 2 ditemukan.
 */
export function parseRoadmapSections(markdown) {
  if (!markdown || typeof markdown !== "string") return [];
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.*)$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) sections.push(current);

  if (sections.length === 0) {
    return [{ title: "Roadmap", body: markdown }];
  }
  return sections.map((s) => ({ title: s.title, body: s.body.join("\n").trim() }));
}
