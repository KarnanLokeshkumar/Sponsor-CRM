import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Building2,
  Megaphone,
  Gift,
  Handshake,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { modules } from '../data/modules';
import { api } from '../services/api';
import GenericModulePage from './GenericModulePage';

const emptySponsor = {
  name: '',
  industry: '',
  website: '',
  email: '',
  phone: '',
  city: '',
  status: 'ACTIVE',
  notes: '',
};

const emptyCampaign = {
  name: '',
  sponsor: { id: '' },
  objective: '',
  startDate: '',
  endDate: '',
  status: 'PLANNED',
};

const emptyDeliverable = {
  type: 'PRE_ROLL',
  placement: '',
  description: '',
  campaign: { id: '' },
  scheduledDate: '',
  status: 'PLANNED',
};

const emptyBenefit = {
  type: 'HOMEPAGE_PLACEMENT',
  description: '',
  sponsor: { id: '' },
  campaign: null,
  targetValue: '',
  actualValue: '',
  status: 'PENDING',
};

const config = {
  sponsors: {
    title: 'Sponsors',
    desc: 'Manage brands and companies sponsoring your OTT platform.',
    icon: Building2,
    columns: [
      ['name', 'Sponsor'],
      ['industry', 'Industry'],
      ['email', 'Email'],
      ['city', 'Location'],
      ['status', 'Status'],
    ],
    empty: emptySponsor,
  },

  campaigns: {
    title: 'Campaigns',
    desc: 'Plan brand promotions across OTT content and placements.',
    icon: Megaphone,
    columns: [
      ['name', 'Campaign'],
      ['sponsor.name', 'Sponsor'],
      ['startDate', 'Start date'],
      ['endDate', 'End date'],
      ['status', 'Status'],
    ],
    empty: emptyCampaign,
  },

  deliverables: {
    title: 'Ad Deliverables',
    desc: 'Track pre-roll, mid-roll, banner ads and sponsored content.',
    icon: Gift,
    columns: [
      ['type', 'Ad type'],
      ['placement', 'Placement'],
      ['campaign.name', 'Campaign'],
      ['scheduledDate', 'Scheduled'],
      ['status', 'Status'],
    ],
    empty: emptyDeliverable,
  },

  benefits: {
    title: 'Sponsor Benefits',
    desc: 'Track promised exposure, placements and audience benefits.',
    icon: Handshake,
    columns: [
      ['type', 'Benefit'],
      ['sponsor.name', 'Sponsor'],
      ['campaign.name', 'Campaign'],
      ['targetValue', 'Target'],
      ['actualValue', 'Delivered'],
      ['status', 'Status'],
    ],
    empty: emptyBenefit,
  },
};

const get = (object, path) =>
  path.split('.').reduce((value, key) => value?.[key], object);

