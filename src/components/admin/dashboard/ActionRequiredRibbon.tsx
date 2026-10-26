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
  const totalExceptions = unassignedCount + pendingBoutiquesCount + driverKycCount;

  return (
    <div className="bg-[#FFF0E8] border border-[#FFDBCE] rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(17,17,17,0.02)]">
      <div className="flex items-start md:items-center gap-space-md">
        <div className="w-9 h-9 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-xl">warning</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm font-bold text-[#541400]">
              Operational Attention Required
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFDBCE] text-[#AE3200]">
              {totalExceptions} Critical Items
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-[#852400] mt-0.5">
            {unassignedCount} orders awaiting courier assignment • {pendingBoutiquesCount} boutique merchant applications • {driverKycCount} driver background verifications.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/admin/assignments"
          className="px-3 py-1.5 bg-white border border-[#FFDBCE] hover:bg-[#FFF8F5] text-[#AE3200] font-label-sm text-label-sm font-semibold rounded-lg transition-colors shadow-2xs"
        >
          Open Courier Queue ({unassignedCount})
        </Link>
        <Link
          href="/admin/vendors"
          className="px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#D94B17] text-white font-label-sm text-label-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Resolve Exceptions
        </Link>
      </div>
    </div>
  );
}
