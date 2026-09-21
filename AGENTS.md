# KudiCart Admin + Vendor Web — AGENTS.md (Repository Operating Directive)

> **Authority level:** This is the repo-level operating directive for `kudicart-admin-vendor-web/`. It **inherits** all rules from the workspace-root `.agents/AGENTS.md` and adds web-app-specific constraints. If a rule here conflicts with the root directive, the root directive wins.

---

## 1. Repository Identity

| Property | Value |
|---|---|
| Repository | `kudicart-admin-vendor-web` |
| Technology | Next.js (TypeScript) |
| Role | **Admin marketplace operations + Vendor scoped management** — presentation layer |
| Hosting | Vercel (D-025) |
| CI/CD | Jenkins (D-026) |

This is a **single web application with two role-based surfaces**:
- **Admin** — marketplace-wide operational control
- **Vendor** — vendor-scoped catalog and order management

Both are presentation layers. Authorization authority lives in `kudicart-backend/`.

---

## 2. Repository-Level Document Map

```text
kudicart-admin-vendor-web/
├── AGENTS.md                ← THIS FILE
├── project_context.md       ← Web app context
├── SPEC.md                  ← Admin + Vendor requirements
├── decisions.md             ← Web-app locked decisions
├── design.md                ← Role-based routing + workflows
├── PLAN.md                  ← Web app plan (16 phases)
├── progress.md              ← Web app progress tracker
├── architecture_prompt.md   ← Web app architecture guidance
└── src/                     ← Application code (gated by §3)
```

### Context Loading Order

```text
1. .agents/AGENTS.md                         → workspace-wide rules
2. kudicart-admin-vendor-web/AGENTS.md       → THIS FILE (repo rules)
3. kudicart-admin-vendor-web/progress.md     → current phase, blockers
4. kudicart-admin-vendor-web/decisions.md    → locked tech + open decisions
5. kudicart-admin-vendor-web/PLAN.md         → active work package
6. KudiCart_progress.md                      → master project state
```

---

## 3. Code-Creation Gate (Web App)

No web app code may be created until:

1. The master `architecture.md` is approved.
2. The active phase in `kudicart-admin-vendor-web/PLAN.md` is bound to concrete file paths.
3. Backend API contracts for consumed endpoints exist in `kudicart-backend/`.

---

## 4. Web App Technology Stack (Locked)

| Concern | Technology | Decision ID |
|---|---|---|
| Framework | Next.js (TypeScript) | D-014 |
| Authentication | Firebase Auth (Email/Password) | D-017 |
| Error Tracking | Sentry | D-023 |
| Hosting | Vercel | D-025 |
| CI/CD | Jenkins | D-026 |
| API | REST to kudicart-backend | D-015 |

---

## 5. Critical Boundary: Two Roles, One App

### 5.1 Single Application, Two Roles (D-WEB-07)
Admin and Vendor are **role-separated users** of the same Next.js application. Do NOT:
- Create two separate web applications.
- Create separate deployments per role.
- Mix admin data into vendor views or vice versa.

### 5.2 Role-Based Routing

```text
/admin/*   → Admin-only routes (marketplace-wide)
/vendor/*  → Vendor-only routes (vendor-scoped)
/login     → Shared authentication
```

Routing middleware must verify the user's role before granting access. An admin route must reject vendor users and vice versa.

### 5.3 Vendor Data Isolation (D-032) — Frontend Enforcement

While the backend is the **authoritative** source of vendor isolation:
- Frontend must still scope API calls using the authenticated vendor context.
- Frontend must NOT show vendor-switching UI that bypasses backend scoping.
- Frontend hiding is **supplementary** — never the sole mechanism.

### 5.4 Frontend Guards ≠ Backend Authorization (D-033)
- Frontend route guards improve UX by preventing navigation to unauthorized screens.
- They do NOT replace backend RBAC guards.
- Every admin-only endpoint must have a backend `@Roles(Role.ADMIN)` guard regardless of frontend protection.

---

## 6. Admin Scope

### What Admin Routes Do

| Feature | Requirement |
|---|---|
| Dashboard with operational cards | R-ADMIN-02 |
| User/customer management | R-ADMIN-03 |
| Vendor management + approval | R-ADMIN-04, R-ADMIN-05 |
| Delivery partner management | R-ADMIN-06 |
| Category management | R-ADMIN-07 |
| Product/catalog management | R-ADMIN-08 |
| Order management (all orders) | R-ADMIN-09 |
| **Manual delivery assignment** | R-ADMIN-10 |
| Payment visibility | R-ADMIN-11 |
| Commission/ledger visibility | R-ADMIN-12 |
| Reviews management | R-ADMIN-13 |
| Support ticket management | R-ADMIN-14 |
| Notification administration | R-ADMIN-15 |
| Reporting + CSV export | R-ADMIN-16 |
| Audit visibility | R-ADMIN-17 |

### Manual Delivery Assignment (D-006)

This is the **only** assignment mechanism:
```text
Admin views order → Selects delivery partner → Confirms assignment → Backend records
```
- No automatic dispatch UI.
- No "suggest nearest rider" button.
- No auto-match on order creation.

---

## 7. Vendor Scope

### What Vendor Routes Do

| Feature | Requirement |
|---|---|
| Vendor profile management | R-VEND-02 |
| Staff functionality (where applicable) | R-VEND-03 |
| Own product/catalog management | R-VEND-04 |
| Own pricing management | R-VEND-05 |
| Own stock management | R-VEND-06 |
| Own order management | R-VEND-07 |
| Permitted order status updates | R-VEND-08 |
| Vendor-specific dashboard | R-VEND-09 |