const pretty = (value) =>
  String(value ?? '—')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export default function ModulePage() {
  const { module: key } = useParams();

  const item = modules.find((module) => module.key === key);
  const c = config[key];

  const [rows, setRows] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    inDiscussion: 0,
  });

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [industry, setIndustry] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(c?.empty || {});

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState('Overview');

  // Load module data
  const load = async () => {
    if (!c) return;

    setBusy(true);
    setError('');

    try {
      if (key === 'sponsors') {
        const [data, sponsorStats] = await Promise.all([
          api.sponsors({
            search: query,
            status,
            industry,
            page,
            size: 10,
          }),
          api.sponsorStats(),
        ]);

        setRows(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setStats(sponsorStats);
      } else {
        const [data, sponsorData, campaignData] = await Promise.all([
          key === 'campaigns'
            ? api.campaigns()
            : key === 'deliverables'
              ? api.deliverables()
              : api.benefits(),

          api.sponsors({ page: 0, size: 100 }),
          api.campaigns(),
        ]);

        setRows(data || []);
        setSponsors(sponsorData.content || []);
        setCampaigns(campaignData || []);
      }
    } catch (err) {
      setError(
        `${err.message}. Check that the Spring Boot API and MySQL are running.`
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, query, status, industry, page]);

  // Create record
  const openCreate = () => {
    setEditing(null);
    setForm({ ...c.empty });
    setError('');
    setModal(true);
  };

  // Edit record
  const openEdit = (row) => {
    setEditing(row.id);

    setForm({
      ...row,
      sponsor: row.sponsor
        ? { id: String(row.sponsor.id) }
        : row.sponsor,
      campaign: row.campaign
        ? { id: String(row.campaign.id) }
        : null,
    });

    setError('');
    setModal(true);
  };

  const change = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Save record
  const save = async (event) => {
    event.preventDefault();

    setBusy(true);
    setError('');

    try {
      const payload = { ...form };

      if (payload.sponsor?.id) {
        payload.sponsor = {
          id: Number(payload.sponsor.id),
        };
      }

      if (payload.campaign?.id) {
        payload.campaign = {
          id: Number(payload.campaign.id),
        };
      } else if ('campaign' in payload) {
        payload.campaign = null;
      }

      if (payload.targetValue === '') {
        payload.targetValue = null;
      }

      if (payload.actualValue === '') {
        payload.actualValue = null;
      }

      if (key === 'sponsors') {
        editing
          ? await api.updateSponsor(editing, payload)
          : await api.createSponsor(payload);
      }

      if (key === 'campaigns') {
        editing
          ? await api.updateCampaign(editing, payload)
          : await api.createCampaign(payload);
      }

      if (key === 'deliverables') {
        editing
          ? await api.updateDeliverable(editing, payload)
          : await api.createDeliverable(payload);
      }

      if (key === 'benefits') {
        editing
          ? await api.updateBenefit(editing, payload)
          : await api.createBenefit(payload);
      }

      setModal(false);

      setNotice(
        editing
          ? 'Record updated successfully.'
          : 'Record created successfully.'
      );

      setSelected(null);

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Delete record
  const remove = async (id) => {
    if (!window.confirm('Delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      if (key === 'sponsors') await api.deleteSponsor(id);
      if (key === 'campaigns') await api.deleteCampaign(id);
      if (key === 'deliverables') await api.deleteDeliverable(id);
      if (key === 'benefits') await api.deleteBenefit(id);

      setNotice('Record deleted.');
      setSelected(null);

      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!item) {
    return (
      <div className="empty-module">
        <h2>Page not found</h2>
      </div>
    );
  }

  if (!c) {
    return <GenericModulePage />;
  }

  const Icon = c.icon;

  const filtered = useMemo(() => {
    if (key === 'sponsors') return rows;

    return rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(query.toLowerCase())
    );
  }, [key, rows, query]);

  const fields =
    key === 'sponsors'
      ? [
          ['name', 'Sponsor / Brand name', 'text', true],
          ['industry', 'Industry', 'text', true],
          ['website', 'Website', 'url'],
          ['email', 'Email', 'email'],
          ['phone', 'Phone', 'tel'],
          ['city', 'City', 'text'],
          ['status', 'Status', 'select', true],
          ['notes', 'Notes', 'textarea'],
        ]
      : key === 'campaigns'
        ? [
            ['name', 'Campaign name', 'text', true],
            ['sponsor', 'Sponsor', 'sponsor', true],
            ['objective', 'Objective', 'textarea'],
            ['startDate', 'Start date', 'date'],
            ['endDate', 'End date', 'date'],
            ['status', 'Status', 'select'],
          ]
        : key === 'deliverables'
          ? [
              ['type', 'Ad type', 'select', true],
              ['placement', 'Placement', 'text'],
              ['campaign', 'Campaign', 'campaign', true],
              ['description', 'Description', 'textarea'],
              ['scheduledDate', 'Scheduled date', 'date'],
              ['status', 'Status', 'select'],
            ]
          : [
              ['type', 'Benefit type', 'select', true],
              ['sponsor', 'Sponsor', 'sponsor', true],
              ['campaign', 'Campaign', 'campaign'],
              ['description', 'Description', 'textarea'],
              ['targetValue', 'Target value', 'number'],
              ['actualValue', 'Delivered value', 'number'],
              ['status', 'Status', 'select'],
            ];

  const selectOptions = {
    status:
      key === 'sponsors'
        ? ['ACTIVE', 'IN_DISCUSSION', 'INACTIVE']
        : key === 'campaigns'
          ? ['PLANNED', 'ACTIVE', 'COMPLETED', 'PAUSED']
          : key === 'deliverables'
            ? ['PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'DELIVERED']
            : ['PENDING', 'IN_PROGRESS', 'DELIVERED'],

    type:
      key === 'deliverables'
        ? [
            'PRE_ROLL',
            'MID_ROLL',
            'POST_ROLL',
            'BANNER_AD',
            'SPONSORED_SHOW',
            'BRANDED_CONTENT',
          ]
        : [
            'HOMEPAGE_PLACEMENT',
            'CONTENT_SPONSORSHIP',
            'AUDIENCE_REACH',
            'PROMOTIONAL_VISIBILITY',
          ],
  };

  // Form fields
  const renderField = ([name, label, type, required]) => (
    <label className="crm-field" key={name}>
      <span>
        {label}
        {required ? ' *' : ''}
      </span>

      {type === 'textarea' ? (
        <textarea
          value={form[name] || ''}
          required={required}
          onChange={(event) => change(name, event.target.value)}
        />
      ) : type === 'select' ? (
        <select
          value={form[name] || selectOptions[name]?.[0] || ''}
          required={required}
          onChange={(event) => change(name, event.target.value)}
        >
          {(selectOptions[name] || []).map((option) => (
            <option key={option} value={option}>
              {pretty(option)}
            </option>
          ))}
        </select>
      ) : type === 'sponsor' || type === 'campaign' ? (
        <select
          value={form[name]?.id || ''}
          required={required}
          onChange={(event) =>
            change(
              name,
              event.target.value
                ? { id: event.target.value }
                : null
            )
          }
        >
          <option value="">
            Select {label.toLowerCase()}
          </option>

          {(type === 'sponsor' ? sponsors : campaigns).map((record) => (
            <option key={record.id} value={record.id}>
              {record.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={form[name] ?? ''}
          required={required}
          onChange={(event) => change(name, event.target.value)}
        />
      )}
    </label>
  );

  const recordCount =
    key === 'sponsors' ? totalElements : rows.length;

  const activeCount =
    key === 'sponsors'
      ? stats.active
      : rows.filter(
          (row) =>
            row.status === 'ACTIVE' ||
            row.status === 'DELIVERED'
        ).length;

  const progressCount =
    key === 'sponsors'
      ? stats.inDiscussion
      : rows.filter((row) => row.status === 'IN_PROGRESS').length;

  const pendingCount =
    key === 'sponsors'
      ? stats.inactive
      : rows.filter((row) =>
          ['PENDING', 'PLANNED', 'SCHEDULED'].includes(row.status)
        ).length;

  return (
    <div className="module-page">
      {/* Heading */}
      <div className="page-heading-row">
        <div>
          <div className="page-eyebrow">
            OTT SPONSOR CRM / ACTIVATION
          </div>

          <h1>{c.title}</h1>
          <p>{c.desc}</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreate}
        >
          <Plus size={17} />

          Add{' '}
          {key === 'sponsors'
            ? 'Sponsor'
            : key === 'campaigns'
              ? 'Campaign'
              : key === 'deliverables'
                ? 'Deliverable'
                : 'Benefit'}
        </button>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="crm-notice" role="status">
          {notice}

          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && !modal && (
        <div className="crm-error" role="alert">
          {error}

          <button
            type="button"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics */}
      <section className="metrics-grid module-metrics">
        <div className="metric-card">
          <div className="metric-top">
            <span>
              {key === 'sponsors' ? 'Total sponsors' : 'Total records'}
            </span>

            <div className="metric-icon blue">
              <Icon size={18} />
            </div>
          </div>

          <div className="metric-value">
            {busy ? '—' : recordCount}
          </div>

          <div className="metric-bottom">
            <span>Stored in database</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span>Active</span>
          </div>

          <div className="metric-value">
            {busy ? '—' : activeCount}
          </div>

          <div className="metric-bottom">
            <span>Currently active / delivered</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span>
              {key === 'sponsors' ? 'In discussion' : 'In progress'}
            </span>
          </div>

          <div className="metric-value">
            {busy ? '—' : progressCount}
          </div>

          <div className="metric-bottom">
            <span>Needs follow-up</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span>
              {key === 'sponsors' ? 'Inactive' : 'Pending / planned'}
            </span>
          </div>

          <div className="metric-value">
            {busy ? '—' : pendingCount}
          </div>

          <div className="metric-bottom">
            <span>Not yet completed</span>
          </div>
        </div>
      </section>

      {/* Records table */}
      <section className="panel records-panel">
        <div className="panel-heading">
          <div>
            <h3>{c.title} directory</h3>

            <p>
              Search and manage your OTT sponsorship records.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={load}
            disabled={busy}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={16} />

            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder={`Search ${c.title.toLowerCase()}...`}
              aria-label={`Search ${c.title}`}
            />
          </label>

          {key === 'sponsors' && (
            <>
              <select
                className="crm-filter"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                aria-label="Filter by industry"
              >
                <option value="">All industries</option>

                {[...new Set(rows.map((row) => row.industry).filter(Boolean))]
                  .sort()
                  .map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
              </select>

              <select
                className="crm-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>

                {['ACTIVE', 'IN_DISCUSSION', 'INACTIVE'].map((value) => (
                  <option key={value} value={value}>
                    {pretty(value)}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {c.columns.map((column) => (
                  <th key={column[0]}>
                    {column[1].toUpperCase()}
                  </th>
                ))}

                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {busy && !rows.length ? (
                <tr>
                  <td
                    colSpan={c.columns.length + 1}
                    className="empty-table"
                  >
                    Loading records...
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() =>
                      key === 'sponsors' && setSelected(row)
                    }
                    className={
                      key === 'sponsors' ? 'clickable-row' : ''
                    }
                  >
                    {c.columns.map((column) => (
                      <td key={column[0]}>
                        {column[0] === 'status' ? (
                          <span
                            className={`status-pill ${String(
                              get(row, column[0]) || ''
                            )
                              .toLowerCase()
                              .replaceAll('_', '-')}`}
                          >
                            {pretty(get(row, column[0]))}
                          </span>
                        ) : column[0] === 'name' ? (
                          <div className="record-name">
                            <span className="record-avatar">
                              {String(get(row, column[0]) || '')
                                .split(' ')
                                .map((value) => value[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </span>

                            <b>{get(row, column[0])}</b>
                          </div>
                        ) : (
                          pretty(get(row, column[0]))
                        )}
                      </td>
                    ))}

                    <td>
                      <button
                        type="button"
                        className="row-more"
                        title="Edit"
                        aria-label={`Edit record ${row.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(row);
                        }}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="row-more danger-action"
                        title="Delete"
                        aria-label={`Delete record ${row.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          remove(row.id);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {!busy && !filtered.length && (
                <tr>
                  <td
                    colSpan={c.columns.length + 1}
                    className="empty-table"
                  >
                    No records found. Add your first{' '}
                    {c.title.toLowerCase().replace(/s$/, '')}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="table-footer">
          <span>
            Showing {filtered.length} of {recordCount} records
          </span>

          {key === 'sponsors' && (
            <div>
              <button
                type="button"
                disabled={page <= 0 || busy}
                onClick={() => setPage((previous) => previous - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>

              <span>
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>

              <button
                type="button"
                disabled={page + 1 >= totalPages || busy}
                onClick={() => setPage((previous) => previous + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Sponsor profile */}
      {selected && key === 'sponsors' && (
        <section className="panel sponsor-profile">
          <div className="sponsor-profile-head">
            <div>
              <span className="page-eyebrow">
                SPONSOR PROFILE
              </span>

              <h2>{selected.name}</h2>

              <p>
                {selected.industry} ·{' '}
                {selected.city || 'Location not added'}
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => openEdit(selected)}
            >
              <Pencil size={15} />
              Edit sponsor
            </button>
          </div>

          <div className="profile-tabs">
            {['Overview', 'Campaigns', 'Deliverables', 'Benefits'].map(
              (tab) => (
                <button
                  type="button"
                  className={detailTab === tab ? 'selected' : ''}
                  onClick={() => setDetailTab(tab)}
                  key={tab}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {detailTab === 'Overview' ? (
            <div className="profile-details">
              <div>
                <small>EMAIL</small>
                <b>{selected.email || '—'}</b>
              </div>

              <div>
                <small>PHONE</small>
                <b>{selected.phone || '—'}</b>
              </div>

              <div>
                <small>WEBSITE</small>
                <b>{selected.website || '—'}</b>
              </div>

              <div>
                <small>STATUS</small>
                <b>{pretty(selected.status)}</b>
              </div>

              <div className="profile-notes">
                <small>NOTES</small>
                <p>{selected.notes || 'No notes added.'}</p>
              </div>
            </div>
          ) : (
            <div className="related-list">
              {(detailTab === 'Campaigns' ? rows : [])
                .filter(
                  (row) => row.sponsor?.id === selected.id
                )
                .map((row) => (
                  <p key={row.id}>{row.name}</p>
                ))}

              <p>
                Open the {detailTab} module to manage related records.
                Records are linked through the sponsor and campaign IDs.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Create / Edit modal */}
      {modal && (
        <div
          className="crm-modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModal(false)
          }
        >
          <form className="crm-modal" onSubmit={save}>
            <div className="crm-modal-head">
              <div>
                <span className="page-eyebrow">
                  OTT SPONSOR CRM
                </span>

                <h2>
                  {editing ? 'Edit' : 'Add'}{' '}
                  {c.title.slice(0, -1)}
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setModal(false)}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="crm-form-grid">
              {fields.map(renderField)}
            </div>

            {error && (
              <div className="crm-error" role="alert">
                {error}
              </div>
            )}

            <div className="crm-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={busy}
              >
                {busy
                  ? 'Saving...'
                  : editing
                    ? 'Save changes'
                    : 'Create record'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}