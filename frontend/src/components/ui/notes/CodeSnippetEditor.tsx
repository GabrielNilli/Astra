// =================================
//  COMPONENT
// =================================
export function CodeSnippetEditor({
  language,
  code,
  onChange,
  fieldClassName,
}: {
  language: string;
  code: string;
  onChange: (value: { language: string; code: string }) => void;
  fieldClassName: string;
}) {
  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-1.5">
      <input
        type="text"
        placeholder="Linguaggio (es. TypeScript)"
        value={language}
        onChange={(event) => onChange({ language: event.target.value, code })}
        className={fieldClassName}
      />
      <textarea
        placeholder="Incolla qui il codice"
        value={code}
        onChange={(event) => onChange({ language, code: event.target.value })}
        required
        rows={6}
        className={`${fieldClassName} resize-none font-mono text-xs`}
      />
    </div>
  );
}
