# KudiCart Admin + Vendor Web — Implementation Plan

> **Purpose:** Bounded execution plan for the Admin + Vendor Web Application.

---

# 1. Plan Status
**Status:** PRE-ARCHITECTURE PLAN

---

# 2. Dependency Order

```text
Final Architecture Approved
        ↓
Next.js Project Foundation
        ↓
Firebase Auth (Email/Password) + Role Resolution
        ↓
Role-Based Routing (Admin vs Vendor)
        ↓
Layout / Navigation Shell (Admin sidebar, Vendor sidebar)
        ↓
Admin: Dashboard
        ↓
Admin: User Management
        ↓
Admin: Vendor Management + Approval
        ↓
Admin: Category Management
        ↓
Admin: Product/Catalog Management
        ↓
Vendor: Profile Management
        ↓
Vendor: Catalog/Product Management
        ↓
Vendor: Pricing + Stock Management
        ↓
Admin: Order Management
        ↓
Vendor: Order Management + Status Updates
        ↓
Admin: Delivery Partner Management
        ↓
Admin: Manual Delivery Assignment
        ↓
Admin: Payment Visibility
        ↓
Admin: Commission/Ledger Visibility
        ↓
Admin: Reviews Management
        ↓
Admin: Support Ticket Management
        ↓
Admin: Reporting + CSV Export
        ↓
Admin: Audit Visibility
        ↓
Vendor: Dashboard/Reporting
        ↓
Notification Administration
        ↓
Sentry Integration
        ↓
Responsive Design Polish
        ↓
Cross-Browser Testing
        ↓
Vercel Deployment Validation
```

---

# 3. Phase 1 — Project Foundation
**Status:** [ ]
- [ ] Next.js project initialization (TypeScript).
- [ ] Directory structure.
- [ ] Linting / formatting / type-checking.
- [ ] UI component library setup.
- [ ] API client foundation.
- [ ] Environment configuration.

---

# 4. Phase 2 — Authentication + Role Routing
**Status:** [ ]
- [ ] Firebase SDK setup (web).
- [ ] Email/password login page.
- [ ] Role resolution from backend.
- [ ] Role-based redirect (Admin → admin dashboard, Vendor → vendor dashboard).
- [ ] Protected route middleware.
- [ ] Logout flow.

---

# 5. Phase 3 — Layout Shell
**Status:** [ ]
- [ ] Admin layout (sidebar navigation, header).
- [ ] Vendor layout (sidebar navigation, header).
- [ ] Responsive navigation.
- [ ] Breadcrumbs.

---

# 6. Phase 4 — Admin Dashboard
**Status:** [ ]
- [ ] Dashboard page with operational cards.
- [ ] Quick navigation links.
- [ ] Data from backend API.

---

# 7. Phase 5 — Admin User Management
**Status:** [ ]
- [ ] Customer list page.
- [ ] Customer detail.
- [ ] User management actions.

---

# 8. Phase 6 — Admin Vendor Management
**Status:** [ ]
- [ ] Vendor list page.
- [ ] Vendor detail.
- [ ] Vendor approval workflow.
- [ ] Vendor creation (if applicable).

---

# 9. Phase 7 — Category Management
**Status:** [ ]
- [ ] Category list (CRUD).
- [ ] Category form.

---

# 10. Phase 8 — Product/Catalog Management
**Status:** [ ]
- [ ] Admin: All products view.
- [ ] Vendor: Own products view.
- [ ] Product CRUD (create, edit, delete).
- [ ] Product image upload (via backend → Cloudinary).
- [ ] Pricing and stock management.

---

# 11. Phase 9 — Order Management
**Status:** [ ]
- [ ] Admin: All orders view.
- [ ] Vendor: Own orders view.
- [ ] Order detail page.
- [ ] Order status display and timeline.
- [ ] Vendor: Permitted status updates (ACCEPTED, PREPARING, READY_FOR_PICKUP).

---

# 12. Phase 10 — Delivery Partner Management + Assignment
**Status:** [ ]
- [ ] Delivery partner list.
- [ ] Partner detail (status, KYC).
- [ ] Manual assignment UI on order detail.
- [ ] Available partners selection.
- [ ] Assignment confirmation.

---

# 13. Phase 11 — Financial Visibility
**Status:** [ ]
- [ ] Payment records list.
- [ ] Commission/ledger visibility.
- [ ] Earnings summary.

---

# 14. Phase 12 — Reviews + Support
**Status:** [ ]
- [ ] Reviews list and management.
- [ ] Support ticket list and management.
- [ ] Ticket detail and status updates.

---

# 15. Phase 13 — Reporting + CSV
**Status:** [ ]
- [ ] Report pages.
- [ ] CSV export functionality.
- [ ] Vendor-specific reporting.

---

# 16. Phase 14 — Audit Visibility
**Status:** [ ]
- [ ] Audit log list.
- [ ] Audit detail view.

---

# 17. Phase 15 — Sentry + Polish
**Status:** [ ]
- [ ] Sentry SDK setup.
- [ ] Responsive design review.
- [ ] Cross-browser testing.
- [ ] Error handling polish.

---

# 18. Phase 16 — Deployment
**Status:** [ ]
- [ ] Vercel deployment configuration.
- [ ] Production environment variables.
- [ ] Domain/DNS configuration.
- [ ] Production smoke tests.

---

# 19. Implementation Gate

Before implementing any phase:
1. Confirm final architecture is approved.
2. Identify Admin vs Vendor scope of the feature.
3. Confirm vendor data isolation is preserved.
4. Verify before marking complete.
