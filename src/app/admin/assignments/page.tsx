"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import { getDemoOrders } from "@/demo-data/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ManualDeliveryAssignmentDrawer } from "@/components/admin/ManualDeliveryAssignmentDrawer";
import { formatINR } from "@/lib/utils";

type AssignmentTab = "READY" | "ASSIGNED" | "ALL";

export default function AdminAssignmentsPage() {
  const [orders] = useState<Order[]>(getDemoOrders());
  const [activeTab, setActiveTab] = useState<AssignmentTab>("READY");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "READY" && order.status !== "READY_FOR_PICKUP") return false;
      if (activeTab === "ASSIGNED" && order.status !== "ASSIGNED") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.orderNumber.toLowerCase().includes(q) || order.id.toLowerCase().includes(q);
        const matchesCustomer = order.customerName.toLowerCase().includes(q);
        const matchesVendor = order.vendorName.toLowerCase().includes(q);
        const matchesDriver = order.assignedDriver?.fullName.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesVendor && !matchesDriver) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const readyCount = useMemo(() => orders.filter((o) => o.status === "READY_FOR_PICKUP").length, [orders]);
  const assignedCount = useMemo(() => orders.filter((o) => o.status === "ASSIGNED").length, [orders]);

  const handleOpenAssign = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleConfirmAssignment = async (orderId: string, driver: DeliveryPartner) => {
    showToast(
      `Backend integration pending: Manual delivery partner assignment requires server connectivity and is not available in UI-only mode.`
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-[8px] shadow-lg flex items-center gap-3 border border-[#333333] text-xs">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#6B6667] hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Delivery Assignments
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20 text-xs font-medium tabular-nums">
              {readyCount} Awaiting Driver
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Manual operational assignment of verified delivery partners to orders ready for pickup.
          </p>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("READY")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
              activeTab === "READY"
                ? "bg-[#111111] text-white"
                : "text-[#6B6667] hover:bg-[#F4F1EA] hover:text-[#111111]"
            }`}
          >
            Ready for Pickup ({readyCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ASSIGNED")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
              activeTab === "ASSIGNED"
                ? "bg-[#111111] text-white"
                : "text-[#6B6667] hover:bg-[#F4F1EA] hover:text-[#111111]"
            }`}
          >
            Assigned ({assignedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
              activeTab === "ALL"
                ? "bg-[#111111] text-white"
                : "text-[#6B6667] hover:bg-[#F4F1EA] hover:text-[#111111]"
            }`}
          >
            All Active ({orders.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6667] text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order, customer, vendor..."
            className="w-full h-9 pl-9 pr-3 bg-[#F7F7F5] text-xs text-[#111111] placeholder:text-[#6B6667]/60 rounded-[8px] border border-[#E4E0DB] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-normal"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4 sm:px-5 py-0 font-medium">Order ID</th>
                <th className="px-4 py-0 font-medium">Customer & Delivery</th>
                <th className="px-4 py-0 font-medium">Boutique Vendor</th>
                <th className="px-4 py-0 font-medium text-right">Amount</th>
                <th className="px-4 py-0 font-medium text-center">Status</th>
                <th className="px-4 py-0 font-medium">Assigned Partner</th>
                <th className="px-4 sm:px-5 py-0 font-medium text-right">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#6B6667]">
                    <p className="font-medium text-[#111111]">No orders in queue</p>
                    <p className="text-xs text-[#6B6667] mt-1">
                      {activeTab === "READY"
                        ? "All ready orders have been manually assigned to delivery partners."
                        : "No matching orders found for current filter criteria."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isReady = order.status === "READY_FOR_PICKUP";
                  const isAssigned = order.status === "ASSIGNED" || !!order.assignedDriver;

                  return (
                    <tr key={order.id} className="h-12 hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="px-4 sm:px-5 py-0 font-mono text-xs font-medium text-[#111111] whitespace-nowrap">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-[#FF5A1F]">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-0">
                        <div>
                          <span className="font-medium text-[#111111]">{order.customerName}</span>
                          <p className="text-xs text-[#6B6667] line-clamp-1 mt-0.5">
                            {order.customerAddress?.locality || order.customerAddress?.city || "Bandra West, Mumbai"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                        {order.vendorName}
                      </td>
                      <td className="px-4 py-0 font-semibold text-[#111111] text-right tabular-nums whitespace-nowrap">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td className="px-4 py-0 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} variant="order" />
                      </td>
                      <td className="px-4 py-0 text-xs whitespace-nowrap">
                        {order.assignedDriver ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#111111]">{order.assignedDriver.fullName}</span>
                            <span className="text-[#6B6667]">({order.assignedDriver.phone})</span>
                          </div>
                        ) : (
                          <span className="text-[#DA1E28] font-medium text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                        {isReady ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(order)}
                            className="h-7 px-3 rounded-[6px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium transition-colors shadow-xs"
                          >
                            Assign Partner
                          </button>
                        ) : isAssigned ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(order)}
                            className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] hover:bg-[#FFF0E8] px-2 py-1 rounded transition-colors"
                          >
                            Reassign
                          </button>
                        ) : (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs font-medium text-[#6B6667] hover:text-[#111111] px-2 py-1 rounded transition-colors"
                          >
                            View Order
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Delivery Assignment Drawer */}
      <ManualDeliveryAssignmentDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        onConfirmAssignment={handleConfirmAssignment}
      />
    </div>
  );
}
