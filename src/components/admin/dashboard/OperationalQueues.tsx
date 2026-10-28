import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function OperationalQueues() {
  const vendors = [
    {
      id: "ven_7821",
      name: "Kashmir Loom Heritage",
      category: "Textiles & Apparel",
      status: "PENDING_REVIEW",
    },
    {
      id: "ven_7822",
      name: "Malabar Spice Co.",
      category: "Artisanal Food",
      status: "PENDING_REVIEW",
    },
    {
      id: "ven_7823",
      name: "Deccan Metalcraft",
      category: "Home & Decor",
      status: "ACTIVE",
    },
  ];

  const deliveryPartners = [
    {
      id: "drv-118",
      name: "Suraj Verma",
      detail: "#DRV-118 • Ather 450X (EV)",
      status: "PENDING",
    },
    {
      id: "drv-119",
      name: "Farhan Akhtar",
      detail: "#DRV-119 • TVS King",
      status: "PENDING",
    },
    {
      id: "drv-104",
      name: "Deepak Solanki",
      detail: "#DRV-104 • Hero Electric",
      status: "VERIFIED",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {/* Column 1: Vendor Overview */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
            <div>
              <h3 className="text-[17px] font-semibold text-[#111111]">
                Vendor Overview
              </h3>
              <p className="text-xs text-[#6B6667] mt-0.5">
                42 active boutiques • 6 pending review
              </p>
            </div>
            <Link
              href="/admin/vendors"
              className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
            >
              <span>View all vendors</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Concise Vendor Rows */}
          <div className="divide-y divide-[#E4E0DB]">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="py-2.5 min-h-[52px] flex items-center justify-between hover:bg-[#F7F7F5]/50 px-1 rounded transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-[13px] font-medium text-[#111111] truncate">
                    {vendor.name}
                  </div>
                  <div className="text-xs text-[#6B6667] truncate mt-0.5">
                    {vendor.category}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <StatusBadge status={vendor.status} variant="vendor" />
                  <Link
                    href={`/admin/vendors/${vendor.id}`}
                    className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] px-2 py-0.5 rounded hover:bg-[#FFF0E8] transition-colors"
                  >
                    {vendor.status === "PENDING_REVIEW" ? "Review" : "View"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Column 2: Delivery Partners */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
            <div>
              <h3 className="text-[17px] font-semibold text-[#111111]">
                Delivery Partners
              </h3>
              <p className="text-xs text-[#6B6667] mt-0.5">
                28 active fleet • 2 awaiting verification
              </p>
            </div>
            <Link
              href="/admin/delivery-partners"
              className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
            >
              <span>Manage partners</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Concise Delivery Partner Rows */}
          <div className="divide-y divide-[#E4E0DB]">
            {deliveryPartners.map((partner) => (
              <div
                key={partner.id}
                className="py-2.5 min-h-[52px] flex items-center justify-between hover:bg-[#F7F7F5]/50 px-1 rounded transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-[13px] font-medium text-[#111111] truncate">
                    {partner.name}
                  </div>
                  <div className="text-xs text-[#6B6667] truncate mt-0.5 font-mono">
                    {partner.detail}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <StatusBadge status={partner.status} variant="kyc" />
                  <Link
                    href={`/admin/delivery-partners/${partner.id}`}
                    className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] px-2 py-0.5 rounded hover:bg-[#FFF0E8] transition-colors"
                  >
                    {partner.status === "PENDING" ? "Verify" : "View"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
