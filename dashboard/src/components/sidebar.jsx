import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Folder,
  Key,
  BarChart2,
  Settings,
  Headphones,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import logo from '../assets/logo.svg';

function Sidebar({ activeTab, setActiveTab, email, handleLogout }) {
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setDesktopDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'analytics', label: 'Usage & Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const displayEmail = email || 'user@example.com';
  const displayName = displayEmail.split('@')[0];
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const renderNavContent = (isMobile = false) => {
    const isDropdownOpen = isMobile ? mobileDropdownOpen : desktopDropdownOpen;
    const setIsDropdownOpen = isMobile ? setMobileDropdownOpen : setDesktopDropdownOpen;
    const ref = isMobile ? mobileDropdownRef : desktopDropdownRef;

    return (
      <>
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="logo-icon" style={{ width: '35px', height: '35px' }} />
          <h2><span style={{ color: '#0E386A' }}>Form</span><span style={{ color: '#09A6D9' }}>Connect</span></h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-profile"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ cursor: 'pointer', position: 'relative' }}
            ref={ref}
          >
            <div className="avatar">{avatarLetter}</div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-email">{displayEmail}</span>
            </div>
            <ChevronDown
              size={16}
              className="dropdown-icon"
              style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                width: '100%',
                marginBottom: '0.5rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 100,
                padding: '0.5rem',
                boxSizing: 'border-box'
              }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--danger-color)',
                    cursor: 'pointer',
                    borderRadius: 'calc(var(--border-radius) - 2px)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.38)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="sidebar sidebar-desktop">
        {renderNavContent(false)}
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
            <span style={{ color: '#0E386A' }}>Form</span><span style={{ color: '#09A6D9' }}>Connect</span>
          </span>
        </div>
        <button
          className="mobile-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* ===== MOBILE DRAWER OVERLAY ===== */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* ===== MOBILE DRAWER ===== */}
      <aside className={`sidebar sidebar-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <button
          className="mobile-drawer-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
        {renderNavContent(true)}
      </aside>
    </>
  );
}

export default Sidebar;
