import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LuLogOut, LuCrown, LuChevronDown, LuSettings } from 'react-icons/lu';

export default function ProfileMenu({ resumeCount = 0, variant = 'default', onOpenSettings }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase() || 'U';
  const isMini = variant === 'mini';
  const isSidebar = variant === 'sidebar';

  return (
    <>
      <div
        className={`profile-menu-wrap profile-menu-wrap--${variant}`}
        ref={menuRef}
      >
        <button
          type="button"
          className={`profile-menu-trigger ${isOpen ? 'open' : ''} profile-menu-trigger--${variant}`}
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          title={user.name}
        >
          {user.picture ? (
            <img src={user.picture} alt="" className="profile-menu-avatar" />
          ) : (
            <span className="profile-menu-avatar-fallback">{initial}</span>
          )}
          {isSidebar && (
            <>
              <span className="profile-menu-trigger-name">{user.name}</span>
              <LuChevronDown size={14} className="profile-menu-chevron" />
            </>
          )}
          {!isMini && !isSidebar && (
            <LuChevronDown size={14} className="profile-menu-chevron" />
          )}
        </button>

        {isOpen && (
          <div className={`profile-menu-dropdown profile-menu-dropdown--${variant}`}>
            <div className="profile-menu-header">
              {user.picture ? (
                <img src={user.picture} alt="" className="profile-menu-dropdown-avatar" />
              ) : (
                <div className="profile-menu-dropdown-avatar-fallback">{initial}</div>
              )}
              <div className="profile-menu-user-info">
                <span className="profile-menu-name">{user.name}</span>
                {user.email && <span className="profile-menu-email">{user.email}</span>}
                <span className="profile-menu-badge">
                  <LuCrown size={11} /> Pro Member
                </span>
              </div>
            </div>

            <div className="profile-menu-stats">
              <span className="profile-menu-stats-label">Resumes created</span>
              <span className="profile-menu-stats-value">{resumeCount}</span>
            </div>

            <div className="profile-menu-divider" />

            {onOpenSettings && (
              <button
                type="button"
                className="profile-menu-settings"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
              >
                <LuSettings size={16} />
                API Settings
              </button>
            )}

            <button
              type="button"
              className="profile-menu-signout"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
            >
              <LuLogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="profile-logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="profile-logout-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-logout-icon">
              <LuLogOut size={28} />
            </div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to log out? You will need to sign in again to access your resumes.</p>
            <div className="profile-logout-actions">
              <button type="button" className="profile-logout-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="profile-logout-confirm" onClick={logout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
