import React from "react";
import Link from "next/link";

export function OperationalQueues() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
      {/* Column A: Vendor Operations & Approvals */}
      <div className="bg-white border border-[#E4E0DB] rounded-xl p-space-md flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-space-sm border-b border-[#E4E0DB]">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Vendor Operations
              </h3>
              <span className="font-body-sm text-body-sm text-secondary">
                42 Active Stores • 6 Pending Approvals
              </span>
            </div>
            <Link
              href="/admin/vendors"
              className="font-label-sm text-label-sm text-primary hover:text-pressed-orange font-semibold flex items-center gap-1"
            >
              View all 48 vendors →
            </Link>
          </div>

          {/* List of Pending Onboarding Applications */}
          <div className="divide-y divide-[#E4E0DB] mt-1">
            {/* Item 1 */}
            <div className="py-space-sm flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F4F1EA] border border-[#E4E0DB] flex items-center justify-center font-bold text-secondary text-sm shrink-0">
                  KL
                </div>
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface block">
                    Kashmir Loom Heritage
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Textiles &amp; Apparel • Submitted 2h ago
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]">
                  Pending Review
                </span>
                <Link
                  href="/admin/vendors/ven_7821"
                  className="h-7 px-3 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-on-surface font-label-sm text-label-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  Review
                </Link>
              </div>
            </div>

            {/* Item 2 */}
            <div className="py-space-sm flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F4F1EA] border border-[#E4E0DB] flex items-center justify-center font-bold text-secondary text-sm shrink-0">
                  MS
                </div>
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface block">
                    Malabar Spice Co.
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Artisanal Food • Submitted 5h ago
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFF6FF] text-[#0043CE] border border-[#BFDBFE]">
                  Docs Submitted
                </span>
                <Link
                  href="/admin/vendors/ven_7822"
                  className="h-7 px-3 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-on-surface font-label-sm text-label-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  Review
                </Link>
              </div>
            </div>

            {/* Item 3 */}
            <div className="py-space-sm flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F4F1EA] border border-[#E4E0DB] flex items-center justify-center font-bold text-secondary text-sm shrink-0">
                  DM
                </div>
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface block">
                    Deccan Metalcraft
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Home &amp; Decor • Submitted yesterday
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]">
                  KYC Pending
                </span>
                <Link
                  href="/admin/vendors/ven_7823"
                  className="h-7 px-3 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-on-surface font-label-sm text-label-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  Review
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E4E0DB] mt-3 flex items-center justify-between text-secondary font-label-xs text-label-xs">
          <span>Average onboarding review duration: 4.2 hours</span>
          <span className="font-medium text-primary">Compliance SLA: 100%</span>
        </div>
      </div>

      {/* Column B: Delivery Partner Operations */}
      <div className="bg-white border border-[#E4E0DB] rounded-xl p-space-md flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-space-sm border-b border-[#E4E0DB]">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Delivery Partner Operations
              </h3>
              <span className="font-body-sm text-body-sm text-secondary">
                28 Active Fleet • 4 Pending Verification
              </span>
            </div>
            <Link
              href="/admin/delivery-partners"
              className="font-label-sm text-label-sm text-primary hover:text-pressed-orange font-semibold flex items-center gap-1"
            >
              Manage all partners →
            </Link>
          </div>

          {/* Fleet Status Indicator Strip */}
          <div className="my-2.5 p-2 bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg flex items-center justify-between font-label-xs text-label-xs">
            <span className="text-secondary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#20885A]" />
              <strong>19 Two-Wheelers</strong> in fulfillment transit
            </span>
            <span className="text-secondary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0043CE]" />
              <strong>9 Standby</strong> EV / Electric units ready
            </span>
          </div>

          {/* Pending Partner KYC List */}
          <div className="divide-y divide-[#E4E0DB]">
            {/* Driver 1 */}
            <div className="py-space-sm flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E5DEDF] flex items-center justify-center font-code-sm text-xs font-bold text-on-surface shrink-0">
                  SV
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Suraj Verma
                    </span>
                    <span className="font-code-xs text-[10px] text-tertiary">#DRV-118</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Ather 450X (EV) • License + Aadhaar
                  </span>
                </div>
              </div>
              <Link
                href="/admin/delivery-partners"
                className="h-7 px-3 bg-[#FF5A1F] hover:bg-[#D94B17] text-white font-label-sm text-label-sm font-semibold rounded-lg transition-colors flex items-center"
              >
                Verify Partner
              </Link>
            </div>

            {/* Driver 2 */}
            <div className="py-space-sm flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E5DEDF] flex items-center justify-center font-code-sm text-xs font-bold text-on-surface shrink-0">
                  FA
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Farhan Akhtar
                    </span>
                    <span className="font-code-xs text-[10px] text-tertiary">#DRV-119</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">
                    TVS King • Vehicle RC verification pending
                  </span>
                </div>
              </div>
              <Link
                href="/admin/delivery-partners"
                className="h-7 px-3 bg-[#FF5A1F] hover:bg-[#D94B17] text-white font-label-sm text-label-sm font-semibold rounded-lg transition-colors flex items-center"
              >
                Verify Partner
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E4E0DB] mt-3 flex items-center justify-between text-secondary font-label-xs text-label-xs">
          <span>Average onboarding velocity: 14 mins</span>
          <span className="font-medium text-[#20885A]">Geo-coverage: 94.6%</span>
        </div>
      </div>
    </div>
  );
}
