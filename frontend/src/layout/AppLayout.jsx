import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ArrowUpRight,
  Bell,
  Menu,
  Search,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

import Sidebar from './Sidebar';
import { api } from '../services/api';
import { moduleDescriptions, modules } from '../data/modules';

export default function AppLayout({
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentUser =
    sessionStorage.getItem('sponsor-crm-user') ||
    localStorage.getItem('sponsor-crm-user') ||
    'Workspace User';

  const current = useMemo(
    () => modules.find((module) => module.path === location.pathname),
    [location.pathname]
  );

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return modules
      .filter((module) =>
        [
          module.label,
          module.key,
          module.group,
          moduleDescriptions[module.key],
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const openModule = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
  };

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
            {/* Workspace search */}
            <div className="global-search-wrap" ref={searchContainerRef}>
              <label className="global-search">
                <Search size={16} />

                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search workspace..."
                  aria-label="Search workspace modules"
                  aria-controls="workspace-search-results"
                  aria-expanded={searchOpen && Boolean(searchQuery.trim())}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchResults[0]) {
                      event.preventDefault();
                      openModule(searchResults[0].path);
                    }

                    if (event.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                />

                <kbd>⌘ K</kbd>
              </label>

              {searchOpen && searchQuery.trim() && (
                <div
                  className="global-search-results"
                  id="workspace-search-results"
                  role="listbox"
                  aria-label="Matching workspace modules"
                >
                  {searchResults.length ? (
                    searchResults.map((module) => {
                      const Icon = module.icon;

                      return (
                        <button
                          type="button"
                          className="global-search-result"
                          key={module.key}
                          role="option"
                          onClick={() => openModule(module.path)}
                        >
                          <Icon size={16} aria-hidden="true" />
                          <span className="global-search-result-copy">
                            <b>{module.label}</b>
                            <small>{module.group}</small>
                          </span>
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </button>
                      );
                    })
                  ) : (
                    <p className="global-search-empty" role="status">
                      No matching workspace modules.
                    </p>
                  )}
                </div>
              )}
            </div>

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
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              title="Open notifications"
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