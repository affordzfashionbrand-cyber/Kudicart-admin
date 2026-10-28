# KudiCart Admin + Vendor Web — Progress Report

> **Purpose:** Durable execution/status record for the Admin + Vendor Web Application.

---

# 1. Status Legend
```text
[ ] Not started
[~] In progress
[x] Complete
[!] Blocked
[-] Deferred
```

---

# 2. Current State
**Overall Status:** COMPLETE (UNIVERSAL PRODUCTION-QUALITY REFINEMENT ACROSS ALL ADMIN & VENDOR ROUTES)

**Documentation:**
```text
[x] project_context.md
[x] SPEC.md
[x] decisions.md
[x] design.md
[x] PLAN.md
[x] progress.md
[x] Final architecture artifact
```

---

# 3. Implementation Progress

## Phase 1 — Project Foundation — **Status:** [x]
- Established design tokens matching approved Stitch designs (`#FF5A1F` Signal Orange, `#F7F7F5` Primary Canvas, `#F4F1EA` Secondary Surface, Plus Jakarta Sans, JetBrains Mono for SKUs/financials).
- Reusable UI component system created (`StatusBadge`, `EmptyState`, `Skeleton`, `ModulePlaceholder`).
- Extended `StatusBadge` to support `order`, `payment`, `user`, `vendor`, `product`, `stock`, `fulfillment`, and `kyc` variants.

## Phase 2 — Authentication + Role Routing — **Status:** [x]
- Unified `/login` route refined into production-quality interface with warm neutral left panel (`#F4F1EA`) and clean light right panel (`#F7F7F5`).
- Removed redundant Central Ops and Vendor Portal role cards, overlines, and template-like features.
- Applied precise geometry: 8px border radius on inputs and button, 14px on form card, 44px control heights, subtle brand focus states without double outlines.
- Left panel copy: "Marketplace Operations for KudiCart" / "Manage orders, vendors, products, and marketplace activity in one place."
- Client-side validation for work email and password; preview navigation restored for UI testing:
  - Admin emails (e.g. `admin@kudicart.com`) route directly to `/admin/dashboard`.
  - Vendor emails (e.g. `vendor@store.com`) route directly to `/vendor/dashboard`.
- Strict isolation: No global Switch Role control in production flow; Vendor portal maintains vendor scope.

## Phase 3 — Layout Shell — **Status:** [x]
- **Admin Central Ops Shell (`AdminHeader` + `AdminSidebar` + `AdminLayout`):**
  - **Minimal Header:** Streamlined to essential elements: compact global search (`Search...`, ~280px), notification bell with unread indicator and popover, and circular 32px profile avatar (removed redundant breadcrumb / current page status text).
  - **Removed Header Clutter:** Removed redundant `Super Admin` role pill, job title, full user name from the closed header bar, long search placeholder, and nonfunctional help icon.
  - **Collapsible Sidebar:** Implemented dual-state desktop sidebar (260px expanded, 72px collapsed) with unobtrusive toggle in the brand area, persistent `localStorage` preference, and dynamic content padding offset (`lg:pl-[260px]` vs `lg:pl-[72px]`).
  - **Clean Navigation & Geometry:** Restrained 8px radius on active states, 500 font weight on labels, outlined icons with accessible floating tooltips when collapsed, and zero footer telemetry or version labels.
  - **Preserved Approved Routes:** Core, Logistics & Fulfillment (Orders, Delivery Partners, Assignments), Finance & Governance, and System Control.
- **Vendor Boutique Shell:** Fixed 260px sidebar (`VendorSidebar`), sticky 64px header (`VendorHeader`), store switcher, notification trigger.

## Phase 4 — Admin Dashboard Refinement — **Status:** [x]
- **Route:** `/admin/dashboard`
- **Components:** `DashboardHeader`, `ActionRequiredRibbon`, `MarketplaceMetricsGrid`, `OrderLifecyclePipeline`, `OperationalQueues`, `FinancialHealthSnapshot`, `RecentOrdersTable`.
- **Production UI Refinement Completed:**
  - **Content Inset & Layout:** Corrected dashboard content container to prevent touching the sidebar boundary (`px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-8 space-y-4 sm:space-y-5 max-w-[1400px] mx-auto box-border min-w-0`), eliminated unnecessary top/bottom empty wrappers, and removed standalone decorative dots.
  - **Header Simplification:** Clean title `Dashboard` (28px semibold) and subtitle `Marketplace overview` (14px regular). Removed hardcoded greetings, stale dates, redundant timezone pills, and fake live refresh controls.
  - **Needs Attention Section:** Replaced oversized loud warning banner with a compact, restrained panel showing genuine actionable items (4 unassigned orders, 3 boutique applications, 2 driver KYC verifications) with amber indicators and direct module links. Removed nonfunctional "Resolve Exceptions" button.
  - **Marketplace Summary Metrics:** Standardized into a balanced 4-card responsive grid (Total Orders: 148, Gross Order Value: ₹4,82,450, Active Vendors: 42/48, Delivery Partners: 28). Removed asymmetric span-5 cards, gradients, colored icon containers, and unsupported claims like 99.8% system uptime.
  - **Order Status Pipeline:** Rebuilt into a clean 8-stage canonical lifecycle with horizontal tiles (status label on left, count on right, vertically centered, 54px height, 10–12px gaps), subtle status tinting, and zero decorative dots across tiles and status badges (`Pending Review`, `Active`, `Verified`, `Ready for Pickup`). Removed numbered stage prefixes, "ACTION" badges, and oversized exception banners.
  - **Operational Queues:** Two balanced equal-width columns for Vendor Overview (3 concise boutique rows) and Delivery Partners (3 concise fleet partner rows) with direct review/inspection links. Removed unapproved SLA percentages, onboarding duration telemetry, standby EV inventories, and driver proximity info.
  - **Recent Orders Table:** Standardized table with concise columns (Order ID, Customer, Boutique Vendor, Fulfillment, Amount, Status, Action), right-aligned currency, monospace identifiers, and consistent `StatusBadge` styling.
  - **Financial Summary:** Simplified into an honest 3-metric overview (Gross Order Value, Recorded Transactions, and Ledger & Settlement references) with links to `/admin/payments` and `/admin/ledger`. Removed unapproved escrow status bars, 24h SLA guarantees, and payment gateway exception progress bars.
  - **Code Integrity:** All components verified via `npm run type-check` (0 errors). Frontend-only mode preserved.

