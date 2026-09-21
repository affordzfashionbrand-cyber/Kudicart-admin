# KudiCart Admin + Vendor Web — Architecture Prompt

> **Purpose:** Guide creation of the Admin + Vendor Web App's detailed architecture.

---

# 1. Context
A single Next.js web application serving two roles: Admin (marketplace-wide) and Vendor (scoped to their own data). Deployed on Vercel.

---

# 2. Architecture Decisions Required

## Next.js Project Structure
- App Router vs Pages Router.
- Route groups for Admin vs Vendor.
- Layout components.
- Page organization.

## Role-Based Access
- Middleware for role-based route protection.
- Role resolution on login.
- Admin-only vs Vendor-only routes.
- Shared routes (if any).

## UI Component Library
- Component library selection (shadcn/ui, Ant Design, etc.).
- Design system / theme.
- Data table component.
- Form components.

## State Management
- Server components vs client components.
- Data fetching strategy (SWR, React Query, etc.).
- Form state management.
- Auth state.

## API Client
- HTTP client for backend communication.
- Auth token injection.
- Error handling.

## Authentication
- Firebase web SDK integration.
- Email/password login form.
- Token management.

## File Upload
- Product image upload flow (→ backend → Cloudinary).
- Upload UI components.

## Reporting / Export
- CSV generation strategy (client-side or backend-generated).
- Report display components.

---

# 3. Route Architecture

### Admin Routes
```
/admin/dashboard
/admin/users
/admin/vendors
/admin/vendors/[id]
/admin/categories
/admin/products
/admin/products/[id]
/admin/orders
/admin/orders/[id]
/admin/delivery-partners
/admin/assignments
/admin/payments
/admin/ledger
/admin/reviews
/admin/support
/admin/reports
/admin/audit
/admin/notifications
/admin/settings
```

### Vendor Routes
```
/vendor/dashboard
/vendor/profile
/vendor/products
/vendor/products/new
/vendor/products/[id]
/vendor/orders
/vendor/orders/[id]
/vendor/reviews
/vendor/reports
/vendor/settings
```

---

# 4. Constraints
1. Single app, two roles — not two separate apps.
2. Vendor data isolation is mandatory.
3. Presentation layer only.
4. No excluded feature screens.
5. Vercel deployment.

---

# 5. Architecture Output Expected
1. Folder structure with responsibilities.
2. Route architecture.
3. Role-based access middleware.
4. Layout component hierarchy.
5. State management approach.
6. API client architecture.
7. Data table / list component pattern.
8. Form / CRUD pattern.
9. CSV export approach.
10. Testing strategy.
11. Vercel deployment configuration.
12. Environment/secrets management.
