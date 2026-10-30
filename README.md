# OTT Sponsor CRM

A React + Spring Boot + MySQL starter application for managing OTT platform sponsors, campaigns, advertising deliverables and sponsor benefits. UI theme: Royal Blue, Silver and White with Light/Dark mode.

## Working features

- Sponsor management: create, view, edit, delete, search, industry/status filters, pagination and database-backed statistics.
- Campaign management: link campaigns to sponsors and maintain objective, dates and status.
- Ad deliverables: track pre-roll, mid-roll, post-roll, banner ads, sponsored shows and branded content against campaigns.
- Sponsor benefits: track homepage placement, content sponsorship, audience reach and promotional visibility, including target and delivered values.
- Sponsor profile: select a sponsor to view company details and navigate its profile tabs.
- Responsive layout, theme toggle and demo login.

The other CRM navigation modules are included as starter workspaces and can be implemented in subsequent iterations. This package does not include billing, invoices, payment processing or payment tracking.

## Requirements

- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- MySQL 8+

## 1. Create the database

The application can create the database automatically if the MySQL user has permission. Or run:

```sql
CREATE DATABASE sponsor_crm;
```

## 2. Configure backend database credentials

Default settings are in `backend/src/main/resources/application.properties`:

- URL: `jdbc:mysql://localhost:3306/sponsor_crm`
- Username: `root`
- Password: blank

Set environment variables if your MySQL credentials differ:

**Windows PowerShell**
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
```

**Windows CMD**
```cmd
set DB_USERNAME=root
set DB_PASSWORD=your_mysql_password
```

## 3. Start backend

```bash
cd backend
mvn spring-boot:run
```

Backend: `http://localhost:8080`

Health check: `http://localhost:8080/api/health`

## 4. Start frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Optional API URL override: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL=http://localhost:8080/api`.

## Demo login

- Sign-in is a local session gate; configure production authentication before deployment.

This is a frontend demo gate only. It is not production authentication. Do not deploy with real user data until server-side authentication, authorization, HTTPS, secrets management and audit controls are implemented.

## REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/sponsors?search=&status=&industry=&page=0&size=10` | Search/filter/page sponsors |
| GET | `/api/sponsors/stats` | Sponsor dashboard counts |
| GET/POST | `/api/sponsors` | List/create sponsor |
| GET/PUT/DELETE | `/api/sponsors/{id}` | Read/update/delete sponsor |
| GET/POST | `/api/campaigns` | List/create campaign |
| PUT/DELETE | `/api/campaigns/{id}` | Update/delete campaign |
| GET/POST | `/api/deliverables` | List/create deliverable |
| PUT/DELETE | `/api/deliverables/{id}` | Update/delete deliverable |
| GET/POST | `/api/benefits` | List/create benefit |
| PUT/DELETE | `/api/benefits/{id}` | Update/delete benefit |

Hibernate creates/updates the tables in the configured database using `spring.jpa.hibernate.ddl-auto=update`.

## Notes

- Start MySQL before starting the backend.
- The frontend requires the backend to be running for the four connected modules.
- Sponsor deletion may be rejected by MySQL if campaigns or benefits still reference that sponsor; remove or reassign dependent records first.
- This package is a development baseline, not a production-hardened deployment.


## Module workspace update

The workspace modules now have module-specific layouts, KPI labels, operational guidance, table columns and create/edit forms. Their records are stored separately by module key through the shared workspace-record API. The four core modules (Sponsors, Campaigns, Deliverables and Benefits) retain their existing dedicated CRUD pages.

Important scope notes:
- The generic modules provide record-register workflows; they are not substitutes for integrations such as email delivery, document upload/storage, sponsor portal authentication, user authentication/authorization, automatic audit logging, or financial ROI calculations.
- KPI breakdowns in the generic module pages are calculated from the currently displayed page unless labelled as total records.
- Login remains a local front-end session gate, not secure server-side authentication.

## Expanded module implementation

The application retains the dedicated Sponsor, Campaign, Deliverable and Benefit entities and adds module-specific custom fields to the remaining 19 operational workspaces. Each workspace has its own field set, table columns, purpose text and server-calculated summary counts. Custom fields are stored as JSON text in `workspace_records.custom_fields`; existing records are preserved by Hibernate schema update.

### Authentication and first administrator

The frontend now authenticates against `POST /api/auth/login`. The backend stores BCrypt password hashes and issues random opaque session tokens (12-hour expiry); the raw token is held only in browser session storage and sent as a Bearer token. Logout revokes the session. All API routes except login, health and error require authentication. User and audit-register workspace routes require the ADMIN role.

Create the first administrator through environment variables before starting the backend. The bootstrap creates the account only if the email does not already exist:

**PowerShell**
```powershell
$env:CRM_ADMIN_EMAIL="admin@yourcompany.com"
$env:CRM_ADMIN_PASSWORD="use-a-long-unique-password"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-local-mysql-password"
cd backend
mvn spring-boot:run
```

Do not commit credentials to Git. If an administrator already exists, changing these environment variables does not reset that account's password.

### Module capability boundaries

- Contacts, Leads, Pipeline, Packages, Opportunities, Proposals, Contracts, Events, Communications, Tasks, Follow-ups, Sponsor Portal, Documents, Notifications, Reports, ROI Analytics, Sponsor Health, Users and Audit Logs now have dedicated data-entry fields and distinct workspace layouts/configurations, backed by their own `moduleKey` data partition and aggregate API.
- Sponsor Portal currently manages portal content records; it is not yet an externally hosted sponsor login portal.
- Documents currently stores document metadata and a file reference/URL; binary file upload/storage needs a configured storage service.
- Notifications currently manages notification records; outbound email/SMS/push delivery needs a provider integration.
- Reports provides report-request management; downloadable report generation still needs report-specific aggregation/export implementation.
- ROI values are captured from entered spend and attributed value; verify source data before using them for financial decisions.
- Audit Logs is a restricted governance register, not yet a tamper-proof automatic audit event stream for every database mutation.
- Payment processing, e-signature, email delivery and external integrations require provider credentials and integration testing.

### Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend default API URL is `http://localhost:8080/api`; override it with `VITE_API_URL` in `frontend/.env` when required.
