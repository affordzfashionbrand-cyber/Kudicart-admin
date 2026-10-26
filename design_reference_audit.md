# KudiCart Admin + Vendor Web — Customer & Driver App Reference Audit for Stitch Design

**Document ID:** `AUDIT-WEB-STITCH-001`  
**Target Repository:** `kudicart-admin-vendor-web` (`Kudicart-admin`)  
**Status:** COMPLETE / AWAITING STITCH GENERATION APPROVAL  
**Author:** AI Systems Architect & UI/UX Specialist  
**Reference Applications:** `Kudicart-customer`, `Kudicart-driver`, `Kudicart-backend`  

---

## Executive Summary

This reference audit provides an exhaustive, evidence-based investigation of the existing **KudiCart Customer Application** (`Kudicart-customer`), the **KudiCart Driver Application** (`Kudicart-driver`), and the **KudiCart Backend** (`Kudicart-backend`). Its purpose is to ground the visual design, information architecture, component hierarchy, design tokens, and user experience of the upcoming **KudiCart Admin + Vendor Web Application** in verified code and design patterns prior to generating screens in **Google Stitch**.

The Admin + Vendor Web Application is a **single Next.js application** deployed on Vercel with **two role-separated surfaces**:
1. **Admin Surface (`/admin/*`)**: Marketplace-wide operational command, delivery partner KYC & status management, manual delivery assignment, vendor approval, catalog management, customer user management, financial/ledger visibility, review moderation, and support ticket resolution.
2. **Vendor Surface (`/vendor/*`)**: Vendor-scoped catalog management, pricing, stock inventory, order tracking, and permitted fulfillment updates (`PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP`). Vendor data isolation is mandatory.

**Scope Boundary Notice:** This document strictly respects all locked architectural decisions and exclusions (D-001 through D-WEB-13). It introduces no customer shopping screens, driver execution flows, automatic dispatch engines, live chat widgets, multi-currency engines, or unapproved BI dashboards. Open decisions (O-WEB-01 through O-WEB-09) are preserved and highlighted for explicit stakeholder confirmation.

---

# SECTION 1 — PROJECT RULES AND REPOSITORY SOURCES INSPECTED

All findings within this document are grounded in direct inspection of the workspace repositories. No assumptions or external marketplace conventions have been substituted for real codebase facts.

### 1.1 Repositories and Documentation Inspected

