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
**Overall Status:** IN PROGRESS (CORE MODULES IMPLEMENTED)

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
- Unified `/login` route implemented with Firebase Email/Password auth and session persistence.
- Role-based routing: Admin accounts navigate to `/admin/dashboard`, Vendor accounts navigate to `/vendor/dashboard`.
- Strict isolation: No global Switch Role control in production flow; Vendor portal maintains vendor scope.

## Phase 3 — Layout Shell — **Status:** [x]
- Admin Central Ops Shell: Fixed 260px sidebar (`AdminSidebar`), sticky 64px header (`AdminHeader`), breadcrumbs, quick search, notification badge, user profile.
- Vendor Boutique Shell: Fixed 260px sidebar (`VendorSidebar`), sticky 64px header (`VendorHeader`), store switcher, notification trigger.

## Phase 4 — Admin Dashboard — **Status:** [x]
- **Route:** `/admin/dashboard`
- **Components:** `DashboardHeader`, `ActionRequiredRibbon`, `MarketplaceMetricsGrid`, `OrderLifecyclePipeline`, `OperationalQueues`, `FinancialHealthSnapshot`, `RecentOrdersTable`.
- Full operational layout matching Stitch export:
  - Reporting Period Selector ("Today (IST)") and live refresh trigger.
  - Action Required Ribbon highlighting 9 critical operational items.
  - High-value platform volume and GOV metrics (₹4,82,450, 148 orders, 42/48 active vendors, 28 fleet, 9 queue exceptions).
  - Order Operations & Canonical Lifecycle Pipeline across 8 fulfillment milestones with live counters and attention panels.
  - Two operational queues: Vendor onboarding applications & delivery partner KYC verification.
  - Financial Health & Transaction Snapshot with escrow clearance breakdown.
  - Recent Marketplace Orders table linked directly to `/admin/orders/[id]`.

## Phase 5 — Admin User Management — **Status:** [x]
- **Routes:** `/admin/users`, `/admin/users/[id]`
- **Customer Directory List (`/admin/users`):**
  - Search by name, phone, email, or customer ID.
  - Filter by Account Status (All, Active, Suspended) and Date Range.
  - High-density table with avatar initials, customer identity, registration date, total order count, total spent, status badge, and pagination.
  - Export CSV trigger.
- **Customer Detail & Inspection (`/admin/users/[id]`):**
  - Back navigation, profile banner with customer number (`#CUS-88219`), Tier badge (Gold Patron), and status badge.
  - Consequential account action: Suspend/Reactivate Account with modal confirmation step.
  - 4 Operational summary metric cards (Total Spent, Total Orders, Average Order Value, Saved Addresses).
  - Tabbed workspace: Order History (links to order detail), Saved Addresses, Product Reviews (star ratings, verified purchase), Support Ticket History.
  - Right rail: Customer Profile & Contact details, verified KYC level, and communication channel preferences.

## Phase 6 — Admin Vendor Management — **Status:** [x]
- **Routes:** `/admin/vendors`, `/admin/vendors/[id]`
- **Vendor Directory List (`/admin/vendors`):**
  - Status tabs: All Vendors (48), Active (42), Pending Approvals (6), Suspended (2).
  - Search, Category filter, Date filter, and Clear filters controls.
  - Data table with store avatar, store name, operating hub, owner contact, category, product count, active order count, registration date, approval status badge, and actions (Review / Manage).
- **Vendor Detail & Application Review (`/admin/vendors/[id]`):**
  - Header with reviewer Amara Okonkwo, screening pass badge, Download Dossier (PDF), Reject Application, and Approve Vendor actions.
  - 4 Key operational stats: Category, Operating Hub, Initial Catalog size, Target fulfillment.
  - Business & Entity Details panel: Legal entity name, primary store contact, registered address, GSTIN, PAN, Bank account payout destination.
  - Submitted Compliance Documents panel: 5/5 files with interactive document preview modal.
  - Initial catalog submission table (42 drafted products).
  - Rejection modal requiring mandatory reason text.
  - Approval modal with confirmation of marketplace activation and hub assignment.
  - Commercial commission terms note explicitly marking rates provisional.

