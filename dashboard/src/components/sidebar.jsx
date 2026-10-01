import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Folder,
  Key,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  MessageSquare,
  Menu,
  X,
  Download
} from 'lucide-react'
import logo from '../assets/logo.svg'
import { toast } from 'sonner'

function Sidebar({ activeTab, setActiveTab, email, handleLogout, projectCount }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on tab change
  useEffect(() => {
    setMobileOpen(false)
  }, [activeTab])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      badge: projectCount !== undefined && projectCount > 0 ? (projectCount > 99 ? '99+' : `${projectCount}`) : null
    },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'analytics', label: 'Usage & Analytics', icon: BarChart2 },
    { id: 'submissions', label: 'Submissions', icon: MessageSquare }
  ]

  const generalItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  const renderNavContent = () => (
    <>
      {/* Brand Logo Header */}
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="FormConnect Logo"
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
        />
        <span className="sidebar-logo-text">
          <span style={{ color: '#0E386A' }}>Form</span><span style={{ color: '#09A6D9' }}>Connect</span>
        </span>
      </div>

      {/* MENU Section */}
      <div className="sidebar-nav-group-label">MENU</div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </button>
          )
        })}
      </nav>

      {/* GENERAL Section */}
      <div className="sidebar-nav-group-label" style={{ marginTop: '1.25rem' }}>GENERAL</div>
      <nav className="sidebar-nav">
        {generalItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          )
        })}

        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ color: '#64748b' }}
        >
          <LogOut size={19} className="nav-icon" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Bottom Promo Card: "Download our Mobile App" */}
      <div className="sidebar-promo-card">
        {/* Subtle decorative curves inside */}
        <svg
          style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            width: '90px',
            height: '90px',
            opacity: 0.25,
            pointerEvents: 'none'
          }}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="40" stroke="#4ade80" strokeWidth="6" />
          <circle cx="50" cy="50" r="20" stroke="#4ade80" strokeWidth="4" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px'
            }}
          >
            <img src={logo} alt="FormConnect" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="sidebar-promo-title">Download our Mobile App</div>
        <div className="sidebar-promo-sub">Connect with forms anywhere</div>

        <a
          href="/formconnect.apk"
          download="FormConnect.apk"
          className="sidebar-promo-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          onClick={() => {
            toast.success('Downloading FormConnect mobile app...')
          }}
        >
          <Download size={15} />
          <span>Download</span>
        </a>
      </div>
    </>
  )

  const displayName = email ? email.split('@')[0] : 'User'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      badge: projectCount !== undefined && projectCount > 0 ? (projectCount > 99 ? '99+' : `${projectCount}`) : null
    },
    { id: 'submissions', label: 'Submissions', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar sidebar-desktop">
        {renderNavContent()}
      </aside>

      {/* Mobile Sticky Topbar */}
      <header className="mobile-topbar">
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <img src={logo} alt="FormConnect" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#0E386A' }}>Form</span><span style={{ color: '#09A6D9' }}>Connect</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* User profile avatar badge */}
          <button
            type="button"
            className="mobile-topbar-user-badge"
            onClick={() => setActiveTab('settings')}
            title={`Logged in as ${email || 'User'}`}
          >
            <div className="mobile-avatar-circle">
              {avatarLetter}
            </div>
            <span className="mobile-username-text">{displayName}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside className={`sidebar sidebar-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        {/* Drawer Profile Header */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div className="mobile-drawer-avatar">
              {avatarLetter}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="mobile-drawer-name">{displayName}</div>
              <div className="mobile-drawer-email">{email || 'User'}</div>
            </div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mobile-drawer-content">
          {renderNavContent()}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-bottom-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} className="mobile-bottom-icon" />
                {item.badge && (
                  <span className="mobile-bottom-badge">{item.badge}</span>
                )}
              </div>
              <span className="mobile-bottom-label">{item.label}</span>
              {isActive && <span className="mobile-bottom-active-dot" />}
            </button>
          )
        })}

        {/* More/Menu item to open drawer */}
        <button
          type="button"
          className={`mobile-bottom-item ${['settings', 'support', 'apikeys'].includes(activeTab) ? 'active' : ''}`}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} className="mobile-bottom-icon" />
          <span className="mobile-bottom-label">More</span>
        </button>
      </nav>
    </>
  )
}

export default Sidebar
