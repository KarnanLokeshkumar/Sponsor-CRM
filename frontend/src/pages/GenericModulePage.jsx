import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Inbox,
  LoaderCircle,
  SearchX,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers3,
  CheckCircle2,
  Clock3,
  CircleDot,
} from "lucide-react";
import { modules, moduleDescriptions } from "../data/modules";
import { api } from "../services/api";

const shared = [
  { key: "title", label: "Name / title", type: "text", required: true },
  { key: "owner", label: "Owner / assignee", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["OPEN", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"],
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    options: ["LOW", "MEDIUM", "HIGH", "URGENT"],
  },
  { key: "dueDate", label: "Due date", type: "date" },
  { key: "relatedSponsorId", label: "Related sponsor ID", type: "number" },
  { key: "description", label: "Notes / details", type: "textarea" },
];
const definitions = {
  contacts: {
    noun: "Contact",
    eyebrow: "RELATIONSHIP DIRECTORY",
    action: "Add contact",
    focus: "Stakeholder coverage",
    focusText:
      "Maintain the people involved in sponsor decisions and relationship ownership.",
    fields: [
      ["title", "CONTACT / ROLE"],
      ["owner", "RELATIONSHIP OWNER"],
      ["custom:email", "EMAIL"],
      ["custom:phone", "PHONE"],
      ["custom:department", "DEPARTMENT"],
      ["status", "STATUS"],
      ["dueDate", "NEXT TOUCHPOINT"],
    ],
    extra: [
      ["email", "Email", "email"],
      ["phone", "Phone", "tel"],
      ["department", "Department", "text"],
      ["jobTitle", "Job title", "text"],
      [
        "decisionRole",
        "Decision role",
        "select",
        ["DECISION_MAKER", "INFLUENCER", "CONTACT", "FINANCE"],
      ],
      [
        "preferredChannel",
        "Preferred channel",
        "select",
        ["EMAIL", "PHONE", "MEETING"],
      ],
    ],
  },
  leads: {
    noun: "Lead",
    eyebrow: "ACQUISITION WORKSPACE",
    action: "Add lead",
    focus: "Lead qualification",
    focusText:
      "Qualify prospective sponsors by fit, estimated value and next action.",
    fields: [
      ["title", "LEAD"],
      ["custom:company", "COMPANY"],
      ["custom:source", "SOURCE"],
      ["owner", "OWNER"],
      ["custom:estimatedValue", "EST. VALUE"],
      ["status", "STAGE"],
      ["dueDate", "NEXT ACTION"],
    ],
    extra: [
      ["company", "Company", "text"],
      [
        "source",
        "Lead source",
        "select",
        ["REFERRAL", "WEBSITE", "EVENT", "OUTBOUND", "OTHER"],
      ],
      ["industry", "Industry", "text"],
      ["estimatedValue", "Estimated value", "number"],
      ["fitScore", "Fit score (1–5)", "number"],
      ["qualificationNotes", "Qualification notes", "textarea"],
    ],
  },
  pipeline: {
    noun: "Pipeline deal",
    eyebrow: "DEAL FLOW",
    action: "Add deal",
    focus: "Pipeline movement",
    focusText:
      "Track sponsorship deals through qualification, proposal, negotiation and close.",
    fields: [
      ["title", "DEAL"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:stage", "STAGE"],
      ["custom:dealValue", "DEAL VALUE"],
      ["owner", "OWNER"],
      ["dueDate", "EXPECTED CLOSE"],
    ],
    extra: [
      [
        "stage",
        "Pipeline stage",
        "select",
        [
          "PROSPECTING",
          "QUALIFICATION",
          "PROPOSAL",
          "NEGOTIATION",
          "WON",
          "LOST",
        ],
      ],
      ["dealValue", "Deal value", "number"],
      ["probability", "Win probability (%)", "number"],
      ["expectedClose", "Expected close date", "date"],
      ["competitor", "Competitor", "text"],
      ["nextStep", "Next step", "textarea"],
    ],
  },
  packages: {
    noun: "Package",
    eyebrow: "SPONSORSHIP INVENTORY",
    action: "Add package",
    focus: "Package catalogue",
    focusText:
      "Define commercial tiers, inclusions, inventory and availability.",
    fields: [
      ["title", "PACKAGE"],
      ["custom:tier", "TIER"],
      ["custom:price", "PRICE"],
      ["custom:inventory", "INVENTORY"],
      ["status", "AVAILABILITY"],
    ],
    extra: [
      [
        "tier",
        "Tier",
        "select",
        ["TITLE", "GOLD", "SILVER", "BRONZE", "CUSTOM"],
      ],
      ["price", "Price", "number"],
      ["currency", "Currency", "select", ["INR", "USD", "EUR"]],
      ["inventory", "Available slots", "number"],
      ["inclusions", "Inclusions", "textarea"],
      ["exclusions", "Exclusions", "textarea"],
    ],
  },
  opportunities: {
    noun: "Opportunity",
    eyebrow: "REVENUE DEVELOPMENT",
    action: "Add opportunity",
    focus: "Opportunity qualification",
    focusText:
      "Assess partnership potential, value, timing and decision ownership.",
    fields: [
      ["title", "OPPORTUNITY"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:value", "EST. VALUE"],
      ["custom:probability", "PROBABILITY"],
      ["owner", "OWNER"],
      ["dueDate", "TARGET DATE"],
    ],
    extra: [
      ["value", "Estimated value", "number"],
      ["probability", "Probability (%)", "number"],
      ["source", "Source", "text"],
      ["businessNeed", "Sponsor objective", "textarea"],
      ["competitor", "Competitor", "text"],
      ["decisionDate", "Decision date", "date"],
    ],
  },
  proposals: {
    noun: "Proposal",
    eyebrow: "PROPOSAL WORKFLOW",
    action: "Create proposal",
    focus: "Proposal readiness",
    focusText:
      "Prepare commercial offers and track internal review and sponsor response.",
    fields: [
      ["title", "PROPOSAL"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:version", "VERSION"],
      ["custom:amount", "PROPOSED AMOUNT"],
      ["status", "REVIEW STATUS"],
      ["dueDate", "SUBMISSION DATE"],
    ],
    extra: [
      ["version", "Version", "text"],
      ["amount", "Proposed amount", "number"],
      ["package", "Package proposed", "text"],
      ["validUntil", "Valid until", "date"],
      ["submittedOn", "Submitted on", "date"],
      [
        "response",
        "Sponsor response",
        "select",
        ["PENDING", "ACCEPTED", "DECLINED", "REVISION_REQUESTED"],
      ],
    ],
  },
  contracts: {
    noun: "Contract",
    eyebrow: "AGREEMENT CONTROL",
    action: "Add contract",
    focus: "Contract milestones",
    focusText:
      "Monitor agreement value, effective dates, renewal and signature status.",
    fields: [
      ["title", "AGREEMENT"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:contractValue", "CONTRACT VALUE"],
      ["custom:startDate", "START DATE"],
      ["custom:endDate", "END DATE"],
      ["status", "STATUS"],
    ],
    extra: [
      ["contractNumber", "Contract number", "text"],
      ["contractValue", "Contract value", "number"],
      ["startDate", "Start date", "date"],
      ["endDate", "End date", "date"],
      ["signedDate", "Signed date", "date"],
      ["renewalNoticeDays", "Renewal notice (days)", "number"],
    ],
  },
  events: {
    noun: "Event",
    eyebrow: "EVENT OPERATIONS",
    action: "Add event",
    focus: "Event readiness",
    focusText:
      "Coordinate event logistics, sponsor participation and delivery milestones.",
    fields: [
      ["title", "EVENT"],
      ["custom:venue", "VENUE"],
      ["custom:eventDate", "EVENT DATE"],
      ["owner", "COORDINATOR"],
      ["custom:capacity", "CAPACITY"],
      ["status", "STATUS"],
    ],
    extra: [
      ["eventDate", "Event date", "date"],
      ["venue", "Venue", "text"],
      ["city", "City", "text"],
      ["capacity", "Capacity", "number"],
      [
        "eventType",
        "Event type",
        "select",
        ["CONFERENCE", "EXHIBITION", "WEBINAR", "FESTIVAL", "OTHER"],
      ],
      ["sponsorParticipation", "Sponsor participation", "textarea"],
    ],
  },
  communications: {
    noun: "Communication",
    eyebrow: "ENGAGEMENT LOG",
    action: "Log communication",
    focus: "Engagement activity",
    focusText:
      "Record sponsor interactions with channel, outcome and agreed next action.",
    fields: [
      ["title", "SUBJECT"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:channel", "CHANNEL"],
      ["custom:contactPerson", "CONTACT"],
      ["custom:interactionDate", "DATE"],
      ["owner", "LOGGED BY"],
    ],
    extra: [
      [
        "channel",
        "Channel",
        "select",
        ["EMAIL", "PHONE", "MEETING", "VIDEO_CALL", "MESSAGE", "OTHER"],
      ],
      ["contactPerson", "Contact person", "text"],
      ["interactionDate", "Interaction date", "date"],
      [
        "outcome",
        "Outcome",
        "select",
        ["POSITIVE", "NEUTRAL", "NEGATIVE", "NO_RESPONSE"],
      ],
      ["nextAction", "Next action", "textarea"],
    ],
  },
  tasks: {
    noun: "Task",
    eyebrow: "WORK MANAGEMENT",
    action: "Create task",
    focus: "Task execution",
    focusText: "Assign work, set priority and track due dates and completion.",
    fields: [
      ["title", "TASK"],
      ["owner", "ASSIGNEE"],
      ["priority", "PRIORITY"],
      ["status", "STATUS"],
      ["dueDate", "DUE DATE"],
    ],
    extra: [
      [
        "taskType",
        "Task type",
        "select",
        ["CALL", "EMAIL", "PREPARATION", "REVIEW", "DELIVERY", "OTHER"],
      ],
      ["startDate", "Start date", "date"],
      ["completionNotes", "Completion notes", "textarea"],
    ],
  },
  "follow-ups": {
    noun: "Follow-up",
    eyebrow: "RELATIONSHIP CADENCE",
    action: "Schedule follow-up",
    focus: "Next touchpoints",
    focusText:
      "Prevent stalled sponsor conversations with scheduled and owned follow-ups.",
    fields: [
      ["title", "FOLLOW-UP"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:channel", "CHANNEL"],
      ["owner", "OWNER"],
      ["dueDate", "SCHEDULED DATE"],
      ["status", "STATUS"],
    ],
    extra: [
      [
        "channel",
        "Follow-up channel",
        "select",
        ["EMAIL", "PHONE", "MEETING", "MESSAGE"],
      ],
      ["contactPerson", "Contact person", "text"],
      ["reminderAt", "Reminder date", "date"],
      ["outcome", "Outcome", "textarea"],
    ],
  },
  "sponsor-portal": {
    noun: "Portal item",
    eyebrow: "SPONSOR EXPERIENCE",
    action: "Add portal item",
    focus: "Sponsor-facing updates",
    focusText:
      "Prepare sponsor-visible updates and track publication and visibility.",
    fields: [
      ["title", "PORTAL ITEM"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:contentType", "CONTENT TYPE"],
      ["owner", "CONTENT OWNER"],
      ["status", "PUBLICATION STATUS"],
    ],
    extra: [
      [
        "contentType",
        "Content type",
        "select",
        ["UPDATE", "REPORT", "DOCUMENT", "EVENT", "DELIVERABLE"],
      ],
      [
        "visibility",
        "Visibility",
        "select",
        ["DRAFT", "SPONSOR_VISIBLE", "INTERNAL"],
      ],
      ["publishedOn", "Published on", "date"],
      ["portalMessage", "Sponsor message", "textarea"],
    ],
  },
  documents: {
    noun: "Document",
    eyebrow: "DOCUMENT CONTROL",
    action: "Register document",
    focus: "Document governance",
    focusText:
      "Track document metadata, ownership, review and expiry. Binary file storage requires a configured storage provider.",
    fields: [
      ["title", "DOCUMENT"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:documentType", "TYPE"],
      ["custom:reference", "REFERENCE"],
      ["status", "REVIEW STATUS"],
      ["dueDate", "REVIEW DATE"],
    ],
    extra: [
      [
        "documentType",
        "Document type",
        "select",
        ["PROPOSAL", "CONTRACT", "INVOICE", "BRAND_ASSET", "REPORT", "OTHER"],
      ],
      ["reference", "File reference / URL", "text"],
      ["version", "Version", "text"],
      ["uploadedBy", "Uploaded by", "text"],
      ["expiryDate", "Expiry date", "date"],
    ],
  },
  notifications: {
    noun: "Notification",
    eyebrow: "ALERT CENTRE",
    action: "Create reminder",
    focus: "Action queue",
    focusText:
      "Manage operational reminders and delivery state. This register does not itself send email or push messages.",
    fields: [
      ["title", "ALERT"],
      ["custom:category", "CATEGORY"],
      ["priority", "SEVERITY"],
      ["owner", "ASSIGNED TO"],
      ["dueDate", "DUE DATE"],
      ["status", "STATE"],
    ],
    extra: [
      [
        "category",
        "Category",
        "select",
        ["CONTRACT", "PAYMENT", "DELIVERABLE", "EVENT", "FOLLOW_UP", "SYSTEM"],
      ],
      ["recipient", "Recipient", "text"],
      ["channel", "Channel", "select", ["IN_APP", "EMAIL", "SMS"]],
      ["sentAt", "Sent at", "date"],
    ],
  },
  reports: {
    noun: "Report request",
    eyebrow: "BUSINESS INTELLIGENCE",
    action: "Add report request",
    focus: "Reporting operations",
    focusText:
      "Define reporting periods, ownership and delivery status. Actual report exports require configured report queries.",
    fields: [
      ["title", "REPORT"],
      ["custom:reportType", "REPORT TYPE"],
      ["custom:period", "PERIOD"],
      ["owner", "OWNER"],
      ["status", "STATUS"],
      ["dueDate", "DUE DATE"],
    ],
    extra: [
      [
        "reportType",
        "Report type",
        "select",
        [
          "SPONSOR_PERFORMANCE",
          "PIPELINE",
          "CAMPAIGN",
          "DELIVERABLES",
          "FINANCIAL",
          "CUSTOM",
        ],
      ],
      ["period", "Reporting period", "text"],
      ["requestedBy", "Requested by", "text"],
      ["format", "Output format", "select", ["PDF", "XLSX", "CSV"]],
      ["deliveredOn", "Delivered on", "date"],
    ],
  },
  "roi-analytics": {
    noun: "ROI analysis",
    eyebrow: "RETURN MEASUREMENT",
    action: "Add ROI analysis",
    focus: "Return measurement",
    focusText:
      "Capture verified investment and outcome values; ROI is calculated from saved inputs.",
    fields: [
      ["title", "ANALYSIS"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:investment", "INVESTMENT"],
      ["custom:attributedValue", "ATTRIBUTED VALUE"],
      ["custom:roi", "ROI"],
      ["owner", "ANALYST"],
    ],
    extra: [
      ["investment", "Investment / spend", "number"],
      ["attributedValue", "Attributed value", "number"],
      ["currency", "Currency", "select", ["INR", "USD", "EUR"]],
      ["reach", "Audience reach", "number"],
      ["engagements", "Engagements", "number"],
      ["measurementPeriod", "Measurement period", "text"],
    ],
  },
  "sponsor-health": {
    noun: "Health review",
    eyebrow: "RELATIONSHIP INSIGHTS",
    action: "Add health review",
    focus: "Relationship health",
    focusText:
      "Assess engagement, fulfilment, renewal likelihood and risks using recorded evidence.",
    fields: [
      ["title", "REVIEW"],
      ["relatedSponsorId", "SPONSOR ID"],
      ["custom:healthScore", "HEALTH SCORE"],
      ["custom:renewalLikelihood", "RENEWAL LIKELIHOOD"],
      ["custom:risk", "RISK"],
      ["owner", "REVIEW OWNER"],
    ],
    extra: [
      ["healthScore", "Health score (0–100)", "number"],
      ["renewalLikelihood", "Renewal likelihood (%)", "number"],
      ["risk", "Risk level", "select", ["LOW", "MEDIUM", "HIGH"]],
      ["lastEngagement", "Last engagement", "date"],
      [
        "sentiment",
        "Sponsor sentiment",
        "select",
        ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      ],
      ["actionPlan", "Action plan", "textarea"],
    ],
  },
  users: {
    noun: "User access record",
    eyebrow: "ACCESS ADMINISTRATION",
    action: "Add access record",
    focus: "Access governance",
    focusText:
      "Maintain an access register. This is not an authentication or authorization system.",
    fields: [
      ["title", "USER / ACCESS ITEM"],
      ["custom:email", "EMAIL"],
      ["custom:role", "ROLE"],
      ["custom:team", "TEAM"],
      ["status", "ACCESS STATUS"],
    ],
    extra: [
      ["email", "Email", "email"],
      [
        "role",
        "Role",
        "select",
        ["ADMIN", "MANAGER", "RELATIONSHIP_MANAGER", "OPERATIONS", "VIEWER"],
      ],
      ["team", "Team", "text"],
      ["requestedOn", "Requested on", "date"],
      ["approvedBy", "Approved by", "text"],
      ["accessNotes", "Access notes", "textarea"],
    ],
  },
  "audit-logs": {
    noun: "Governance record",
    eyebrow: "GOVERNANCE REGISTER",
    action: "Add governance record",
    focus: "Governance review",
    focusText:
      "Track manual governance reviews. This is not yet an automatic immutable audit trail.",
    fields: [
      ["title", "AUDIT ITEM"],
      ["custom:actionType", "ACTION TYPE"],
      ["custom:actor", "ACTOR"],
      ["custom:entity", "ENTITY"],
      ["custom:occurredOn", "OCCURRED ON"],
      ["status", "REVIEW STATUS"],
    ],
    extra: [
      [
        "actionType",
        "Action type",
        "select",
        ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT", "PERMISSION_CHANGE"],
      ],
      ["actor", "Actor", "text"],
      ["entity", "Affected entity", "text"],
      ["entityId", "Affected record ID", "text"],
      ["occurredOn", "Occurred on", "date"],
      ["reviewNotes", "Review notes", "textarea"],
    ],
  },
};
const pretty = (value) =>
  String(value ?? "—")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
const emptyForm = () => ({
  title: "",
  owner: "",
  status: "OPEN",
  priority: "MEDIUM",
  dueDate: "",
  relatedSponsorId: "",
  description: "",
  customFields: {},
});

export default function GenericModulePage() {
  const { module: key } = useParams();
  const [searchParams] = useSearchParams();
  const item = modules.find((x) => x.key === key);
  const cfg = definitions[key];
  const [rows, setRows] = useState([]),
    [sponsors, setSponsors] = useState([]),
    [summary, setSummary] = useState({
      total: 0,
      open: 0,
      progress: 0,
      done: 0,
      overdue: 0,
      highPriority: 0,
    });
  const [search, setSearch] = useState(() => searchParams.get("search") || ""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(0),
    [totalPages, setTotalPages] = useState(0),
    [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm),
    [editing, setEditing] = useState(null),
    [modal, setModal] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [d, s, m] = await Promise.all([
        api.workspaceRecords(key, { search, status, page, size: 10 }),
        api.sponsors({ page: 0, size: 100 }),
        api.workspaceSummary(key),
      ]);
      setRows(d.content || []);
      setTotalPages(d.totalPages || 0);
      setTotal(d.totalElements || 0);
      setSponsors(s.content || []);
      setSummary(m);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [key, search, status, page]);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);
  const fields = useMemo(() => cfg?.extra || [], [cfg]);
  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setModal(true);
  };
  const startEdit = (r) => {
    let custom = {};
    try {
      custom =
        typeof r.customFields === "string"
          ? JSON.parse(r.customFields || "{}")
          : r.customFields || {};
    } catch {}
    setEditing(r.id);
    setForm({
      ...emptyForm(),
      ...r,
      relatedSponsorId: r.relatedSponsorId || "",
      dueDate: r.dueDate || "",
      customFields: custom,
    });
    setError("");
    setModal(true);
  };
  const setCustom = (name, value) =>
    setForm((old) => ({
      ...old,
      customFields: { ...old.customFields, [name]: value },
    }));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        relatedSponsorId: form.relatedSponsorId
          ? Number(form.relatedSponsorId)
          : null,
        dueDate: form.dueDate || null,
        customFields: JSON.stringify(form.customFields || {}),
      };
      if (editing) await api.updateWorkspaceRecord(key, editing, payload);
      else await api.createWorkspaceRecord(key, payload);
      setModal(false);
      setNotice(editing ? "Record updated." : "Record created.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    try {
      await api.deleteWorkspaceRecord(key, id);
      setNotice("Record deleted.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  if (!item || !cfg)
    return (
      <div className="empty-module">
        <h2>Page not found</h2>
      </div>
    );
  const metricCards = [
    { label: "Total records", value: summary.total ?? total, Icon: Layers3 },
    { label: "Open", value: summary.open ?? 0, Icon: CircleDot },
    { label: "In progress", value: summary.progress ?? 0, Icon: Clock3 },
    { label: "Completed", value: summary.done ?? 0, Icon: CheckCircle2 },
  ];
  const cell = (r, key) => {
    if (key === "title")
      return (
        <div className="record-name">
          <b>{r.title}</b>
        </div>
      );
    if (key === "status")
      return (
        <span
          className={`status-pill ${String(r.status || "")
            .toLowerCase()
            .replaceAll("_", "-")}`}
        >
          {pretty(r.status)}
        </span>
      );
    if (key === "priority") return pretty(r.priority);
    if (key === "relatedSponsorId")
      return (
        sponsors.find((s) => s.id === r.relatedSponsorId)?.name ||
        r.relatedSponsorId ||
        "—"
      );
    if (key.startsWith("custom:")) {
      let c = {};
      try {
        c = JSON.parse(r.customFields || "{}");
      } catch {}
      if (key === "custom:roi") {
        const spend = Number(c.investment),
          value = Number(c.attributedValue);
        return spend > 0
          ? `${(((value - spend) / spend) * 100).toFixed(1)}%`
          : "—";
      }
      return c[key.slice(7)] || "—";
    }
    return r[key] || "—";
  };
  return (
    <div className={`module-page module-${key}`}>
      <div className="page-heading-row">
        <div>
          <div className="page-eyebrow">{cfg.eyebrow}</div>
          <h1>{item.label}</h1>
          <p>{moduleDescriptions[key]}</p>
        </div>
        <button className="primary-button" onClick={startCreate}>
          <Plus size={16} />
          {cfg.action}
        </button>
      </div>
      {notice && (
        <div className="crm-notice" role="status">
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {error && !modal && (
        <div className="crm-error" role="alert">
          {error}
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="metrics-grid module-metrics">
        {metricCards.map(({ label, value, Icon }, i) => (
          <div className={`metric-card module-kpi kpi-${i}`} key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <div className="metric-icon blue">
                <Icon size={17} />
              </div>
            </div>
            <div className="metric-value">
              {busy && rows.length === 0 ? "—" : value}
            </div>
            <div className="metric-bottom">
              <span>
                {i === 0
                  ? "All matching records"
                  : "All records in this module"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="module-insight-grid">
        <section className="panel module-focus">
          <div className="module-focus-top">
            <span className="page-eyebrow">MODULE WORKSPACE</span>
            <span className="module-focus-icon">
              <Layers3 size={19} />
            </span>
          </div>
          <h2>{cfg.focus}</h2>
          <p>{cfg.focusText}</p>
          <div className="module-focus-foot">
            <span>{summary.highPriority || 0} high priority</span>
            <span>{summary.overdue || 0} overdue</span>
          </div>
        </section>
        <section className="panel module-status-panel">
          <div className="panel-heading">
            <div>
              <h3>Workflow snapshot</h3>
              <p>Counts across all saved records</p>
            </div>
          </div>
          <div className="module-status-bars">
            {[
              {
                label: "Open",
                value: summary.open || 0,
                color: "var(--workflow-open)",
              },
              {
                label: "In progress",
                value: summary.progress || 0,
                color: "var(--workflow-progress)",
              },
              {
                label: "Completed",
                value: summary.done || 0,
                color: "var(--workflow-completed)",
              },
              {
                label: "Overdue",
                value: summary.overdue || 0,
                color: "var(--workflow-overdue)",
              },
            ].map((x) => (
              <div className="module-status-row" key={x.label}>
                <span>{x.label}</span>
                <div>
                  <i
                    style={{
                      width: `${summary.total ? Math.max(x.value ? 3 : 0, (x.value / summary.total) * 100) : 0}%`,
                      background: x.color,
                    }}
                  />
                </div>
                <b>{x.value}</b>
              </div>
            ))}
          </div>
          <div className="module-overdue">
            <AlertTriangle size={14} /> {summary.overdue || 0} overdue records
            need attention
          </div>
        </section>
      </div>
      <section
        className="panel records-panel module-records"
        aria-busy={busy}
      >
        <div className="panel-heading">
          <div>
            <h3>{cfg.noun} register</h3>
            <p>
              Review and maintain saved {item.label.toLowerCase()}{" "}
              records.
            </p>
          </div>
        </div>
        <div className="table-toolbar">
          <select
            className="crm-filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {["OPEN", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cfg.fields.map(([k, l]) => (
                  <th key={k}>{l}</th>
                ))}
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {busy && !rows.length ? (
                <tr>
                  <td colSpan={cfg.fields.length + 1} className="empty-table">
                    <div className="table-state table-state-loading" role="status">
                      <LoaderCircle className="spin-animation" size={18} />
                      <span>Loading records…</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    {cfg.fields.map(([k, label]) => (
                      <td key={k} data-label={label}>
                        {cell(r, k)}
                      </td>
                    ))}
                    <td data-label="Actions">
                      <button
                        className="row-more"
                        title="Edit"
                        onClick={() => startEdit(r)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="row-more danger-action"
                        title="Delete"
                        onClick={() => remove(r.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!busy && !rows.length && (
                <tr>
                  <td colSpan={cfg.fields.length + 1} className="empty-table">
                    <div className="table-state">
                      {search || status ? (
                        <SearchX className="table-state-icon" size={22} />
                      ) : (
                        <Inbox className="table-state-icon" size={22} />
                      )}
                      <strong>
                        {search || status
                          ? "No matching records"
                          : `No ${item.label.toLowerCase()} yet`}
                      </strong>
                      <span>
                        {search || status
                          ? "Try changing the global search or status filter."
                          : `Add your first ${cfg.noun.toLowerCase()} to get started.`}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>
            Showing {rows.length} of {total} records
          </span>
          <div>
            <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={15} />
            </button>
            <span>
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
      {modal && (
        <div
          className="crm-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <form className="crm-modal" onSubmit={save}>
            <div className="crm-modal-head">
              <div>
                <span className="page-eyebrow">{item.label.toUpperCase()}</span>
                <h2>
                  {editing ? "Edit" : "Create"} {cfg.noun.toLowerCase()}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="crm-form-grid">
              {shared.map((f) => (
                <label
                  className="crm-field"
                  key={f.key}
                  style={f.type === "textarea" ? { gridColumn: "1 / -1" } : {}}
                >
                  <span>
                    {f.label}
                    {f.required ? " *" : ""}
                  </span>
                  {f.type === "textarea" ? (
                    <textarea
                      rows="3"
                      value={form[f.key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={form[f.key] || f.options[0]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    >
                      {f.options.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.key] ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              {fields.map(([name, label, type, options]) => (
                <label
                  className="crm-field"
                  key={name}
                  style={type === "textarea" ? { gridColumn: "1 / -1" } : {}}
                >
                  <span>{label}</span>
                  {type === "textarea" ? (
                    <textarea
                      rows="3"
                      value={form.customFields?.[name] || ""}
                      onChange={(e) => setCustom(name, e.target.value)}
                    />
                  ) : type === "select" ? (
                    <select
                      value={form.customFields?.[name] || ""}
                      onChange={(e) => setCustom(name, e.target.value)}
                    >
                      <option value="">Select {label.toLowerCase()}</option>
                      {options.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={form.customFields?.[name] || ""}
                      onChange={(e) => setCustom(name, e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
            {error && <div className="crm-error">{error}</div>}
            <div className="crm-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
 