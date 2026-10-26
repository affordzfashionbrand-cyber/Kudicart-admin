"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/utils";

interface VendorOrderRow {
  id: string;
  orderNumber: string;
  placedTime: string;
  productName: string;
  quantity: number;
  variant: string;
  totalAmount: number;
  status: "PREPARING" | "READY_FOR_PICKUP" | "HANDED_OVER";
}

const INITIAL_VENDOR_ORDERS: VendorOrderRow[] = [
  {
    id: "v-01",
    orderNumber: "KC-98210",
    placedTime: "10:14 AM (18m ago)",
    productName: "Silk Kaftan Dress",
    quantity: 2,
    variant: "Size: 42 • Emerald Green",
    totalAmount: 14850,
    status: "PREPARING",
  },
  {
    id: "v-02",
    orderNumber: "KC-98208",
    placedTime: "09:42 AM (50m ago)",
    productName: "Structured Linen Blazer",
    quantity: 1,
    variant: "Size: 38 • Raw Chalk",
    totalAmount: 9200,
    status: "READY_FOR_PICKUP",
  },
  {
    id: "v-03",
    orderNumber: "KC-98205",
    placedTime: "08:30 AM (2h ago)",
    productName: "Hand-Embroidered Kurta",
    quantity: 1,
    variant: "Size: 40 • Deep Ochre",
    totalAmount: 6450,
    status: "READY_FOR_PICKUP",
  },
  {
    id: "v-04",
    orderNumber: "KC-98199",
    placedTime: "Yesterday 18:20",
    productName: "Handloom Tussar Sari",
    quantity: 1,
    variant: "Free Size • Royal Indigo",
    totalAmount: 18500,
    status: "HANDED_OVER",
  },
];

