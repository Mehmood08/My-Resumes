import React, { useState, useRef, useEffect } from "react";
import MarkdownToolbar from "./MarkdownToolbar";
import "./professionalEditor.css";
import { marked } from "marked";


export default function MarkdownEditor({
  markdownValue,
  onMarkdownChange,
  scriptValue,
  onScriptChange
}) {
  const [activeTab, setActiveTab] = useState("Markdown");
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

  useEffect(() => {
    const handler = setTimeout(() => onScriptChange(localScript), 200);
    return () => clearTimeout(handler);
  }, [localScript, onScriptChange]);

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
        {["Markdown", "HTML Preview", "Script"].map(tab => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {activeTab === "Markdown" && (
        <div className="toolbar-container">
          <MarkdownToolbar onCommand={handleCommand} />
        </div>
      )}

      {/* Editor Content */}
      <div className="editor-content">
        {activeTab === "Markdown" && (
          <textarea
            ref={textareaRef}
            className="editor-textarea large-scroll"
            value={localMarkdown}
            onChange={(e) => setLocalMarkdown(e.target.value)}
            placeholder="Write Markdown..."
          />
        )}

       {activeTab === "HTML Preview" && (
  <div
    className="html-preview large-scroll"
    dangerouslySetInnerHTML={{ __html: marked(localMarkdown) }}
  />
)}

        {activeTab === "Script" && (
          <textarea
            className="editor-textarea large-scroll"
            value={localScript}
            onChange={(e) => setLocalScript(e.target.value)}
            placeholder="Write Script here..."
          />
        )}
      </div>
    </div>
  );
}