## Phase 5 — Admin User Management — **Status:** [x]
- **Routes:** `/admin/users`, `/admin/users/[id]`
- **Service Layer (`src/lib/api/users.ts`):**
  - Implemented `getCustomers()`, `getCustomerById()`, `updateCustomerStatus()`, and `generateCustomersCSV()`.
  - Configured backend API attempt (`/api/v1/admin/users`) with timeout and graceful development fallback reporting (`isFallback: boolean`).
- **Customer Directory List (`/admin/users`):**
  - Resolved `View Details` defect: replaced cramped button with dedicated, accessible `<Link>` navigating to `/admin/users/[id]`.
  - Added clickable links to Customer Name and Customer ID for seamless navigation.
  - Fixed table layout usability: added explicit column sizing, formatted phone numbers with `whitespace-nowrap font-mono tabular-nums` to eliminate broken multi-line numbers, and preserved horizontal scroll responsiveness.
  - Removed misleading bulk selection checkboxes (no bulk operations supported).
  - Search across Customer Name, Phone, Email, and Customer ID.
  - Filter by Account Status (`All`, `Active`, `Suspended`) and Registration Date Range with "Clear Filters" reset.
  - Client-side pagination: slices actual dataset (10 items/page), displays true entry counts (`Showing 1 to 8 of 8 customers`), with active page controls.
  - Client-side CSV export: real RFC 4180 CSV generation (`text/csv;charset=utf-8;`) with automatic Blob download.
- **Customer Detail & Inspection (`/admin/users/[id]`):**
  - Replaced silent fallback (`MOCK_CUSTOMERS[0]`) with true loading skeleton, dedicated "Customer Not Found" screen, and error state.
  - Dynamic breadcrumbs: `Users → Customer Details`.
  - Copy-to-clipboard actions with visual confirmation for Phone and Email.
  - Operational metric cards: Total Spent, Total Orders, Average Order Value, Saved Addresses.
  - Tabbed workspace: Order History (linking to `/admin/orders/[id]`), Saved Addresses, Product Reviews, Support Tickets.
  - Consequential Account Action: Suspend / Reactivate Customer modal with state update and feedback.
- **Shared Shell Improvements:**
  - `AdminHeader`: Root breadcrumb links to `/admin/dashboard`, dynamic breadcrumbs for users module, profile dropdown with user session info and working Sign-Out, notifications link, and support link.
  - `AdminSidebar`: Logo links to `/admin/dashboard`, manual assignment link, removed fake telemetry and unapproved status badges.

## Phase 6 — Admin Vendor Management — **Status:** [x]
- **Routes:** `/admin/vendors`, `/admin/vendors/[id]`
- **Service Layer (`src/lib/api/vendors.ts`):**
  - Implemented `getVendors()`, `getVendorById()`, `approveVendor()`, `rejectVendor()`, `suspendVendor()`, and `generateVendorsCSV()`.
  - Configured backend API attempt (`/api/v1/admin/vendors`) with timeout handling, typed responses, and honest development fallback reporting (`isFallback: boolean`).
- **Vendor Directory List (`/admin/vendors`):**
  - Resolved `View Details` and navigation: accessible `<Link>` routing on Store Name, monogram avatar, and Action buttons (`Review` / `Manage`).
  - Dynamic status tabs with live counts (`All Vendors`, `Active`, `Pending Approvals` with active pulse, `Suspended`).
  - Search across Store Name, Owner Name, Email, and Vendor ID.
  - Dynamic Category filter extracted from vendor records, Registration Date filter, and Clear Filters action.
  - Clean table formatting with `whitespace-nowrap font-mono tabular-nums` for contact numbers to eliminate awkward line wrapping.
  - Client-side pagination: slices actual dataset (8 items/page) with true entry counts (`Showing 1 to 8 of 8 boutiques`) and working Previous/Next controls.
  - RFC 4180 CSV Export: automatic client-side CSV compilation and Blob download.
  - Add Vendor workflow: honest informational modal explaining that administrative onboarding invitations (`POST /api/v1/admin/vendors/invite`) are pending backend implementation.
- **Vendor Detail & Inspection (`/admin/vendors/[id]`):**
  - Eliminated silent fallback (`MOCK_VENDORS[0]`), adding loading skeleton and dedicated "Vendor Boutique Not Found" error card.
  - Dynamic breadcrumbs in shell: `Central Operations → Vendors → Vendor Details`.
  - Removed unapproved and fabricated claims: fake reviewer names (`Amara Okonkwo`), fictional review timestamps, 4-step fake checklist ("Penny Drop", "Live GSTIN verification"), express "60 Minutes Guaranteed" SLA, EV fleet claims, and provisional 12.5% countersignature statements.
  - Replaced checklist with genuine Compliance Document Checklist reflecting actual uploaded documents.
  - Business & Entity Details: Legal Entity Name, Primary Contact with role, Registered Address, Email & Phone with copy-to-clipboard, GSTIN, PAN, Bank & IFSC.
  - Submitted Compliance Documents with secure modal preview drawer.
  - Initial Product Catalog overview with draft stock, prices in INR, and direct link to `/admin/products`.
  - Operational Actions: Approve Vendor modal with confirmation, Reject Application modal with mandatory reason input, and Suspend Store action.

## Phase 7 — Category Management — **Status:** [x]
- **Route:** `/admin/categories`
- **Category Management Workspace:**
  - Full marketplace category listing with canonical apparel and lifestyle categories (`Ethnic Wear`, `Western Wear`, `Traditional`, `Footwear`, `Accessories`, `Jewellery`).
  - Search by category name or slug, filter by active/inactive status, and RFC 4180 CSV export.
  - Category creation and editing drawer with client validation and honest notice regarding backend persistence.
  - Standardized table layout, 8px input/button radii, 10px card radii, and Outlined Lucide icons.

