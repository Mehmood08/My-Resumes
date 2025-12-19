import React, { useState, useRef, useEffect } from "react";
import MarkdownToolbar from "./MarkdownToolbar";
import "./professionalEditor.css";
import CVPreview from "./CVPreview";
import GuidedEditor from "./GuidedEditor";

export default function MarkdownEditor({
  markdownValue,
  onMarkdownChange,
  scriptValue,
  onScriptChange,
  activeTab,
  onTabChange,
  cvFormat
}) {
  const [localMarkdown, setLocalMarkdown] = useState(markdownValue);
  const [localScript, setLocalScript] = useState(scriptValue);
  const textareaRef = useRef();

  // Sync with parent props
  useEffect(() => setLocalMarkdown(markdownValue), [markdownValue]);
  useEffect(() => setLocalScript(scriptValue), [scriptValue]);

  // Update parent with debounce
  useEffect(() => {
    const handler = setTimeout(() => onMarkdownChange(localMarkdown), 200);
    return () => clearTimeout(handler);
  }, [localMarkdown, onMarkdownChange]);

  const handleCommand = (cmd) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = localMarkdown.substring(start, end);
    let insert = "";

    switch (cmd) {
      case "bold": insert = `**${selected || "bold text"}**`; break;
      case "italic": insert = `_${selected || "italic text"}_`; break;
      case "heading": insert = `# ${selected || "Heading"}`; break;
      case "ulist": insert = `- ${selected || "List item"}`; break;
      case "olist": insert = `1. ${selected || "List item"}`; break;
      case "code": insert = "```\n" + (selected || "code") + "\n```"; break;
      case "table": insert = "| Col1 | Col2 |\n| --- | --- |\n| Data1 | Data2 |"; break;
      default: insert = selected;
    }

    const newText = localMarkdown.substring(0, start) + insert + localMarkdown.substring(end);
    setLocalMarkdown(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insert.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="editor-container">
      {/* Tabs */}
      <div className="tabs">
        {["Guided", "Markdown", "Preview",].map(tab => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar - Only for Markdown editing now */}
      {activeTab === "Markdown" && (
        <div className="toolbar-container">
          <MarkdownToolbar onCommand={handleCommand} />
        </div>
      )}

      {/* Editor Content */}
      <div className="editor-content">
        {activeTab === "Guided" && (
          <GuidedEditor
            markdown={localMarkdown}
            onChange={setLocalMarkdown}
          />
        )}

        {activeTab === "Markdown" && (
          <textarea
            ref={textareaRef}
            className="editor-textarea large-scroll"
            value={localMarkdown}
            onChange={(e) => setLocalMarkdown(e.target.value)}
            placeholder="Write Markdown..."
          />
        )}

        {activeTab === "Preview" && (
          <CVPreview markdown={localMarkdown} format={cvFormat} />
        )}
      </div>
    </div>
  );
}
