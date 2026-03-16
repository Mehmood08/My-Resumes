import React, { useState, useEffect, memo, useMemo } from "react";
import { useAuth } from '../context/AuthContext'; // Import Auth
import { LuPlus, LuTrash2, LuChevronDown, LuChevronRight, LuLogOut, LuX } from "react-icons/lu";

function Sidebar({ notes, onSelectNote, onDeleteNote, onCreateNote, activeNoteId, openParentId, isSidebarOpen, onCloseSidebar }) {
  const { user, logout } = useAuth(); // Get User
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

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'mobile-show' : ''}`}>
      {/* PROFESSIONAL USER PROFILE HEADER */}
      {user && (
        <div className="sidebar-profile" style={{
          padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '15px',
          borderBottom: '1px solid #e2e8f0', marginBottom: '15px', background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
        }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user.picture}
              alt="Profile"
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '2px', right: '0', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }}></span>
              Pro Member
            </div>
          </div>

          <button
            onClick={logout}
            className="logout-btn-hover"
            style={{
              background: '#fee2e2', border: 'none', color: '#ef4444',
              borderRadius: '8px', padding: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Sign Out"
          >
            <LuLogOut size={18} />
          </button>
        </div>
      )}

      <div className="sidebar-header">
        <div className="header-top">
          <h3>My Resumes</h3>
          <button className="sidebar-close-btn mobile-only" onClick={onCloseSidebar} title="Close Sidebar">
            <LuX size={20} />
          </button>
        </div>
      </div>

      <div className="section-label">History / Resumes</div>
      <div className="notes-list large-scroll">
        {parents.map((parent, pIdx) => (
          <div key={parent.id || `parent-${pIdx}`} className="parent-container">
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
