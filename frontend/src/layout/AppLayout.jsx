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
import { modules } from '../data/modules';

export default function AppLayout({
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [collapsed, setCollapsed] = useState(() =>
    window.matchMedia('(min-width: 761px) and (max-width: 1024px)').matches
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);

  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const compactDesktop = window.matchMedia(
      '(min-width: 761px) and (max-width: 1024px)'
    );
    const updateSidebar = () => setCollapsed(compactDesktop.matches);

    compactDesktop.addEventListener('change', updateSidebar);
    return () => compactDesktop.removeEventListener('change', updateSidebar);
  }, []);

  const currentUser =
    sessionStorage.getItem('sponsor-crm-user') ||
    localStorage.getItem('sponsor-crm-user') ||
    'Workspace User';

  const current = useMemo(
    () => modules.find((module) => module.path === location.pathname),
    [location.pathname]
  );

  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  const query = searchQuery.trim();

  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setSearching(false);
      setActiveSearchIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearchResults([]);
    setSearchError('');
    setActiveSearchIndex(-1);

    const timer = window.setTimeout(() => {
      api.searchRecords(query, { signal: controller.signal })
        .then((results) => {
          setSearchResults(results);
          setActiveSearchIndex(-1);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setSearchError(error.message);
            setSearchResults([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setSearching(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (window.matchMedia('(max-width: 900px)').matches) {
          setMobileSearchOpen(true);
        } else {
          searchInputRef.current?.focus();
        }
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setMobileOpen(false);
        setActiveSearchIndex(-1);
      }
    };

    const handlePointerDown = (event) => {
      if (
        !searchContainerRef.current?.contains(event.target) &&
        !event.target.closest?.('.mobile-search-toggle')
      ) {
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setActiveSearchIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  const openRecord = (record) => {
    const params = new URLSearchParams({ search: query });
    navigate({
      pathname: `/${record.moduleKey}`,
      search: `?${params.toString()}`,
    });
    setSearchQuery('');
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setActiveSearchIndex(-1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown' && searchResults.length) {
      event.preventDefault();
      setActiveSearchIndex((index) =>
        index >= searchResults.length - 1 ? 0 : index + 1
      );
    }

    if (event.key === 'ArrowUp' && searchResults.length) {
      event.preventDefault();
      setActiveSearchIndex((index) =>
        index <= 0 ? searchResults.length - 1 : index - 1
      );
    }

    if (event.key === 'Enter' && searchResults.length) {
      event.preventDefault();
      openRecord(searchResults[activeSearchIndex] || searchResults[0]);
    }

    if (event.key === 'Escape') {
      setSearchOpen(false);
      setActiveSearchIndex(-1);
    }
  };

  const handleToggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  const handleCloseMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleOpenMobileMenu = () => {
    setCollapsed(false);
    setMobileOpen(true);
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
              onClick={handleOpenMobileMenu}
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
            <div
              className={`global-search-wrap ${
                mobileSearchOpen ? 'mobile-open' : ''
              }`}
              ref={searchContainerRef}
            >
              <label className="global-search">
                <Search size={18} strokeWidth={2.25} aria-hidden="true" />

                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search records..."
                  aria-label="Search CRM records"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls="workspace-search-results"
                  aria-expanded={searchOpen && Boolean(searchQuery.trim())}
                  aria-activedescendant={
                    activeSearchIndex >= 0
                      ? `workspace-search-result-${activeSearchIndex}`
                      : undefined
                  }
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                    setSearchResults([]);
                    setSearchError('');
                    setActiveSearchIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                />

              
              </label>

              {searchOpen && searchQuery.trim() && (
                <div
                  className="global-search-results"
                  id="workspace-search-results"
                  role="listbox"
                  aria-label="Matching CRM records"
                >
                  {query.length < 2 ? (
                    <p className="global-search-empty" role="status">
                      Enter at least 2 characters to search records.
                    </p>
                  ) : searching ? (
                    <p className="global-search-empty" role="status">
                      Searching records…
                    </p>
                  ) : searchError ? (
                    <p className="global-search-error" role="alert">
                      Search failed: {searchError}
                    </p>
                  ) : searchResults.length ? (
                    searchResults.map((record, index) => {
                      const definition = modules.find(
                        (item) => item.key === record.moduleKey
                      );
                      const Icon = definition?.icon || Search;

                      return (
                        <button
                          type="button"
                          className="global-search-result"
                          key={`${record.moduleKey}-${record.id}`}
                          id={`workspace-search-result-${index}`}
                          role="option"
                          aria-selected={index === activeSearchIndex}
                          data-active={index === activeSearchIndex}
                          onClick={() => openRecord(record)}
                          aria-label={`${record.title}, ${definition?.label || record.moduleKey}`}
                        >
                          <Icon size={16} aria-hidden="true" />
                          <span className="global-search-result-copy">
                            <b>{record.title}</b>
                            <small>
                              {definition?.label || record.moduleKey}
                              {record.status ? ` · ${record.status.replaceAll('_', ' ')}` : ''}
                              {record.detail ? ` · ${record.detail}` : ''}
                            </small>
                          </span>
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </button>
                      );
                    })
                  ) : (
                    <p className="global-search-empty" role="status">
                      No matching records.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-button mobile-search-toggle"
              onClick={() => {
                setMobileSearchOpen((open) => !open);
                setSearchOpen(true);
              }}
              aria-label={mobileSearchOpen ? 'Close workspace search' : 'Open workspace search'}
              aria-expanded={mobileSearchOpen}
              title="Search workspace"
            >
              <Search size={19} strokeWidth={2.25} aria-hidden="true" />
            </button>

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
          <Outlet key={location.pathname} />
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