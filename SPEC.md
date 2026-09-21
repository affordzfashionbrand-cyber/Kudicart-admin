# KudiCart Admin + Vendor Web — Product Specification

> **Purpose:** Define the approved product requirements for the Admin + Vendor Web Application.
>
> Backend API and server-side logic are specified in `kudicart-backend/SPEC.md`.

---

# 1. Product Goal

The Admin + Vendor Web Application is a Next.js application providing marketplace operations for Admins and vendor-scoped management for Vendors, through a single web application with role-based access.

---

# 2. Admin Requirements

### R-ADMIN-01 — Authentication
Admins shall authenticate using Firebase Authentication with email/password.

### R-ADMIN-02 — Dashboard
Admins shall have access to the approved administrative dashboard with basic operational cards.

### R-ADMIN-03 — User Management
Admins shall be able to view/manage customers and relevant application users.

### R-ADMIN-04 — Vendor Management
Admins shall be able to manage vendors.

### R-ADMIN-05 — Vendor Approval
Admins shall be able to perform the supported vendor approval workflow.

### R-ADMIN-06 — Delivery Partner Management
Admins shall be able to manage delivery partners and view relevant status/KYC information.

### R-ADMIN-07 — Category Management
Admins shall be able to manage categories.

### R-ADMIN-08 — Product/Catalog Management
Admins shall be able to manage product/catalog information.

### R-ADMIN-09 — Order Management
Admins shall be able to view and manage marketplace orders.

### R-ADMIN-10 — Manual Delivery Assignment
Admins shall be able to manually assign a delivery partner to an applicable order.

### R-ADMIN-11 — Payment Visibility
Admins shall have the approved payment-related visibility.

### R-ADMIN-12 — Commission and Ledger Visibility
Admins shall have visibility into commissions, earnings, and ledger records.

### R-ADMIN-13 — Reviews Management
Admins shall be able to view/manage reviews and ratings.

### R-ADMIN-14 — Support Tickets Management
Admins shall be able to view/manage support tickets.

### R-ADMIN-15 — Notifications
Admins shall have access to relevant notification functionality.

### R-ADMIN-16 — Reporting and CSV
Admins shall have access to basic reporting, dashboard cards, and CSV export where specified.

### R-ADMIN-17 — Audit Visibility
Admins shall have the audit-related visibility included in scope.

---

# 3. Vendor Requirements

### R-VEND-01 — Authentication
Vendors shall authenticate using Firebase Authentication with email/password.

### R-VEND-02 — Vendor Profile
Vendors shall be able to manage their vendor profile information.

### R-VEND-03 — Staff Functionality
Where applicable, vendors shall have access to supported staff functionality.

### R-VEND-04 — Catalog Management
Vendors shall be able to manage their products within their vendor scope.

### R-VEND-05 — Pricing Management
Vendors shall manage product pricing through the catalog flow.

### R-VEND-06 — Stock Quantity Management
Vendors shall manage product stock quantity through the product flow.

### R-VEND-07 — Order Management
Vendors shall view and manage orders applicable to their vendor account.

### R-VEND-08 — Order Status Updates
Vendors shall perform the order-status updates permitted to the vendor role.

### R-VEND-09 — Vendor Reporting
Vendors shall have access to vendor-specific dashboard/reporting.

### R-VEND-10 — Data Scoping
Vendor users shall only access data for their vendor scope. No access to other vendors' data.

---

# 4. Platform Requirements

### R-PLAT-WEB-01 — Next.js
The web application shall be built with Next.js.

### R-PLAT-WEB-02 — Responsive Design
The web application shall support responsive behavior.

### R-PLAT-WEB-03 — Cross-Browser
Basic cross-browser testing for supported browsers.

### R-PLAT-WEB-04 — Vercel Hosting
The web application shall be deployed on Vercel.

### R-PLAT-WEB-05 — Sentry
Sentry shall be integrated for error tracking.

---

# 5. Quality Requirements

### R-QA-WEB-01 — Functional Testing
Admin and Vendor functionality shall be functionally tested.

### R-QA-WEB-02 — Authorization Testing
Role-based access (Admin vs Vendor) shall be tested.

### R-QA-WEB-03 — Vendor Isolation Testing
Vendor data isolation shall be verified.

---

# 6. Hard Constraints

1. Admin and Vendor are role-separated users of the same web application.
2. Vendor data scoping is mandatory (backend-enforced).
3. Frontend hiding is NOT sufficient authorization.
4. No excluded feature screens.
5. No direct database access.

---

# 7. Acceptance Criteria

- [ ] AC-01: Admin can authenticate with email/password.
- [ ] AC-02: Vendor can authenticate with email/password.
- [ ] AC-03: Admin sees admin dashboard with operational cards.
- [ ] AC-04: Admin can manage users, vendors, categories, products, orders.
- [ ] AC-05: Admin can manually assign delivery partners to orders.
- [ ] AC-06: Admin can manage reviews, support tickets.
- [ ] AC-07: Admin can view payment/commission/ledger information.
- [ ] AC-08: Admin can view reporting and CSV exports.
- [ ] AC-09: Admin can view audit information.
- [ ] AC-10: Vendor can manage own catalog, pricing, stock.
- [ ] AC-11: Vendor can manage own orders and permitted status updates.
- [ ] AC-12: Vendor CANNOT access another vendor's data.
- [ ] AC-13: Vendor sees vendor-specific dashboard/reporting.
- [ ] AC-14: Web app is responsive.
- [ ] AC-15: Sentry captures errors.
- [ ] AC-16: No excluded functionality is implemented.

---

# 8. Open Questions

1. Exact admin dashboard card definitions.
2. Exact CSV export datasets and columns.
3. Exact vendor staff roles and permissions.
4. Exact reporting definitions.
5. Exact audit event visibility.
6. Exact vendor approval workflow details.
7. Exact support ticket management interface.
8. Exact KYC display fields for delivery partners.

---

# 9. Scope Change Rule

Any requirement not in this specification requires an explicit scope change before implementation.
