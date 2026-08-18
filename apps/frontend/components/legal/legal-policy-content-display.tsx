import { renderLegalMarkdownLines } from "@/lib/legal/legal-document-markdown";

type LegalPolicyContentDisplayProps = {
  content: string;
  contentFormat?: string;
  className?: string;
};

export function LegalPolicyContentDisplay({
  content,
  contentFormat = "MARKDOWN",
  className,
}: LegalPolicyContentDisplayProps) {
  const format = contentFormat.toUpperCase();

  if (format === "HTML") {
    return (
      <pre className={className} aria-label="HTML preview (escaped)">
        {content}
      </pre>
    );
  }

  if (format === "PLAIN") {
    return (
      <div className={className} style={{ whiteSpace: "pre-wrap" }}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderLegalMarkdownLines(content) }}
    />
  );
}

export { extractLegalDocumentHeadings } from "@/lib/legal/legal-document-markdown";
