import React, { useState, useEffect, useRef } from 'react'
import { Search, Mail, Bell, ChevronDown, LogOut, Settings as SettingsIcon, Key, ExternalLink } from 'lucide-react'

export function TopBar({ email, onLogout, onNavigate, onSearch }) {
  const [searchValue, setSearchValue] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const searchInputRef = useRef(null)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  // Display user details
  const displayEmail = email || 'tmichael20@gmail.com'
  const displayName = email ? email.split('@')[0] : 'Totok Michael'

  // Shortcut key listener for Cmd+F / Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchValue(val)
    if (onSearch) {
      onSearch(val)
    }
  }

  return (
    <header className="topbar-container">
      {/* Search Bar with shortcut chip */}
      <div className="topbar-search-wrapper">
        <Search size={18} className="topbar-search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          className="topbar-search-input"
          placeholder="Search task"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <div className="topbar-search-shortcut" title="Press ⌘F to search">
          ⌘F
        </div>
      </div>

      {/* Right Top Actions */}
      <div className="topbar-actions">
        {/* Mail Button */}
        <button
          type="button"
          className="btn-icon-circle"
          title="Messages"
          onClick={() => {
            if (onNavigate) onNavigate('support')
          }}
        >
          <Mail size={18} />
        </button>

        {/* Notification Bell Button */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="btn-icon-circle"
            title="Notifications"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {/* Notification indicator dot */}
            <span
              style={{
                position: 'absolute',
                top: '9px',
                right: '9px',
                width: '7px',
                height: '7px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid #ffffff'
              }}
            />
          </button>

          {notifDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '280px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.85rem',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.4rem'
                }}
              >
                Notifications
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem' }}>
                🎉 Welcome to your new FormConnect dashboard theme!
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                🟢 All form endpoints and services are operating normally.
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            className="topbar-user-profile"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="topbar-avatar">
              {/* Cute memoji / avatar illustration */}
              <span role="img" aria-label="avatar" style={{ fontSize: '1.25rem' }}>
                👨🏽‍💻
              </span>
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{displayName}</span>
              <span className="topbar-user-email">{displayEmail}</span>
            </div>
            <ChevronDown
              size={14}
              color="#64748b"
              style={{
                transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                marginLeft: '0.25rem'
              }}
            />
          </div>

          {/* User Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '220px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 100
              }}
            >
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '0.35rem'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {displayEmail}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false)
                  if (onNavigate) onNavigate('settings')
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  color: '#334155',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  boxShadow: 'none',
                  justifyContent: 'flex-start',
                  fontSize: '0.85rem'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <SettingsIcon size={16} color="#64748b" />
                Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false)
                  if (onNavigate) onNavigate('apikeys')
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  color: '#334155',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  boxShadow: 'none',
                  justifyContent: 'flex-start',
                  fontSize: '0.85rem'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Key size={16} color="#64748b" />
                API Keys
              </button>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.35rem 0' }} />

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false)
                  if (onLogout) onLogout()
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  color: '#dc2626',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  boxShadow: 'none',
                  justifyContent: 'flex-start',
                  fontSize: '0.85rem'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} color="#dc2626" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