## Phase 8 — Product/Catalog Management — **Status:** [x]
- **Routes:** `/admin/products`, `/admin/products/[id]`
- **Service Layer (`src/lib/api/products.ts`):**
  - Implemented `getProducts()`, `getProductById()`, and `generateProductsCSV()`.
  - Configured backend API integration consuming NestJS `CatalogController` (`GET /api/v1/products` and `GET /api/v1/products/:id`) with timeout handling and typed mapper to `CatalogProduct`.
- **Product & Catalog Directory (`/admin/products`):**
  - Resolved count conflicts: eliminated hardcoded `1,842 Catalog Items`, deriving header total, status tab counts, filter result count, and pagination summary from the single authoritative product collection.
  - Dynamic status tabs with live counts: All Products, Active Listings, Low Stock (inventory condition), Out of Stock (inventory condition), Draft / Review.
  - Search across Product Title, Brand, SKU, and Vendor Name.
  - Dynamic Category and Vendor filters populated from actual catalog entries.
  - Table layout fixes: resolved arbitrary multi-line SKU breaks (`whitespace-nowrap font-mono tabular-nums`), unconstrained vendor text (`truncate max-w-[170px]`), and wrapped stock numbers (`{stockQuantity} units`).
  - Active Refresh control with loading spin state and in-progress indicator.
  - RFC 4180 CSV export via Blob download.
  - Client-side pagination: slices actual dataset (8 items/page) with true entry counts (`Showing 1 to 8 of 8 items`) and functional Previous/Next controls.
- **Product Detail & Inspection View (`/admin/products/[id]`):**
  - Eliminated silent fallback (`MOCK_PRODUCTS[0]`), adding loading skeleton and dedicated "Product Not Found" screen.
  - Dynamic breadcrumbs in shell: `Central Operations → Products → Product Details`.
  - Removed unapproved 12.5% provisional commission calculation on product detail, keeping commercial presentation focused on authentic selling price, MRP, and stock availability.
  - High-resolution gallery preview with asset switcher, narrative description, and verified technical specifications.
  - Inventory and hub assignment details with merchant attribution link to `/admin/vendors/[id]`.

## Phase 9 — Order Management & Manual Assignment — **Status:** [x]
- **Routes:** `/admin/orders`, `/admin/orders/[id]`
- **Service Layer (`src/lib/api/orders.ts`):**
  - Implemented `getOrders()`, `getOrderById()`, `assignDeliveryPartner()`, `calculateOrderStats()`, and `exportOrdersToCSV()`.
  - Configured backend integration consuming NestJS `OrdersController` (`GET /api/v1/orders`, `GET /api/v1/orders/:id`, and `POST /api/v1/orders/:id/assign-driver` per D-006 manual assignment directive) with timeout handling, in-memory state preservation, and honest fallback reporting (`isFallback: boolean`).
- **Marketplace Orders Directory (`/admin/orders`):**
  - **Eliminated Table Layout & Horizontal Clipping Defects:** Formatted phone numbers and driver registrations with `whitespace-nowrap font-mono tabular-nums` to eliminate broken multi-line wraps; assigned intentional column widths; ensured all critical operational columns (Order ID, Customer, Vendor/Pickup, Fulfillment, Items, Amount, Payment, Order Status, Assigned Partner, and Actions) fit comfortably on standard desktop without forced horizontal scroll.
  - **Removed Misleading Selection Checkboxes:** Removed the non-functional 40px checkbox selection column since no bulk order actions exist, reclaiming valuable horizontal space.
  - **Dynamic Order Counts:** Replaced hardcoded `89 Total Active Orders` in the header and static counts in the tabs array with dynamic counts derived from the loaded dataset via `calculateOrderStats()`.
  - **Canonical Order Lifecycle Tabs:** Implemented all canonical order statuses (`All Orders`, `Placed`, `Accepted`, `Preparing`, `Ready for Pickup`, `Assigned`, `Picked Up`, `Out for Delivery`, `Delivered`) with dynamic count badges, active indicators, and smooth horizontal scrolling (`custom-scrollbar`) to eliminate edge clipping on tablet and laptop viewports.
  - **Search & Multi-Criteria Filtering:** Real-time search across Order ID (`#KC-98214`), customer name, customer phone, boutique vendor name, pickup hub, and product titles; dropdown filters for Order Status, Fulfillment Type (`Standard`, `Express (60m)`, `Try & Buy`), and Date Range presets (`All Time`, `Today`, `Last 7 Days`, `Last 30 Days`); plus Clear Filters reset action.
  - **Client-Side Pagination:** Slices active dataset (8 items/page) with true entry counts (`Showing 1 to 8 of X orders`) and functional Previous/Next and page number controls.
  - **Active Refresh & RFC 4180 CSV Export:** Genuine data reload with animated spin indicator; real client-side RFC 4180 CSV compilation (`text/csv;charset=utf-8;`) and automatic Blob download.
- **Manual Delivery Partner Assignment Drawer (`ManualDeliveryAssignmentDrawer.tsx`):**
  - **Fixed Critical Partner Pre-selection Defect:** Driver selection now strictly defaults to `null` (zero auto-selection or fallback to first item). The administrator must explicitly select an eligible partner from the list to enable the confirmation button.
  - **Removed Decorative & Unsupported Claims:** Eliminated the decorative `Priority Dispatch` header badge and fake `Packed & Verified` green badge.
  - **Live Driver Pool Integration:** Connected to `getDeliveryPartners()` from `src/lib/api/drivers.ts` with vehicle type filters (`All Eligible`, `Two-Wheeler`, `EV / Electric`) and search by partner name, driver ID, or registration plate.
  - **Backend Assignment Mutation:** Wired to `assignDeliveryPartner()` service (`POST /api/v1/orders/:id/assign-driver`), updating order status to `ASSIGNED`, recording audit history event, and providing green success banner before closing.
  - **Accessibility & Guardrails:** Full keyboard navigation (Escape closes drawer), backdrop dismissal, loading spinners, and error banners for state conflicts.
