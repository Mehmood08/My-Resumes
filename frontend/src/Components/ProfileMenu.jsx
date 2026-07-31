import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LuLogOut, LuUser, LuUserPlus } from 'react-icons/lu';
import InviteModal from './InviteModal';

export default function ProfileMenu({ variant = 'default' }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
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

  const isMini = variant === 'mini';
  const isSidebar = variant === 'sidebar';
  const iconSize = isMini ? 20 : 18;

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
          aria-label="Profile menu"
          title={user.name}
        >
          <LuUser size={iconSize} className="profile-menu-icon" />
          {isSidebar && <span>Profile</span>}
        </button>

        {isOpen && (
          <div className={`profile-menu-dropdown profile-menu-dropdown--${variant}`} role="menu">
            <div className="profile-menu-context-user">
              <span className="profile-menu-name">{user.name}</span>
              {user.email && <span className="profile-menu-email">{user.email}</span>}
            </div>
            <div className="profile-menu-divider" />
            <button
              type="button"
              className="profile-menu-signout"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsInviteOpen(true);
              }}
            >
              <LuUserPlus size={16} />
              Invite User
            </button>
            <button
              type="button"
              className="profile-menu-signout"
              role="menuitem"
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

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}
