import React, { memo } from "react";
import { createPortal } from "react-dom";
import {
  LuEye,
  LuDownload,
  LuPenLine,
  LuSave,
  LuCheck,
  LuSparkles,
  LuChartBar,
  LuLoader,
} from "react-icons/lu";

function handleFabButtonMouseDown(event, onClick) {
  if (event.button !== 0 || event.currentTarget.disabled) return;

  const active = document.activeElement;
  if (active?.matches?.("textarea, input, [contenteditable=\"true\"]")) {
    event.preventDefault();
    onClick?.(event);
  }
}

function FabBarButton({ className, onClick, label, tooltip, disabled, children }) {
  return (
    <button
      type="button"
      className={`fab-bar-btn fab-bar-btn-labeled ${className || ""}`}
      title={tooltip}
      onMouseDown={(event) => handleFabButtonMouseDown(event, onClick)}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
    >
      {children}
      <span className="fab-mobile-label">{label}</span>
    </button>
  );
}

function FloatingActionBar({
  isPreview,
  needsVerification,
  verifyState,
  hasAppliedSuggestions,
  isExportingPdf,
  onSave,
  onVerify,
  onTogglePreview,
  onOpenScore,
  onOpenAnalyse,
  onExportPdf,
}) {
  const bar = (
    <div className="floating-actions-cluster">
      {hasAppliedSuggestions && (
        <span className="unsaved-changes-badge">Unsaved</span>
      )}
      <div className="floating-actions floating-action-bar">
        {!isPreview && (
          <>
            <FabBarButton
              className={`fab-save ${needsVerification ? "fab-save-locked" : ""}`}
              onClick={onSave}
              label="Save"
              tooltip={
                needsVerification
                  ? "Verify all sections before saving"
                  : "Save resume"
              }
              disabled={needsVerification}
            >
              <LuSave size={20} />
            </FabBarButton>
            {verifyState.active && !verifyState.verified && (
              <FabBarButton
                className="fab-verify"
                onClick={onVerify}
                label="Verify"
                tooltip="Verify this section"
              >
                <LuCheck size={20} />
              </FabBarButton>
            )}
            <span className="floating-action-divider" aria-hidden="true" />
          </>
        )}
        <FabBarButton
          className={isPreview ? "fab-edit active" : "fab-preview"}
          onClick={onTogglePreview}
          label={isPreview ? "Edit" : "Preview"}
          tooltip={isPreview ? "Back to edit" : "Preview CV"}
        >
          {isPreview ? <LuPenLine size={20} /> : <LuEye size={20} />}
        </FabBarButton>
        <span className="floating-action-divider" aria-hidden="true" />
        <FabBarButton
          className="fab-score"
          onClick={onOpenScore}
          label="Score"
          tooltip="Score CV with AI"
        >
          <LuChartBar size={20} />
        </FabBarButton>
        <FabBarButton
          className="fab-analyse"
          onClick={onOpenAnalyse}
          label="Analyse"
          tooltip="Analyse CV against job description"
        >
          <LuSparkles size={20} />
        </FabBarButton>
        {isPreview && (
          <>
            <span className="floating-action-divider" aria-hidden="true" />
            <FabBarButton
              className="fab-export"
              onClick={onExportPdf}
              label="PDF"
              tooltip="Download vector PDF"
              disabled={isExportingPdf}
            >
              {isExportingPdf ? (
                <LuLoader size={20} className="fab-spin" />
              ) : (
                <LuDownload size={20} />
              )}
            </FabBarButton>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(bar, document.body);
}

export default memo(FloatingActionBar);
