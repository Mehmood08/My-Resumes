import React, { useState, useEffect, memo, useMemo } from "react";
import { useAuth } from '../context/AuthContext'; // Import Auth
import { LuPlus, LuTrash2, LuChevronDown, LuChevronRight, LuLogOut, LuX, LuFileText, LuCrown, LuSettings } from "react-icons/lu";

function Sidebar({ notes, onSelectNote, onDeleteNote, onCreateNote, activeNoteId, openParentId, isSidebarOpen, onCloseSidebar }) {
  const { user, logout } = useAuth(); // Get User
  const [openParents, setOpenParents] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const resumeCount = useMemo(() => Array.isArray(notes) ? notes.filter(n => !n.parentId).length : 0, [notes]);
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
      {/* PREMIUM USER PROFILE CARD */}
      {user && (
        <div className="profile-card">
          <div className="profile-main">
            <div className="profile-avatar-container">
              {user.picture ? (
                <img src={user.picture} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-fallback">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="online-status-dot"></div>
            </div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-role-badge">
                <LuCrown size={12} /> Pro Member
              </div>
            </div>
          </div>

          <div className="profile-footer">
            <div className="profile-stats-item">
              <span className="stats-label">Resumes</span>
              <span className="stats-value">{resumeCount} Created</span>
            </div>
            <div className="profile-actions">
              <button className="profile-action-btn" title="Profile Settings">
                <LuSettings size={16} />
              </button>
              <button onClick={() => setShowLogoutConfirm(true)} className="profile-action-btn logout-btn" title="Sign Out">
                <LuLogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}>
            <div style={{
              background: '#fee2e2', color: '#ef4444', width: '60px', height: '60px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <LuLogOut size={30} />
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.25rem', marginBottom: '10px' }}>Sign Out</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.5' }}>
              Are you sure you want to log out? You will need to sign in again to access your resumes.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={logout}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-header" style={{ padding: '16px 20px' }}>
        <div className="header-top" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(79, 70, 229, 0.2)',
              color: '#a5b4fc',
              padding: '5px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LuFileText size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#f8fafc', opacity: 0.9 }}>
              My-Resume
            </h3>
          </div>
          
          {/* Desktop & Mobile Collapse Button */}
          <button 
            className="sidebar-toggle-btn" 
            onClick={onCloseSidebar} 
            title="Close Sidebar"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <LuX size={18} />
          </button>
        </div>
      </div>


      <div className="section-label">History / Resumes</div>
      <div className="notes-list large-scroll">
        {parents.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--sidebar-muted)', fontSize: '13px' }}>
            <p>No resumes yet.</p>
            <button 
              onClick={onCreateNote}
              style={{
                marginTop: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', 
                color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Start First CV
            </button>
          </div>
        ) : (
          parents.map((parent, pIdx) => (
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
          ))
        )}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
