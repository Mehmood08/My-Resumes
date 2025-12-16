import React, { useState, useEffect, memo, useMemo } from "react";

function Sidebar({ notes, onSelectNote, onDeleteNote, onCreateNote, activeNoteId, openParentId }) {
  const [openParents, setOpenParents] = useState({});

  // Precompute parents and children map to avoid filtering on every render
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

  // Auto open parent only when openParentId changes
  useEffect(() => {
    if (!openParentId) return;
    if (!openParents[openParentId]) {
      setOpenParents(prev => ({ ...prev, [openParentId]: true }));
    }
  }, [openParentId]);

  const toggleParent = (id) => {
    setOpenParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Notes:</h3>
        <button className="add-btn" onClick={() => onCreateNote()}>+</button>
      </div>

      <div className="notes-list">
        {parents.map(parent => (
          <div key={parent.id} className="parent-container">
            <div
              className={`note-item parent-note ${activeNoteId === parent.id ? "active" : ""}`}
              onClick={() => { onSelectNote(parent); toggleParent(parent.id); }}
            >
              <div className="note-info">
                <span className="note-title">{parent.title || "Untitled"}</span>
                <small className="note-date">{parent.date}</small>
              </div>

              <div className="note-buttons">
                <button
                  className="child-btn"
                  onClick={(e) => { e.stopPropagation(); onCreateNote(parent.id); }}
                > + </button>

                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); onDeleteNote(parent.id); }}
                > ✖ </button>
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

                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); onDeleteNote(child.id); }}
                    > ✖ </button>
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
