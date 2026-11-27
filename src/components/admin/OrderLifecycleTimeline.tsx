import React from "react";
import { AlertTriangle, Check, RotateCcw } from "lucide-react";
import { OrderStatus, OrderStatusHistoryItem } from "@/types/orders";

interface TimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistoryItem[];
  isTryAndBuy?: boolean;
}

export function OrderLifecycleTimeline({
  currentStatus,
  history = [],
  isTryAndBuy = false,
}: TimelineProps) {
  const showTryAndBuy = Boolean(
    isTryAndBuy ||
      currentStatus === "TRY_AND_BUY" ||
      history.some((h) => h.status === "TRY_AND_BUY")
  );
  const normalizedCurrent: OrderStatus =
    currentStatus === "PREPARING"
      ? "PACKING"
      : currentStatus === "ASSIGNED"
        ? "READY_FOR_PICKUP"
        : currentStatus === "PICKED_UP"
          ? "OUT_FOR_DELIVERY"
          : currentStatus;

  const isReturnState =
    normalizedCurrent === "RETURNING" || normalizedCurrent === "RETURNED";
  const isTerminalFailure =
    normalizedCurrent === "CANCELLED" || normalizedCurrent === "FAILED";

  const FORWARD_MILESTONES: { status: OrderStatus; label: string; stepNumber: number }[] = [
    { status: "PLACED", label: "Placed", stepNumber: 1 },
    { status: "ACCEPTED", label: "Accepted", stepNumber: 2 },
    { status: "PACKING", label: "Packing", stepNumber: 3 },
    { status: "READY_FOR_PICKUP", label: "Ready for Pickup", stepNumber: 4 },
    { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", stepNumber: 5 },
    ...(showTryAndBuy
      ? [{ status: "TRY_AND_BUY" as OrderStatus, label: "Try & Buy", stepNumber: 6 }]
      : []),
    ...(isReturnState
      ? [
          { status: "RETURNING" as OrderStatus, label: "Returning", stepNumber: showTryAndBuy ? 7 : 6 },
          { status: "RETURNED" as OrderStatus, label: "Returned", stepNumber: showTryAndBuy ? 8 : 7 },
        ]
      : [{ status: "DELIVERED" as OrderStatus, label: "Delivered", stepNumber: showTryAndBuy ? 7 : 6 }]),
  ];

  const milestones = FORWARD_MILESTONES;

  const normalizedHistoryStatuses = new Set<string>(
    history.map((h) =>
      h.status === "PREPARING"
        ? "PACKING"
        : h.status === "ASSIGNED"
          ? "READY_FOR_PICKUP"
          : h.status === "PICKED_UP"
            ? "OUT_FOR_DELIVERY"
            : h.status
    )
  );
  const highestHistoryForwardIdx = milestones.reduce((maxIdx, m, idx) => {
    return normalizedHistoryStatuses.has(m.status) ? Math.max(maxIdx, idx) : maxIdx;
  }, -1);

  const activeIndex = isTerminalFailure
    ? -1
    : milestones.findIndex((m) => m.status === normalizedCurrent);

  const completedUpToIdx = isTerminalFailure ? highestHistoryForwardIdx : activeIndex;

  const progressIndex = activeIndex >= 0 ? activeIndex : Math.max(0, completedUpToIdx);
  const progressPercent = Math.min(
    100,
    Math.max(0, (progressIndex / Math.max(1, milestones.length - 1)) * 100)
  );

  const terminalHistItem = history.find((h) => h.status === currentStatus);

  return (
    <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#111111]">Order Lifecycle Timeline</h2>
        <span className="text-xs text-[#6B6667] font-medium">
          {isTerminalFailure || isReturnState
            ? `Canonical State: ${currentStatus.replace(/_/g, " ")}`
            : "8 Forward Milestones"}
        </span>
      </div>

      {isTerminalFailure && (
        <div className="p-3 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] text-xs text-[#991B1B] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>
              Order ended in <strong>{currentStatus}</strong> state
              {terminalHistItem?.note ? ` — ${terminalHistItem.note}` : "."}
            </span>
          </div>
          {terminalHistItem?.timestamp && (
            <span className="font-mono text-[11px] shrink-0">{terminalHistItem.timestamp}</span>
          )}
        </div>
      )}

      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div
          className={`${isReturnState ? "min-w-[980px]" : "min-w-[840px]"} relative flex items-start justify-between`}
        >
          {/* Continuous Track Line */}
          <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-[#E4E0DB] -z-0">
            <div
              className={`h-full transition-all duration-500 ${
                isTerminalFailure ? "bg-[#DA1E28]" : "bg-[#20885A]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps */}
          {milestones.map((milestone, idx) => {
            const isCompleted = isTerminalFailure
              ? idx <= completedUpToIdx
              : idx < activeIndex;
            const isActive = !isTerminalFailure && idx === activeIndex;
            const isPending = !isCompleted && !isActive;
            const isReturnStep =
              milestone.status === "RETURNING" || milestone.status === "RETURNED";

            const histItem = history.find((h) => h.status === milestone.status);
            const timeLabel =
              histItem?.timestamp ||
              (isActive ? "Current" : isCompleted ? "Completed" : "Pending");

            return (
              <div
                key={milestone.status}
                className={`flex flex-col items-center relative z-10 w-24 text-center ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                {isCompleted && (
                  <div className="w-7 h-7 rounded-full bg-[#ECFDF5] border border-[#20885A] text-[#20885A] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                {isActive && (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
                      isReturnStep
                        ? "bg-[#FFFBEB] border-2 border-[#D97706] text-[#D97706]"
                        : "bg-[#FFF0E8] border-2 border-[#FF5A1F] text-[#FF5A1F]"
                    }`}
                  >
                    {isReturnStep ? (
                      <RotateCcw className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" />
                    )}
                  </div>
                )}

                {isPending && (
                  <div className="w-7 h-7 rounded-full bg-[#F7F7F5] border border-[#E4E0DB] text-[#6B6667] flex items-center justify-center text-xs font-medium">
                    {milestone.stepNumber}
                  </div>
                )}

                <span
                  className={`text-xs mt-2 leading-tight ${
                    isActive
                      ? isReturnStep
                        ? "font-semibold text-[#B45309]"
                        : "font-semibold text-[#FF5A1F]"
                      : isCompleted
                      ? "font-medium text-[#111111]"
                      : "font-normal text-[#6B6667]"
                  }`}
                >
                  {milestone.label}
                </span>

                <span
                  className={`text-[11px] font-mono mt-0.5 ${
                    isActive
                      ? isReturnStep
                        ? "font-semibold text-[#B45309]"
                        : "font-semibold text-[#FF5A1F]"
                      : "text-[#6B6667]"
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
