import { Outlet, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';

import {
  Bell,
  Menu,
  Search,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

import Sidebar from './Sidebar';
import { api } from '../services/api';
import { modules } from '../data/modules';

export default function AppLayout({
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const currentUser =
    sessionStorage.getItem('sponsor-crm-user') ||
    localStorage.getItem('sponsor-crm-user') ||
    'Workspace User';

  const current = useMemo(
    () => modules.find((module) => module.path === location.pathname),
    [location.pathname]
  );

  const handleToggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  const handleCloseMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Clear local authentication even if the API request fails.
      console.error('Logout API request failed:', error);
    } finally {
      onLogout?.();
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={handleCloseMobileMenu}
        onLogout={handleLogout}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Mobile navigation overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* Main content */}
      <main
        className={`main-area ${
          collapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        {/* Top navigation */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              title="Open menu"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              className="icon-button desktop-menu"
              onClick={handleToggleSidebar}
              aria-label={
                collapsed ? 'Expand sidebar' : 'Collapse sidebar'
              }
              title={
                collapsed ? 'Expand sidebar' : 'Collapse sidebar'
              }
            >
              <Menu size={19} />
            </button>

            {/* Breadcrumb */}
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="crumb-slash">/</span>
              <strong>
                {current?.label || 'Overview'}
              </strong>
            </div>
          </div>

          {/* Topbar actions */}
          <div className="topbar-actions">
            {/* Search display */}
            <label className="global-search">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search workspace..."
                aria-label="Search workspace"
              />

              <kbd>⌘ K</kbd>
            </label>

            {/* Theme toggle */}
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label="Toggle light and dark theme"
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon size={16} />
              ) : (
                <Sun size={16} />
              )}

              <span>
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>

            <div className="topbar-divider" />

            {/* User profile */}
            <div
              className="profile-menu"
              aria-label={`Signed in as ${currentUser}`}
            >
              <span className="avatar">AD</span>

              <span className="profile-copy">
                <b>{currentUser}</b>
                <small>Signed in</small>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <span>© Sponsor CRM</span>

          <span>
            <Sparkles size={13} />
            Workspace
          </span>
        </footer>
      </main>
    </div>
  );
}