export default function VendorDashboardPage() {
  const [orders, setOrders] = useState<VendorOrderRow[]>(INITIAL_VENDOR_ORDERS);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "PREPARING") return o.status === "PREPARING";
    if (activeFilter === "READY_FOR_PICKUP") return o.status === "READY_FOR_PICKUP";
    if (activeFilter === "HANDED_OVER") return o.status === "HANDED_OVER";
    return true;
  });

  const handleMarkReady = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "READY_FOR_PICKUP" } : o))
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1440px] mx-auto">
      {/* Workflow Constraint Notice Banner */}
      <div className="p-4 bg-white border border-[#E4E0DB] rounded-xl flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0043CE] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">info</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111111]">
              Workflow Directive: Central Logistics Handoff
            </h4>
            <p className="text-xs text-[#6B6667] mt-0.5">
              Operational Notice: As an authorized boutique, mark orders as{" "}
              <code className="font-mono text-[#D94B17] bg-[#FFF0E8] px-1.5 py-0.5 rounded font-semibold text-[11px]">
                READY_FOR_PICKUP
              </code>{" "}
              once packed. KudiCart Central Ops handles dispatch and rider assignment.
            </p>
          </div>
        </div>
        <button
          onClick={() => alert("Boutique Packaging Guidelines: Ensure tamper-evident security satchel is sealed prior to Central Ops dispatch handover.")}
          className="text-[#6B6667] hover:text-[#111111] text-[11px] font-semibold uppercase tracking-wider shrink-0 underline"
        >
          Dispatch Guidelines
        </button>
      </div>

      {/* Page Header + Operational Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Maison Lagos — Orders &amp; Fulfillment
          </h1>
          <p className="text-xs text-[#6B6667] mt-1">
            Fulfill orders up to READY_FOR_PICKUP for central fleet handover.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Batch invoices downloaded.")}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[#6B6667] text-[18px]">print</span>
            <span>Batch Invoices</span>
          </button>
          <button
            onClick={() => alert("New product modal opened.")}
            className="h-9 px-4 bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 4 Vendor KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Orders */}
        <div className="bg-white p-4 rounded-xl border border-[#E4E0DB] shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-bold">
              Today&apos;s Orders
            </span>
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#111111]">24</span>
            <span className="text-xs font-bold text-[#20885A] flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">All catalog items combined</p>
        </div>

        {/* Card 2: Pending Packaging */}
        <div className="bg-white p-4 rounded-xl border border-[#E4E0DB] shadow-xs">
          <div className="flex items-center justify-between text-[#C9822E]">
            <span className="text-[11px] uppercase tracking-wider font-bold">
              Pending Packaging
            </span>
            <span className="material-symbols-outlined text-[20px]">package_2</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#C9822E]">6</span>
            <span className="text-xs text-[#6B6667]">Needs attention</span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">SLA Target: &lt; 45 mins packing</p>
        </div>

        {/* Card 3: Ready for Pickup */}
        <div className="bg-white p-4 rounded-xl border border-[#E4E0DB] shadow-xs">
          <div className="flex items-center justify-between text-[#0043CE]">
            <span className="text-[11px] uppercase tracking-wider font-bold">
              Ready for Pickup
            </span>
            <span className="material-symbols-outlined text-[20px]">inventory</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0043CE]">3</span>
            <span className="text-xs text-[#6B6667]">In holding bay</span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Awaiting Central Fleet dispatch</p>
        </div>

        {/* Card 4: Current Period Settlement */}
        <div className="bg-white p-4 rounded-xl border border-[#E4E0DB] shadow-xs">
          <div className="flex items-center justify-between text-[#20885A]">
            <span className="text-[11px] uppercase tracking-wider font-bold">
              Period Settlement
            </span>
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#111111]">
              {formatINR(1240500)}
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Disbursement Friday 18:00</p>
        </div>
      </div>

      {/* Boutique Orders Table Card */}
      <div className="bg-white rounded-xl border border-[#E4E0DB] shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 border-b border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === "ALL"
                  ? "bg-[#EAE7DF] text-[#111111]"
                  : "text-[#6B6667] hover:bg-[#F7F7F5]"
              }`}
            >
              All Active ({orders.length})
            </button>
            <button
              onClick={() => setActiveFilter("PREPARING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === "PREPARING"
                  ? "bg-[#EAE7DF] text-[#111111]"
                  : "text-[#6B6667] hover:bg-[#F7F7F5]"
              }`}
            >
              Pending Packaging (1)
            </button>
            <button
              onClick={() => setActiveFilter("READY_FOR_PICKUP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === "READY_FOR_PICKUP"
                  ? "bg-[#EAE7DF] text-[#111111]"
                  : "text-[#6B6667] hover:bg-[#F7F7F5]"
              }`}
            >
              Ready for Pickup (2)
            </button>
            <button
              onClick={() => setActiveFilter("HANDED_OVER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === "HANDED_OVER"
                  ? "bg-[#EAE7DF] text-[#111111]"
                  : "text-[#6B6667] hover:bg-[#F7F7F5]"
              }`}
            >
              Handed Over Today (1)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B6667]">
            <span>Store Scope: Restricted</span>
            <span className="material-symbols-outlined text-[16px]">lock</span>
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F4F1EA] text-[#6B6667] text-[11px] font-bold uppercase tracking-wider border-b border-[#E4E0DB]">
                <th className="py-2 px-4 font-semibold">Order ID</th>
                <th className="py-2 px-4 font-semibold">Placed Time</th>
                <th className="py-2 px-4 font-semibold">Item Details</th>
                <th className="py-2 px-4 font-semibold text-right">Total</th>
                <th className="py-2 px-4 font-semibold text-center">Fulfillment Status</th>
                <th className="py-2 px-4 font-semibold text-right">Vendor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs">
              {filteredOrders.map((row) => (
                <tr key={row.id} className="h-12 hover:bg-[#F7F7F5]/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-semibold text-[#111111]">
                    #{row.orderNumber}
                  </td>
                  <td className="py-2.5 px-4 text-[#6B6667] font-mono text-[11px]">
                    {row.placedTime}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-[#111111]">{row.productName}</span>
                    <span className="text-[#6B6667] font-mono text-[11px] ml-1">
                      × {row.quantity}
                    </span>
                    <span className="block text-[11px] text-[#6B6667]">{row.variant}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#111111]">
                    {formatINR(row.totalAmount)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.status === "PREPARING" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#EFF6FF] text-[#0043CE] font-semibold border border-[#BFDBFE]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0043CE]" />
                        PREPARING
                      </span>
                    )}
                    {row.status === "READY_FOR_PICKUP" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#FFFBEB] text-[#B45309] font-semibold border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                        READY_FOR_PICKUP
                      </span>
                    )}
                    {row.status === "HANDED_OVER" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#ECFDF5] text-[#20885A] font-semibold border border-[#A7F3D0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
                        HANDED_OVER
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {row.status === "PREPARING" ? (
                      <button
                        type="button"
                        onClick={() => handleMarkReady(row.id)}
                        className="h-8 px-3 bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                        <span>Mark Ready for Pickup</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Packing slip for #${row.orderNumber} printed.`)}
                        className="h-8 px-3 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[#6B6667] text-[14px]">
                          print
                        </span>
                        <span>Print Packing Slip</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