## Phase 7 — Category Management — **Status:** [ ]

## Phase 8 — Product/Catalog Management — **Status:** [x]
- **Routes:** `/admin/products`, `/admin/products/[id]`
- **Product & Catalog Directory (`/admin/products`):**
  - Status tabs: All Products (1,842), Active Listings (1,690), Low Stock (84), Out of Stock (68), Draft/Review (14).
  - Search by title, brand, SKU, or vendor.
  - Category, Vendor, Fulfillment Type (Dark Store vs Vendor Fulfilled), and Stock Status dropdown filters.
  - 10-column table with product thumbnail, brand, SKU, vendor name, selling price, MRP, stock quantity, stock status badge, fulfillment type badge, listing status badge, and View action.
- **Product Detail & Inspection View (`/admin/products/[id]`):**
  - Read-only inspection disclaimer clearly delineating Central Operations boundary from vendor workspace.
  - Action toolbar: View in Boutique Portal, Download SKU Dossier, Export Product JSON.
  - Product Imagery & Gallery: Master asset preview with color calibration tag + 4 interactive thumbnails.
  - Narrative description & verified technical specifications table.
  - Right rail: Commercial Structure & Pricing breakdown (Selling price, MRP, discount %, standard commission deduction, vendor net settlement), Inventory & Hub Routing distribution, and Merchant Attribution card.

## Phase 9 — Order Management — **Status:** [x]
- **Routes:** `/admin/orders`, `/admin/orders/[id]`
- Marketplace Orders queue with canonical lifecycle filter tabs, search, and dense table.
- Order Detail view with canonical lifecycle stepper, item list, try & buy breakdown, customer/hub details, and manual courier assignment drawer.

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

## Phase 15 — Sentry + Polish — **Status:** [ ]
## Phase 16 — Deployment — **Status:** [ ]

---

# 4. Verification Evidence

- **TypeScript Typecheck:**
  ```powershell
  npm run type-check
  # Exit code: 0 (Zero errors)
  ```
- **Next.js Production Build:**
  ```powershell
  npm run build
  # Exit code: 0 (Compiled successfully in 30.9s, all 28 routes generated cleanly)
  ```
- **Generated Routes:**
  - `○ /admin/dashboard` (5.75 kB / 123 kB First Load JS)
  - `○ /admin/users` (2.67 kB / 119 kB First Load JS)
  - `ƒ /admin/users/[id]` (4.39 kB / 121 kB First Load JS)
  - `○ /admin/vendors` (3.09 kB / 121 kB First Load JS)
  - `ƒ /admin/vendors/[id]` (4.76 kB / 122 kB First Load JS)
  - `○ /admin/products` (3.23 kB / 122 kB First Load JS)
  - `ƒ /admin/products/[id]` (3.07 kB / 122 kB First Load JS)
  - `○ /admin/orders` (3.99 kB / 125 kB First Load JS)
  - `ƒ /admin/orders/[id]` (5.26 kB / 127 kB First Load JS)
  - `○ /login` (3.46 kB / 106 kB First Load JS)
  - `○ /vendor/dashboard` (3.02 kB / 113 kB First Load JS)

---

# 5. Data & API Scoping State
- **Available APIs:** Verified auth endpoints and Prisma schema contracts in `Kudicart-backend`.
- **UI Fixtures:** Development fixtures (`src/mocks/users.ts`, `src/mocks/vendors.ts`, `src/mocks/products.ts`, `src/mocks/orders.ts`, `src/mocks/drivers.ts`) isolated in `src/mocks/`.
- **Honest Operational Feedback:** Account suspension, vendor approval/rejection, document preview, and search/filter work reactively in the frontend with clear user feedback without claiming server-side persistence where live backend endpoints have not been wired up.
