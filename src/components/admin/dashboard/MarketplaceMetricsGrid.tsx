import React from "react";
import Link from "next/link";

interface MarketplaceMetricsGridProps {
  totalOrders?: number;
  gov?: number;
  activeVendors?: number;
  totalVendors?: number;
  pendingVendors?: number;
  deliveryFleetCount?: number;
  onDutyDrivers?: number;
  standbyDrivers?: number;
  queueExceptionsCount?: number;
}

export function MarketplaceMetricsGrid({
  totalOrders = 148,
  gov = 482450,
  activeVendors = 42,
  totalVendors = 48,
  pendingVendors = 6,
  deliveryFleetCount = 28,
  onDutyDrivers = 19,
  standbyDrivers = 9,
  queueExceptionsCount = 9,
}: MarketplaceMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-md">
      {/* Primary Anchor Card (Spans 5 Columns) */}
      <div className="lg:col-span-5 bg-white border border-[#E4E0DB] rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-[#FFF0E8] via-transparent to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFF0E8] text-[#AE3200]">
                <span className="material-symbols-outlined text-lg material-symbols-fill">
                  shopping_bag
                </span>
              </span>
              <span className="font-label-xs text-label-xs uppercase font-semibold tracking-wider text-secondary">
                Platform Volume &amp; GOV
              </span>
            </div>
            <Link
              href="/admin/orders"
              className="font-label-sm text-label-sm text-[#AE3200] hover:text-[#541400] font-semibold flex items-center gap-1 transition-colors"
            >
              View all orders{" "}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-space-md pt-2">
            <div>
              <span className="font-label-xs text-label-xs text-secondary block">
                Total Orders Created
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-3xl font-extrabold text-on-surface">
                  {totalOrders}
                </span>
                <span className="font-label-xs text-label-xs font-semibold text-[#20885A] flex items-center">
                  <span className="material-symbols-outlined text-sm">trending_up</span> +12.4%
                </span>
              </div>
              <span className="font-label-xs text-label-xs text-secondary block mt-1">
                vs yesterday (132 orders)
              </span>
            </div>

            <div className="border-l border-[#E4E0DB] pl-space-md">
              <span className="font-label-xs text-label-xs text-secondary block">
                Gross Order Value (GOV)
              </span>
              <div className="flex items-baseline gap-1 mt-1 font-headline-lg text-3xl font-extrabold text-on-surface">
                <span className="text-xl font-medium text-secondary">₹</span>
                {gov.toLocaleString("en-IN")}
              </div>
              <span className="font-label-xs text-label-xs text-secondary block mt-1">
                Avg order value ₹3,260
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E4E0DB] flex items-center justify-between text-secondary font-label-xs text-label-xs">
          <span>Peak ordering window: 13:00 - 14:30 IST</span>
          <span className="font-code-xs font-semibold text-on-surface">99.8% System Uptime</span>
        </div>
      </div>

      {/* Metric Card 2: Active Vendors (Spans 2 Columns) */}
      <div className="lg:col-span-2 bg-white border border-[#E4E0DB] rounded-xl p-space-md flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-xs text-label-xs uppercase font-semibold text-secondary">
              Active Vendors
            </span>
            <span className="p-1 rounded bg-[#F4F1EA] text-secondary">
              <span className="material-symbols-outlined text-base">storefront</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-2xl font-bold text-on-surface">
              {activeVendors}{" "}
              <span className="text-base font-normal text-secondary">/ {totalVendors}</span>
            </div>
            <span className="font-label-xs text-label-xs text-secondary block mt-1">
              Boutiques online now
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E4E0DB] mt-3 flex items-center justify-between">
          <span className="font-label-xs text-label-xs text-[#C9822E] font-medium">
            {pendingVendors} pending approval
          </span>
          <Link href="/admin/vendors" className="text-primary hover:text-pressed-orange">
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Metric Card 3: Active Delivery Partners (Spans 2 Columns) */}
      <div className="lg:col-span-2 bg-white border border-[#E4E0DB] rounded-xl p-space-md flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-xs text-label-xs uppercase font-semibold text-secondary">
              Delivery Fleet
            </span>
            <span className="p-1 rounded bg-[#F4F1EA] text-secondary">
              <span className="material-symbols-outlined text-base">two_wheeler</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-2xl font-bold text-on-surface">
              {deliveryFleetCount}
            </div>
            <span className="font-label-xs text-label-xs text-secondary block mt-1">
              {onDutyDrivers} on duty • {standbyDrivers} standby
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E4E0DB] mt-3 flex items-center justify-between">
          <span className="font-label-xs text-label-xs text-[#20885A] font-medium">
            Fleet active 88%
          </span>
          <Link href="/admin/delivery-partners" className="text-primary hover:text-pressed-orange">
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Metric Card 4: Pending Action Items (Spans 3 Columns) */}
      <div className="lg:col-span-3 bg-white border border-[#E4E0DB] rounded-xl p-space-md flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-xs text-label-xs uppercase font-semibold text-secondary">
              Queue Exceptions
            </span>
            <span className="p-1 rounded bg-[#FEF2F2] text-[#DA1E28]">
              <span className="material-symbols-outlined text-base">priority_high</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline-lg text-2xl font-bold text-[#DA1E28]">
              {queueExceptionsCount}
            </div>
            <span className="font-label-xs text-label-xs text-secondary block mt-1">
              Actions requiring admin signoff
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E4E0DB] mt-3 flex items-center justify-between text-secondary font-label-xs text-label-xs">
          <span className="truncate">3 KYC • 4 Unassigned • 2 Escalated</span>
          <span className="material-symbols-outlined text-base text-secondary">chevron_right</span>
        </div>
      </div>
    </div>
  );
}
