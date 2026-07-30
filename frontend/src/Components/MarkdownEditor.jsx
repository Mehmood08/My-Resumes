import React, { useState, useRef, useEffect } from "react";
import "./professionalEditor.css";
import CVPreview from "./CVPreview";
import GuidedEditor from "./GuidedEditor";
import { layouts } from "./templatesData";
import { LuEye, LuDownload, LuPlus, LuPenLine, LuSave, LuCheck, LuSparkles } from "react-icons/lu";

export default function MarkdownEditor({
  markdownValue,
  onMarkdownChange,
  cvFormat,
  onFormatChange,
  onSave,
  onStartWizard,
  needsVerification,
  onVerificationDismissed,
  onMetaUpdate,
  onDownloadPDF,
  onScoreCV,
  currentNoteId,
}) {
  const [localMarkdown, setLocalMarkdown] = useState(markdownValue);
  const [previewMarkdown, setPreviewMarkdown] = useState(markdownValue);
  const [isPreview, setIsPreview] = useState(false);
  const [verifyState, setVerifyState] = useState({ active: false, verified: false });
  const guidedEditorRef = useRef();

  useEffect(() => {
    setLocalMarkdown(markdownValue);
    setPreviewMarkdown(markdownValue);
  }, [markdownValue]);

  useEffect(() => {
    const handler = setTimeout(() => onMarkdownChange(localMarkdown), 200);
    return () => clearTimeout(handler);
  }, [localMarkdown, onMarkdownChange]);

  const handleSave = () => {
    const latest = guidedEditorRef.current?.getMarkdown?.() ?? localMarkdown;
    setLocalMarkdown(latest);
    onMarkdownChange(latest);
    onSave(latest);
  };

  const openPreview = () => {
    const latest = guidedEditorRef.current?.getMarkdown?.() ?? localMarkdown;
    setPreviewMarkdown(latest);
    setLocalMarkdown(latest);
    onMarkdownChange(latest);
    setIsPreview(true);
  };

  const closePreview = () => setIsPreview(false);

  const togglePreview = () => {
    if (isPreview) closePreview();
    else openPreview();
  };

  return (
    <div className="editor-container editor-container-full">
      <div className="editor-content editor-content-full">
        <div style={{ display: !isPreview ? "block" : "none", height: "100%", width: "100%" }}>
          <GuidedEditor
            ref={guidedEditorRef}
            markdown={localMarkdown}
            onChange={setLocalMarkdown}
            onSave={handleSave}
            onStartWizard={onStartWizard}
            needsVerification={needsVerification}
            onVerificationDismissed={onVerificationDismissed}
            onMetaUpdate={onMetaUpdate}
            onVerifyStateChange={setVerifyState}
          />
        </div>

        {isPreview && (
          <div className="template-selection-container">
            <div className="selection-split-layout">
              <aside className="preview-template-picker">
                <div className="preview-template-list">
                  {layouts.map(layout => (
                    <button
                      key={layout.id}
                      type="button"
                      className={`preview-template-item ${cvFormat === layout.id ? "selected" : ""}`}
                      onClick={() => onFormatChange(layout.id)}
                    >
                      <span className="preview-template-item-name">{layout.name}</span>
                      <span className="preview-template-item-desc">{layout.description}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="right-panel-preview">
                <div className="preview-stage">
                  <CVPreview markdown={previewMarkdown} format={cvFormat} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="floating-actions">
        {!isPreview && (
          <>
            <button
              type="button"
              className={`fab-round fab-save ${needsVerification ? "fab-save-locked" : ""}`}
              onClick={() => {
                if (needsVerification) return;
                handleSave();
              }}
              title={needsVerification ? "Verify all AI sections before saving" : "Save resume"}
              aria-label="Save resume"
              disabled={needsVerification}
            >
              <LuSave size={22} />
            </button>
            {verifyState.active && !verifyState.verified && (
              <button
                type="button"
                className="fab-round fab-verify"
                onClick={() => guidedEditorRef.current?.verifyCurrentSection?.()}
                title="Verify this section"
                aria-label="Verify section"
              >
                <LuCheck size={22} />
              </button>
            )}
          </>
        )}
        <button
          type="button"
          className={`fab-round ${isPreview ? "fab-edit active" : "fab-preview"}`}
          onClick={togglePreview}
          title={isPreview ? "Back to edit" : "Preview CV"}
          aria-label={isPreview ? "Back to edit" : "Preview CV"}
        >
          {isPreview ? <LuPenLine size={22} /> : <LuEye size={22} />}
        </button>
        {isPreview && (
          <>
            <button
              type="button"
              className={`fab-round fab-score ${!currentNoteId ? "fab-score-disabled" : ""}`}
              onClick={() => currentNoteId && onScoreCV?.()}
              title={currentNoteId ? "Score CV with AI" : "Save your resume first to enable AI scoring"}
              aria-label="Score CV with AI"
              disabled={!currentNoteId}
            >
              <LuSparkles size={22} />
            </button>
            <button
              type="button"
              className="fab-round fab-export"
              onClick={onDownloadPDF}
              title="Export as PDF"
              aria-label="Export as PDF"
            >
              <LuDownload size={22} />
            </button>
          </>
        )}
        <button
          type="button"
          className="fab-round fab-add"
          onClick={onStartWizard}
          title="Create new resume"
          aria-label="Create new resume"
        >
          <LuPlus size={24} />
        </button>
      </div>
    </div>
  );
}
