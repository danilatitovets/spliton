import { describe, expect, it } from "vitest";

import {
  extractLegalDocumentHeadings,
  formatLegalTocTitle,
  legalDocumentTocHeadings,
  renderLegalMarkdownLines,
} from "@/lib/legal/legal-document-markdown";

describe("legal-document-markdown", () => {
  it("extracts heading ids from markdown", () => {
    const content = "## Scope\n\nText\n\n### Details\n\nMore";
    expect(extractLegalDocumentHeadings(content)).toEqual([
      { id: "scope", title: "Scope", level: 2 },
      { id: "details", title: "Details", level: 3 },
    ]);
  });

  it("renders headings with matching ids", () => {
    const html = renderLegalMarkdownLines("## Scope\n\nHello");
    expect(html).toContain('<h2 id="scope">Scope</h2>');
    expect(html).toContain("<p>Hello</p>");
  });

  it("does not double-number TOC titles", () => {
    expect(formatLegalTocTitle("1. Роль платформы", 0)).toBe("1. Роль платформы");
    expect(formatLegalTocTitle("Роль платформы", 0)).toBe("1. Роль платформы");
    expect(formatLegalTocTitle("Введение", 2)).toBe("3. Введение");
  });

  it("keeps only top-level headings in the TOC", () => {
    expect(
      legalDocumentTocHeadings([
        { id: "one", title: "1. One", level: 2 },
        { id: "nested", title: "Details", level: 3 },
        { id: "two", title: "2. Two", level: 2 },
      ]),
    ).toEqual([
      { id: "one", title: "1. One", level: 2 },
      { id: "two", title: "2. Two", level: 2 },
    ]);
  });
});
