// Pull the "Frequently asked questions" section out of a markdown body into structured data.
// Returns the body without that section, plus [{ q, a }]. Answers stay as inline markdown on one line.
export function extractFaqs(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^##\s+frequently asked questions\s*$/i.test(l.trim()));
  if (start < 0) return { body: markdown, faqs: [] };

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^##\s+/.test(lines[i]) && !/^###/.test(lines[i])) { end = i; break; }

  const faqs = [];
  let cur = null;
  for (const raw of lines.slice(start + 1, end)) {
    const line = raw.trim();
    const h = line.match(/^###\s+(.*)$/);
    if (h) { cur = { q: h[1].trim(), a: [] }; faqs.push(cur); continue; }
    if (cur && line) cur.a.push(line.replace(/^[-*]\s+/, ''));
  }
  const clean = faqs.map((f) => ({ q: f.q, a: f.a.join(' ') })).filter((f) => f.q && f.a);
  const body = [...lines.slice(0, start), ...lines.slice(end)].join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { body, faqs: clean };
}

export const faqYaml = (faqs) =>
  faqs.length ? ['faqs:', ...faqs.map((f) => `  - { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} }`)] : [];
