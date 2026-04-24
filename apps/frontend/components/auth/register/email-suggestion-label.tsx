export function EmailSuggestionLabel({ suggestion }: { suggestion: string }) {
  const at = suggestion.indexOf("@");
  if (at === -1) return <>{suggestion}</>;
  const local = suggestion.slice(0, at);
  const domain = suggestion.slice(at);
  return (
    <>
      <span className="text-neutral-400">{local}</span>
      <span className="text-neutral-900">{domain}</span>
    </>
  );
}
