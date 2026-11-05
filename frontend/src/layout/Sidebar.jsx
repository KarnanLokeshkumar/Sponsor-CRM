import { NavLink } from 'react-router-dom';

import {
  ChevronLeft,
  Handshake,
  ShieldCheck,
  LogOut,
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
}) {
  const handleLogout = async () => {
    onNavigate?.();
    await onLogout?.();
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${
        mobileOpen ? 'mobile-open' : ''
      }`}
    >
      {/* Brand */}
      <div className="brand-row">
        <div className="brand-mark">
          <Handshake size={21} />
        </div>

        {!collapsed && (
          <div className="brand-name">
            <b>SPONSOR CRM</b>
            <small>WORKSPACE</small>
          </div>
        )}

        <button
          type="button"
          className="sidebar-collapse"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Workspace Switch */}
      <div className="workspace-switch">
        <div className="workspace-icon">CRM</div>

        {!collapsed && (
          <div>
            <b>Workspace</b>
            <small>Management</small>
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
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={17} />

                    {!collapsed && (
                      <span>{item.label}</span>
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
        <div className="secure-note">
          <ShieldCheck size={16} />

          {!collapsed && (
            <span>Secure workspace</span>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={17} />

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>

        {!collapsed && (
          <div className="sidebar-version">
            VERSION <span>1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}