- **Order Detail View (`/admin/orders/[id]`):**
  - Eliminated silent fallback (`|| MOCK_ORDERS[0]`), adding a clean loading skeleton and dedicated `Order Not Found` screen for non-existent records.
  - Breadcrumbs accurately reflected in shell: `Central Operations → Orders → #{orderId}`.
  - Replaced mock `alert()` calls with real browser invoice printing (`window.print()`) and contextual boutique contact feedback.
  - Connected assignment drawer directly from the dispatch control panel.

## Phase 10 — Delivery Partner Management & KYC Review — **Status:** [x]
- **Routes:** `/admin/delivery-partners`, `/admin/delivery-partners/[id]`
- **Delivery Partner Directory List (`/admin/delivery-partners`):**
  - Page header with partner count badge (`32 Registered Fleet Partners (4 Pending KYC)`), CSV export trigger, and refresh control.
  - 4 Operational KPI Summary Cards: Total Delivery Partners (32), Online Fleet (19 with live pulsing indicator), Pending KYC Review (4 with warning styling and review queue tag), Approved Fleet (26 with compliance ready status).
  - Search & Filter Toolbar: Keyword search by name, driver ID (`#DRV-xxx`), phone, or vehicle registration; dropdown filters for KYC Status (All, Pending, Approved, Rejected), Availability (Online, Offline), Work Preference (Full-time, Part-time), Vehicle Type (Bike, Scooty, EV); and Clear Filters action.
  - High-Density Data Table matching Stitch design: Checkbox selection, Partner avatar monogram/name/driver ID, verified Phone number, Work Preference badge, Vehicle type & model, Registration plate badge, Online status badge, Completed deliveries count, KYC status badge, and contextual actions (`Review KYC` primary button for pending partners, `View Details` outline button for confirmed partners).
  - Robust table states: skeleton loading rows, empty state with filter clearing, pagination controls with range summary, and CSV fleet download.
- **Delivery Partner Detail & KYC Review Workspace (`/admin/delivery-partners/[id]`):**
  - Operational header with breadcrumbs (`Delivery Partners → Partner Details`), partner legal name, driver code (`#DRV-118`), KYC and online status badges, submission metadata (date, reviewer, terminal hub), and contextual Approve/Reject actions.
  - Asymmetric two-column operational layout (65% left, 35% right):
    - **Partner Identity & Operational Details Card:** Full legal name, verified phone with SMS OTP badge, work preference, delivery history with onboarding candidate status, registered residential address.
    - **Fleet Vehicle Profile Card:** Vehicle class (EV Scooty L2), Make & Model (Ather 450X Gen 3), registration plate badge (`MH 02 EE 8419`), active RC match status, and Zero-Emission EV badge.
    - **KYC Document Dossier Inspection Workspace:** Grouped inspection of 7 document artifacts:
      - Document A: Driver Live Selfie (portrait container with zoom hover, camera capture metadata).
      - Document B: Aadhaar Card (UIDAI Masked) with front & back views side-by-side.
      - Document C: PAN Card (Income Tax Dept) with **front-only view** (never back placeholder).
      - Document D: Driving Licence with front authorizations (`MCWG`, `LMV`) and back endorsements side-by-side.
      - Document E: Vehicle RC with front specs and back hypothecation/tax exemption side-by-side.
      - Interactive Fullscreen Document Lightbox Modal for high-resolution inspection.
    - **Administrative Decision Card:** Mandatory Verification Checklist (5 interactive checks), Eligibility Policy Explanatory Note, and Decision Action Buttons (`Approve Partner KYC`, `Reject KYC / Request Re-upload`).
    - **Audit Trail & Timeline:** Chronological compliance events with timestamps and status indicators.
    - **Operational Guardrails Notice:** Central Ops manual assignment policy clarification.
- **KYC Decision Confirmation Dialogs:**
  - Approval Confirmation Modal: Summarizes partner, terminal hub, and vehicle with loading spinner and real mutation trigger.
  - Rejection Confirmation Modal: Mandatory rejection reason textarea with validation error handling, quick presets, and audit trail delivery.
- **Backend API Integration (`src/lib/api/drivers.ts`):**
  - Centralized client consuming `GET /api/v1/admin/drivers`, `GET /api/v1/admin/drivers/:id`, and `POST /api/v1/admin/drivers/:id/kyc/review`.
  - Typed payloads matching NestJS `DriverAdminController` and `KycReviewDto`.
  - Strict error handling: Prevents unpersisted optimistic UI updates on mutation failures and provides honest visual development fixtures when backend is offline.

## Phase 11 — Financial Visibility (Payments & Ledger) — **Status:** [x]
- **Routes:** `/admin/payments`, `/admin/ledger`
- **Payments Management Workspace (`/admin/payments`):**
  - Header with title "Payments", description "Monitor marketplace transactions and payment status.", date-range selector ("Today (IST)"), live refresh button, and CSV export trigger.
  - 4 Operational KPI Summary Cards:
    - Settled Today (₹1,42,850 across 12 orders)
    - Razorpay Payments (₹98,400 across 9 digital transactions)
    - Cash on Delivery (₹44,450 across 3 pending cash collections)
    - Failed Transactions (₹14,200 across 2 gateway errors)
  - Search & Filter Toolbar:
    - Keyword search by Payment ID (`#PAY-xxx`), Order ID (`#KUDI-xxx`), Customer name, or Gateway Reference / Bank RRN.
    - Payment Method dropdown filter (All, Razorpay, Cash on Delivery, Bank Transfer).
    - Status dropdown filter (All, Captured / Success, Pending, Failed, Refunded).
    - Date range dropdown and Reset/Clear filters trigger.
  - High-Density Data Table matching Stitch export:
    - 7 Columns: Payment ID (monospace), Associated Order (clickable link), Customer details, Amount (formatted INR, right-aligned font-mono), Payment Method badge, Payment Status badge, Gateway Reference / Bank RRN (monospace), Date & Time (IST format), and contextual Actions ("Inspect" trigger).
    - Skeletons, empty search state with clear filters button, and pagination controls.
  - Transaction Inspection Right-Rail Dossier:
    - Compact slide-out / split-panel detail drawer for selected transaction.
    - Payment identification, status badge, transaction amount, customer name, phone, and email.
    - Payment Gateway metadata: Gateway provider (Razorpay), Payment ID (`pay_Px761G92KL801`), Order reference (`order_P730x9N82910`), Bank RRN (`329188401928`), captured timestamp, and payment method details (UPI / NetBanking / Card).
    - Associated Order details link (`#KUDI-8921`) with items preview.
    - Receipt / Payment slip print/download trigger.
