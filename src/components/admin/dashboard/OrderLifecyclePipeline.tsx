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
    inTransit?: number;
    outForDelivery?: number;
    delivered: number;
    returning?: number;
    returned?: number;
    cancelled?: number;
    failed?: number;
  };
}

export function OrderLifecyclePipeline({
  pipelineCounts = {
    placed: 0,
    accepted: 0,
    preparing: 0,
    readyForPickup: 0,
    assigned: 0,
    pickedUp: 0,
    inTransit: 0,
    delivered: 0,
    returning: 0,
    returned: 0,
    cancelled: 0,
    failed: 0,
  },
}: OrderLifecyclePipelineProps) {
  const stages: Array<{
    key: string;
    label: string;
    count: number;
    href: string;
    tone?: "action" | "success" | "warning" | "danger";
  }> = [
    {
      key: "PLACED",
      label: "Placed",
      count: pipelineCounts.placed ?? 0,
      href: "/admin/orders?status=PLACED",
    },
    {
      key: "ACCEPTED",
      label: "Accepted",
      count: pipelineCounts.accepted ?? 0,
      href: "/admin/orders?status=ACCEPTED",
    },
    {
      key: "PREPARING",
      label: "Preparing",
      count: pipelineCounts.preparing ?? 0,
      href: "/admin/orders?status=PREPARING",
    },
    {
      key: "READY_FOR_PICKUP",
      label: "Ready for Pickup",
      count: pipelineCounts.readyForPickup ?? 0,
      href: "/admin/orders?status=READY_FOR_PICKUP",
      tone: "action",
    },
    {
      key: "ASSIGNED",
      label: "Assigned",
      count: pipelineCounts.assigned ?? 0,
      href: "/admin/orders?status=ASSIGNED",
    },
    {
      key: "PICKED_UP",
      label: "Picked Up",
      count: pipelineCounts.pickedUp ?? 0,
      href: "/admin/orders?status=PICKED_UP",
    },
    {
      key: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
      count: pipelineCounts.inTransit ?? pipelineCounts.outForDelivery ?? 0,
      href: "/admin/orders?status=OUT_FOR_DELIVERY",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      count: pipelineCounts.delivered ?? 0,
      href: "/admin/orders?status=DELIVERED",
      tone: "success",
    },
    {
      key: "RETURNING",
      label: "Returning",
      count: pipelineCounts.returning ?? 0,
      href: "/admin/orders?status=RETURNING",
      tone: "warning",
    },
    {
      key: "RETURNED",
      label: "Returned",
      count: pipelineCounts.returned ?? 0,
      href: "/admin/orders?status=RETURNED",
      tone: "warning",
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      count: pipelineCounts.cancelled ?? 0,
      href: "/admin/orders?status=CANCELLED",
      tone: "danger",
    },
    {
      key: "FAILED",
      label: "Failed",
      count: pipelineCounts.failed ?? 0,
      href: "/admin/orders?status=FAILED",
      tone: "danger",
    },
  ];

  return (
    <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 shadow-xs space-y-3">
      {/* Compact Section Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111111]">
            Order Status
          </h2>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Marketplace fulfillment overview
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
        >
          <span>View all orders</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* Compact Horizontal Tile Layout: Label on Left, Count on Right, Vertically Centered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {stages.map((stage) => {
          let cardStyle = "bg-[#F7F7F5] border-[#E4E0DB]";
          let labelStyle = "text-[#6B6667]";
          let countStyle = "text-[#111111]";

          if (stage.tone === "action") {
            cardStyle = "bg-[#FFF0E8] border-[#FF5A1F]/30";
            labelStyle = "text-[#D94B17]";
            countStyle = "text-[#D94B17]";
          } else if (stage.tone === "success") {
            cardStyle = "bg-[#F0FDF4] border-[#BBF7D0]";
            labelStyle = "text-[#20885A]";
            countStyle = "text-[#20885A]";
          } else if (stage.tone === "warning") {
            cardStyle = "bg-[#FFFBEB] border-[#FDE68A]";
            labelStyle = "text-[#B45309]";
            countStyle = "text-[#B45309]";
          } else if (stage.tone === "danger") {
            cardStyle = "bg-[#FEF2F2] border-[#FECACA]";
            labelStyle = "text-[#B91C1C]";
            countStyle = "text-[#B91C1C]";
          }

          return (
            <Link
              key={stage.key}
              href={stage.href}
              className={`h-[54px] px-3.5 rounded-[8px] border flex items-center justify-between min-w-0 transition-all hover:border-[#FF5A1F] ${cardStyle}`}
            >
              <span className={`text-[12px] sm:text-[13px] font-normal truncate pr-2 ${labelStyle}`}>
                {stage.label}
              </span>
              <span className={`text-[20px] sm:text-[22px] font-semibold leading-none shrink-0 ${countStyle}`}>
                {stage.count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
