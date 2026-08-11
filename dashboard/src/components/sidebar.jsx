import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Folder,
  Key,
  BarChart2,
  Settings,
  Headphones,
  Zap,
  ChevronDown,
  LogOut
} from 'lucide-react';
import logo from '../assets/logo.svg';

function Sidebar({ activeTab, setActiveTab, email, handleLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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

  return (
    <aside className="sidebar">
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
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ cursor: 'pointer', position: 'relative' }}
          ref={dropdownRef}
        >
          <div className="avatar">{avatarLetter}</div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-email">{displayEmail}</span>
          </div>
          <ChevronDown
            size={16}
            className="dropdown-icon"
            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              width: '92%',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 10,
              padding: '0.5rem'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
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
    </aside>
  );
}

export default Sidebar;
