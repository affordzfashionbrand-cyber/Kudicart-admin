import React from "react";
import Link from "next/link";

interface MarketplaceMetricsGridProps {
  totalOrders?: number;
  gov?: number;
  activeVendors?: number;
  totalVendors?: number;
  deliveryFleetCount?: number;
}

export function MarketplaceMetricsGrid({
  totalOrders = 148,
  gov = 482450,
  activeVendors = 42,
  totalVendors = 48,
  deliveryFleetCount = 28,
}: MarketplaceMetricsGridProps) {
  const cards = [
    {
      id: "orders",
      label: "Total Orders",
      value: totalOrders.toString(),
      description: "All recorded platform orders",
      icon: "shopping_cart",
      href: "/admin/orders",
      linkText: "View orders",
    },
    {
      id: "gov",
      label: "Gross Order Value",
      value: `₹${(gov ?? 0).toLocaleString("en-IN")}`,
      description: "Platform transaction volume",
      icon: "payments",
      href: "/admin/ledger",
      linkText: "View ledger",
    },
    {
      id: "vendors",
      label: "Active Vendors",
      value: (
        <>
          {activeVendors}{" "}
          <span className="text-sm font-normal text-[#6B6667]">/ {totalVendors}</span>
        </>
      ),
      description: "Registered boutique stores",
      icon: "storefront",
      href: "/admin/vendors",
      linkText: "View vendors",
    },
    {
      id: "fleet",
      label: "Delivery Partners",
      value: deliveryFleetCount.toString(),
      description: "Fulfillment fleet partners",
      icon: "local_shipping",
      href: "/admin/delivery-partners",
      linkText: "View partners",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between shadow-xs h-full"
        >
          <div>
            {/* Header: Label & Matching Sidebar Icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#6B6667]">
                {card.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB]/80 flex items-center justify-center text-[#6B6667] shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  {card.icon}
                </span>
              </div>
            </div>

            {/* Metric Value */}
            <div className="text-2xl sm:text-[28px] font-semibold text-[#111111] mt-2 leading-tight">
              {card.value}
            </div>

            {/* Supporting Text */}
            <span className="text-xs text-[#6B6667] block mt-1">
              {card.description}
            </span>
          </div>

          {/* Action Link */}
          <div className="pt-3 mt-3 border-t border-[#E4E0DB]">
            <Link
              href={card.href}
              className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
            >
              <span>{card.linkText}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
