import React from "react";
import Link from "next/link";

interface ModulePlaceholderProps {
  moduleName: string;
  scope: "Admin" | "Vendor";
  icon: string;
  description?: string;
}

export function ModulePlaceholder({
  moduleName,
  scope,
  icon,
  description,
}: ModulePlaceholderProps) {
  const returnHref = scope === "Admin" ? "/admin/orders" : "/vendor/dashboard";
  const returnLabel = scope === "Admin" ? "View Marketplace Orders Queue" : "Return to Boutique Dashboard";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E4E0DB] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#6B6667] mb-1">
          <span>{scope === "Admin" ? "Central Operations" : "Boutique Portal"}</span>
          <span>/</span>
          <span className="text-[#111111] font-semibold">{moduleName}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#FF5A1F] text-[26px]">
            {icon}
          </span>
          <span>{moduleName}</span>
        </h1>
        <p className="text-xs text-[#6B6667] mt-1">
          {description || `Operational governance and tracking for ${moduleName.toLowerCase()}.`}
        </p>
      </div>

      {/* Intentional Placeholder Card */}
      <div className="p-8 sm:p-12 rounded-xl bg-white border border-[#E4E0DB] shadow-xs text-center max-w-2xl mx-auto space-y-4 my-8">
        <div className="w-12 h-12 rounded-xl bg-[#FFF0E8] border border-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mx-auto shadow-xs">
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-[#111111]">
            {moduleName} Module
          </h2>
          <p className="text-xs text-[#6B6667] max-w-md mx-auto leading-relaxed">
            Approved Stitch design specification pending for this module. In accordance with project scope rules, full functionality will be implemented once design templates are approved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={returnHref}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>{returnLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
