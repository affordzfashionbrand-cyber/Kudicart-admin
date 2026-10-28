"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Printer,
  Plus,
  X,
  Package,
  Info,
  CheckCheck,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface VendorOrderRow {
  id: string;
  orderNumber: string;
  placedTime: string;
  productName: string;
  quantity: number;
  variant: string;
  totalAmount: number;
  status: "PLACED" | "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "HANDED_OVER";
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
  {
    id: "v-05",
    orderNumber: "KC-98194",
    placedTime: "Yesterday 16:05",
    productName: "Organza Dupatta Set",
    quantity: 1,
    variant: "Free Size • Pastel Coral",
    totalAmount: 4800,
    status: "HANDED_OVER",
  },
];

export default function VendorDashboardPage() {
  const [orders, setOrders] = useState<VendorOrderRow[]>(INITIAL_VENDOR_ORDERS);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setToastMessage("Order marked as READY_FOR_PICKUP. Dispatch queue notified.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleActionNotice = (message: string) => {
    setToastMessage(`Not connected in this build: ${message}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Workflow Constraint Notice Banner */}
      <div className="p-4 bg-white border border-[#E4E0DB] rounded-[10px] flex flex-col sm:flex-row items-start justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[#EFF6FF] text-[#0043CE] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-[#0043CE]" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#111111]">
              Central Logistics Handover Policy
            </h4>
            <p className="text-xs text-[#6B6667] mt-0.5 leading-relaxed">
              As an authorized boutique vendor, mark prepared orders as{" "}
              <code className="font-mono text-[#D94B17] bg-[#FFF0E8] px-1.5 py-0.5 rounded font-medium text-[11px]">
                READY_FOR_PICKUP
              </code>{" "}
              once packed. KudiCart Central Operations manages rider assignment and dispatch.
            </p>
          </div>
        </div>
        <Link
          href="/vendor/profile"
          className="text-[#D94B17] hover:underline text-xs font-medium shrink-0 self-end sm:self-auto"
        >
          Dispatch Bay Guidelines →
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Maison Lagos — Orders &amp; Fulfillment
          </h1>
          <p className="text-xs text-[#6B6667] mt-1">
            Fulfill store orders up to Ready for Pickup for central fleet handover.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleActionNotice("Batch invoice export requires backend print service.")}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium rounded-[8px] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Batch Invoices</span>
          </button>
          <button
            onClick={() => handleActionNotice("Product creation requires catalog persistence.")}
            className="h-9 px-4 bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Vendor KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Orders */}
        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Today&apos;s Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#111111]">24</span>
            <span className="text-xs font-medium text-[#20885A] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Boutique items combined</p>
        </div>

        {/* Card 2: Ready for Pickup */}
        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Ready for Pickup
            </span>
            <Package className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#D94B17]">2</span>
            <span className="text-[11px] text-[#6B6667]">Awaiting rider handover</span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Staged in Bay Slot 4</p>
        </div>

        {/* Card 3: Today's Gross Sales */}
        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Today&apos;s GMV
            </span>
            <span className="font-mono text-xs text-[#6B6667]">INR</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              ₹38,950
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Net receivable calculated at settlement</p>
        </div>

        {/* Card 4: Packaging SLA */}
        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Fulfillment Rate
            </span>
            <Clock className="w-4 h-4 text-[#20885A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#20885A]">99.2%</span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Average pack time: 14 mins</p>
        </div>
      </div>

      {/* Orders Management Table Card */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-[#E4E0DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Recent Boutique Orders
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[11px] font-mono text-[#6B6667]">
              {filteredOrders.length} shown
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["ALL", "PREPARING", "READY_FOR_PICKUP", "HANDED_OVER"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors whitespace-nowrap ${
                  activeFilter === tab
                    ? "bg-[#111111] text-white"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
                }`}
              >
                {tab === "ALL" && "All Orders"}
                {tab === "PREPARING" && "Preparing (1)"}
                {tab === "READY_FOR_PICKUP" && "Ready for Pickup (2)"}
                {tab === "HANDED_OVER" && "Handed Over (2)"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Order ID &amp; Time</th>
                <th className="px-4">Garment / Item Details</th>
                <th className="px-4 text-center">Qty</th>
                <th className="px-4 text-right">Amount</th>
                <th className="px-4 text-center">Fulfillment Status</th>
                <th className="px-4 text-right">Boutique Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredOrders.map((order) => {
                const isPreparing = order.status === "PREPARING";
                const isReady = order.status === "READY_FOR_PICKUP";

                return (
                  <tr
                    key={order.id}
                    className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                  >
                    <td className="px-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-[#FF5A1F]">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-[#6B6667] mt-0.5">
                        {order.placedTime}
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="font-medium text-[#111111]">
                        {order.productName}
                      </div>
                      <div className="text-[11px] text-[#6B6667] mt-0.5">
                        {order.variant}
                      </div>
                    </td>
                    <td className="px-4 text-center font-mono font-medium">
                      {order.quantity}
                    </td>
                    <td className="px-4 text-right font-medium tabular-nums whitespace-nowrap">
                      {formatINR(order.totalAmount)}
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {order.status === "PREPARING" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          Preparing
                        </span>
                      )}
                      {order.status === "READY_FOR_PICKUP" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/30">
                          Ready for Pickup
                        </span>
                      )}
                      {order.status === "HANDED_OVER" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          Handed Over
                        </span>
                      )}
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      {isPreparing && (
                        <button
                          onClick={() => handleMarkReady(order.id)}
                          className="h-7 px-2.5 rounded-[6px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium shadow-2xs transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Ready</span>
                        </button>
                      )}
                      {isReady && (
                        <span className="text-[11px] text-[#6B6667] font-medium">
                          Awaiting Central Rider
                        </span>
                      )}
                      {order.status === "HANDED_OVER" && (
                        <span className="text-[11px] text-[#20885A] font-medium">
                          In Central Transit
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667] bg-[#F7F7F5]">
          <span>Displaying latest orders for Maison Lagos Atelier</span>
          <Link
            href="/vendor/orders"
            className="text-[#D94B17] hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>View Full Order History</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
