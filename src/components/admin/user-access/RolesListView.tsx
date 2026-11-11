"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, ArrowLeft } from "lucide-react";

export function RolesListView() {
  return (
    <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-8 shadow-2xs space-y-5">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[15px] font-semibold text-[#111111]">
              Custom Role Definitions Gated — Pending O-002 Specification
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[10px] font-mono font-medium">
              DEFERRED OPEN DECISION O-002
            </span>
          </div>
          <p className="text-xs text-[#6B6667] leading-relaxed max-w-2xl">
            Granular role templates and vendor/staff sub-role hierarchies are intentionally deferred pending explicit approval of Open Decision <span className="font-mono text-[#111111]">O-002</span>. Placeholder role counts and local draft role templates have been removed to prevent unapproved RBAC rules.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5 text-xs text-[#6B6667]">
        <Shield className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
        <span>
          Platform access continues to enforce authoritative backend <span className="font-mono text-[#111111]">ADMIN</span> and <span className="font-mono text-[#111111]">VENDOR</span> authentication roles until O-002 is finalized.
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
