# KudiCart Admin + Vendor Web — System Design

> **Purpose:** System design for the Admin + Vendor Web Application.

---

# 1. Design Objectives

1. Provide comprehensive admin marketplace operations.
2. Provide vendor-scoped catalog and order management.
3. Implement role-based routing (Admin vs Vendor).
4. Delegate all authoritative business logic to the backend.
5. Enforce vendor data isolation through backend-driven scoping.
6. Support responsive web design.

---

# 2. Architecture Position

```text
┌────────────────────────────────┐
│  KudiCart Admin/Vendor Web      │  ← Next.js (this repo)
│  (Presentation Layer)           │
│  Admin routes │ Vendor routes   │
└──────────┬─────────────────────┘
           │ REST API
           ▼
┌────────────────────────────────┐
│  KudiCart Backend               │  ← NestJS (kudicart-backend)
└──────────┬─────────────────────┘
           ▼
┌────────────────────────────────┐
│  PostgreSQL + Services          │
└────────────────────────────────┘
```

---

# 3. Authentication Design

```text
Admin/Vendor opens web app
      ↓
Email + Password login form
      ↓
Firebase Authentication
      ↓
Firebase ID Token
      ↓
Token sent to backend
      ↓
Backend resolves: user → role (Admin or Vendor) → vendor scope (if Vendor)
      ↓
Role-based redirect (Admin dashboard or Vendor dashboard)
```

---

# 4. Role-Based Routing Design

```text
Login → Backend role check
      ↓
┌─── Admin ────────────────────┐
│  /admin/dashboard            │
│  /admin/users                │
│  /admin/vendors              │
│  /admin/categories           │
│  /admin/products             │
│  /admin/orders               │
│  /admin/delivery-partners    │
│  /admin/assignments          │
│  /admin/payments             │
│  /admin/ledger               │
│  /admin/reviews              │
│  /admin/support              │
│  /admin/reports              │
│  /admin/audit                │
│  /admin/notifications        │
│  /admin/settings             │
└──────────────────────────────┘

┌─── Vendor ───────────────────┐
│  /vendor/dashboard           │
│  /vendor/profile             │
│  /vendor/products            │
│  /vendor/orders              │
│  /vendor/reviews             │
│  /vendor/reports             │
│  /vendor/settings            │
└──────────────────────────────┘
```

Vendor routes serve vendor-scoped data only. Admin routes serve marketplace-wide data.

---

# 5. Admin Workflow Designs

## 5.1 Manual Delivery Assignment

```text
Admin → Orders list → Select order (READY_FOR_PICKUP)
      ↓
View available delivery partners
      ↓
Select delivery partner
      ↓
Confirm assignment
      ↓
Backend records assignment → Order → ASSIGNED
      ↓
Driver receives push notification
```

## 5.2 Vendor Approval

```text
Admin → Vendors list → Pending vendors
      ↓
Review vendor details
      ↓
Approve / Reject
      ↓
Backend updates vendor status
```

## 5.3 Dashboard

```text
Admin Dashboard
  ├── Total orders (today/week/month)
  ├── Active orders
  ├── Total revenue
  ├── Active vendors
  ├── Active delivery partners
  ├── Pending support tickets
  └── Quick navigation links
```

## 5.4 CSV Export

```text
Admin → Report section
      ↓
Select report type
      ↓
Apply filters (date range, etc.)
      ↓
Download CSV
```

---

# 6. Vendor Workflow Designs

## 6.1 Catalog Management

```text
Vendor → Products list (own products)
      ↓
Add / Edit / Delete products
      ↓
Set pricing, stock quantity
      ↓
Upload product images (via backend → Cloudinary)
```

## 6.2 Order Management

```text
Vendor → Orders list (own orders)
      ↓
View order detail
      ↓
Update status (permitted transitions):
  PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP
```

---

# 7. Data Table Design

Admin and Vendor screens heavily use data tables with:

- Pagination.
- Sorting.
- Filtering.
- Search.
- Bulk actions where applicable.
- Row click → detail view.

---

# 8. State Management Design

| State | Examples |
|---|---|
| Auth state | Firebase user, role, vendor scope |
| Page data | Tables, lists, form data |
| UI state | Modals, sidebars, loading, errors |
| Filters | Date ranges, status filters, search |

---

# 9. Error Handling

| Error Type | Handling |
|---|---|
| Auth errors | Redirect to login |
| Authorization errors | Show "Access Denied" |
| Validation errors | Inline form errors |
| Network errors | Toast/alert with retry |
| Business rule errors | Display backend message |
| Unexpected errors | Sentry + generic error page |

---

# 10. Responsive Design

The web app should be usable on:
- Desktop (primary).
- Tablet.
- Basic mobile responsiveness.

---

# 11. Scope Protection

The web app must NOT implement:
- Customer shopping pages.
- Driver execution pages.
- Coupon/combo/loyalty management.
- Delivery zone configuration.
- Auto-dispatch configuration.
- BI dashboards beyond approved cards.

---

# 12. Antigravity Instructions

Before implementing a web app feature:
1. Identify the requirement and role (Admin or Vendor).
2. Confirm the feature is within scope.
3. Keep business logic on the backend.
4. Vendor isolation is mandatory.
5. Frontend route guards supplement but do not replace backend authorization.
