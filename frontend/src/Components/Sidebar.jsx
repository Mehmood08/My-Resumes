import React, { useState, useEffect, memo, useMemo } from "react";
import { LuTrash2, LuChevronDown, LuChevronRight, LuPanelLeftClose, LuPanelLeft, LuSettings, LuPlus } from "react-icons/lu";
import ProfileMenu from "./ProfileMenu";

const LETTER_AVATAR_COLORS = [
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#dbeafe", color: "#2563eb" },
  { bg: "#dcfce7", color: "#16a34a" },
  { bg: "#ffedd5", color: "#ea580c" },
  { bg: "#fce7f3", color: "#db2777" },
  { bg: "#ccfbf1", color: "#0d9488" },
  { bg: "#fef3c7", color: "#d97706" },
  { bg: "#e0e7ff", color: "#4f46e5" },
];

function getLetterAvatar(title, index = 0) {
  const letter = (title || "U").trim().charAt(0).toUpperCase() || "U";
  const palette = LETTER_AVATAR_COLORS[(letter.charCodeAt(0) + index) % LETTER_AVATAR_COLORS.length];
  return { letter, ...palette };
}

function Sidebar({
  notes,
  onSelectNote,
  onDeleteNote,
  activeNoteId,
  openParentId,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onCreateResume,
}) {
  const [openParents, setOpenParents] = useState({});
  const parents = useMemo(() => Array.isArray(notes) ? notes.filter(n => !n.parentId) : [], [notes]);
  const childrenByParent = useMemo(() => {
    const map = {};
    if (!Array.isArray(notes)) return map;
    notes.forEach(n => {
      if (n.parentId) {
        if (!map[n.parentId]) map[n.parentId] = [];
        map[n.parentId].push(n);
      }
    });
    return map;
  }, [notes]);

  useEffect(() => {
    if (!openParentId) return;
    if (!openParents[openParentId]) {
      setOpenParents(prev => ({ ...prev, [openParentId]: true }));
    }
  }, [openParentId]);

  const toggleParent = (id) => {
    setOpenParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectNote = (note) => {
    onSelectNote(note);
    if (window.innerWidth <= 768) onToggleSidebar();
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? "sidebar-expanded mobile-show" : "sidebar-collapsed-mode"}`}>
      {/* Expanded sidebar */}
      <div className="sidebar-expanded-panel">
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <div className="sidebar-brand">
              <h3 className="sidebar-brand-title">My Resumes</h3>
            </div>
            <button
              className="sidebar-collapse-btn"
              onClick={onToggleSidebar}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <LuPanelLeftClose size={18} />
            </button>
          </div>
        </div>

        {onCreateResume && (
          <div className="sidebar-new-resume-wrap">
            <button
              type="button"
              className="sidebar-settings-btn sidebar-add-btn"
              onClick={onCreateResume}
            >
              <LuPlus size={18} />
              <span>New Resume</span>
            </button>
          </div>
        )}

        <div className="section-label">Saved Resumes</div>
        <div className="notes-list large-scroll">
          {parents.length === 0 ? (
            <div className="sidebar-empty-state">
              <p>No resumes yet</p>
              <span className="sidebar-empty-hint">Create a resume from the main screen to see it listed here.</span>
            </div>
          ) : (
            parents.map((parent, pIdx) => {
              const avatar = getLetterAvatar(parent.title, pIdx);
              return (
              <div key={parent.id || `parent-${pIdx}`} className="parent-container">
                <div
                  className={`note-item parent-note ${activeNoteId === parent.id ? "active" : ""}`}
                  onClick={() => { handleSelectNote(parent); toggleParent(parent.id); }}
                >
                  <span
                    className="cv-letter-avatar"
                    style={{ background: avatar.bg, color: avatar.color }}
                    aria-hidden="true"
                  >
                    {avatar.letter}
                  </span>
                  <div className="note-info">
                    <span className="note-title">
                      {childrenByParent[parent.id] ? (openParents[parent.id] ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />) : null}
                      {parent.title || "Untitled"}
                    </span>
                    <small className="note-date">{parent.date}</small>
                  </div>

                  <div className="note-buttons" onClick={e => e.stopPropagation()}>
                    <button className="delete-btn" onClick={() => onDeleteNote(parent.id)} title="Delete">
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {openParents[parent.id] && childrenByParent[parent.id] && (
                  <div className="child-notes-container open">
                    {childrenByParent[parent.id].map((child, cIdx) => {
                      const childAvatar = getLetterAvatar(child.title, pIdx + cIdx + 1);
                      return (
                      <div
                        key={child.id || `child-${cIdx}`}
                        className={`note-item child-note ${activeNoteId === child.id ? "active" : ""}`}
                        onClick={() => handleSelectNote(child)}
                      >
                        <span
                          className="cv-letter-avatar cv-letter-avatar--sm"
                          style={{ background: childAvatar.bg, color: childAvatar.color }}
                          aria-hidden="true"
                        >
                          {childAvatar.letter}
                        </span>
                        <div className="note-info">
                          <span className="note-title">{child.title || "Untitled"}</span>
                          <small className="note-date">{child.date}</small>
                        </div>

                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteNote(child.id); }} title="Delete">
                          <LuTrash2 size={14} />
                        </button>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )})
          )}
        </div>

        <div className="sidebar-footer">
          {onOpenSettings && (
            <button
              type="button"
              className="sidebar-settings-btn"
              onClick={onOpenSettings}
            >
              <LuSettings size={18} />
              <span>Settings</span>
            </button>
          )}
          <ProfileMenu variant="sidebar" />
        </div>
      </div>

      {/* Collapsed icon rail */}
      <div className="sidebar-mini-rail">
        <button
          type="button"
          className="sidebar-mini-btn"
          onClick={onToggleSidebar}
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <LuPanelLeft size={20} />
        </button>

        <div className="sidebar-mini-divider" />

        {onCreateResume && (
          <button
            type="button"
            className="sidebar-mini-btn sidebar-mini-add-btn"
            onClick={onCreateResume}
            title="New Resume"
            aria-label="New Resume"
          >
            <LuPlus size={20} />
          </button>
        )}

        <div className="sidebar-mini-divider" />

        <div className="sidebar-mini-resumes">
          {parents.map((parent, pIdx) => {
            const avatar = getLetterAvatar(parent.title, pIdx);
            return (
            <button
              key={parent.id || `mini-${pIdx}`}
              type="button"
              className={`sidebar-mini-resume-btn ${activeNoteId === parent.id ? "active" : ""}`}
              onClick={() => handleSelectNote(parent)}
              title={parent.title || "Untitled"}
            >
              <span
                className="cv-letter-avatar cv-letter-avatar--mini"
                style={{ background: avatar.bg, color: avatar.color }}
              >
                {avatar.letter}
              </span>
            </button>
          )})}
        </div>

        <div className="sidebar-mini-spacer" />

        <div className="sidebar-mini-divider" />

        <div className="sidebar-mini-footer">
          {onOpenSettings && (
            <button
              type="button"
              className="sidebar-mini-btn sidebar-mini-settings-btn"
              onClick={onOpenSettings}
              title="Settings"
              aria-label="Settings"
            >
              <LuSettings size={20} />
            </button>
          )}
          <ProfileMenu variant="mini" />
        </div>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
