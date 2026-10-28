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
  const stages = [
    {
      key: "PLACED",
      label: "Placed",
      count: pipelineCounts.placed,
      href: "/admin/orders?status=PLACED",
    },
    {
      key: "ACCEPTED",
      label: "Accepted",
      count: pipelineCounts.accepted,
      href: "/admin/orders?status=ACCEPTED",
    },
    {
      key: "PREPARING",
      label: "Preparing",
      count: pipelineCounts.preparing,
      href: "/admin/orders?status=PREPARING",
    },
    {
      key: "READY_FOR_PICKUP",
      label: "Ready for Pickup",
      count: pipelineCounts.readyForPickup,
      href: "/admin/orders?status=READY_FOR_PICKUP",
      isActionable: true,
    },
    {
      key: "ASSIGNED",
      label: "Assigned",
      count: pipelineCounts.assigned,
      href: "/admin/orders?status=ASSIGNED",
    },
    {
      key: "PICKED_UP",
      label: "Picked Up",
      count: pipelineCounts.pickedUp,
      href: "/admin/orders?status=PICKED_UP",
    },
    {
      key: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
      count: pipelineCounts.inTransit,
      href: "/admin/orders?status=OUT_FOR_DELIVERY",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      count: pipelineCounts.delivered,
      href: "/admin/orders?status=DELIVERED",
      isSuccess: true,
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

          if (stage.isActionable) {
            cardStyle = "bg-[#FFF0E8] border-[#FF5A1F]/30";
            labelStyle = "text-[#D94B17]";
            countStyle = "text-[#D94B17]";
          } else if (stage.isSuccess) {
            cardStyle = "bg-[#F0FDF4] border-[#BBF7D0]";
            labelStyle = "text-[#20885A]";
            countStyle = "text-[#20885A]";
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