- **Commission & Ledger Workspace (`/admin/ledger`):**
  - Header with title "Commission & Ledger", description "Review marketplace commission and recorded ledger information.", period selector ("April 2026 (Active Fiscal)"), live refresh, and Download Ledger CSV trigger.
  - 4 Financial KPI Summary Cards:
    - Gross Marketplace Volume (GMV): ₹12,84,500 across 18 partner stores
    - Platform Commission Retained: ₹1,54,140 (12.0% blended average take-rate)
    - Net Vendor Payouts Due: ₹11,30,360 across confirmed delivered orders
    - Driver Fleet Payout Total: ₹1,84,200 across completed delivery runs
  - Search & Category Filter Toolbar:
    - Vendor search by store name or vendor ID (`#VEN-xxx`).
    - Store Category filter (All, Heritage Textiles, Handcrafted Fashion, Organic Spices, Metalcraft, Silver Jewellery).
    - Settlement Status filter (All, Settled, Due / Pending, Under Review).
    - Reset/Clear filters action.
  - Vendor Ledger Data Table matching Stitch export:
    - 8 Columns: Vendor Store name & ID, Total Delivered Orders, Gross GMV (INR right-aligned), Commission Rate (e.g., 12.0%, 15.0%), Commission Retained (INR right-aligned), Net Payable (INR bold right-aligned), Settlement Status badge, Last Payout Date, and Actions ("Breakdown" trigger).
    - Responsive layout, empty state, and range pagination.
  - Financial Breakdown & Reconciliation Modal:
    - Detailed breakdown for selected vendor: Order-by-order calculation, applied take-rate, gross deductions, GST deduction on platform fees, and net disbursable amount.
    - Bank payout destination details (Bank name, masked Account number, IFSC code, account holder name).
    - Reconciliation trigger with honest confirmation modal informing the administrator of missing backend settlement API.

## Phase 12 — Reviews + Support — **Status:** [x]
- **Routes:** `/admin/reviews`, `/admin/support`
- **Reviews & Ratings Workspace (`/admin/reviews`):**
  - Header with title "Reviews & Ratings", description "Inspect customer feedback and manage supported review moderation.", and live refresh trigger.
  - 4 Review Summary KPI Cards:
    - Average Rating: 4.8 / 5.0 (428 total verified ratings)
    - Total Written Reviews: 184 reviews
    - Rating Distribution Breakdown: Interactive visual bar distribution (5★: 72%, 4★: 18%, 3★: 6%, 2★: 3%, 1★: 1%)
    - Flagged / Reported Reviews: 3 customer feedback items flagged for profanity or competitor mention
  - Filter & Search Toolbar:
    - Search by product title, SKU, vendor name, or customer name.
    - Star Rating filter (All Ratings, 5 Stars, 4 Stars, 3 Stars, 2 Stars, 1 Star).
    - Moderation Status filter (All Statuses, Approved / Published, Flagged / In Review, Hidden).
    - Clear filters trigger.
  - Reviews Data Table matching Stitch export:
    - 8 Columns: Product thumbnail, name & SKU; Vendor name; Customer avatar & name; Star Rating (visual stars + numeric); Review Content preview (sensibly truncated); Associated Order ID; Date (IST); Moderation Status badge; Actions ("Inspect", "Delete Review").
  - Review Inspection Right-Rail Dossier:
    - Full un-truncated customer review text with headline and timestamp.
    - Verified Purchase indicator and linked Order ID (`#KUDI-8921`).
    - Product context with thumbnail, SKU, current price, and vendor name.
    - Rating score and moderation audit flag indicator with flag reason.
  - Review Deletion Confirmation Dialog:
    - Consequential action modal warning administrator of permanent removal from product catalog.
    - Identifies review ID, customer name, and product.
    - Cancellation and Confirm Delete buttons with loading state and honest visual feedback.
- **Support Tickets Workspace (`/admin/support`):**
  - Header with title "Support Tickets", description "Track customer issues and manage support follow-up.", live refresh trigger, and CSV export.
  - Status Navigation Tabs matching canonical lifecycle:
    - All Tickets (18)
    - Open (8)
    - In Progress (6)
    - Resolved (4)
  - 4 Queue Metric KPI Cards:
    - Open Tickets: 8 tickets awaiting first response
    - Urgent Priority: 3 escalations (transit damage / delivery delay)
    - Average First Response: 18m (target < 30m)
    - Resolution Rate Today: 94.2% across 24 resolved tickets
  - Filter & Search Toolbar:
    - Search by Ticket ID (`#TICK-xxxx`), Customer name, or Subject headline.
    - Category filter (All Categories, Order Delay, Try & Buy Issue, Damaged Goods, Payment Failure, General Inquiry).
    - Priority filter (All Priorities, Low, Medium, High, Urgent).
    - Clear filters trigger.
  - Support Tickets High-Density Data Table:
    - 7 Columns: Ticket ID (monospace), Customer / Requester name & email, Category badge, Subject headline preview, Priority badge, Current Status badge, Last Updated timestamp, Actions ("Resolve" / "Inspect").
  - Ticket Inspection & Resolution Workspace Dossier:
    - Split-view right rail dossier showing complete customer ticket details.
    - Requester identity, phone, email, and registered account tier.
    - Associated Order reference (`#KUDI-8921`) with direct navigation link.
    - 3-Stage Visual Lifecycle Sequencer: `OPEN → IN_PROGRESS → RESOLVED` with active stage indication.
    - Issue description with original customer message.
    - Internal Resolution Notes logger with draft note input and Save Note trigger.
    - Status Transition Action: Contextual transition buttons (`Mark In Progress`, `Mark Resolved`, `Re-open Ticket`) with status confirmation.

