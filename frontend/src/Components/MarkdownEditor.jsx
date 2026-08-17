import React, { useState, useRef, useEffect } from "react";

import CVPreview from "./CVPreview";
import GuidedEditor from "./GuidedEditor";
import CVAnalyseModal from "./CVAnalyseModal";
import CVScoringModal from "./CVScoringModal";
import { layouts } from "./templatesData";
import { LuEye, LuDownload, LuPenLine, LuSave, LuCheck, LuSparkles, LuChartBar } from "react-icons/lu";

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
  currentNoteId,
  isPreview,
  onPreviewChange,
}) {
  const [localMarkdown, setLocalMarkdown] = useState(markdownValue);
  const [previewMarkdown, setPreviewMarkdown] = useState(markdownValue);
  const [verifyState, setVerifyState] = useState({ active: false, verified: false });
  const [isAnalyseOpen, setIsAnalyseOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [hasAppliedSuggestions, setHasAppliedSuggestions] = useState(false);
  const guidedEditorRef = useRef();
  const pendingApplyRef = useRef(null);

  useEffect(() => {
    setLocalMarkdown(markdownValue);
    setPreviewMarkdown(markdownValue);
    setHasAppliedSuggestions(false);
  }, [markdownValue]);

  useEffect(() => {
    if (isPreview || !pendingApplyRef.current) return;
    const { sectionId, content } = pendingApplyRef.current;
    pendingApplyRef.current = null;
    guidedEditorRef.current?.applySectionSuggestion?.(sectionId, content);
    setHasAppliedSuggestions(true);
  }, [isPreview]);

  useEffect(() => {
    const handler = setTimeout(() => onMarkdownChange(localMarkdown), 200);
    return () => clearTimeout(handler);
  }, [localMarkdown, onMarkdownChange]);

  const getCurrentMarkdown = () => {
    if (!isPreview) {
      return guidedEditorRef.current?.getDisplayMarkdown?.() ?? localMarkdown;
    }
    return previewMarkdown || localMarkdown;
  };

  const handleSave = () => {
    const isValid = guidedEditorRef.current?.validate?.() ?? true;
    if (!isValid) return;
    const latest = guidedEditorRef.current?.getMarkdown?.() ?? localMarkdown;
    setLocalMarkdown(latest);
    onMarkdownChange(latest);
    onSave(latest);
    setHasAppliedSuggestions(false);
  };

  const openPreview = () => {
    const latest = getCurrentMarkdown();
    setPreviewMarkdown(latest);
    setLocalMarkdown(latest);
    onMarkdownChange(latest);
    onPreviewChange?.(true);
  };

  const closePreview = () => onPreviewChange?.(false);

  const togglePreview = () => {
    if (isPreview) closePreview();
    else openPreview();
  };

  const syncLatestMarkdown = () => {
    const latest = getCurrentMarkdown();
    setLocalMarkdown(latest);
    setPreviewMarkdown(latest);
    onMarkdownChange(latest);
    return latest;
  };

  const openAnalyse = () => {
    syncLatestMarkdown();
    setIsAnalyseOpen(true);
  };

  const openScore = () => {
    syncLatestMarkdown();
    setIsScoreOpen(true);
  };

  const handleApplySection = (sectionId, content) => {
    if (isPreview) {
      pendingApplyRef.current = { sectionId, content };
      onPreviewChange?.(false);
      return;
    }
    guidedEditorRef.current?.applySectionSuggestion?.(sectionId, content);
    setHasAppliedSuggestions(true);
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
            resumeId={currentNoteId}
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

      <div className="floating-actions-cluster">
        {hasAppliedSuggestions && (
          <span className="unsaved-changes-badge">Unsaved</span>
        )}
        <div className="floating-actions floating-action-bar">
          {!isPreview && (
            <>
              <span className="fab-tooltip-wrap" data-tooltip={needsVerification ? "Verify all sections before saving" : "Save resume"}>
                <button
                  type="button"
                  className={`fab-bar-btn fab-save ${needsVerification ? "fab-save-locked" : ""}`}
                  onClick={() => {
                    if (needsVerification) return;
                    handleSave();
                  }}
                  aria-label="Save resume"
                  disabled={needsVerification}
                >
                  <LuSave size={20} />
                </button>
              </span>
              {verifyState.active && !verifyState.verified && (
                <span className="fab-tooltip-wrap" data-tooltip="Verify this section">
                  <button
                    type="button"
                    className="fab-bar-btn fab-verify"
                    onClick={() => guidedEditorRef.current?.verifyCurrentSection?.()}
                    aria-label="Verify section"
                  >
                    <LuCheck size={20} />
                  </button>
                </span>
              )}
              <span className="floating-action-divider" aria-hidden="true" />
            </>
          )}
          <span className="fab-tooltip-wrap" data-tooltip={isPreview ? "Back to edit" : "Preview CV"}>
            <button
              type="button"
              className={`fab-bar-btn ${isPreview ? "fab-edit active" : "fab-preview"}`}
              onClick={togglePreview}
              aria-label={isPreview ? "Back to edit" : "Preview CV"}
            >
              {isPreview ? <LuPenLine size={20} /> : <LuEye size={20} />}
            </button>
          </span>
          <span className="floating-action-divider" aria-hidden="true" />
          <span className="fab-tooltip-wrap fab-tooltip-wrap--end" data-tooltip="Score CV with AI">
            <button
              type="button"
              className="fab-bar-btn fab-score"
              onClick={openScore}
              aria-label="Score CV with AI"
            >
              <LuChartBar size={20} />
            </button>
          </span>
          <span className="fab-tooltip-wrap fab-tooltip-wrap--end" data-tooltip="Analyse CV against job description">
            <button
              type="button"
              className="fab-bar-btn fab-analyse"
              onClick={openAnalyse}
              aria-label="Analyse CV against job description"
            >
              <LuSparkles size={20} />
            </button>
          </span>
          {isPreview && (
            <>
              <span className="floating-action-divider" aria-hidden="true" />
              <span className="fab-tooltip-wrap" data-tooltip="Export as PDF">
                <button
                  type="button"
                  className="fab-bar-btn fab-export"
                  onClick={onDownloadPDF}
                  aria-label="Export as PDF"
                >
                  <LuDownload size={20} />
                </button>
              </span>
            </>
          )}
        </div>
      </div>

      <CVAnalyseModal
        isOpen={isAnalyseOpen}
        onClose={() => setIsAnalyseOpen(false)}
        markdown={getCurrentMarkdown()}
        onApplySection={handleApplySection}
      />
      <CVScoringModal
        isOpen={isScoreOpen}
        onClose={() => setIsScoreOpen(false)}
        markdown={getCurrentMarkdown()}
      />
    </div>
  );
}
