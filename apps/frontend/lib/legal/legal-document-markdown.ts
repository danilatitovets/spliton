export type LegalDocumentHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

const LEADING_SECTION_NUM = /^(?:\d+[.)]|§)\s+/;

/** TOC label: keep heading numbers if present, otherwise add 1. 2. 3. */
export function formatLegalTocTitle(title: string, index: number): string {
  const trimmed = title.trim();
  if (LEADING_SECTION_NUM.test(trimmed)) return trimmed;
  return `${index + 1}. ${trimmed}`;
}

/** Main sections only, so the sidebar stays short and does not scroll. */
export function legalDocumentTocHeadings(headings: LegalDocumentHeading[]): LegalDocumentHeading[] {
  const top = headings.filter((item) => item.level === 2);
  return top.length > 0 ? top : headings;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function slugifyLegalHeading(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base.slice(0, 72) || "section";
}

export function extractLegalDocumentHeadings(content: string): LegalDocumentHeading[] {
  const headings: LegalDocumentHeading[] = [];
  const used = new Map<string, number>();

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trimEnd();
    let level: 2 | 3 | null = null;
    let title = "";

    if (line.startsWith("## ")) {
      level = 2;
      title = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      level = 3;
      title = line.slice(4).trim();
    }

    if (!level || !title) continue;

    const base = slugifyLegalHeading(title);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;

    headings.push({ id, title, level });
  }

  return headings;
}

export function renderLegalMarkdownLines(content: string): string {
  const lines = content.split("\n");
  const html: string[] = [];
  let inList = false;
  const used = new Map<string, number>();

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  const headingId = (title: string) => {
    const base = slugifyLegalHeading(title);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      closeList();
      html.push("<br />");
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      const title = line.slice(4).trim();
      html.push(`<h3 id="${headingId(title)}">${escapeHtml(title)}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      const title = line.slice(3).trim();
      html.push(`<h2 id="${headingId(title)}">${escapeHtml(title)}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      const title = line.slice(2).trim();
      html.push(`<h1 id="${headingId(title)}">${escapeHtml(title)}</h1>`);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${escapeHtml(line)}</p>`);
  }
  closeList();
  return html.join("");
}