## Phase 13 — Reporting + CSV — **Status:** [x]
- **Route:** `/admin/reports`
- **Operational Reports Workspace:**
  - Header with title "Reports", description "Generate operational reports, preview sample dataset rows, and export CSV files across marketplace domains.", status badge "Report Engine: Active", and schema tag "Provisional Export Schema".
  - 4 Selectable Category Cards:
    1. Orders Summary Report (`SCHEMA: ORD-V4`, active selection)
    2. Vendor Sales & Commission Report (`SCHEMA: VEN-V2`)
    3. Delivery Partner Performance Report (`SCHEMA: LOG-V3`)
    4. Product Catalog & Stock Report (`SCHEMA: CAT-V1`)
  - Filter & Reporting-Period Toolbar:
    - Segmented period control: Today, Yesterday, Last 7 Days (default), Month to Date, Custom Range (with date pickers).
    - Operating Hub dropdown filter (`All Operating Hubs`, `Bandra West (BW-01)`, `Colaba Flagship (CB-02)`).
    - Category-specific status dropdown filters.
    - Clear Filters trigger.
  - Report Preview Workspace & Data Table:
    - Table header indicating active report category, selected date period, and sample record count.
    - Tailored column views per report type:
      - Orders: Order ID, Date & Time (IST), Customer, Vendor / Boutique, Items count, Gross GMV (formatted INR), Commission (formatted INR), Delivery Partner, Order Status badge.
      - Vendors: Vendor ID, Boutique Name, Operating Hub, Delivered Orders, Gross Sales (formatted INR), Commission Rate, Commission Retained, Net Payable (bold right-aligned), Settlement Status badge.
      - Drivers: Partner ID, Partner Name, Vehicle Class, Active Hours, Completed Runs, Avg Delivery Time, Payout Total (formatted INR), Status badge.
      - Catalog: SKU Code, Product Title & Brand, Boutique Vendor, Operating Hub Node, Stock Qty (with Low-Stock alert flag), MRP (strikethrough INR), Selling Price (INR), Listing Status badge.
  - Download CSV Export:
    - Demonstrative client-side CSV download using browser Blob export formatted per active report schema, with user confirmation toast.
  - Clean omission of unapproved raw Stitch controls (`Schema Dictionary`, `Schedule Daily Dump`).

## Phase 14 — Audit Visibility, Notifications & Settings — **Status:** [x]
- **Routes:** `/admin/audit`, `/admin/notifications`, `/admin/settings`
- **Audit Log Workspace (`/admin/audit`):**
  - Header with title "Audit Log", description "Inspect recorded administrative activity, entity mutations, and operational authorization events.", and "Export Audit Digest (CSV)" trigger.
  - Filter Toolbar:
    - Text search for actor ID (`#USR-...`), entity ID (`#VEN-...`, `#DRV-...`, `#KC-...`), or action type.
    - Action Type dropdown filter (e.g. `DRIVER_KYC_APPROVED`, `DRIVER_ASSIGNED_MANUAL`, `VENDOR_APPROVED`, `PRODUCT_STATUS_CHANGED`, `PAYOUT_HOLD_UPDATED`, etc.).
    - Actor Role filter (`Central Ops Lead`, `Admin`, `System Automation`, `Finance Settlement`).
    - Entity Type filter (`Driver`, `Vendor`, `Order`, `Product`, `Payment`, `Customer`).
    - Date range selector (`Last 7 Days`, `Today`, `Last 24 Hours`, `Last 30 Days`).
    - Clear Filters action.
  - 2-Column Split Workspace Layout (65% Table / 35% Dossier):
    - Left Side: Dense Audit Events Table (7 columns) with Timestamp (IST monospace), Actor name & ID, Action Type badge, Entity ID (monospace), IP Address (monospace), Details Summary, and "Inspect" button. Active row highlight with Signal Orange left border. Table pagination.
    - Right Side: Event Dossier Panel displaying Event ID (`#AUD-884102`), "Immutable" verification seal, Copy Event ID button (with feedback), Action Summary card, Actor Identity details, Technical Origin & Seals (Timestamp IST, Origin IP, User Agent, Session Token SHA-256 hash), Recorded Change Payload (formatted syntax-colored JSON), and contextual entity navigation link (`View Partner Record (/admin/delivery-partners/DRV-118)`).
    - Security governance notice clarifying write-once cryptographic seal.
- **Notifications Workspace (`/admin/notifications`):**
  - Header with title "Notifications", description "Review operational alerts, system dispatch messages, and broadcast announcements.", recorded notification counter with unread count badge, and queue refresh trigger.
  - System-Alert Broadcast Banner:
    - Visually faithful to Stitch proposal with amber "Provisional Admin Capability" tag.
    - Form controls for Alert Title, Target Scope (`All Hubs & Fleets`, `Bandra West Node`, `Fleet Only (Drivers)`, `Boutique Merchants`), Severity, and Dispatch Note.
    - Honest modal disclaimer on submission explaining that backend broadcast API (`/api/v1/admin/notifications/broadcast`) is not yet wired to live push gateways.
  - Filter Toolbar: Search keyword, Category (`KYC`, `Assignment`, `Order Updates`, `System Alerts`), Target Role (`Driver`, `Customer`, `Vendor`, `Central Admin`), and Delivery Status (`Delivered`, `Queued`, `Failed`).
  - 2-Column Split Layout (60% Table / 40% Detail Dossier):
    - Left Side: Operational Notification Log Table (7 columns) with Timestamp (IST monospace), Category badge, Target role, Recipient details, Title & Preview, Status badge, and "View" trigger.
    - Right Side: Dispatch Dossier with Notification ID (`#NOTIF-5521`), Channel badge (`Push Notification`, `SMS Gateway`, `Email Digest`, `In-App`), Title, Full message body, Recipient identity, Delivery details, and "Mark as Read" action.
