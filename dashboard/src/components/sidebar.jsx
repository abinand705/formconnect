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
  X
} from 'lucide-react'
import logo from '../assets/logo.svg'
import { toast } from 'sonner'

function Sidebar({ activeTab, setActiveTab, email, handleLogout, projectCount = 4 }) {
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
    { id: 'projects', label: 'Projects', icon: Folder, badge: `${projectCount > 0 ? (projectCount > 10 ? '12+' : projectCount) : '12+'}` },
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

        <button
          type="button"
          className="sidebar-promo-btn"
          onClick={() => {
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText('https://formconnect.app/download').catch(() => {})
            }
            toast.success('Mobile app download link copied to clipboard!')
          }}
        >
          Download
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar sidebar-desktop">
        {renderNavContent()}
      </aside>

      {/* Mobile Topbar */}
      <header className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img src={logo} alt="FormConnect" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827' }}>
            <span style={{ color: '#0E386A' }}>Form</span><span style={{ color: '#09A6D9' }}>Connect</span>
          </span>
        </div>
        <button
          className="btn-icon-circle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          style={{ width: '38px', height: '38px' }}
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`sidebar sidebar-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <button
          className="mobile-drawer-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        {renderNavContent()}
      </aside>
    </>
  )
}

export default Sidebar
