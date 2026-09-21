# KudiCart Admin + Vendor Web — Project Context

> **Purpose:** Durable project context for the KudiCart Admin and Vendor Web Application.
>
> This file covers only the **Next.js Web Application** serving Admin and Vendor roles. For backend API, see `kudicart-backend/`. For mobile apps, see `kudicart-customer-app/` and `kudicart-driver-app/`.

---

# 1. Repository Overview

This repository contains the **KudiCart Admin + Vendor Web Application** — a Next.js application deployed on Vercel.

The web application serves two distinct user roles through a single application with role-based routing:

1. **Admin** — Marketplace-wide operational control.
2. **Vendor** — Vendor-scoped catalog and order management.

Both roles authenticate via Firebase email/password and interact with the common KudiCart backend via REST API.

---

# 2. System Position

```text
kudicart-customer-app
kudicart-driver-app
kudicart-admin-vendor-web   ← THIS REPOSITORY
        ↓
  Common KudiCart Backend (kudicart-backend)
        ↓
  Supabase PostgreSQL
```

---

# 3. Two Actors, One Application

## 3.1 Admin

The Admin operates the marketplace and manages operational workflows requiring centralized control.

Admin scope includes:

- Dashboard with operational overview cards.
- Customer/user management.
- Vendor management and approval.
- Delivery partner management (status, KYC visibility).
- Category management.
- Product/catalog management.
- Order management.
- **Manual delivery-partner assignment.**
- Payment visibility.
- Commission and ledger visibility.
- Reviews and ratings management.
- Support ticket management.
- Notification administration.
- Basic reporting and aggregations.
- CSV export where specified.
- Audit visibility.

## 3.2 Vendor

The Vendor manages its own marketplace catalog and order operations, scoped to its vendor account.

Vendor scope includes:

- Vendor profile management.
- Staff functionality (where applicable).
- Product/catalog management (own products).
- Product pricing management.
- Product stock quantity management.
- Order management (own orders).
- Order status updates (permitted transitions).
- Vendor-specific dashboard/reporting.
- Vendor-scoped data access only.

### Critical — Vendor Data Isolation

Vendor users must NOT gain access to another vendor's data. This is enforced by the backend, not just UI hiding.

---

# 4. Technology Stack

| Concern | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Authentication | Firebase Authentication (Email/Password) |
| Error Tracking | Sentry |
| Hosting | Vercel |
| API Communication | REST API to kudicart-backend |

---

# 5. Authentication

- **Method:** Firebase Authentication with **Email / Password**.
- Both Admin and Vendor authenticate the same way.
- Firebase ID tokens are sent to the backend for verification.
- The backend resolves user role (Admin vs Vendor) and vendor scope.
- Role-based routing determines which screens/features are accessible.

---

# 6. Web App Owns

- Marketplace operations UX (Admin).
- Vendor catalog/order management UX.
- Dashboard/reporting presentation.
- Manual rider assignment UX.
- Product/catalog management UX.
- Review/support ticket management UX.
- Role-based navigation and route guards.
- Firebase email/password authentication flow.
- Sentry client-side error capture.

---

# 7. Web App Does NOT Own (Authoritative)

- Authorization (backend enforces).
- Payment verification.
- Business-state enforcement.
- Vendor data isolation (backend enforces).
- Order-state validation.
- Commission calculations.

---

# 8. Key Admin Workflows

### Manual Delivery Assignment
```text
Admin views order in READY_FOR_PICKUP state
      ↓
Admin views available delivery partners
      ↓
Admin selects a delivery partner
      ↓
Assignment is recorded via backend
      ↓
Order moves to ASSIGNED state
      ↓
Driver receives push notification
```

### Vendor Approval
```text
Vendor registration (or Admin creates vendor)
      ↓
Admin reviews vendor details
      ↓
Admin approves/rejects vendor
```

### Dashboard
```text
Admin dashboard
      ↓
Operational cards (orders, revenue, users, etc.)
      ↓
Quick access to management sections
```

---

# 9. Hard Scope Exclusions

The web application must NOT implement:

- Customer shopping UI.
- Delivery partner execution UI.
- Coupon management.
- Combo/bundle management.
- Loyalty/referral/wallet/subscription management.
- AI recommendation management.
- Delivery zone configuration.
- Automatic rider dispatch.
- Route optimization.
- BI platform / data warehouse.
- Power BI / Tableau integration.
- Predictive analytics.
- Live chat platform.
- Multi-language/multi-currency admin.

---

# 10. Hosting and Deployment

- **Platform:** Vercel.
- **CI/CD:** Jenkins (per project decisions).
- The web app is deployed as a Next.js application on Vercel.

---

# 11. Production Account Ownership

Production accounts (Firebase, Vercel, Sentry, domain/DNS) are **Client-owned**.

---

# 12. Environment Configuration

The web app requires:

- Firebase configuration (web config).
- Backend API base URL.
- Sentry DSN.
- Vercel deployment configuration.

**No production secrets in source control.**

---

# 13. Responsive Design

The web application shall support responsive behavior within the approved supported environments. Basic cross-browser testing is included.

---

# 14. Antigravity Instruction

Read this document before beginning work on the Admin/Vendor web app. Do not add functionality outside the approved scope. Vendor data isolation is mandatory.
