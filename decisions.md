# KudiCart Admin + Vendor Web — Decisions

> **Purpose:** Record decisions approved for the Admin + Vendor Web Application.

---

# 1. Technology Decisions

## D-WEB-01 — Web Framework
**Status:** `LOCKED`
The web application uses **Next.js** with **TypeScript**.

## D-WEB-02 — Authentication
**Status:** `LOCKED`
Admin and Vendor authenticate via **Firebase Authentication** with **Email / Password**.

## D-WEB-03 — Error Tracking
**Status:** `LOCKED`
**Sentry** is integrated for error tracking.

## D-WEB-04 — Hosting
**Status:** `LOCKED`
The web app is deployed on **Vercel**.

## D-WEB-05 — API Communication
**Status:** `LOCKED`
The web app communicates with the **common KudiCart NestJS Backend** via REST API. No direct database access.

## D-WEB-06 — CI/CD
**Status:** `LOCKED`
**Jenkins** is the CI/CD platform.

---

# 2. Scope Decisions

## D-WEB-07 — Single Application, Two Roles
**Status:** `LOCKED`
Admin and Vendor are **role-separated users** of the same Next.js web application. Do NOT create separate web applications for each role.

## D-WEB-08 — Vendor Data Isolation
**Status:** `LOCKED`
Vendor-scoped users must NOT access another vendor's data. This is enforced by the backend, not only by UI hiding.

## D-WEB-09 — Manual Delivery Assignment
**Status:** `LOCKED`
Delivery partner assignment is admin-driven and manual. No automatic dispatch UI.

## D-WEB-10 — No Authoritative Business Logic
**Status:** `LOCKED`
The web app is a presentation layer. Authorization, payment verification, and business-state enforcement are backend responsibilities.

## D-WEB-11 — Excluded Features
**Status:** `LOCKED`
The web app must NOT implement:
- Customer shopping UI.
- Delivery partner execution UI.
- Coupon/combo/loyalty/wallet/subscription management.
- AI recommendation management.
- Delivery zone configuration.
- Automatic rider dispatch UI.
- Route optimization UI.
- BI/data warehouse dashboards.
- Live chat platform.
- Multi-language/multi-currency admin.

## D-WEB-12 — Reporting Boundary
**Status:** `LOCKED`
Reporting is limited to approved admin dashboard cards, basic aggregations, and CSV export. No BI platform, Power BI, Tableau, or predictive analytics.

## D-WEB-14 — Affordz Official Store & Dark Store Workflow
**Status:** `LOCKED`
The Admin Product Management interface provides an "Add Dark Store Product" workflow exclusively for the Affordz Official Store:
- Fulfillment type defaults to `DARK_STORE` and cannot be toggled to `VENDOR`.
- The form contains no vendor selector; backend binds the reserved official store vendor identity.
- Requires dark store hub selection (`darkStoreHubId`).
- Vendor products remain strictly within the vendor portal flow.

## D-WEB-15 — Product Media Handling via Supabase Storage (Amended per DCR-002)
**Status:** `LOCKED`
Product imagery is uploaded directly to Supabase Storage or through authenticated backend endpoints. The web client stores returned CDN URLs in the product payload. No service-role keys are exposed to the client.

---

# 3. Account Ownership

## D-WEB-13 — Production Accounts
**Status:** `LOCKED`
Production accounts (Firebase, Vercel, Sentry, domain/DNS) must be **Client-owned**.

---

# 4. Open Decisions

| ID | Decision still required |
|---|---|
| O-WEB-01 | Exact dashboard card definitions |
| O-WEB-02 | Exact CSV export datasets/columns |
| O-WEB-03 | Exact vendor staff roles/permissions |
| O-WEB-04 | Exact reporting definitions |
| O-WEB-05 | Exact audit event visibility |
| O-WEB-06 | Exact vendor approval workflow |
| O-WEB-07 | Exact support ticket management |
| O-WEB-08 | Exact KYC display fields |
| O-WEB-09 | UI component library / design system choice |

---

# 5. Decision Precedence
1. Master `KudiCart_decisions.md`
2. This file's locked decisions
3. Approved specification
4. Design/plan
5. Prototype
6. AI assumptions
