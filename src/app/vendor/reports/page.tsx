"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, Lock, ArrowLeft, FileSpreadsheet } from "lucide-react";

export default function VendorReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Store Reports &amp; Settlements
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
              Pending O-013–O-016 Specification
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Store sales reconciliations, commission breakdowns, and settlement CSV exports.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-8 shadow-2xs space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Settlement Reports &amp; CSV Exports Gated — Pending Specification
              </h2>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[10px] font-mono font-medium">
                OPEN DECISIONS O-013, O-014, O-015, O-016
              </span>
            </div>
            <p className="text-xs text-[#6B6667] leading-relaxed max-w-2xl">
              Store financial reporting, commission formulas (<span className="font-mono text-[#111111]">O-013</span>), reporting definitions (<span className="font-mono text-[#111111]">O-015</span>), and CSV export column schemas (<span className="font-mono text-[#111111]">O-016</span>) are deferred pending approval. Synthetic payout figures and static CSV exports have been disabled so unapproved metrics are never presented as real data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5 text-xs text-[#6B6667]">
            <BarChart3 className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#111111]">Commission &amp; Settlement Rules (O-013 / O-015)</p>
              <p className="mt-1 leading-relaxed">
                Exact commission percentages, logistics deduction rules, and cycle aggregations await final specification approval.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5 text-xs text-[#6B6667]">
            <FileSpreadsheet className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#111111]">CSV Export Schemas (O-016)</p>
              <p className="mt-1 leading-relaxed">
                Settlement CSV downloads will be enabled once backend export endpoints and canonical column schemas are finalized.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Link
            href="/vendor/orders"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Live Store Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
