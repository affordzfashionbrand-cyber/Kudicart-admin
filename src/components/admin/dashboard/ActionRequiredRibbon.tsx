import React from "react";
import Link from "next/link";

interface ActionRequiredRibbonProps {
  unassignedCount?: number;
  pendingBoutiquesCount?: number;
  driverKycCount?: number;
}

export function ActionRequiredRibbon({
  unassignedCount = 4,
  pendingBoutiquesCount = 3,
  driverKycCount = 2,
}: ActionRequiredRibbonProps) {
  const totalItems = unassignedCount + pendingBoutiquesCount + driverKycCount;

  if (totalItems === 0) return null;

  return (
    <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3.5 sm:p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[#111111]">
            Needs Attention
          </h2>
          <span className="text-[11px] font-medium text-[#C9822E] bg-[#FFFBEB] border border-[#FDE68A] px-1.5 py-0.5 rounded">
            {totalItems} pending
          </span>
        </div>
      </div>

      {/* Divided Actionable Items Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E4E0DB] pt-3">
        {/* Item 1: Unassigned Orders */}
        <div className="flex flex-col justify-between py-2 md:py-0 md:px-4 first:md:pl-0">
          <div>
            <div className="text-2xl font-semibold text-[#111111] leading-tight">
              {unassignedCount}
            </div>
            <p className="text-xs text-[#6B6667] mt-1">
              Orders awaiting manual partner assignment
            </p>
          </div>
          <Link
            href="/admin/orders?status=READY_FOR_PICKUP"
            className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] mt-2.5 inline-flex items-center gap-1 transition-colors"
          >
            <span>Assign partners</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* Item 2: Pending Vendor Applications */}
        <div className="flex flex-col justify-between py-2 md:py-0 md:px-4">
          <div>
            <div className="text-2xl font-semibold text-[#111111] leading-tight">
              {pendingBoutiquesCount}
            </div>
            <p className="text-xs text-[#6B6667] mt-1">
              Boutique store applications pending review
            </p>
          </div>
          <Link
            href="/admin/vendors"
            className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] mt-2.5 inline-flex items-center gap-1 transition-colors"
          >
            <span>Review vendors</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* Item 3: Driver KYC Verifications */}
        <div className="flex flex-col justify-between py-2 md:py-0 md:px-4 last:md:pr-0">
          <div>
            <div className="text-2xl font-semibold text-[#111111] leading-tight">
              {driverKycCount}
            </div>
            <p className="text-xs text-[#6B6667] mt-1">
              Delivery partner KYC verifications pending
            </p>
          </div>
          <Link
            href="/admin/delivery-partners"
            className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] mt-2.5 inline-flex items-center gap-1 transition-colors"
          >
            <span>Verify partners</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
