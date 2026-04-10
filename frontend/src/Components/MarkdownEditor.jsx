import React, { useState, useRef, useEffect } from "react";
import MarkdownToolbar from "./MarkdownToolbar";
import "./professionalEditor.css";
import CVPreview from "./CVPreview";
import GuidedEditor from "./GuidedEditor";

const layouts = [
    { id: "America", name: "American Standard", description: "Clean, traditional & results-focused." },
    { id: "European", name: "European Modern", description: "Sleek, organized & structured." },
    { id: "Gulf", name: "Gulf Professional", description: "Refined & optimized for the Gulf region." },
    { id: "Professional", name: "Classic Professional", description: "Timeless business-standard layout." },
    { id: "Creative", name: "Creative Edge", description: "Bold design for modern industries." },
    { id: "Minimalist", name: "Clean Minimalist", description: "Simple, easy to read & distraction-free." },
    { id: "Executive", name: "Senior Executive", description: "Sophisticated for top-tier roles." },
    { id: "Academic", name: "Academic / Research", description: "Detailed structure for scholars." },
    { id: "Tech", name: "Technical Specialist", description: "Optimized for skills & tech stack." },
    { id: "Service", name: "Customer Service", description: "Practical & experience-heavy." }
];

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
  onVerificationDismissed
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
        {activeTab === "Guided" && (
          <GuidedEditor
            markdown={localMarkdown}
            onChange={setLocalMarkdown}
            onSave={onSave}
            onStartWizard={onStartWizard}
            needsVerification={needsVerification}
            onVerificationDismissed={onVerificationDismissed}
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

        {activeTab === "Templates" && (
          <div className="template-switcher" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
            <div className="wizard-header" style={{ marginBottom: '20px', padding: '30px 40px 10px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Choose a Template</h2>
              <p style={{ color: '#64748b' }}>Select a layout that best fits your industry and style.</p>
            </div>
            
            <div className="selection-grid" style={{ padding: '0 40px 40px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                {layouts.map(layout => (
                  <div 
                    key={layout.id}
                    className={`selection-card ${cvFormat === layout.id ? 'active' : ''}`}
                    onClick={() => {
                       onFormatChange(layout.id);
                       onTabChange("Preview"); // Auto switch so they can see it!
                    }}
                    style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Live Mini Preview Box */}
                    <div className="mini-cv-wrapper" style={{ 
                        width: '100%', 
                        height: '280px', 
                        overflow: 'hidden', 
                        position: 'relative', 
                        borderRadius: '6px', 
                        marginBottom: '16px', 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ width: '800px', height: '1131px', transform: 'scale(0.28)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                             <CVPreview markdown={localMarkdown} format={layout.id} />
                        </div>
                    </div>
                    
                    <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', color: '#0f172a' }}>{layout.name}</h3>
                    <p style={{ fontSize: '13px', margin: 0, color: '#64748b', lineHeight: '1.4' }}>{layout.description}</p>
                    {cvFormat === layout.id && <div className="active-indicator" style={{ marginTop: '12px' }}>Selected ✓</div>}
                  </div>
                ))}
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
