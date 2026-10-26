import React from "react";
import { OrderStatus, OrderStatusHistoryItem } from "@/types/orders";

interface TimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistoryItem[];
}

const MILESTONES: { status: OrderStatus; label: string; stepNumber: number }[] = [
  { status: "PLACED", label: "Placed", stepNumber: 1 },
  { status: "ACCEPTED", label: "Accepted", stepNumber: 2 },
  { status: "PREPARING", label: "Preparing", stepNumber: 3 },
  { status: "READY_FOR_PICKUP", label: "Ready for pickup", stepNumber: 4 },
  { status: "ASSIGNED", label: "Assigned", stepNumber: 5 },
  { status: "PICKED_UP", label: "Picked up", stepNumber: 6 },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery", stepNumber: 7 },
  { status: "DELIVERED", label: "Delivered", stepNumber: 8 },
];

export function OrderLifecycleTimeline({ currentStatus, history = [] }: TimelineProps) {
  const currentIndex = MILESTONES.findIndex((m) => m.status === currentStatus);
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  // Percentage for connection fill line
  const progressPercent = Math.min(100, Math.max(0, (safeCurrentIndex / (MILESTONES.length - 1)) * 100));

  return (
    <section className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-body-md font-bold text-on-surface">Order Lifecycle Timeline</h2>
        <span className="text-label-xs font-label-xs text-secondary font-medium">
          8 Canonical Milestones
        </span>
      </div>

      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-[840px] relative flex items-start justify-between">
          {/* Continuous Track Line */}
          <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-[#E4E0DB] -z-0">
            <div
              className="h-full bg-[#10B981] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps */}
          {MILESTONES.map((milestone, idx) => {
            const isCompleted = idx < safeCurrentIndex;
            const isActive = idx === safeCurrentIndex;
            const isPending = idx > safeCurrentIndex;

            // Find matching history item if available
            const histItem = history.find((h) => h.status === milestone.status);
            const timeLabel = histItem?.timestamp || (isCompleted || isActive ? "Completed" : "Pending");

            return (
              <div
                key={milestone.status}
                className={`flex flex-col items-center relative z-10 w-24 text-center ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                {isCompleted && (
                  <div className="w-7 h-7 rounded-full bg-[#ECFDF5] border border-[#10B981] text-[#059669] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                  </div>
                )}

                {isActive && (
                  <div className="w-7 h-7 rounded-full bg-[#FFFBEB] border-2 border-[#FF5A1F] text-[#FF5A1F] flex items-center justify-center shadow-xs ring-4 ring-[#FF5A1F]/15">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                  </div>
                )}

                {isPending && (
                  <div className="w-7 h-7 rounded-full bg-[#F7F7F5] border border-[#E4E0DB] text-[#8E8B85] flex items-center justify-center text-xs font-medium">
                    {milestone.stepNumber}
                  </div>
                )}

                <span
                  className={`text-xs mt-2 leading-tight ${
                    isActive
                      ? "font-bold text-[#FF5A1F]"
                      : isCompleted
                      ? "font-semibold text-on-surface"
                      : "font-medium text-secondary"
                  }`}
                >
                  {milestone.label}
                </span>

                <span
                  className={`text-[11px] font-mono mt-0.5 ${
                    isActive
                      ? "font-semibold text-[#FF5A1F]"
                      : "text-secondary"
                  }`}
                >
                  {timeLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
