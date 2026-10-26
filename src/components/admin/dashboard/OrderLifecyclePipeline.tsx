import React from "react";
import Link from "next/link";

interface OrderLifecyclePipelineProps {
  pipelineCounts?: {
    placed: number;
    accepted: number;
    preparing: number;
    readyForPickup: number;
    assigned: number;
    pickedUp: number;
    inTransit: number;
    delivered: number;
  };
}

export function OrderLifecyclePipeline({
  pipelineCounts = {
    placed: 12,
    accepted: 18,
    preparing: 24,
    readyForPickup: 14,
    assigned: 16,
    pickedUp: 22,
    inTransit: 19,
    delivered: 23,
  },
}: OrderLifecyclePipelineProps) {
  const totalInPipeline =
    pipelineCounts.placed +
    pipelineCounts.accepted +
    pipelineCounts.preparing +
    pipelineCounts.readyForPickup +
    pipelineCounts.assigned +
    pipelineCounts.pickedUp +
    pipelineCounts.inTransit +
    pipelineCounts.delivered;

  return (
    <div className="bg-white border border-[#E4E0DB] rounded-xl p-space-lg shadow-sm space-y-space-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E0DB] pb-space-sm">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Order Operations &amp; Canonical Lifecycle
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Live state across 8 canonical fulfillment milestones for active shift.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#20885A] animate-pulse" />
          <span className="font-label-xs text-label-xs text-secondary font-mono">
            {totalInPipeline} Orders in Pipeline
          </span>
        </div>
      </div>

      {/* 8 Canonical Milestones Horizontal Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {/* Milestone 1: Placed */}
        <div className="p-2.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5] flex flex-col justify-between h-20 transition-all hover:border-secondary">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-secondary font-medium">1. Placed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-on-surface">
            {pipelineCounts.placed}
          </div>
        </div>

        {/* Milestone 2: Accepted */}
        <div className="p-2.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5] flex flex-col justify-between h-20 transition-all hover:border-secondary">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-secondary font-medium">2. Accepted</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-on-surface">
            {pipelineCounts.accepted}
          </div>
        </div>

        {/* Milestone 3: Preparing */}
        <div className="p-2.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5] flex flex-col justify-between h-20 transition-all hover:border-secondary">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-secondary font-medium">3. Preparing</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0043CE]" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-[#0043CE]">
            {pipelineCounts.preparing}
          </div>
        </div>

        {/* Milestone 4: Ready for Pickup (HIGHLIGHTED ACTION NEEDED) */}
        <Link
          href="/admin/orders?status=READY_FOR_PICKUP"
          className="p-2.5 rounded-lg border-2 border-[#FF5A1F] bg-[#FFF0E8] flex flex-col justify-between h-20 transition-all hover:bg-[#FFE5D8] group cursor-pointer relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-[#AE3200] font-bold">
              4. Ready Pickup
            </span>
            <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-[#FF5A1F] text-white uppercase tracking-wider">
              Action
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-headline-sm text-xl font-extrabold text-[#541400]">
              {pipelineCounts.readyForPickup}
            </div>
            <span className="font-label-xs text-[10px] text-[#AE3200] font-semibold flex items-center">
              Review →
            </span>
          </div>
        </Link>

        {/* Milestone 5: Assigned */}
        <div className="p-2.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5] flex flex-col justify-between h-20 transition-all hover:border-secondary">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-secondary font-medium">5. Assigned</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-on-surface">
            {pipelineCounts.assigned}
          </div>
        </div>

        {/* Milestone 6: Picked Up */}
        <div className="p-2.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5] flex flex-col justify-between h-20 transition-all hover:border-secondary">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-secondary font-medium">6. Picked Up</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-on-surface">
            {pipelineCounts.pickedUp}
          </div>
        </div>

        {/* Milestone 7: In Transit */}
        <div className="p-2.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5] flex flex-col justify-between h-20 transition-all hover:border-secondary">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-secondary font-medium">7. In Transit</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0043CE]" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-[#0043CE]">
            {pipelineCounts.inTransit}
          </div>
        </div>

        {/* Milestone 8: Delivered */}
        <div className="p-2.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] flex flex-col justify-between h-20 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs text-[#20885A] font-bold">8. Delivered</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
          </div>
          <div className="font-headline-sm text-lg font-bold text-[#20885A]">
            {pipelineCounts.delivered}
          </div>
        </div>
      </div>

      {/* Embedded Needs Attention Sub-Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
        {/* Box A: Orders Requiring Dispatch */}
        <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-lg p-space-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-white text-[#C9822E] shadow-2xs">
              <span className="material-symbols-outlined text-xl">alarm</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm font-bold text-[#92400E] block">
                4 Orders Waiting Courier &gt; 15 mins
              </span>
              <span className="font-body-sm text-body-sm text-[#B45309]">
                Ready for pickup at boutique, zero delivery partner match.
              </span>
            </div>
          </div>
          <Link
            href="/admin/assignments"
            className="h-8 px-3 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors shrink-0 ml-2"
          >
            <span>Assign Partner</span>
          </Link>
        </div>

        {/* Box B: Assignment Stale/Conflict */}
        <div className="border border-[#FECACA] bg-[#FEF2F2] rounded-lg p-space-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-white text-[#DA1E28] shadow-2xs">
              <span className="material-symbols-outlined text-xl">sync_problem</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm font-bold text-[#B91C1C] block">
                1 Driver Cancellation Conflict
              </span>
              <span className="font-body-sm text-body-sm text-[#DA1E28]">
                Order #KC-98188 rejected by courier in route to boutique.
              </span>
            </div>
          </div>
          <Link
            href="/admin/assignments"
            className="h-8 px-3 bg-white border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DA1E28] rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors shrink-0 ml-2"
          >
            <span>Re-assign</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
