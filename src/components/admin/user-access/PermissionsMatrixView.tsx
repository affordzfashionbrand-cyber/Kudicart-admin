"use client";

import React from "react";
import Link from "next/link";
import { SlidersHorizontal, Lock, ArrowLeft } from "lucide-react";

export function PermissionsMatrixView() {
  return (
    <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-8 shadow-2xs space-y-5">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[15px] font-semibold text-[#111111]">
              Module Permissions Matrix Gated — Pending O-002 Specification
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[10px] font-mono font-medium">
              DEFERRED OPEN DECISION O-002
            </span>
          </div>
          <p className="text-xs text-[#6B6667] leading-relaxed max-w-2xl">
            Fine-grained module and action capability matrices require an approved RBAC specification under Open Decision <span className="font-mono text-[#111111]">O-002</span>. Static 17-module capability grids and unbacked permission toggles have been replaced with this specification gate.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5 text-xs text-[#6B6667]">
        <SlidersHorizontal className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
        <span>
          Once O-002 is resolved, role-permission mappings will load directly from the backend policy registry.
        </span>
      </div>

      <div>
        <Link
          href="/admin/user-access"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Administrative Accounts</span>
        </Link>
      </div>
    </div>
  );
}