### Vendor Order Status Transitions

Vendors may update orders they own through these transitions only:
```text
PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP
```

Any further transitions (ASSIGNED, PICKED_UP, etc.) are Admin/Driver actions — the vendor UI must NOT expose them.

### Vendor Data Scoping (D-032, R-VEND-10)
- Vendor views show ONLY their own data.
- API calls must use the vendor-scoped endpoints.
- No "all vendors" or "all marketplace" data in vendor routes.

---

## 8. Web App Hard Exclusions

Do NOT create screens, components, pages, or routes for:

| Excluded | Decision |
|---|---|
| Customer shopping UI | Out of scope |
| Delivery partner execution UI | Out of scope |
| Coupon management | D-003 |
| Combo/bundle management | D-004 |
| Delivery zone configuration | D-005 |
| Automatic dispatch configuration | D-006 |
| Route optimization UI | D-007 |
| BI / Power BI / Tableau dashboards | D-008 |
| Loyalty/referral/wallet management | D-009 |
| Live chat platform | D-010 |
| Multi-language/multi-currency admin | D-011 |

### Reporting Boundary (D-WEB-12)
Reporting is limited to:
- Admin dashboard cards (definitions OPEN — O-014)
- Basic aggregations
- CSV export (definitions OPEN — O-016)

No BI platform, Power BI, Tableau, or predictive analytics.

---

## 9. Web App Open Decisions

Stop and ask the user — do NOT invent resolutions:

| ID | Decision | Impact |
|---|---|---|
| O-WEB-01 | Dashboard card definitions | Admin dashboard |
| O-WEB-02 | CSV export datasets/columns | CSV export |
| O-WEB-03 | Vendor staff roles/permissions | Vendor module |
| O-WEB-04 | Reporting definitions | Reports pages |
| O-WEB-05 | Audit event visibility | Audit pages |
| O-WEB-06 | Vendor approval workflow details | Vendor management |
| O-WEB-07 | Support ticket management UI | Support pages |
| O-WEB-08 | KYC display fields | Partner management |
| O-WEB-09 | UI component library / design system | Phase 1 |

---

## 10. API Dependency Rule

Before implementing any admin or vendor page:

1. **Verify** the backend endpoint exists (or is defined in the API contract).
2. **Match** the response shape — do not invent response structures.
3. **Include** Firebase ID token in every authenticated request.
4. **For vendor pages:** use vendor-scoped endpoints that enforce `vendor_id`.
5. If the endpoint does not exist → **STOP**. Backend must be built first.

---

## 11. Data Table Pattern

Admin and Vendor pages heavily use data tables. Standardize:

- Pagination (server-side preferred).
- Sorting.
- Filtering / search.
- Row click → detail view.
- Loading and error states.
- Empty states.

Use a consistent data table component across all management pages.

---

## 12. Responsive Design

The web app must be usable on:
- Desktop (primary target).
- Tablet.
- Basic mobile responsiveness.

Cross-browser testing scope per O-018 (OPEN).

---

## 13. Environment & Secrets

Required:
- Firebase web configuration
- Backend API base URL
- Sentry DSN
- Vercel deployment configuration

**No production secrets in source control. No Firebase service account in client-side code.**

---

## 14. Testing Requirements

| Test Type | Required |
|---|---|
| Component tests | Page rendering, form interactions |
| Role routing tests | Admin-only / vendor-only access |
| Vendor isolation tests | Vendor cannot see other vendor data |
| Data table tests | Pagination, filtering, sorting |
| Auth flow tests | Login, role resolution, redirect |
| CRUD flow tests | Create/edit/delete operations |

Evidence must be recorded in `kudicart-admin-vendor-web/progress.md`.

---

## 15. Deployment Rules

| Item | Requirement |
|---|---|
| Platform | Vercel |
| Environment variables | Must be set in Vercel project settings |
| Preview deployments | Per-branch previews via Vercel |
| Production deployment | Through Jenkins CI/CD pipeline |
| Domain/DNS | Client-owned (D-035) |

---

## 16. Sync Rules

After completing any web app work unit, update:

| File | What |
|---|---|
| `kudicart-admin-vendor-web/progress.md` | Phase status, checklist, evidence |
| `KudiCart_progress.md` | Master progress (if phase-level change) |
| `KudiCart_PLAN.md` | Phase status (if phase-level change) |

---

## 17. Self-Check (Admin + Vendor Web)

Before completing any turn:

- [ ] Did I implement authoritative business logic on the client? → Move to backend.
- [ ] Did I break vendor data isolation? → Fix: ensure vendor-scoped API calls.
- [ ] Did I rely on frontend route guards as the sole authorization? → Fix: ensure backend RBAC exists.
- [ ] Did I create automatic dispatch UI? → Delete. Manual assignment only.
- [ ] Did I create separate web apps for admin and vendor? → Merge into one app.
- [ ] Did I expose vendor-only transitions (ASSIGNED, DELIVERED) in vendor UI? → Remove.
- [ ] Did I create UI for excluded features? → Delete.
- [ ] Did I consume a backend endpoint that doesn't exist? → Stop, flag dependency.
- [ ] Did I add direct database access? → Remove.
- [ ] Did I silently decide an OPEN item? → Surface to user.
- [ ] Did I update progress.md with evidence? → Do it now.
