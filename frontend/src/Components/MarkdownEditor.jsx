import React, { useState, useRef, useEffect, useCallback } from "react";

import CVPreview from "./CVPreview";
import GuidedEditor from "./GuidedEditor";
import CVAnalyseModal from "./CVAnalyseModal";
import CVScoringModal from "./CVScoringModal";
import FloatingActionBar from "./FloatingActionBar";
import { layouts } from "./templatesData";

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
  isExportingPdf = false,
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
  const getCurrentMarkdownRef = useRef(() => "");

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

  const getCurrentMarkdown = useCallback(() => {
    if (!isPreview) {
      return guidedEditorRef.current?.getDisplayMarkdown?.() ?? localMarkdown;
    }
    return previewMarkdown || localMarkdown;
  }, [isPreview, localMarkdown, previewMarkdown]);

  getCurrentMarkdownRef.current = getCurrentMarkdown;

  const handleSave = useCallback(() => {
    const isValid = guidedEditorRef.current?.validate?.() ?? true;
    if (!isValid) return;
    const latest = guidedEditorRef.current?.getMarkdown?.() ?? localMarkdown;
    setLocalMarkdown(latest);
    onMarkdownChange(latest);
    onSave(latest);
    setHasAppliedSuggestions(false);
  }, [localMarkdown, onMarkdownChange, onSave]);

  const handleSaveClick = useCallback(() => {
    if (needsVerification) return;
    handleSave();
  }, [needsVerification, handleSave]);

  const openPreview = useCallback(() => {
    const latest = getCurrentMarkdownRef.current();
    setPreviewMarkdown(latest);
    setLocalMarkdown(latest);
    onMarkdownChange(latest);
    onPreviewChange?.(true);
  }, [onMarkdownChange, onPreviewChange]);

  const closePreview = useCallback(() => {
    onPreviewChange?.(false);
  }, [onPreviewChange]);

  const togglePreview = useCallback(() => {
    if (isPreview) closePreview();
    else openPreview();
  }, [isPreview, closePreview, openPreview]);

  const syncLatestMarkdown = useCallback(() => {
    const latest = getCurrentMarkdownRef.current();
    setLocalMarkdown(latest);
    setPreviewMarkdown(latest);
    onMarkdownChange(latest);
    return latest;
  }, [onMarkdownChange]);

  const openAnalyse = useCallback(() => {
    syncLatestMarkdown();
    setIsAnalyseOpen(true);
  }, [syncLatestMarkdown]);

  const openScore = useCallback(() => {
    syncLatestMarkdown();
    setIsScoreOpen(true);
  }, [syncLatestMarkdown]);

  const handleVerify = useCallback(() => {
    guidedEditorRef.current?.verifyCurrentSection?.();
  }, []);

  const handleExportPdf = useCallback(() => {
    onDownloadPDF(getCurrentMarkdownRef.current());
  }, [onDownloadPDF]);

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
                  {layouts.map((layout) => (
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

      <FloatingActionBar
        isPreview={isPreview}
        needsVerification={needsVerification}
        verifyState={verifyState}
        hasAppliedSuggestions={hasAppliedSuggestions}
        isExportingPdf={isExportingPdf}
        onSave={handleSaveClick}
        onVerify={handleVerify}
        onTogglePreview={togglePreview}
        onOpenScore={openScore}
        onOpenAnalyse={openAnalyse}
        onExportPdf={handleExportPdf}
      />

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
