import { NavLink } from 'react-router-dom';

import {
  ChevronLeft,
  Handshake,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { modules } from '../data/modules';

const groups = [
  'Workspace',
  'Relationships',
  'Growth',
  'Partnerships',
  'Activation',
  'Insights',
  'Administration',
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
  onLogout,
  onToggleCollapse,
}) {
  const handleLogout = async () => {
    onNavigate?.();
    await onLogout?.();
  };

  const handleNavigation = () => {
    onNavigate?.();
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${
        mobileOpen ? 'mobile-open' : ''
      }`}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="brand-row">
        <div className="brand-mark" aria-hidden="true">
          <Handshake size={21} strokeWidth={2.2} />
        </div>

        {!collapsed && (
          <div className="brand-name">
            <b>SPONSOR CRM</b>
            <small>PARTNERSHIP WORKSPACE</small>
          </div>
        )}

        <button
          type="button"
          className="sidebar-collapse"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} />
          ) : (
            <PanelLeftClose size={17} />
          )}
        </button>
      </div>

      {/* Workspace */}
      <div className="workspace-switch">
        <div className="workspace-icon" aria-hidden="true">
          <span>SC</span>
        </div>

        {!collapsed && (
          <div className="workspace-copy">
            <b>Workspace</b>
            <small>Management Portal</small>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="side-nav">
        {groups.map((group) => {
          const items = modules.filter(
            (module) => module.group === group
          );

          if (!items.length) {
            return null;
          }

          return (
            <section className="nav-group" key={group}>
              {!collapsed && (
                <p className="nav-heading">{group}</p>
              )}

              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={handleNavigation}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-icon">
                      <Icon size={17} strokeWidth={1.9} />
                    </span>

                    {!collapsed && (
                      <span className="nav-link-label">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </section>
          );
        })}
      </nav>

      {/* Sidebar Bottom */}
      <div className="sidebar-bottom">
        

        {/* Logout */}
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={16} strokeWidth={2} />

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>

        {!collapsed && (
          <div className="sidebar-version">
            <span>SPONSOR CRM</span>
            <span className="version-number">VERSION 1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}