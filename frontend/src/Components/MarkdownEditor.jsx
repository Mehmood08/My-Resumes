import React, { useState, useRef, useEffect } from "react";
import MarkdownToolbar from "./MarkdownToolbar";
import "./professionalEditor.css";
import CVPreview from "./CVPreview";
import GuidedEditor from "./GuidedEditor";
import { layouts } from "./templatesData";
import { LuCheck } from "react-icons/lu";

/* =========================================================
   MiniCVCard — Dynamically scales a full CV to fit any card.
   Uses ResizeObserver for pixel-perfect, always-correct scale.
========================================================= */
const CV_NATIVE_WIDTH = 794; // A4 page at 96dpi in pixels
const CV_NATIVE_HEIGHT = 750;  // Reduced to show top portion only, making cards more compact

function MiniCVCard({ markdown, formatId }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (width > 0) setScale(width / CV_NATIVE_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const containerHeight = Math.round(CV_NATIVE_HEIGHT * scale);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${containerHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: 'white',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: `${CV_NATIVE_WIDTH}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}>
        {/* Strip the CVPreview's own gray padding & background */}
        <style>{`
          .minicv-inner .cv-preview {
            background: white !important;
            padding: 0 !important;
            min-height: 0 !important;
            overflow: hidden !important;
            align-items: flex-start !important;
          }
        `}</style>
        <div className="minicv-inner">
          <CVPreview markdown={markdown} format={formatId} />
        </div>
      </div>
    </div>
  );
}

export default function MarkdownEditor({
  markdownValue,
  onMarkdownChange,
  scriptValue,
  onScriptChange,
  activeTab,
  onTabChange,
  cvFormat,
  onFormatChange,
  onSave,
  onStartWizard,
  needsVerification,
  onVerificationDismissed,
  onMetaUpdate
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
        {["Guided", "Templates", "Preview"].map(tab => (
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
        {/* GuidedEditor is always mounted to preserve 'Verified' state. We just hide it using display. */}
        <div style={{ display: activeTab === "Guided" ? "block" : "none", height: "100%", width: "100%" }}>
          <GuidedEditor
            markdown={localMarkdown}
            onChange={setLocalMarkdown}
            onSave={onSave}
            onStartWizard={onStartWizard}
            needsVerification={needsVerification}
            onVerificationDismissed={onVerificationDismissed}
            onMetaUpdate={onMetaUpdate}
          />
        </div>

        {activeTab === "Markdown" && (
          <textarea
            ref={textareaRef}
            className="editor-textarea large-scroll"
            value={localMarkdown}
            onChange={(e) => setLocalMarkdown(e.target.value)}
            placeholder="Write Markdown..."
          />
        )}

        {activeTab === "Templates" && (
          <div className="templates-tab-container">
            <div className="templates-header">
              <h2>Choose a Template</h2>
              <p>Select a layout that best fits your industry and style. All templates are 100% professional and ATS-friendly.</p>
            </div>
            
            <div className="templates-scroll-area">
              <div className="templates-grid">
                  {layouts.map(layout => (
                    <div 
                      key={layout.id}
                      className={`template-card-box ${cvFormat === layout.id ? 'active' : ''}`}
                      onClick={() => {
                         onFormatChange(layout.id);
                         onTabChange("Preview"); // Auto switch so they can see it!
                      }}
                    >
                      {cvFormat === layout.id && (
                         <div className="selection-check">
                            <LuCheck size={18} strokeWidth={3} />
                         </div>
                      )}

                      {/* Live Mini Preview using the self-scaling MiniCVCard */}
                      <MiniCVCard markdown={localMarkdown} formatId={layout.id} />
                      
                      <div className="template-card-info">
                          <h3>{layout.name}</h3>
                          <p>{layout.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Preview" && (
          <CVPreview markdown={localMarkdown} format={cvFormat} />
        )}
      </div>
    </div>
  );
}