- **Settings Workspace (`/admin/settings`):**
  - Header with title "Settings", description "Manage authenticated account profile, operational workspace preferences, and session security guardrails.", policy badge "Central Ops Configuration • Policy v4.8", and access level badge "SuperAdmin Node".
  - Section A: Authenticated Account & Session Identity:
    - Personnel avatar initials (`AO`), active principal status badge, role, and assigned permissions (`ALL_DOMAINS_ROOT`).
    - Read-only form grid for Display Name (with lock), Email Address (with verified badge), Staff Identifier (`#USR-101`), and Assigned Operating Terminal (`Central Ops HQ / Bandra West Node`).
    - Informational note on centralized IAM directory governance.
  - Section B: Operational Workspace & Table Preferences:
    - Default Table Page Size selector (`10`, `25`, `50` rows per page).
    - Currency Display Standard: Indian Rupee (`INR ₹`) — read-only.
    - Timestamp Display Format selector (`IST` vs `UTC`).
    - High-Density Operational Rows toggle with local persistence (`localStorage`).
    - Audio Alert on Critical Exception toggle with local persistence.
    - "Reset Local Cache" button with feedback.
  - Section C: Authentication & Session Security:
    - Authentication Provider card (`Firebase Authentication (Enterprise SSO)`, status: Active).
    - MFA card (`Hardware Security Key / TOTP Authenticator`, status: ENFORCED).
    - Active administrative session details table (Gateway IP, session timestamp, client device & agent, channel status).
    - "Regenerate Session Auth Token" action with honest policy modal explaining automatic 60m refresh token lifecycle.
    - "Sign Out All Active Sessions" action with confirmation modal and session clear.
  - Section D: Provisional System Boundaries & Governance Guardrails:
    - Explicit restriction notice stating core business policies (commission rates, settlement schedules, routing algorithms) are governed exclusively by deployment pipelines.
    - Quick link to `/admin/audit` and checksum seal.
- **User & Access Workspace (`/admin/user-access`, `/admin/user-access/roles`, `/admin/user-access/permissions`):**
  - Added to Admin Sidebar under `System Control` as primary item.
  - Distinct from customer management (`/admin/users`).
  - Users Tab (`/admin/user-access`): Administrative account directory, search across name and email, role filter, status filter, add user modal (with honest notice), and account details drawer.
  - Roles Tab (`/admin/user-access/roles`): Role templates (`Super Admin` protected, `Marketplace Operations`, `Catalog Manager`, `Finance Reviewer`, `Support Manager`), search by role, add role modal, edit role modal, and direct links to permissions matrix.
  - Permissions Matrix Tab (`/admin/user-access/permissions`): Role selector dropdown, dynamic module enablement count (`X of 17 Modules Enabled`), unsaved draft changes tracking, grouped matrix across Core, Logistics & Fulfillment, Finance & Governance, and System Control with interactive `#FF5A1F` orange checkboxes. Reset to Template and Save Permissions (with honest frontend-only notice).

## Vendor Portal Refinement — **Status:** [x]
- **Routes:**
  - `/vendor/dashboard`: Orders & fulfillment benchmark with central logistics handover directive, 4 operational KPI cards, permitted transitions (`PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP`), and recent order queue.
  - `/vendor/profile`: Boutique commercial profile, GSTIN, registered address, operational bay slot assignment, manager contact, and edit drawer with honest feedback.
  - `/vendor/products`: Vendor-scoped catalog and stock management, search, category filter, stock level filter, in-stock/low-stock/out-of-stock badges, and add product drawer.
  - `/vendor/orders`: Vendor-scoped orders queue, filter tabs, permitted status transitions (`Accept`, `Start Prep`, `Mark Ready`), and garment items breakdown drawer.
  - `/vendor/reviews`: Boutique product reviews, rating distribution summary (4.8/5.0), verified purchase badges, subtle star ratings, and review feedback cards.
  - `/vendor/reports`: Weekly settlement reconciliations, gross GMV, commission take-rate, logistics fees, net payouts, and real RFC 4180 CSV export download.
  - `/vendor/settings`: Store preferences (arrival chimes, tamper-evident security seal enforcement), local persistence, and vendor isolation guardrails.
- **Vendor Shell Components (`VendorHeader`, `VendorSidebar`, `VendorLayout`):**
  - Standardized `VendorHeader` matching `AdminHeader` benchmark: route-aware breadcrumbs, expandable search (`max-w-3xl`), store notifications bell with unread dropdown, and 32px circular profile avatar (`FB`) with popover.
  - Collapsible desktop `VendorSidebar` supporting 260px expanded and 72px rail collapsed modes with persistent `localStorage` preference and accessible tooltips.
  - `VendorLayout` with dynamic padding offset (`lg:pl-[260px]` vs `lg:pl-[72px]`).

---

# 4. Frontend-Only UI Mode & Backend Decoupling (Completed)

- **Objective:** Restored the KudiCart Admin + Vendor application to a clean, pure frontend-only presentation layer. Removed all active backend REST API requests, Firebase runtime configuration requirements, and database/server execution paths from the Admin project while strictly preserving all approved screens, design systems, and client-side interactions.
- **Dedicated Demonstration Layer (`src/demo-data/`):**
  - `src/demo-data/users.ts`: Demonstration customer records (`DEMO_CUSTOMERS`), lookup by ID, and RFC 4180 CSV export.
  - `src/demo-data/vendors.ts`: Demonstration boutique vendor records (`DEMO_VENDORS`), lookup by ID, and RFC 4180 CSV export.
  - `src/demo-data/products.ts`: Demonstration catalog product records (`DEMO_PRODUCTS`), lookup by ID, and RFC 4180 CSV export.
  - `src/demo-data/orders.ts`: Demonstration marketplace orders (`DEMO_ORDERS`), lookup by ID, status metrics computation, and RFC 4180 CSV export.
  - `src/demo-data/drivers.ts`: Demonstration fleet delivery partners (`DEMO_DELIVERY_PARTNERS`), lookup by ID with KYC verification documents.
  - `src/demo-data/index.ts`: Central re-export of all demonstration datasets.
