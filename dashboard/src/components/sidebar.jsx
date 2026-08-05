import React from 'react';
import { 
  LayoutDashboard, 
  Folder, 
  Key, 
  BarChart2, 
  Settings, 
  Headphones,
  Zap,
  ChevronDown
} from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'analytics', label: 'Usage & Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Zap className="logo-icon" fill="var(--accent-color)" stroke="var(--accent-color)" size={24} />
        <h2>FormConnect</h2>
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
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="user-name">Abinand E S</span>
            <span className="user-email">abinand705@gmail.com</span>
          </div>
          <ChevronDown size={16} className="dropdown-icon" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
