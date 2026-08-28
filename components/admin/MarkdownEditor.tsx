import { useId, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownEditorProps = {
  id: string;
  invalid?: boolean;
  error?: string;
  value: string;
  onChange(value: string): void;
};

export default function MarkdownEditor({ id, invalid = false, error, value, onChange }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const writeTabRef = useRef<HTMLButtonElement>(null);
  const previewTabRef = useRef<HTMLButtonElement>(null);
  const tabId = useId().replaceAll(":", "");
  const writeTabId = `${tabId}-write-tab`;
  const previewTabId = `${tabId}-preview-tab`;
  const panelId = `${tabId}-panel`;

  function insert(before: string, after = "", fallback = "text") {
    const element = textareaRef.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selection = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${before}${selection}${after}${value.slice(end)}`;
    onChange(nextValue);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + before.length, start + before.length + selection.length);
    });
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextMode = event.key === 'Home'
      ? 'write'
      : event.key === 'End'
        ? 'preview'
        : mode === 'write' ? 'preview' : 'write';
    setMode(nextMode);
    window.requestAnimationFrame(() => (nextMode === 'write' ? writeTabRef.current : previewTabRef.current)?.focus());
  }

  return (
    <div className="markdownEditor">
      <div className="markdownTabs" role="tablist" aria-label="Case study editor mode">
        <button ref={writeTabRef} id={writeTabId} type="button" role="tab" aria-controls={panelId} aria-selected={mode === "write"} tabIndex={mode === "write" ? 0 : -1} onKeyDown={moveTab} onClick={() => setMode("write")}>Write</button>
        <button ref={previewTabRef} id={previewTabId} type="button" role="tab" aria-controls={panelId} aria-selected={mode === "preview"} tabIndex={mode === "preview" ? 0 : -1} onKeyDown={moveTab} onClick={() => setMode("preview")}>Preview</button>
      </div>
      {mode === "write" ? (
        <div id={panelId} role="tabpanel" aria-labelledby={writeTabId}>
          <div className="markdownToolbar" aria-label="Markdown formatting">
            <button type="button" onClick={() => insert("## ", "", "Section heading")}>Heading</button>
            <button type="button" onClick={() => insert("**", "**", "bold text")}>Bold</button>
            <button type="button" onClick={() => insert("- ", "", "list item")}>List</button>
            <button type="button" onClick={() => insert("[", "](https://example.com)", "link text")}>Link</button>
            <button type="button" onClick={() => insert("`", "`", "code")}>Code</button>
          </div>
          <textarea
            ref={textareaRef}
            id={id}
            className="markdownTextarea"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Full case study in Markdown"
            aria-invalid={invalid}
            aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
            spellCheck="true"
          />
        </div>
      ) : (
        <div id={panelId} className="markdownPreview markdownBody" role="tabpanel" aria-labelledby={previewTabId} tabIndex={0}>
          {value.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p>Nothing to preview yet.</p>}
        </div>
      )}
      <p id={`${id}-help`} className="adminFieldHelp">Use headings, short paragraphs, lists, links, and code where they improve understanding. Raw HTML is not rendered.</p>
      {error && <p id={`${id}-error`} className="adminFieldError" role="alert">{error}</p>}
    </div>
  );
}