| Repository | Inspected Path / File | Purpose & Focus of Inspection |
|---|---|---|
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/AGENTS.md` | Operating directive, role boundary rules, code gates, testing, deployment |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/project_context.md` | Single app architecture, actors, system positioning, exclusions |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/SPEC.md` | Admin (R-ADMIN-01..17) and Vendor (R-VEND-01..10) requirements |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/decisions.md` | Locked decisions (D-WEB-01..13) and open decisions (O-WEB-01..09) |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/design.md` | System design, role-based routing map, workflow state diagrams |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/PLAN.md` | 16 implementation phases and dependency gates |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/progress.md` | Execution progress and active blockers (B-WEB-01..08) |
| **Admin Web App** | `c:/Aman Projects/Kudicart/Kudicart-admin/architecture_prompt.md` | Architecture requirements, route inventory, technical boundaries |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/tailwind.config.js` | NativeWind theme tokens, brand color definitions, font stacks |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/src/constants/theme.ts` | Primary BrandColors, light/dark themes, spacing scales, typography |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/src/global.css` | Google Fonts imports, font-family overrides, input focus styles |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/src/components/common/*` | EditorialText, SectionTitle, ProductCard, EmptyState, double-bezel cards |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/src/app/orders.tsx` | Order status badge colors, customer order listing & details |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/src/app/tracking.tsx` | 8 canonical order milestones, live tracking UI, icons |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/src/services/api.ts` | Customer API contracts, models, authentication flow |
| **Customer App** | `c:/Aman Projects/Kudicart/Kudicart-customer/.agents/skills/stitch-design-taste/*` | Stitch design standards, anti-generic UI rules, typography, grid systems |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/src/theme/colors.ts` | Driver palette, semantic state colors, surfaces, inputs |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/src/theme/tokens.ts` | Typography definitions (Söhne/Inter), radii, spacing, dark mode fallback |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/driver_uiux_master_package.md` | Operational workflow reality, store-stationed model, mandatory dispatch |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/icon_system_audit.md` | Lucide icon system, stroke widths, sizing scale, semantic mapping |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/responsive_ui_audit.md` | Mobile viewport rules (320px–430px+), text wrapping, button stickiness |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/src/features/kyc/*` | DriverDetails, VehicleDetails, DocumentUploads, KYC validation rules |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/src/features/orders/*` | DashboardScreen, OrderDetailsScreen, Try & Buy workflow views |
| **Driver App** | `c:/Aman Projects/Kudicart/Kudicart-driver/src/store/useDriverStore.ts` | DriverProfile, VehicleProfile, DocumentsProfile, KYC statuses |
| **Backend** | `c:/Aman Projects/Kudicart/Kudicart-backend/prisma/schema.prisma` | Authoritative database models, enums (Role, OrderStatus, etc.) |
| **Backend** | `c:/Aman Projects/Kudicart/Kudicart-backend/prisma/seed.ts` | Seeded hubs, vendors, products, users, categories, coupons |
| **Backend** | `c:/Aman Projects/Kudicart/Kudicart-backend/src/modules/orders/*` | OrdersController, StateMachineService (canonical role permissions) |
| **Backend** | `c:/Aman Projects/Kudicart/Kudicart-backend/src/modules/driver/driver-admin.controller.ts` | Admin driver list, detail view, KYC review endpoint (`/api/v1/admin/drivers`) |
| **Backend** | `c:/Aman Projects/Kudicart/Kudicart-backend/src/modules/auth/*` | Firebase login verification, JWT token resolution, user/role binding |

### 1.2 Mandatory Requirements and Architectural Constraints

1. **Framework & Language:** Next.js with TypeScript (`D-WEB-01`).
2. **Single Web Application, Two Roles (`D-WEB-07`):** One unified web project containing `/admin/*` and `/vendor/*` routes. Not two separate projects. Not two separate Vercel deployments.
3. **Authentication:** Firebase Authentication with **Email / Password** (`D-WEB-02`). Both Admin and Vendor login through the same portal route (`/login`). The backend verifies the Firebase ID token and resolves the user's role (`ADMIN` vs `VENDOR`) and vendor scope (`vendorId`).
4. **Backend Authority:** Common NestJS backend (`kudicart-backend`) is the authoritative source for all business logic, payment verification, authorization, state transitions, and data persistence (`D-WEB-05`, `D-WEB-10`). No direct database connections.
5. **Vendor Data Isolation (`D-032`, `D-WEB-08`, `R-VEND-10`):** Mandatory. Vendor routes access vendor-scoped data only. The UI must never display cross-vendor data or provide vendor-switching selectors.
6. **Delivery Partner Assignment (`D-006`, `D-WEB-09`, `R-ADMIN-10`):** **Manual assignment only**. An Admin selects an order in `READY_FOR_PICKUP` state, reviews available delivery partners, and assigns a driver. There is **no automatic dispatch, no auto-match button, and no nearest-rider algorithm**.
7. **Hosting & CI/CD:** Hosted on Vercel (`D-WEB-04`), integrated with Jenkins CI/CD (`D-WEB-06`) and Sentry error tracking (`D-WEB-03`).
8. **Hard Exclusions (`D-WEB-11`):** No customer shopping UI, no driver delivery execution UI, no coupon management, no combo management, no delivery zone configuration, no route optimization, no BI platforms (Power BI / Tableau), no live chat, no loyalty / wallet management, and no multi-currency admin.

---

# SECTION 2 — CUSTOMER APPLICATION INSPECTION & AUDIT

Source inspected: `Kudicart-customer` (`src/constants/theme.ts`, `tailwind.config.js`, `src/global.css`, `src/components/common/*`, `src/app/*`).

### 2.1 Brand & Visual Identity
The Customer Application embodies an **editorial luxury atelier / modern boutique aesthetic**. It merges high-fashion lookbook presentation with rapid 18-minute quick-commerce fulfillment.

```
       [ KudiCart Customer Visual DNA ]
 ┌──────────────────────────────────────────────┐
 │  Editorial Luxury  +  High-Speed Delivery    │
 │  - Soft warm canvas (#F7F7F5, #F4F1EA)       │
 │  - High-contrast typography:                 │
 │      Playfair Display (Editorial Serif)      │
 │      Plus Jakarta Sans (Modern Geometric)    │
 │  - High-impact accent:                       │
 │      Signal Orange (#FF5A1F)                 │
 │  - Tactile Bezel Card Shells (Double-Border) │
 └──────────────────────────────────────────────┘
```

#### A. Verified Color Tokens
Extracted directly from `Kudicart-customer/src/constants/theme.ts` and `tailwind.config.js`:

| Token Name | Hex Code | Verified Usage in Customer App |
|---|---|---|
| `BrandColors.softWhite` / `paper` | `#F7F7F5` | Primary application canvas, background of root screens |
| `BrandColors.oyster` | `#F4F1EA` | Secondary card backgrounds, outer bezel shells, empty state icons |
| `BrandColors.concrete` / `line` | `#D9D9D5` | 1px borders on cards, input containers, divider lines |
| `BrandColors.inkBlack` / `ink` | `#111111` | Primary headings, primary buttons, pill tags, strong borders |
| `BrandColors.graphite` | `#353335` | Secondary text, dark-mode surfaces, subtle card elevations |
| `BrandColors.grey` / `muted` | `#6B6667` | Descriptive metadata, helper captions, inactive labels |
| `BrandColors.signalOrange` | `#FF5A1F` | Brand signature accent, active badges, primary CTA highlights, delivery zap indicators |
| `Colors.light.backgroundElement` | `#FFFFFF` | Inner card containers, active modal surfaces, white chips |
| `Colors.light.backgroundSelected` | `#EAEAE7` | Hover / pressed surface states |

#### B. Typography System
Loaded via Google Fonts in `src/global.css`:

1. **Editorial Serif (`Playfair Display`):**
   - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).
   - Usage: Hero headlines, lookbook titles, section headers, product title accents.
   - **Signature Pattern (`SectionTitle` / `splitEditorial`):** Two-line headline structure where Line 1 is Regular Serif (`Playfair Display` 400), Line 2 is Bold Serif (`Playfair Display` 700) ending with a mandatory period (`.`), preceded by an uppercase sans overline (`Plus Jakarta Sans` 700, 11px, `letter-spacing: 2.5px`).
2. **Modern Sans (`Plus Jakarta Sans`):**
   - Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
   - Usage: Body text, buttons, form inputs, metadata, status labels, pricing.
3. **Monospace:**
   - Fallback: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
   - Usage: Order numbers, SKUs, tracking codes.

#### C. Card & Elevation Treatments
- **Double Bezel Card Shell (`ProductCard.tsx`):** Outer bezel container with `p-[4px] bg-[#F4F1EA] border border-[#D9D9D5] rounded-[24px]` holding an inner content container `bg-white rounded-[20px] overflow-hidden`. This creates an expensive, physical, layered appearance without harsh dropshadows.
- **Button Styling:**
  - Primary pill button: `bg-[#111111] rounded-full pl-[24px] pr-[8px] py-[8px]` with an inner circular icon container `w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center`.
  - Uppercase tracked text: `font-black text-[11px] uppercase tracking-[0.15em]`.
- **Badges:** `bg-[#111111]/95 px-[8px] py-[4px] rounded-[10px] flex-row items-center gap-[4px] border border-[#FF5A1F]` with Zap or Star icon.

#### D. Semantic Colors & Status Badges
Extracted from `src/app/orders.tsx`:
- **`DELIVERED`:** Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46`, Icon `CheckCircle2` (`#059669`).
- **Active Orders (`PLACED`, `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`):**
  - Background `#FFF7ED`, Border `#FFEDD5`, Text `#C2410C`, Pulsing Dot `#FF5A1F`.

### 2.2 Interaction & Usability Patterns
- **Empty States (`empty-state.tsx`):** Centered circular icon container (`w-[80px] h-[80px] rounded-full bg-[#F4F1EA] border border-[#D9D9D5]`), followed by a two-line editorial title, muted description (`#6B6667`), and a black pill CTA button.
- **Micro-interactions:** Custom cubic-bezier spring curves (`Easing.bezier(0.32, 0.72, 0, 1)`) with scale-down feedback (`scaleTo = 0.97`) on tap.
- **Modals:** Slide-up bottom sheets with dark backdrop overlays and drag handles.

### 2.3 Adaptation for Admin + Vendor Web Application

| Customer Pattern | Web Administrative Adaptation | Rationale |
|---|---|---|
| **Editorial Serif Headlines** | Use selectively for high-level page headers and brand marks; avoid in data tables. | Editorial serif adds luxury prestige but impedes rapid scannability in high-density data tables. |
| **Soft Canvas (`#F7F7F5`) & Oyster (`#F4F1EA`)** | Carry forward directly as primary web canvas and table toolbar backgrounds. | Maintains brand cohesion while reducing eye strain during prolonged operational shifts. |
| **Signal Orange (`#FF5A1F`)** | Retain as primary brand accent for active states, notifications, and key action triggers. | Strongest brand identifier across all KudiCart surfaces. |
| **Double Bezel Card Shell** | Adapt for high-level dashboard metric cards and summary panels. | Provides structured, tactile card presentation without heavy drop shadows. |
| **Status Badge Styling** | Carry forward 1:1 into table chips and status pills. | Familiar color coding (`#ECFDF5`/`#065F46` for success, `#FFF7ED`/`#C2410C` for pending). |
| **Mobile Bottom Tabs** | **Do NOT adapt.** Replace with a fixed, collapsible Desktop Left Sidebar. | Enterprise web operations require rapid multi-level hierarchy navigation. |
| **Shopping Cart / Lookbook Feeds** | **Do NOT adapt.** Excluded from Admin/Vendor scope. | Admin/Vendor interface is an operational management cockpit, not an e-commerce storefront. |

---

# SECTION 3 — DRIVER APPLICATION INSPECTION & AUDIT

Source inspected: `Kudicart-driver` (`src/theme/*`, `driver_uiux_master_package.md`, `icon_system_audit.md`, `src/features/kyc/*`, `src/features/orders/*`, `src/store/useDriverStore.ts`).

### 3.1 Visual System & Theme Architecture
The Driver Application is a **focused, high-contrast, store-stationed operational delivery tool**. It prioritizes immediate glanceability, strict state clarity, and unambiguous operational steps under outdoor daylight and nocturnal conditions.

```
         [ KudiCart Driver Operational System ]
 ┌─────────────────────────────────────────────────────┐
 │  Stationed at Store  →  Admin Manual Assignment     │
 │  - High-contrast canvas (#F3F1EC / #F7F7F5)         │
 │  - Signal Orange primary (#FF5A1F)                  │
 │  - Functional status colors (Success #20885A)       │
 │  - Strict Lucide Outline Iconography (2px stroke)   │
 │  - Unambiguous status indicators (Text+Icon+Color)  │
 └─────────────────────────────────────────────────────┘
```

#### A. Verified Color Tokens
Extracted from `Kudicart-driver/src/theme/colors.ts` and `src/theme/tokens.ts`:

| Token Name | Hex Code | Verified Usage in Driver App |
|---|---|---|
| `colors.primary` | `#FF5A1F` | Primary actions, active navigation icons, focused borders |
| `colors.primaryDark` | `#D94B17` | Pressed state for buttons, active accents |
| `colors.primaryLight` | `#FFF0E8` | Highlighted row backgrounds, active notification badges |
| `colors.secondary` | `#393939` | Secondary controls, header subtitles |
| `colors.success` / `tokens.online` | `#20885A` (`#16805A`) | Online toggle, completed deliveries, approved KYC status |
| `tokens.successSoft` | `#E8F4ED` | Approved status background pills |
| `colors.danger` / `tokens.error` | `#DA1E28` (`#C7433D`) | Rejection notices, offline warnings, destructive actions |
| `colors.warning` | `#F1C21B` (`#C9822E`) | KYC review pending, incomplete document badges |
| `colors.info` | `#0043CE` | Informational announcements, shift status updates |
| `colors.background` / `tokens.canvas` | `#F3F1EC` / `#F7F7F5` | Main screen background |
| `colors.surface` | `#FFFFFF` | Card surfaces, form inputs, modal dialogs |
| `colors.text` / `tokens.ink` | `#171716` / `#111111` | Primary text content |
| `colors.textSecondary` / `tokens.muted` | `#65635F` / `#6B6B67` | Metadata, document subtitle hints |
| `colors.border` / `tokens.border` | `#E2DED7` / `#E4E0DB` | Container borders, table dividers |

#### B. Iconography System (`KudiIcon`)
Extracted from `Kudicart-driver/icon_system_audit.md`:
- **Icon Set:** Lucide Icons (`lucide-react` / `lucide-react-native`).
- **Stroke Width:** Strict `2px` stroke with rounded line caps and joints. Outlines only; filled variants are prohibited.
- **Sizes:** 14px/16px (inline metadata, status dots), 20px (action items, table actions), 24px (header navigation, sidebar icons), 32px+ (restricted to empty states).
- **Rule:** Never use unicode emojis (`📋`, `✓`) or decorative colored boxes behind icons.

#### C. Radii Scale
Extracted from `Kudicart-driver/src/theme/tokens.ts`:
- `radii.largeCard`: 16px (outer dashboard containers)
- `radii.card`: 12px (inner content cards, detail sections)
- `radii.button`: 10px (form buttons, table action triggers)
- `radii.pill`: 999px (status chips, badges)

### 3.2 Operational Terminology & Domain Concepts (Admin-Relevant)

The Driver codebase and backend contracts reveal the precise domain terminology used by KudiCart operations:

```
[ Driver KYC Lifecycle ]
SUBMITTED ───────────────► PENDING_REVIEW ───────────────► APPROVED (Can Go Online)
                                 │
                                 └──────────────────────► REJECTED (Needs Attention)
```

1. **Driver Profiles & Availability:**
   - `isOnline`: Boolean indicating whether the driver is on-shift and available.
   - **Crucial Business Rule:** A driver **cannot go online** unless their KYC status is `APPROVED` (`driver-admin.controller.ts:66`, `DashboardScreen.tsx:99`).
   - `workPreference`: `FULL_TIME` (8 hrs/day, 6 days/wk, 119 weekly orders target) vs `PART_TIME` (5 hrs/day, 6 days/wk, 75 weekly orders target).
   - `tier`: Silver Tier, Gold Tier, Platinum Tier.
   - `completedDeliveries`: Integer count of successful handovers.
2. **Driver KYC & Document Hierarchy:**
   - **Personal Details:** Full Name, Phone, Aadhaar Number (12 digits, formatted `XXXX XXXX XXXX`), PAN Number (10 chars, formatted `AAAAA9999A`), Date of Birth (`DD/MM/YYYY`), Driving Licence (`SS-RRXXXXXXXXXXXX`).
   - **Vehicle Details:** Vehicle Type (`Bike`, `Scooty`, `EV Bike`, `EV Scooty`), Registration Number (standard Indian state format `MH 01 AB 1234` or BH series `22 BH 1234 AA`), Make, Model, RC Status.
   - **Required Documents & Sides:**
     - `aadhaar`: Front & Back
     - `pan`: Front Side only
     - `drivingLicence`: Front & Back
     - `vehicleRc`: Front & Back
     - `selfie`: Single front-facing portrait
   - **Document Review States:** `PENDING`, `VERIFIED`, `REJECTED`, `Needs attention` (blurry/cropped, registration mismatch).
3. **Delivery Operational Model:**
   - Stationed at dark store / vendor hub.
   - Manual admin assignment is mandatory (`driver_uiux_master_package.md:146`). The driver does not browse or claim orders from a radar feed.
   - Order handoff sequence: `READY_FOR_PICKUP → ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED`.

### 3.3 Backend Administrative Driver Endpoints Already Implemented
Verified from `Kudicart-backend/src/modules/driver/driver-admin.controller.ts`:
- `GET /api/v1/admin/drivers`: Lists drivers with `id`, `fullName`, `phone`, `kycStatus`, `isOnline`, `completedDeliveries`, `vehicle`.
- `GET /api/v1/admin/drivers/:id`: Returns full driver profile including documents, vehicle, and KYC status.
- `POST /api/v1/admin/drivers/:id/kyc/review`: Submits administrative approval/rejection (`KycReviewDto { status: 'APPROVED' | 'REJECTED', rejectionReason?: string }`). Dispatches FCM notification to the driver.

---

# SECTION 4 — COMPARATIVE ANALYSIS: CUSTOMER VS DRIVER APP

| Feature / Area | Customer Application (`Kudicart-customer`) | Driver Application (`Kudicart-driver`) | Unified Web Application Recommendation |
|---|---|---|---|
| **Brand Identity** | Editorial luxury, high-fashion boutique feel. Warm oyster/canvas palette with Playfair Display serif. | Utilitarian, fast, high-contrast operational tool. Clean sans-serif and Lucide outlines. | **Professional Modern Operations:** Inherits KudiCart's signature Signal Orange (`#FF5A1F`), Soft Canvas (`#F7F7F5`), and Ink Black (`#111111`). Keeps typography clean with `Plus Jakarta Sans` for UI, reserving `Playfair Display` strictly for top-level brand identity. |
| **Canvas & Surfaces** | `#F7F7F5` (Soft White), `#F4F1EA` (Oyster), `#FFFFFF` (Surface). | `#F3F1EC` (Background), `#FFFFFF` (Surface). | Standardize on `#F7F7F5` as root background, `#FFFFFF` for data cards/tables, and `#F4F1EA` for secondary panels/toolbars. |
| **Typography** | `Playfair Display` (Serif, 400/600/700) + `Plus Jakarta Sans` (Sans, 400/600/700). | `Sohne` / `Inter` (Hero 32, Title 16, Body 13, Caption 12). | **Primary UI:** `Plus Jakarta Sans` across all tables, forms, and buttons. **Numbers/Codes:** `JetBrains Mono` or `Geist Mono`. **Headings:** Restrained `Plus Jakarta Sans` 700 with optional subtle serif brand accents. |
| **Accent Colors** | Signal Orange `#FF5A1F`, Deep Ink `#111111`. | Signal Orange `#FF5A1F`, Success Green `#20885A`, Danger Red `#DA1E28`, Warning Amber `#F1C21B`. | Signal Orange `#FF5A1F` as brand signature; Success `#20885A`, Danger `#DA1E28`, Warning `#C9822E`, Info `#0043CE` for operational states. |
| **Card Styling** | Double bezel: outer `#F4F1EA` border with `#D9D9D5`, inner white `rounded-[20px]`. | Flat cards with subtle `1px` border (`#E4E0DB`) and `12px/16px` border radius. | **Admin & Vendor Web:** Flat white containers with `1px` border (`#E4E0DB`), `12px` border radius, and diffused whisper shadow (`0 1px 3px rgba(0,0,0,0.04)`). Double bezel reserved for top-level dashboard KPI cards. |
| **Navigation** | Bottom navigation tabs + stack modals. | Bottom navigation tabs (Home, Earnings, Shifts, Profile) + stack screens. | **Desktop Web Shell:** Persistent Left Sidebar (collapsible on tablet), sticky top header with breadcrumbs, role badge, quick search, and user profile drawer. |
| **Form Inputs** | Minimalist underlined/boxed inputs, uppercase tracked labels (11px). | Floating/bordered inputs with explicit error helper text below. | Explicit top-aligned labels (`12px`, `#6B6667`, 600 weight), `40px` input height, `8px` radius, `#E4E0DB` border, `#FF5A1F` focus ring (2px offset). |
| **Data Presentation** | Visual cards, lookbook grid, horizontal carousels. | Status cards, simple lists, linear progress bars. | **Desktop Data Tables:** Dense sortable data tables with fixed headers, server-side pagination, status pill chips, and sticky action columns. |
| **Iconography** | Lucide React Native + Material Symbols Outlined. | Lucide Icons strictly outlined (`2px` stroke, `KudiIcon`). | Standardize on **Lucide React** (`2px` stroke, purely outlined, 16px/20px sizes). No filled icon boxes or unicode emojis. |
| **Inconsistencies Identified** | Legacy prototype references to "Affordz" exist in mock seeds and comments. | Older docs mentioned "Accept Order" and "Radar Animation" which were purged in the master package. | **Web Decision:** All customer, driver, admin, and vendor surfaces are branded strictly as **KudiCart**. Purge any residual "Affordz" references from web copy. Use the store-stationed mandatory assignment model. |

---

# SECTION 5 — ADMIN & VENDOR WEB SCREEN INVENTORY

Every screen listed below is in scope per `SPEC.md`, `AGENTS.md`, and `architecture_prompt.md`. Excluded features have been omitted.

```
                    [ KudiCart Unified Web Application ]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
     [ ADMIN SURFACE (/admin/*) ]            [ VENDOR SURFACE (/vendor/*) ]
     - Marketplace Overview Dashboard        - Vendor Operations Dashboard
     - Customer User Management              - Vendor Profile Management
     - Vendor Management & Approval          - Vendor Catalog Management
     - Delivery Partner KYC Review           - Product Create & Edit
     - Manual Driver Assignment              - Pricing & Stock Control
     - Category & Product Management         - Vendor Order Processing
     - Marketplace Orders Control            - Permitted Status Transitions
     - Payments & Financial Ledger           - Product Reviews Feedback
     - Review Moderation                     - Vendor Sales Reports & CSV
     - Support Ticket Resolution             - Store Settings
     - Audit Log Inspection
     - Notification Administration
```

---

## 5.1 Admin Surface (`/admin/*`)

### Screen 01: Admin Dashboard (`/admin/dashboard`)
- **Primary Goal:** Provide executive oversight of marketplace operations, order throughput, fulfillment health, active fleet capacity, and urgent exceptions.
- **Main Sections:**
  1. Top KPI Summary Banner (Total Orders Today, Gross Merchandise Value, Active Deliveries, Pending Vendor Approvals, Active Delivery Partners Online, Open Support Tickets).
  2. Urgent Operational Exceptions Strip (Orders awaiting driver assignment > 10m, pending KYC submissions, high-priority support tickets).
  3. Live Fulfillment Pipeline Bar (Orders segmented by stage: Placed → Accepted → Preparing → Ready for Pickup → Assigned → Picked Up → Out for Delivery → Delivered).
  4. Recent Orders Table (last 10 orders with instant status pill and direct assignment button).
  5. Dark Store Hub Capacity & Delivery Partner Distribution widget.
- **Primary Actions:** "Assign Rider" (triggers assignment modal for ready orders), "Review KYC" (deep links to pending partner).
- **States:** Populated, Loading (skeleton cards), Error (retry prompt), Empty (quiet day state).

### Screen 02: User Management (`/admin/users`)
- **Primary Goal:** Search, view, and inspect registered customer users and application accounts.
- **Main Sections:**
  1. Search & Filter Bar (Name, phone, email, registration date range, role filter).
  2. Customers Data Table (Columns: User ID, Name, Avatar, Phone, Email, Orders Count, Total Spent, Registration Date, Status, Actions).
  3. Slide-out Drawer / Detail View (`/admin/users/[id]`): Customer profile details, saved addresses, order history table, submitted reviews, support tickets.
- **Actions:** View Details, Toggle Account Status (Active/Suspended), Export Users CSV.

### Screen 03: Vendor Management & Approval (`/admin/vendors`)
- **Primary Goal:** Oversee onboarded boutiques/vendors and review pending vendor applications.
- **Main Sections:**
  1. Status Tab Bar: "Active Vendors" | "Pending Approvals" (with count badge) | "Suspended".
  2. Vendors Table (Columns: Store Name, Vendor Owner, Contact Email, Phone, Catalog Products Count, Active Orders, Revenue Share/Commission, Approval Status, Created Date, Actions).
  3. Vendor Detail & Approval View (`/admin/vendors/[id]`): Store profile, owner identity, business documents, assigned products, commission rate, and audit history.
- **Primary Actions:** "Approve Vendor" (modal confirmation with commission setting), "Reject Vendor" (with mandatory reason field), "Suspend Vendor".

### Screen 04: Delivery Partner Management & KYC Review (`/admin/delivery-partners`)
- **Primary Goal:** Manage delivery partner fleet, monitor online availability, and perform KYC document approvals.
- **Main Sections:**
  1. Overview Metrics Strip: Total Drivers, Currently Online, In-Transit, KYC Pending Review, KYC Approved.
  2. Filter Toolbar: KYC Status filter (`ALL`, `PENDING`, `APPROVED`, `REJECTED`), Online Status (`Online`, `Offline`), Work Preference (`FULL_TIME`, `PART_TIME`).
  3. Delivery Partners Table (Columns: Driver ID, Name, Phone, Work Preference, Vehicle Type, Reg Number, Online Status, Completed Deliveries, KYC Status, Actions).
  4. KYC Document Review Page/Drawer (`/admin/delivery-partners/[id]`):
     - Driver profile & vehicle summary (Make, Model, RC Number, RC Status).
     - Document Inspection Gallery: Side-by-side viewer for Aadhaar (Front/Back), PAN (Front), Driving Licence (Front/Back), Vehicle RC (Front/Back), and Selfie.
     - Document Verification Flags: Individual toggle per document (Verified / Needs Attention).
     - Review Decision Box: "Approve Driver KYC" (sets driver to `APPROVED`, enables online toggle) vs "Reject / Request Re-upload" (rejection reason input, sends FCM alert).
- **Backend Endpoints Consumed:** `GET /api/v1/admin/drivers`, `GET /api/v1/admin/drivers/:id`, `POST /api/v1/admin/drivers/:id/kyc/review`.

### Screen 05: Category Management (`/admin/categories`)
- **Primary Goal:** Create, update, reorder, and maintain marketplace categories.
- **Main Sections:**
  1. Categories Table (Columns: Category ID, Name, Count Text / Subtitle, Icon identifier, Product Count, Created At, Actions).
  2. Create/Edit Category Modal: Name input, Count Text input, Icon picker (Lucide icon selector), Display order.
- **Actions:** "Create Category", "Edit", "Delete" (safeguarded against categories with active products).

### Screen 06: Product & Catalog Management (`/admin/products`)
- **Primary Goal:** Marketplace-wide view of all catalog items across all vendors and dark store hubs.
- **Main Sections:**
  1. Filter Bar: Category dropdown, Vendor dropdown, Fulfillment Type (`DARK_STORE`, `VENDOR`), Stock Status (`In Stock`, `Low Stock`, `Out of Stock`).
  2. Products Table (Columns: Image thumbnail, Product Title, Brand, Vendor Store, Category, Price, Original Price, Stock Qty, Fulfillment Type, Status, Actions).
  3. Product Detail Modal/View (`/admin/products/[id]`): Read-only administrative view of gallery images, description, sizes, fabric, origin, try-and-buy eligibility, and assigned Dark Store Hub.
- **Actions:** View Product, Search, Filter, Export Products CSV.

### Screen 07: Marketplace Order Management (`/admin/orders`)
- **Primary Goal:** Complete operational control and visibility over every order in the marketplace lifecycle.
- **Main Sections:**
  1. Status Pipeline Tabs: `ALL` | `PLACED` | `ACCEPTED` | `PREPARING` | `READY_FOR_PICKUP` (urgent) | `ASSIGNED` | `PICKED_UP` | `OUT_FOR_DELIVERY` | `DELIVERED`.
  2. Orders Table (Columns: Order #, Customer Name, Vendor Store, Fulfillment Type, Total Items, Grand Total, Payment Status, Order Status Pill, Elapsed Time, Assigned Driver, Actions).
  3. Order Detail Page (`/admin/orders/[id]`):
     - Header: Order #, Timestamp, Status badge, Quick Assignment trigger.
     - 8-Milestone Visual Timeline with completion timestamps and performer roles.
     - Customer & Delivery Address Card.
     - Vendor / Dark Store Hub Pickup Card.
     - Ordered Items Table (Title, Brand, Size, Trial Size, Price, Qty, Item Image).
     - Payment Summary Card (Item Total, Delivery Fee, Taxes, Coupon Discount, Grand Total, Method, Transaction ID).
     - Delivery Partner Card (Assigned driver details, phone, vehicle, or "Unassigned" warning badge).
     - Try & Buy Session Tracker (if applicable: Stage, Trial duration, Return manifest, Reconciled status).
- **Actions:** "Assign Delivery Partner" (on `READY_FOR_PICKUP`), View Status History, Print Manifest, Export Orders CSV.

### Screen 08: Manual Delivery Partner Assignment Modal / Drawer (`/admin/assignments`)
- **Primary Goal:** Execute manual delivery partner assignment for orders in `READY_FOR_PICKUP` status (`D-006`).
- **Layout & Structure:**
  - Order Summary Banner: Order Number, Store Pickup Address, Customer Dropoff Locality, Item Count.
  - Available Delivery Partners List:
    - Filterable by: Online only (default), Vehicle Type (Bike/Scooty), Work Preference.
    - Partner Card / Table Row: Driver Photo, Full Name, Phone, Vehicle Reg, Completed Deliveries Count, Distance/Proximity (if coordinates available), Current Status (`Online - Idle`).
    - Radio selection button for chosen driver.
  - Assignment Confirmation Footer: Driver selection summary, "Confirm & Dispatch Assignment" button.
- **Backend Endpoint Consumed:** `POST /api/v1/orders/:id/assign-driver` with body `{ driverId: string }`.

### Screen 09: Payment Visibility (`/admin/payments`)
- **Primary Goal:** Financial audit and monitoring of all incoming transactions via Razorpay and COD.
- **Main Sections:**
  1. Transaction Metrics: Total Settled Today, Razorpay Online Total, Cash on Delivery Total, Failed Transactions Count.
  2. Payments Data Table (Columns: Payment ID / Razorpay Order ID, Order #, Customer, Amount, Payment Method [`RAZORPAY`, `COD`], Payment Status [`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`], Date/Time, Actions).
  3. Payment Detail Drawer: Razorpay payment signature, verification timestamp, webhook log, associated order details.

### Screen 10: Commission & Ledger Visibility (`/admin/ledger`)
- **Primary Goal:** Monitor vendor sales commissions, dark store fulfillment earnings, and platform ledger balances.
- **Main Sections:**
  1. Summary Cards: Gross Marketplace Volume, Platform Commission Earned, Net Vendor Payouts Due, Driver Payout Total.
  2. Vendor Ledger Table (Columns: Vendor Name, Total Orders, GMV, Commission %, Commission Deducted, Net Payable, Last Payout Date, Actions).
  3. Ledger Export Button: Download Ledger CSV.

### Screen 11: Reviews & Ratings Management (`/admin/reviews`)
- **Primary Goal:** Moderate customer reviews, inspect product feedback, and handle reported ratings.
- **Main Sections:**
  1. Rating Metrics: Average Marketplace Rating, Total Reviews, 5-Star Breakdown, Flagged Reviews Count.
  2. Reviews Table (Columns: Product Image & Title, Vendor, Customer Name, Star Rating [1-5 Stars], Comment Text, Order #, Date, Actions).
  3. Action: Delete Review (with confirmation modal for inappropriate content).

### Screen 12: Support Ticket Management (`/admin/support`)
- **Primary Goal:** Track, triage, and resolve customer support tickets.
- **Main Sections:**
  1. Status Filter: `ALL` | `OPEN` (urgent) | `IN_PROGRESS` | `RESOLVED`.
  2. Tickets Table (Columns: Ticket ID, Customer Name, Category, Title, Associated Order #, Status Pill, Created Date, Actions).
  3. Ticket Detail & Resolution View (`/admin/support/[id]`):
     - Ticket metadata, customer inquiry description, linked order details.
     - Internal Notes / Resolution thread.
     - Status Update Selector: `OPEN` → `IN_PROGRESS` → `RESOLVED`.

### Screen 13: Notification Administration (`/admin/notifications`)
- **Primary Goal:** View dispatched administrative notifications and audit FCM system alerts.
- **Main Sections:**
  1. Sent Notifications Table (Columns: Timestamp, Category [`SYSTEM`, `ORDER`, `ASSIGNMENT`, `KYC`], Target Role, Recipient Name/ID, Title, Message Body, Delivery Status).
  2. System Alert Broadcast Banner.

### Screen 14: Basic Reporting & CSV Export (`/admin/reports`)
- **Primary Goal:** Generate standard operational summaries and download structured CSV reports (`D-WEB-12`).
- **Main Sections:**
  1. Report Type Selector:
     - Orders Summary Report
     - Vendor Sales & Commission Report
     - Delivery Partner Performance Report
     - Product Catalog & Stock Report
  2. Date Range Picker (Today, Yesterday, Last 7 Days, Month to Date, Custom Range).
  3. Data Preview Table (first 10 records matching query).
  4. "Download CSV" Action Button.

### Screen 15: Audit Log Visibility (`/admin/audit`)
- **Primary Goal:** Compliance and security visibility into administrative write actions (`R-ADMIN-17`, `R-AUDIT-01..03`).
- **Main Sections:**
  1. Audit Event Table (Columns: Timestamp, Actor ID, Actor Role, Action Type [e.g., `KYC_APPROVED`, `DRIVER_ASSIGNED`, `VENDOR_APPROVED`, `PRODUCT_DELETED`], Entity ID, IP / User Agent, Details).
  2. Filter by Actor and Action Type.

---

## 5.2 Vendor Surface (`/vendor/*`)

**Core Constraint:** Every Vendor screen must be scoped exclusively to the authenticated vendor's account (`vendorId`). No cross-vendor visibility. No vendor-switching dropdowns.

### Screen 16: Vendor Dashboard (`/vendor/dashboard`)
- **Primary Goal:** Provide the vendor boutique owner with a focused operational overview of their own catalog, incoming orders, and daily fulfillment performance.
- **Main Sections:**
  1. Vendor Header: Boutique Name (e.g., "Avanya Haute Atelier"), Store ID, Operating Status badge.
  2. Key Metric Cards: Today's Orders, Orders Awaiting Acceptance, Orders In Preparation, Out of Stock Products, Today's Gross Sales.
  3. Active Orders Action Queue (orders in `PLACED` or `ACCEPTED` requiring immediate kitchen/boutique action).
  4. Quick Navigation Cards: "Manage Products", "Add New Product", "Order History", "Store Profile".
- **States:** Populated, Loading, Empty (welcoming first-time vendor setup guide).

### Screen 17: Vendor Profile Management (`/vendor/profile`)
- **Primary Goal:** Maintain store details, contact information, and business hours.
- **Main Sections:**
  1. Store Profile Form: Store Name, Store Description, Contact Phone, Support Email, Physical Store/Boutique Address, City, Pincode.
  2. Store Operating Hours: Opening time, closing time, daily active toggle.
  3. Action: "Save Changes" (triggers backend update).

### Screen 18: Vendor Catalog & Products (`/vendor/products`)
- **Primary Goal:** View, filter, and manage products belonging exclusively to the authenticated vendor.
- **Main Sections:**
  1. Header with "Add New Product" CTA button.
  2. Filter Toolbar: Search by title/brand, Category dropdown, Stock status filter (`All`, `In Stock`, `Low Stock`, `Out of Stock`), Fulfillment type (`VENDOR`, `DARK_STORE`).
  3. Products Data Table (Columns: Thumbnail, Title, Brand, Category, Price [₹], Original Price [₹], Stock Quantity, Try & Buy Eligible [Yes/No], Status, Actions).
  4. Inline Quick Edit: Stock quantity and price editable directly or via modal.
- **Actions:** Add Product, Edit Product, Delete / Archive Product.

### Screen 19: Vendor Product Creation & Editing (`/vendor/products/new` & `/vendor/products/[id]`)
- **Primary Goal:** Create new product listings and edit existing inventory specifications.
- **Main Sections:**
  1. Basic Information Card: Title, Brand, Category selector, Description, Origin, Fabric/Materials.
  2. Pricing & Discount Card: Selling Price (₹), Original / MRP (₹), Computed Discount tag (`auto-calculated`).
  3. Stock & Inventory Card: Available Stock Quantity, Stock Badge label (`LOW STOCK`, `IN STOCK`), Ready to Ship toggle.
  4. Variants & Sizing Card: Size selector chips (`XS`, `S`, `M`, `L`, `XL`, `28`, `30`, `32`, `34`), Color specifications.
  5. Product Media Upload Card: Primary cover image upload, gallery image uploaders (delegated to Cloudinary via backend API), image alt text input.
  6. Fulfillment & Services Card: Fulfillment Type (`VENDOR` store direct vs `DARK_STORE` hub consignment), Try & Buy Eligible checkbox.
- **Primary Action:** "Save Product" / "Publish Listing".

### Screen 20: Vendor Order Management (`/vendor/orders`)
- **Primary Goal:** Track and fulfill customer orders containing items from this vendor's boutique.
- **Main Sections:**
  1. Fulfillment Workflow Tabs:
     - `INCOMING` (`PLACED`): Requires boutique acceptance.
     - `IN PREPARATION` (`ACCEPTED`, `PREPARING`): Boutique packaging & quality check.
     - `READY FOR PICKUP` (`READY_FOR_PICKUP`): Packed at counter waiting for driver.
     - `IN TRANSIT` (`ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`): Read-only tracking.
     - `COMPLETED` (`DELIVERED`): Historical orders.
  2. Vendor Orders Table (Columns: Order #, Order Date/Time, Items Ordered, Subtotal [₹], Fulfillment Type, Order Status Pill, Action Button).
  3. Action Buttons per Row:
     - On `PLACED`: "Accept Order" (`POST :id/vendor-accept`)
     - On `ACCEPTED`: "Start Preparing" (`POST :id/vendor-prepare`)
     - On `PREPARING`: "Mark Ready for Pickup" (`POST :id/vendor-ready`)

### Screen 21: Vendor Order Detail View (`/vendor/orders/[id]`)
- **Primary Goal:** Detailed packaging slip and fulfillment interface for a specific order.
- **Main Sections:**
  1. Order Header: Order #, Time elapsed since placement, Current status pill.
  2. Status Progression Action Bar: Large, unmistakable action button showing the next valid transition:
     - `PLACED` → **[ Accept Order ]**
     - `ACCEPTED` → **[ Begin Packaging ]**
     - `PREPARING` → **[ Mark Ready for Driver Pickup ]**
     - `READY_FOR_PICKUP` → *"Waiting for delivery partner assignment by KudiCart Admin"* (no further vendor action permitted).
  3. Ordered Items List: High-resolution item thumbnail, Title, Brand, Ordered Size, Quantity, Unit Price, Total.
  4. Delivery Note & Packaging Specifications (e.g., gift wrapping, try-and-buy garment care).

### Screen 22: Vendor Customer Reviews (`/vendor/reviews`)
- **Primary Goal:** Monitor customer feedback on products sold by this vendor.
- **Main Sections:**
  1. Review Stats: Average store rating, total reviews count.
  2. Reviews Table (Columns: Product Image & Name, Customer Name, Rating, Review Comment, Date).

### Screen 23: Vendor Reporting & Sales CSV (`/vendor/reports`)
- **Primary Goal:** Inspect vendor-scoped financial earnings and download sales CSVs.
- **Main Sections:**
  1. Sales Summary: Total Units Sold, Gross Product Revenue, Commission Deducted, Net Vendor Earnings.
  2. Date Filter: Week, Month, Custom.
  3. "Download Vendor Sales CSV" Button.

### Screen 24: Vendor Store Settings (`/vendor/settings`)
- **Primary Goal:** Configure boutique notifications and operational preferences.
- **Main Sections:**
  1. Notification Preferences: SMS alert on new order, email summary frequency.
  2. Store Status: Open for orders / Temporary holiday mode.

---

## 5.3 Shared Authentication & Shell

### Screen 25: Unified Authentication Screen (`/login`)
- **Primary Goal:** Secure Firebase Email/Password authentication for Admins and Vendors (`D-WEB-02`).
- **Main Sections:**
  - Split-screen layout:
    - Left Panel: Editorial luxury brand showcase with KudiCart logo, warm paper background, atelier photography, and tagline: *"KudiCart Marketplace Operations & Boutique Portal"*.
    - Right Panel: Minimalist high-contrast login card.
      - Email Address input (`Plus Jakarta Sans`).
      - Password input with visibility toggle.
      - "Sign In to Console" primary button (Signal Orange `#FF5A1F`).
      - Security note: *"Access restricted to authorized personnel. Role-based routing enforced upon sign-in."*
- **Auth Flow:** Authenticates with Firebase → Obtains ID Token → Sends to `POST /api/v1/auth/firebase/login` → Backend resolves Role (`ADMIN` vs `VENDOR`) → Next.js router redirects to `/admin/dashboard` or `/vendor/dashboard`.

---

# SECTION 6 — VISUAL DESIGN RECOMMENDATIONS & DESIGN SYSTEM

## 6.1 Shared KudiCart Web Identity (Desktop-First)
The Admin + Vendor Web Application must look like an **authentic member of the KudiCart family** while delivering the high information density, rapid scannability, and operational efficiency required by desktop power users.

```
                  [ KudiCart Web Design Hierarchy ]
 ┌─────────────────────────────────────────────────────────────────┐
 │  Primary Canvas: Warm Neutral Paper (#F7F7F5)                   │
 │  Card Containers: Pure White (#FFFFFF) with 1px Border (#E4E0DB)│
 │  Brand Accent: KudiCart Signal Orange (#FF5A1F)                 │
 │  Text Hierarchy: Deep Ink (#111111) & Muted Slate (#6B6667)    │
 │  Typography: Plus Jakarta Sans (UI) + JetBrains Mono (Numbers)  │
 │  Icons: Lucide Outlined (2px stroke, no decorative boxes)       │
 └─────────────────────────────────────────────────────────────────┘
```

1. **Aesthetic Tone:** Clinical precision meets atelier warmth. Generous whitespace around content zones, but dense, high-efficiency data rows within tables and form groups.
2. **Layout Foundation:** CSS Grid and Flexbox with a strict **8px baseline scale** (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px). Container max-width: 1440px on widescreen displays.
3. **Typography Rule:**
   - **User Interface:** `Plus Jakarta Sans` exclusively.
   - **Monospace Override:** When displaying Order IDs (`#ORD-9821`), SKUs, Driver Phone Numbers, Razorpay IDs, and Currency Amounts (`₹3,499.00`), switch font to `JetBrains Mono` or `Geist Mono` for tabular alignment.
   - **Serif Constraint:** `Playfair Display` is restricted to the top-level application logo / brand mark and dashboard welcoming headers. **Never** use serif fonts inside table rows, form inputs, status chips, or operational action buttons.

## 6.2 Admin vs Vendor Visual Differentiation

| Element | Admin Portal (`/admin/*`) | Vendor Portal (`/vendor/*`) |
|---|---|---|
| **Header Badge** | `KudiCart Central Ops` (Deep Graphite `#111111` pill with `#FF5A1F` dot) | `Avanya Haute Atelier` (Warm Oyster `#F4F1EA` pill with Storefront icon) |
| **Sidebar Theme** | Clean White surface with `#111111` active indicators and full 15-module operational menu. | Clean White surface with focused 7-module boutique menu (Dashboard, Profile, Products, Orders, Reviews, Reports, Settings). |
| **Telemetry Scope** | Marketplace-wide: Global GMV, fleet capacity, multi-vendor performance, dark stores. | Boutique-scoped: Store revenue, own products in stock, incoming kitchen/packaging queue. |
| **Order Action Roles** | Assignment trigger button, full cancel/reassign permissions, payment audit. | Sequential fulfillment actions only (`Accept` → `Prepare` → `Ready for Pickup`). |

---

## 6.3 Comprehensive Design Token Proposal

| Token Category | Token Name | Value | Status | Source / Rationale |
|---|---|---|---|---|
| **Brand Primary** | `color-brand-orange` | `#FF5A1F` | **VERIFIED** | Customer `theme.ts`, Driver `colors.ts` |
| **Brand Primary Dark** | `color-brand-orange-dark` | `#D94B17` | **VERIFIED** | Driver `colors.ts` (Hover / active CTA states) |
| **Brand Primary Light** | `color-brand-orange-light` | `#FFF0E8` | **VERIFIED** | Driver `colors.ts` (Active row tint, notification pill) |
| **Neutral Canvas** | `color-neutral-canvas` | `#F7F7F5` | **VERIFIED** | Customer `theme.ts` (`softWhite`), Driver `tokens.ts` |
| **Neutral Surface** | `color-neutral-surface` | `#FFFFFF` | **VERIFIED** | Customer/Driver common card surface |
| **Neutral Secondary** | `color-neutral-oyster` | `#F4F1EA` | **VERIFIED** | Customer `theme.ts` (`oyster`), bezel shell background |
| **Neutral Border** | `color-neutral-border` | `#E4E0DB` | **VERIFIED** | Driver `tokens.ts` (`border`), customer divider line |
| **Neutral Border Subdued** | `color-neutral-border-subtle` | `#ECEAE5` | **PROPOSED** | Soft inner dividers between table rows |
| **Text Primary** | `color-text-primary` | `#111111` | **VERIFIED** | Customer `inkBlack`, Driver `tokens.ink` |
| **Text Secondary** | `color-text-secondary` | `#6B6667` | **VERIFIED** | Customer `theme.ts` (`grey`), Driver `tokens.muted` |
| **Text Muted** | `color-text-muted` | `#9E9B97` | **PROPOSED** | Table column header labels, disabled hints |
| **Status Success** | `color-status-success` | `#20885A` | **VERIFIED** | Driver `tokens.online`, customer delivered badge |
| **Status Success Soft** | `color-status-success-bg` | `#ECFDF5` | **VERIFIED** | Customer `orders.tsx` (`DELIVERED` badge bg) |
| **Status Success Border**| `color-status-success-border` | `#A7F3D0` | **VERIFIED** | Customer `orders.tsx` (`DELIVERED` badge border)|
| **Status Pending/Warning**| `color-status-warning` | `#C2410C` | **VERIFIED** | Customer `orders.tsx` (Active order orange text) |
| **Status Pending Soft** | `color-status-warning-bg` | `#FFF7ED` | **VERIFIED** | Customer `orders.tsx` (Active order orange bg) |
| **Status Pending Border**| `color-status-warning-border`| `#FFEDD5` | **VERIFIED** | Customer `orders.tsx` (Active order orange border)|
| **Status Danger** | `color-status-danger` | `#DA1E28` | **VERIFIED** | Driver `colors.danger` |
| **Status Danger Soft** | `color-status-danger-bg` | `#FDF2F2` | **PROPOSED** | KYC rejection / payment failure pill bg |
| **Status Info** | `color-status-info` | `#0043CE` | **VERIFIED** | Driver `colors.info` |
| **Font Family UI** | `font-sans` | `'Plus Jakarta Sans', sans-serif` | **VERIFIED** | Customer `global.css`, `theme.ts` |
| **Font Family Mono** | `font-mono` | `'JetBrains Mono', monospace` | **PROPOSED** | Financial tables, Order IDs, Driver phone numbers |
| **Font Family Editorial**| `font-editorial` | `'Playfair Display', serif` | **VERIFIED** | Logo and top-level brand mark only |
| **Radius Small** | `radius-sm` | `6px` | **PROPOSED** | Table buttons, inline badges |
| **Radius Base** | `radius-md` | `8px` | **PROPOSED** | Form inputs, dropdown menus |
| **Radius Card** | `radius-lg` | `12px` | **VERIFIED** | Driver `tokens.ts` (`radii.card`) |
| **Radius Large** | `radius-xl` | `16px` | **VERIFIED** | Driver `tokens.ts` (`radii.largeCard`) |
| **Radius Pill** | `radius-pill` | `9999px` | **VERIFIED** | Customer & Driver status chips |
| **Shadow Whisper** | `shadow-whisper` | `0 1px 3px rgba(0,0,0,0.04)` | **PROPOSED** | Card container elevation |
| **Shadow Modal** | `shadow-modal` | `0 20px 40px -15px rgba(0,0,0,0.12)` | **PROPOSED** | Assignment drawers, confirmation modals |

---

# SECTION 7 — WORKFLOW SPECIFICATIONS & SCREEN STATES

## 7.1 Key Administrative & Vendor Workflows

### Workflow 1: Admin Vendor Approval Workflow
```text
[Vendor Registers / Admin Inputs Vendor]
                  │
                  ▼
         /admin/vendors (Status: PENDING)
                  │
                  ▼
          Admin clicks "Review Vendor"
                  │
                  ▼
         /admin/vendors/[id]
   Inspect Store Info, Owner ID, Tax/GST, Documents
                  │
         ┌────────┴────────┐
         ▼                 ▼
   [ Approve Vendor ]  [ Reject Vendor ]
         │                 │
         ▼                 ▼
Modal: Set Commission %  Input Rejection Reason
(e.g., 15% Platform cut)   (e.g., "Invalid Tax Reg")
         │                 │
         ▼                 ▼
   Status → ACTIVE     Status → REJECTED
Vendor receives email  Vendor receives feedback
```

### Workflow 2: Admin Manual Delivery Partner Assignment (`D-006`)
```text
Order transitions to READY_FOR_PICKUP (via Vendor)
                  │
                  ▼
         /admin/orders
   Order flagged with Orange Alert Pill: "Needs Driver"
                  │
                  ▼
          Admin clicks "Assign Driver"
                  │
                  ▼
  Manual Assignment Modal / Drawer Opens
  - Shows Order details: Store Pickup Pod & Customer Dropoff Locality
  - Fetches GET /api/v1/admin/drivers (filters: isOnline == true, kycStatus == APPROVED)
  - Displays list of available drivers with completed deliveries & vehicle type
                  │
                  ▼
    Admin selects Driver (e.g., "Rajesh Kumar - Bike")
                  │
                  ▼
   Admin clicks "Confirm & Dispatch"
                  │
                  ▼
   POST /api/v1/orders/:id/assign-driver { driverId }
                  │
                  ▼
   Order transitions: READY_FOR_PICKUP → ASSIGNED
   Driver receives Push Notification on Driver App
```

### Workflow 3: Admin Delivery Partner KYC Verification
```text
Driver registers and uploads documents on Driver App
                  │
                  ▼
         /admin/delivery-partners
   Driver row appears with KYC Status: "PENDING"
                  │
                  ▼
          Admin clicks "Review KYC"
                  │
                  ▼
         /admin/delivery-partners/[id]
  Side-by-side inspection of:
  - Aadhaar (Front & Back)
  - PAN Card (Front)
  - Driving Licence (Front & Back)
  - Vehicle RC (Front & Back)
  - Driver Selfie
                  │
         ┌────────┴────────┐
         ▼                 ▼
   [ Approve KYC ]     [ Reject KYC ]
         │                 │
         ▼                 ▼
POST :id/kyc/review    POST :id/kyc/review
{ status: 'APPROVED' } { status: 'REJECTED', reason: 'Blurry DL' }
         │                 │
         ▼                 ▼
Driver status → APPROVED  Driver status → REJECTED
Driver can now go Online  Driver app shows rejection reason
```

### Workflow 4: Vendor Order Fulfillment Sequence
```text
Customer Checkout completes → Order status: PLACED
                  │
                  ▼
         /vendor/orders
   Incoming Order card appears in "Incoming" tab
                  │
                  ▼
   Vendor clicks [ Accept Order ]
   POST /api/v1/orders/:id/vendor-accept
   Status transitions: PLACED → ACCEPTED
                  │
                  ▼
   Vendor clicks [ Begin Packaging ]
   POST /api/v1/orders/:id/vendor-prepare
   Status transitions: ACCEPTED → PREPARING
                  │
                  ▼
   Boutique finishes packing & quality check
   Vendor clicks [ Ready for Pickup ]
   POST /api/v1/orders/:id/vendor-ready
   Status transitions: PREPARING → READY_FOR_PICKUP
                  │
                  ▼
   VENDOR WORKFLOW TERMINATES.
   UI displays: "Package Ready. Waiting for KudiCart Admin to dispatch driver."
   (Subsequent transitions ASSIGNED → PICKED_UP → DELIVERED are Admin/Driver only).
```

---

## 7.2 Comprehensive Screen State Requirements

Every screen designed in Stitch must support all 7 fundamental UI states. Static happy-path mockups alone are unacceptable:

| Screen State | Visual Representation & Behavior | Required Elements |
|---|---|---|
| **1. Populated (Happy Path)** | Clean, dense data table or cards displaying actual business data. Sortable column headers, clear typography, status chips. | Pagination controls, action menus, search results count. |
| **2. Loading (Initial Mount)** | Structured **Skeletal Shimmer** placeholders matching exact card/table dimensions. No spinning circles or generic blank screens. | Table skeleton rows with pulsating soft grey blocks (`#ECEAE5`). |
| **3. Empty (Zero Data)** | Centered clean layout: Subdued Lucide icon (`32px`, `#6B6667`) in `#F4F1EA` circular container, 2-line title, descriptive helper text, and primary creation CTA button. | "No orders found matching this filter", "Add your first product to begin". |
| **4. Error (API Failure)** | Inline warning banner or empty-state replacement: Red alert icon, clear human-readable error explanation, and a high-contrast "Retry Request" button. | Captured via Sentry client-side. |
| **5. Validation (Form Errors)** | Inline field errors directly beneath inputs: Red text (`12px`, `#DA1E28`), red input border (`1px solid #DA1E28`), helper message. | Visible before form submission on blur, and on submit attempt. |
| **6. Disabled / Read-Only** | Low-contrast styling (`opacity: 0.5`, `cursor: not-allowed`, background `#F7F7F5`). | Form inputs during active submission, vendor fields locked by admin. |
| **7. Destructive Confirmation** | Two-step modal dialog with explicit title, impact statement, and red confirmation button (e.g., "Delete Product", "Reject KYC"). | Cancel button, Confirm action, loading indicator during processing. |

---

# SECTION 8 — RESPONSIVE LAYOUT & BREAKPOINT SPECIFICATIONS

The KudiCart Web Application is **desktop-first**, but fully responsive across tablet and mobile viewports:

```
[ Desktop: 1440px+ ]  ──►  Fixed Left Sidebar (260px) + Fluid Operations Stage
[ Laptop:  1024px  ]  ──►  Condensed Sidebar (64px icon rail) + Scrollable Stage
[ Tablet:  768px   ]  ──►  Collapsible Off-canvas Drawer + Stacked Cards / Tables
[ Mobile:  375px   ]  ──►  Mobile App Bar + Full-width Stacked Operational Cards
```

1. **Desktop Viewport (`≥ 1280px`):**
   - Persistent Left Navigation Sidebar (width: `260px`).
   - Sticky Top Bar (height: `64px`) containing Breadcrumbs, Global Search, Notification Center, and Role Profile.
   - Stage Area: Wide multi-column layout, full data tables with all columns visible, side-by-side detail panels.
2. **Laptop / Narrow Desktop (`1024px – 1279px`):**
   - Collapsible Sidebar automatically condenses into an icon-only navigation rail (`64px` width) with tooltips.
   - Table columns with secondary importance (e.g., Creation Date, SKU) gracefully hide behind horizontal scroll or expand row triggers.
3. **Tablet (`768px – 1023px`):**
   - Sidebar moves to a slide-over off-canvas drawer triggered by a header hamburger button.
   - Metric cards reflow from 4-in-a-row to a 2×2 grid.
   - Data tables retain horizontal scrolling with sticky left identifiers (Order #, Driver Name) and sticky right action buttons.
4. **Mobile (`375px – 767px`):**
   - Full single-column reflow (`width: 100%`, `padding: 16px`).
   - Tables convert to mobile operational cards: each order or driver is a card with top-right status pill and bottom full-width action button.
   - Primary action buttons (e.g., "Assign Driver", "Save Changes") pin to the bottom edge above mobile safe area insets.

---

# SECTION 9 — STITCH DESIGN BRIEF & SCREEN GENERATION SEQUENCE

To maximize design system consistency and prevent fragmented mockups, generate screens in Google Stitch in the following **strict 8-phase sequence**:

```
[ STITCH GENERATION ROADMAP ]
Phase 1: Foundation & Design Tokens  ──► Phase 2: Application Shells
               │                                      │
               ▼                                      ▼
Phase 3: Admin Overview Dashboard    ──► Phase 4: Admin Core Operations (Orders/Fleet)
               │                                      │
               ▼                                      ▼
Phase 5: Vendor Core Operations      ──► Phase 6: Admin Secondary Modules (Ledger/KYC)
               │                                      │
               ▼                                      ▼
Phase 7: Modals & Drawers            ──► Phase 8: Responsive & Exceptional States
```

### Phase 1: Shared Design System & Component Library Setup
- **Stitch Goal:** Generate the foundational design token reference sheet and core atomic components.
- **Deliverables:**
  - Color palette showcase (Signal Orange, Ink Black, Soft Canvas, Oyster, Status Pills).
  - Typography scale & font pairing (`Plus Jakarta Sans` UI + `Playfair Display` Logo).
  - Button states (Primary Orange, Secondary Black Pill, Ghost, Destructive).
  - Form controls (Text input, Dropdown selector, Checkbox, Toggle switch, Search bar).
  - Status badge chips (`DELIVERED`, `PLACED`, `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`, `APPROVED`, `PENDING`, `REJECTED`).
  - Standard Data Table component with hover states, sorting indicators, and pagination footer.

### Phase 2: Shared Authentication & Layout Shells
- **Stitch Goal:** Establish the dual-role navigation shell and login experience.
- **Deliverables:**
  - Unified Login Screen (`/login`): Split-screen editorial image left + high-contrast form right.
  - Admin App Shell: Left navigation sidebar with 15 Admin items, top bar with breadcrumbs and Admin Ops badge.
  - Vendor App Shell: Left navigation sidebar with 7 Vendor items, top bar with Boutique Name badge.

### Phase 3: Admin Marketplace Dashboard
- **Stitch Goal:** Establish the primary Admin command center.
- **Deliverables:**
  - `/admin/dashboard`: Top KPI cards, live order fulfillment pipeline, urgent exception banner, and recent orders table.

### Phase 4: Admin Core Operations (Orders & Manual Assignment)
- **Stitch Goal:** Establish order management and the manual dispatch mechanism.
- **Deliverables:**
  - `/admin/orders`: Orders list with multi-status tabs, filtering, and status chips.
  - `/admin/orders/[id]`: Order detail page with 8-milestone timeline, items list, customer/pickup addresses.
  - Manual Driver Assignment Drawer: Order summary, filterable available driver list, assignment confirmation CTA.

### Phase 5: Vendor Core Operations (Catalog & Order Processing)
- **Stitch Goal:** Establish vendor-scoped catalog and fulfillment processing.
- **Deliverables:**
  - `/vendor/dashboard`: Boutique overview with active packaging queue.
  - `/vendor/products`: Vendor-scoped products data table with stock/price editing.
  - `/vendor/products/new`: Product creation form (pricing, variants, image uploaders, fulfillment type).
  - `/vendor/orders`: Incoming orders queue with sequential action buttons (`Accept` → `Prepare` → `Ready`).
  - `/vendor/orders/[id]`: Boutique packaging slip and fulfillment detail view.

### Phase 6: Admin Secondary Operations (Fleet KYC, Ledger, Support)
- **Stitch Goal:** Complete remaining Admin operational modules.
- **Deliverables:**
  - `/admin/delivery-partners`: Fleet management table with online status and KYC filters.
  - `/admin/delivery-partners/[id]`: KYC Document Review gallery (side-by-side Aadhaar, PAN, DL, RC, Selfie) with approval/rejection controls.
  - `/admin/vendors`: Vendor approval list and detail view.
  - `/admin/payments` & `/admin/ledger`: Financial transaction tables and commission reports.
  - `/admin/support`: Support ticket resolution queue.

### Phase 7: Reusable Overlays & Modals
- **Stitch Goal:** Standardize dialogs across both roles.
- **Deliverables:**
  - Vendor Approval Confirmation Modal (with commission percentage input).
  - KYC Rejection Modal (with rejection reason input).
  - Destructive Action Dialog (Delete product, suspend vendor).
  - CSV Export Parameter Drawer (date range picker, dataset columns selector).

### Phase 8: Tablet & Mobile Responsive Variations
- **Stitch Goal:** Ensure operational usability on narrow viewports.
- **Deliverables:**
  - Tablet (768px) Dashboard with condensed icon rail.
  - Mobile (375px) Order Management view with card-based layout and sticky action bar.

---

# SECTION 10 — OPEN DECISIONS, UNCERTAINTIES & BACKEND CONTRACT DEPENDENCIES

In accordance with project operating rules, open decisions are explicitly preserved rather than silently invented. The following items require formal client/stakeholder sign-off:

| Decision ID | Area | Unresolved Decision | Impact on Stitch Design | Proposed Recommendation (Awaiting Approval) |
|---|---|---|---|---|
| **O-WEB-01** | Admin Dashboard | Exact definitions and calculation formulas for dashboard KPI cards. | Affects which metrics appear in the top summary cards of `/admin/dashboard`. | **Recommend:** 6 core operational cards: Total Orders Today, Gross Sales Volume (₹), Active In-Transit Orders, Unassigned Ready Orders, Pending KYC Reviews, and Open Support Tickets. |
| **O-WEB-02** | CSV Export | Exact column schema and data filters for administrative CSV downloads. | Affects modal fields and preview tables in `/admin/reports` and `/vendor/reports`. | **Recommend:** Standard flattened CSV schemas: Order Number, Date, Customer, Vendor, Driver, Subtotal, Tax, Delivery Fee, Total, Payment Method, Status. |
| **O-WEB-03** | Vendor Staff | Multi-user vendor staff roles and granular permissions. | Determines whether `/vendor/settings` or `/vendor/staff` has sub-role selectors (e.g., Manager vs Cashier). | **Recommend:** For Phase 1, treat each Vendor account as a single authenticated Boutique Owner entity. Defer complex multi-user staff management. |
| **O-WEB-04** | Reporting Definitions | Timeframe boundaries and aggregation grouping for operational reports. | Affects charts/tables in `/admin/reports`. | **Recommend:** Basic aggregation intervals: Daily, Weekly, and Monthly totals. No complex BI or predictive trends. |
| **O-WEB-05** | Audit Event Catalog | Exact taxonomy of captured administrative events and retention rules. | Determines the event filter dropdown in `/admin/audit`. | **Recommend:** Capture all state-changing write operations: `AUTH_LOGIN`, `ORDER_ASSIGNED`, `KYC_APPROVED`, `KYC_REJECTED`, `VENDOR_APPROVED`, `PRICE_UPDATED`, `STOCK_UPDATED`. |
| **O-WEB-06** | Vendor Approval Workflow | Document requirements for vendor onboarding (e.g., FSSAI, GSTIN, Trade License). | Affects display fields on `/admin/vendors/[id]`. | **Recommend:** Display Store Name, Owner Name, Contact, GSTIN, Bank Account Details, and Storefront Photo. |
| **O-WEB-07** | Support Ticket Fields | Ticket category taxonomy and resolution SLA rules. | Affects ticket creation and detail views in `/admin/support`. | **Recommend:** Categories: `ORDER_DELAYED`, `WRONG_ITEM`, `DAMAGED_PARCEL`, `PAYMENT_ISSUE`, `GENERAL_INQUIRY`. |
| **O-WEB-08** | Delivery Partner KYC Fields | Display fields for partner KYC review. | Affects document display on `/admin/delivery-partners/[id]`. | **Resolved by Driver Codebase Audit:** Aadhaar (12 digits, front/back), PAN (10 chars, front), DL (DL format, front/back), Vehicle RC (BH/State format, front/back), and Selfie. |
| **O-WEB-09** | UI Component Library | Choice of foundational component library for Next.js web app. | Affects frontend implementation styling approach. | **Recommend:** **Tailwind CSS + shadcn/ui (Radix Primitives) + Lucide React**. Perfectly mirrors the existing KudiCart design system tokens, avoids heavy styling lock-in, and delivers 100% accessible, customizable desktop tables and dialogs. |

### Backend API Contract Dependencies
The following backend endpoints are required to support the complete design inventory:
- `GET /api/v1/admin/drivers` & `POST /api/v1/admin/drivers/:id/kyc/review` → **VERIFIED IMPLEMENTED** in `Kudicart-backend`.
- `POST /api/v1/orders/:id/assign-driver` → **VERIFIED IMPLEMENTED** in `Kudicart-backend`.
- `POST /api/v1/orders/:id/vendor-accept`, `vendor-prepare`, `vendor-ready` → **VERIFIED IMPLEMENTED** in `Kudicart-backend`.
- `GET /api/v1/admin/vendors` & `POST /api/v1/admin/vendors/:id/approve` → Defined in backend specification; endpoints must be bound prior to Web Phase 6 implementation.
- `GET /api/v1/vendor/products` (scoped by `vendorId`) → Required for Web Phase 8.

---

# SECTION 11 — VERIFICATION AND COMPLETION ATTESTATION

1. **Grounded in Code:** Every brand token, layout rule, status lifecycle, and domain concept in this document was extracted directly from active workspace files in `Kudicart-customer`, `Kudicart-driver`, `Kudicart-backend`, and `Kudicart-admin`.
2. **Zero Code Modified:** No code was added or modified in the Customer, Driver, Backend, or Admin applications. No development servers were started. No database migrations were run.
3. **Scope Integrity Maintained:** Excluded features remain strictly excluded. Vendor data isolation is preserved as an absolute requirement. Manual delivery assignment remains the sole assignment mechanism.
4. **Stitch Ready:** This document is fully structured to serve as the prompt context, visual reference, and screen inventory for Google Stitch design generation.

*End of Reference Audit Report.*
