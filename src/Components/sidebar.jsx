import React, { useState, useEffect, memo, useMemo } from "react";
import { cvTemplates } from "../data/cvTemplates";
import { LuPlus, LuTrash2, LuChevronDown, LuChevronRight } from "react-icons/lu";

function Sidebar({ notes, onSelectNote, onDeleteNote, onCreateNote, activeNoteId, openParentId }) {
  const [openParents, setOpenParents] = useState({});
  const [selectedRole, setSelectedRole] = useState("Blank Note");
  const [showGuide, setShowGuide] = useState(false);

  const parents = useMemo(() => notes.filter(n => !n.parentId), [notes]);
  const childrenByParent = useMemo(() => {
    const map = {};
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

  const handleCreateNew = () => {
    if (selectedRole === "Blank Note") {
      setShowGuide(true);
      setTimeout(() => setShowGuide(false), 4000);
    }
    onCreateNote(null, selectedRole);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="header-top">
          <h3>My Resumes</h3>
          <button className="add-btn" onClick={handleCreateNew} title="Create New">
            <LuPlus size={18} />
          </button>
        </div>

        {showGuide && (
          <div className="guide-hint">
            💡 <strong>Tip:</strong> Select a <strong>Field</strong> then click Create New Note to get a ready-made structure!
          </div>
        )}

        <div className="role-selector-container">
          <label className="role-selector-label">Primary Field</label>
          <select
            className="role-selector"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {Object.keys(cvTemplates).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="section-label">History / Resumes</div>
      <div className="notes-list large-scroll">
        {parents.map(parent => (
          <div key={parent.id} className="parent-container">
            <div
              className={`note-item parent-note ${activeNoteId === parent.id ? "active" : ""}`}
              onClick={() => { onSelectNote(parent); toggleParent(parent.id); }}
            >
              <div className="note-info">
                <span className="note-title">
                  {childrenByParent[parent.id] ? (openParents[parent.id] ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />) : null}
                  {parent.title || "Untitled"}
                </span>
                <small className="note-date">{parent.date}</small>
              </div>

              <div className="note-buttons" onClick={e => e.stopPropagation()}>
                <button className="child-btn" onClick={() => onCreateNote(parent.id)} title="Add Sub-note">
                  <LuPlus size={14} />
                </button>
                <button className="delete-btn" onClick={() => onDeleteNote(parent.id)} title="Delete">
                  <LuTrash2 size={14} />
                </button>
              </div>
            </div>

            {openParents[parent.id] && childrenByParent[parent.id] && (
              <div className="child-notes-container open">
                {childrenByParent[parent.id].map(child => (
                  <div
                    key={child.id}
                    className={`note-item child-note ${activeNoteId === child.id ? "active" : ""}`}
                    onClick={() => onSelectNote(child)}
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
        ))}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
