import React, { useState, useEffect, memo, useMemo } from "react";
import { LuTrash2, LuChevronDown, LuChevronRight, LuPanelLeftClose, LuPanelLeft, LuFileText } from "react-icons/lu";
import ProfileMenu from "./ProfileMenu";

function Sidebar({
  notes,
  onSelectNote,
  onDeleteNote,
  activeNoteId,
  openParentId,
  isSidebarOpen,
  onToggleSidebar,
  resumeCount,
  onOpenSettings,
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
              <div className="sidebar-brand-icon">
                <LuFileText size={16} />
              </div>
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

        <div className="section-label">Saved Resumes</div>
        <div className="notes-list large-scroll">
          {parents.length === 0 ? (
            <div className="sidebar-empty-state">
              <p>No resumes yet</p>
              <span className="sidebar-empty-hint">Create a resume from the main screen to see it listed here.</span>
            </div>
          ) : (
            parents.map((parent, pIdx) => (
              <div key={parent.id || `parent-${pIdx}`} className="parent-container">
                <div
                  className={`note-item parent-note ${activeNoteId === parent.id ? "active" : ""}`}
                  onClick={() => { handleSelectNote(parent); toggleParent(parent.id); }}
                >
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
                    {childrenByParent[parent.id].map((child, cIdx) => (
                      <div
                        key={child.id || `child-${cIdx}`}
                        className={`note-item child-note ${activeNoteId === child.id ? "active" : ""}`}
                        onClick={() => handleSelectNote(child)}
                      >
                        <div className="note-info">
                          <span className="note-title">{child.title || "Untitled"}</span>
                          <small className="note-date">{child.date}</small>
                        </div>

                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteNote(child.id); }} title="Delete">
                          <LuTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <ProfileMenu resumeCount={resumeCount} variant="sidebar" onOpenSettings={onOpenSettings} />
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

        <div className="sidebar-mini-resumes">
          {parents.map((parent, pIdx) => (
            <button
              key={parent.id || `mini-${pIdx}`}
              type="button"
              className={`sidebar-mini-resume-btn ${activeNoteId === parent.id ? "active" : ""}`}
              onClick={() => handleSelectNote(parent)}
              title={parent.title || "Untitled"}
            >
              <LuFileText size={18} />
            </button>
          ))}
        </div>

        <div className="sidebar-mini-spacer" />

        <div className="sidebar-mini-footer">
          <ProfileMenu resumeCount={resumeCount} variant="mini" onOpenSettings={onOpenSettings} />
        </div>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
