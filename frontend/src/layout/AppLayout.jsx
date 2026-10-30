import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Bell, ChevronDown, Menu, Search, Sparkles, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import { api } from '../services/api';
import { modules } from '../data/modules';

export default function AppLayout({ onLogout, theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = sessionStorage.getItem('sponsor-crm-user') || 'Workspace User';
  const signOut = async () => { try { await api.logout(); } catch {} onLogout(); };
  const current = useMemo(() => modules.find(m => m.path === location.pathname), [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <main className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19}/></button>
            <button className="icon-button desktop-menu" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar"><Menu size={19}/></button>
            <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{current?.label || 'Overview'}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search"><Search size={16}/><input placeholder="Search workspace..." /><kbd>⌘ K</kbd></label>
            <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle light and dark theme" title="Toggle theme">{theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}<span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18}/><i/></button>
            <div className="topbar-divider"/>
            <button className="profile-menu" onClick={signOut} title="Sign out">
              <span className="avatar">AD</span>
              <span className="profile-copy"><b>{currentUser}</b><small>Signed in</small></span>
              <ChevronDown size={15}/>
            </button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="app-footer"><span>© Sponsor CRM</span><span><Sparkles size={13}/> Workspace</span></footer>
      </main>
    </div>
  );
}