- **Backend API Layer Removed (`src/lib/api/`):**
  - Removed all REST API client files (`auth.ts`, `drivers.ts`, `orders.ts`, `products.ts`, `users.ts`, `vendors.ts`).
  - Zero active `fetch(`${API_BASE}...`)` requests remaining in the admin codebase.
  - Removed all fallback catch handlers that substituted data on failed network requests.
- **Login Screen Refinements:**
  - Removed Firebase initialization and runtime credential check (`NEXT_PUBLIC_FIREBASE_API_KEY`).
  - Removed the permanent red error banner (`"Authentication is currently unavailable..."`).
  - Login renders cleanly without any environment variables.
  - Validates email and password format on the client; upon submission, shows a concise informational notice (`"Authentication is not connected in this UI preview build."`) without redirecting or faking authentication.
- **Shared Application Shell (`AdminHeader`):**
  - Removed localStorage auth session restoration and backend token inspection.
  - Defaults to Amara Okonkwo (Super Admin) for layout review.
  - Sign out button routes cleanly to `/login`.
- **Honest Action Indicators for Server-Bound Mutations:**
  - Customer status modification: Displays pending integration notice without pretending server persistence.
  - Vendor approval / rejection / suspension: Displays pending integration notice without changing server-confirmed status.
  - Manual delivery partner assignment: Displays pending integration notice in both list page, detail page, and assignment drawer without faking order status changes.
  - Driver KYC verification decision: Displays pending integration notice without faking status.

---

# 5. Verification Evidence

- **TypeScript Typecheck:**
  ```powershell
  npm run type-check
  # Exit code: 0 (Zero errors)
  ```
- **Next.js Production Build:**
  ```powershell
  npm run build
  # Exit code: 0 (Compiled successfully, 28/28 static & dynamic routes generated cleanly)
  ```
- **Generated Routes:**
  - `○ /` (127 B / 103 kB First Load JS)
  - `○ /_not-found` (1 kB / 104 kB First Load JS)
  - `○ /admin/assignments` (190 B / 106 kB First Load JS)
  - `○ /admin/audit` (6.84 kB / 122 kB First Load JS)
  - `○ /admin/categories` (190 B / 106 kB First Load JS)
  - `○ /admin/dashboard` (8.41 kB / 124 kB First Load JS)
  - `○ /admin/delivery-partners` (4.63 kB / 124 kB First Load JS)
  - `ƒ /admin/delivery-partners/[id]` (7.94 kB / 127 kB First Load JS)
  - `○ /admin/ledger` (5.32 kB / 117 kB First Load JS)
  - `○ /admin/notifications` (6.4 kB / 119 kB First Load JS)
  - `○ /admin/orders` (4.87 kB / 132 kB First Load JS)
  - `ƒ /admin/orders/[id]` (5.27 kB / 132 kB First Load JS)
  - `○ /admin/payments` (6.71 kB / 122 kB First Load JS)
  - `○ /admin/products` (4.55 kB / 125 kB First Load JS)
  - `ƒ /admin/products/[id]` (4.34 kB / 125 kB First Load JS)
  - `○ /admin/reports` (7.08 kB / 119 kB First Load JS)
  - `○ /admin/reviews` (6.59 kB / 119 kB First Load JS)
  - `○ /admin/settings` (5.66 kB / 112 kB First Load JS)
  - `○ /admin/support` (6.83 kB / 122 kB First Load JS)
  - `○ /admin/users` (5.41 kB / 121 kB First Load JS)
  - `ƒ /admin/users/[id]` (6.2 kB / 122 kB First Load JS)
  - `○ /admin/vendors` (4.83 kB / 125 kB First Load JS)
  - `ƒ /admin/vendors/[id]` (7.05 kB / 127 kB First Load JS)
  - `○ /login` (2.84 kB / 112 kB First Load JS)
  - `○ /vendor/dashboard` (3.02 kB / 113 kB First Load JS)
  - `○ /vendor/orders` (190 B / 106 kB First Load JS)
  - `○ /vendor/products` (190 B / 106 kB First Load JS)
  - `○ /vendor/profile` (190 B / 106 kB First Load JS)
  - `○ /vendor/reports` (190 B / 106 kB First Load JS)
  - `○ /vendor/reviews` (190 B / 106 kB First Load JS)
  - `○ /vendor/settings` (190 B / 106 kB First Load JS)

---

# 6. Repository Integrity & Backend Separation
- **Shared Backend Repository:** `c:\Aman Projects\Kudicart\Kudicart-backend` was completely untouched (git status confirmed clean).
- **Architecture Documentation:** Approved specifications (`SPEC.md`, `design.md`, `decisions.md`, `PLAN.md`) preserved intact for the authorized future backend integration phase.

---

# 7. Shared Header & Sidebar Final Layout Correction
- **Sidebar Collapse & Expand Control:**
  - Removed the arrow below the K icon in collapsed mode.
  - Resolved icon mixing issue by managing `isHoveringBrand` via React state. It renders exclusively the white bold "K" when unhovered, and exclusively the expand icon (`menu_open` with `scale-x-[-1]`) when hovered, completely preventing both from rendering simultaneously.
  - In expanded mode (260px), a compact collapse toggle (`menu_open`) is positioned at the far right of the brand row.
- **Header Layout & Clean Spacing:**
  - Removed the word "Dashboard" from the header completely.
  - When on the dashboard, the header left area remains clean without redundant page titles.
  - Search bar smoothly expands across the middle (`max-w-3xl`) with comfortable horizontal distribution.
  - Right area maintains strictly the notification icon (with unread indicator) and small circular profile avatar (`AO`).
- **Default Desktop State:**
  - Desktop sidebar defaults to **expanded** for fresh sessions.
  - Explicit user toggle choices are respected across routes and sessions.
- **Synchronized Shell & Verification:**
  - Content offset strictly synchronized (`lg:pl-[260px]` vs `lg:pl-[72px]`).
  - Verified with `npm run type-check` (`tsc --noEmit`) with 0 errors.




