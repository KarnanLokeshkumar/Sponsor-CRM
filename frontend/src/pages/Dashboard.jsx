import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowUpRight,
  RefreshCw,
  Building2,
  Megaphone,
  Gift,
  Handshake,
  Layers3,
  Activity,
  AlertCircle,
} from 'lucide-react';

import { modules } from '../data/modules';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    sponsors: 0,
    campaigns: 0,
    deliverables: 0,
    benefits: 0,
    modules: [],
  });

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    setError('');

    try {
      const workspaceModules = modules.filter(
        (module) =>
          ![
            'overview',
            'sponsors',
            'campaigns',
            'deliverables',
            'benefits',
          ].includes(module.key)
      );

      const [
        sponsorStats,
        campaigns,
        deliverables,
        benefits,
        ...workspace 
      ] = await Promise.all([
        api.sponsorStats(),
        api.campaigns(),
        api.deliverables(),
        api.benefits(),

        ...workspaceModules.map((module) =>
          api
            .workspaceSummary(module.key)
            .then((data) => ({
              key: module.key,
              total: data.total || 0,
            }))
            .catch(() => ({
              key: module.key,
              total: 0,
            }))
        ),
      ]);

      setStats({
        sponsors: sponsorStats.total || 0,
        campaigns: campaigns.length,
        deliverables: deliverables.length,
        benefits: benefits.length,
        modules: workspace,
      });
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const coreCards = [
    {
      label: 'Sponsors',
      value: stats.sponsors,
      icon: Building2,
      path: '/sponsors',
      description: 'Manage sponsor relationships',
    },
    {
      label: 'Campaigns',
      value: stats.campaigns,
      icon: Megaphone,
      path: '/campaigns',
      description: 'Track active campaigns',
    },
    {
      label: 'Deliverables',
      value: stats.deliverables,
      icon: Gift,
      path: '/deliverables',
      description: 'Monitor partnership deliverables',
    },
    {
      label: 'Benefits',
      value: stats.benefits,
      icon: Handshake,
      path: '/benefits',
      description: 'Manage sponsor benefits',
    },
  ];

  const moduleCount = stats.modules.reduce(
    (total, item) => total + item.total,
    0
  ) +
    stats.sponsors +
    stats.campaigns +
    stats.deliverables +
    stats.benefits;

  const getModuleCount = (key) => {
    switch (key) {
      case 'sponsors':
        return stats.sponsors;
      case 'campaigns':
        return stats.campaigns;
      case 'deliverables':
        return stats.deliverables;
      case 'benefits':
        return stats.benefits;
      default:
        return stats.modules.find((item) => item.key === key)?.total || 0;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Page heading */}
      <div className="page-heading-row">
        <div>
          <div className="page-eyebrow">
            SPONSOR RELATIONSHIP WORKSPACE
          </div>

          <h1>Overview</h1>

          <p>
            Monitor sponsor relationships, campaigns and partnership
            operations from one workspace.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={load}
          disabled={busy}
        >
          <RefreshCw
            size={15}
            className={busy ? 'spin-animation' : ''}
          />
          {busy ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="crm-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>

          <button type="button" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {/* Overview metrics */}
      <section className="metrics-grid" aria-label="CRM statistics">
        {coreCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              to={card.path}
              className="metric-card"
              key={card.label}
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div className="metric-top">
                <span>{card.label}</span>

                <div className="metric-icon blue">
                  <Icon size={19} strokeWidth={1.9} />
                </div>
              </div>

              <div className="metric-value">
                {busy ? '—' : card.value}
              </div>

              <div className="metric-description">
                {card.description}
              </div>

              <div className="metric-bottom">
                <span>Open module</span>
                <ArrowUpRight size={15} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* All modules */}
      <section className="panel overview-modules-panel">
        <div className="panel-heading">
          <div>
            <div className="page-eyebrow">
              WORKSPACE DIRECTORY
            </div>

            <h3>All CRM modules</h3>

            <p>
              Access your relationship management, growth,
              partnership, activation, insights and administration
              workspaces.
            </p>
          </div>

          <div className="overview-total">
            <Layers3 size={19} />

            <b>{busy ? '—' : moduleCount}</b>

            <span>saved records</span>
          </div>
        </div>

        <div className="overview-module-grid">
          {modules
            .filter((module) => module.key !== 'overview')
            .map((module) => {
              const Icon = module.icon;
              const total = getModuleCount(module.key);

              return (
                <Link
                  to={module.path}
                  className="overview-module-card"
                  key={module.key}
                >
                  <span className="overview-module-icon">
                    <Icon size={18} strokeWidth={1.9} />
                  </span>

                  <span className="overview-module-copy">
                    <b>{module.label}</b>

                    <small>
                      {busy ? 'Loading...' : `${total} records`}
                    </small>
                  </span>

                  <ArrowUpRight
                    size={15}
                    className="module-arrow"
                  />
                </Link>
              );
            })}
        </div>
      </section>

      {/* Dashboard information */}
      <div className="dashboard-footer-note">
        <Activity size={16} />

        <span>
          Dashboard figures are loaded from the connected CRM APIs.
        </span>
      </div>
    </div>
  );
}