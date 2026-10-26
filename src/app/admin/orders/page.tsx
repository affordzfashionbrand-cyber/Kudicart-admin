"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order, OrderStatus, FulfillmentType } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import { MOCK_ORDERS } from "@/mocks/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ManualDeliveryAssignmentDrawer } from "@/components/admin/ManualDeliveryAssignmentDrawer";
import { formatINR } from "@/lib/utils";

type TabFilter = "ALL" | OrderStatus;

const TABS: { id: TabFilter; label: string; count: number }[] = [
  { id: "ALL", label: "All Orders", count: 89 },
  { id: "PLACED", label: "Placed", count: 6 },
  { id: "ACCEPTED", label: "Accepted", count: 8 },
  { id: "PREPARING", label: "Preparing", count: 14 },
  { id: "READY_FOR_PICKUP", label: "Ready for Pickup", count: 18 },
  { id: "ASSIGNED", label: "Assigned", count: 12 },
  { id: "PICKED_UP", label: "Picked Up", count: 10 },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", count: 11 },
  { id: "DELIVERED", label: "Delivered", count: 28 },
];

export default function AdminMarketplaceOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("ALL");
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab !== "ALL" && order.status !== activeTab) {
        return false;
      }

      // Status dropdown filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      // Fulfillment filter
      if (fulfillmentFilter !== "ALL" && order.fulfillmentType !== fulfillmentFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerPhone.includes(query) ||
          order.vendorName.toLowerCase().includes(query) ||
          order.pickupHub.toLowerCase().includes(query) ||
          order.items.some((item) => item.title.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [orders, activeTab, statusFilter, fulfillmentFilter, searchQuery]);

  // Handle drawer open
  const handleOpenAssignDrawer = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderForDrawer(order);
    setIsDrawerOpen(true);
  };

  // Handle assignment completion
  const handleConfirmAssignment = (orderId: string, driver: DeliveryPartner) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "ASSIGNED",
              assignedDriver: {
                id: driver.id,
                fullName: driver.fullName,
                phone: driver.phone,
                vehicleType: driver.vehicleType,
                vehicleModel: driver.vehicleModel,
                vehicleRegistration: driver.vehicleRegistration,
                completedDeliveries: driver.completedDeliveries,
                kycStatus: driver.kycStatus,
              },
              history: [
                ...o.history,
                {
                  status: "ASSIGNED",
                  timestamp: new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) + " IST",
                  performer: "Central Ops Admin",
                  note: `Manually dispatched to ${driver.fullName} (${driver.driverCode})`,
                },
              ],
            }
          : o
      )
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setActiveTab("ALL");
    setSearchQuery("");
    setStatusFilter("ALL");
    setFulfillmentFilter("ALL");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1440px] mx-auto">
      {/* ================= PAGE HEADER & LIVE METRICS OVERVIEW ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E0DB] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Marketplace Orders
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EAE7DF] text-[#111111] text-xs font-semibold font-mono">
              89 Total Active Orders
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Monitor marketplace orders and coordinate fulfillment across boutique partners.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => alert("Orders export generated in CSV format.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-semibold text-[#111111] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= ORDER LIFECYCLE STATUS TABS ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none custom-scrollbar border-b border-[#E4E0DB] whitespace-nowrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isReady = tab.id === "READY_FOR_PICKUP";

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? isReady
                    ? "bg-[#FFFBEB] border border-[#FDE68A] text-[#C9822E] shadow-xs"
                    : "bg-white border border-[#E4E0DB] text-[#111111] shadow-xs"
                  : "text-[#6B6667] hover:text-[#111111] hover:bg-white"
              }`}
            >
              {isReady && (
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
              )}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                  isActive
                    ? isReady
                      ? "bg-[#FF5A1F] text-white"
                      : "bg-[#EAE7DF] text-[#111111]"
                    : "bg-[#EAE7DF]/70 text-[#6B6667]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <div className="p-3 bg-white rounded-xl border border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Quick Filter Search Input */}
          <div className="relative min-w-[260px] flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center text-[#6B6667]">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer, vendor..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E4E0DB] bg-white text-xs text-[#111111] placeholder:text-[#6B6667] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-[#E4E0DB] bg-white text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLACED">Placed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-[#6B6667] text-[16px]">
              expand_more
            </span>
          </div>

          {/* Fulfillment Type Dropdown */}
          <div className="relative">
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-[#E4E0DB] bg-white text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Types (Standard, Express, Try &amp; Buy)</option>
              <option value="Standard">Standard Delivery</option>
              <option value="Express (60m)">Express (60 min)</option>
              <option value="Try &amp; Buy">Try &amp; Buy</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-[#6B6667] text-[16px]">
              expand_more
            </span>
          </div>

          {/* Date Range Picker */}
          <button
            type="button"
            className="h-9 px-3 rounded-lg border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs text-[#111111] inline-flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[#6B6667] text-[16px]">
              calendar_today
            </span>
            <span>Today (24 Oct 2024)</span>
            <span className="material-symbols-outlined text-[#6B6667] text-[16px]">
              expand_more
            </span>
          </button>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="h-9 px-3 rounded-lg text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] text-xs font-semibold transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* ================= OPERATIONAL DATA TABLE ================= */}
      <div className="bg-white rounded-xl border border-[#E4E0DB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F4F1EA] text-[#6B6667] text-[11px] font-bold uppercase tracking-wider border-b border-[#E4E0DB]">
                <th className="w-10 px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedRowIds.length === filteredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-[#E4E0DB] text-[#FF5A1F] focus:ring-[#FF5A1F]"
                  />
                </th>
                <th className="px-3 py-2 font-semibold">Order ID</th>
                <th className="px-3 py-2 font-semibold">Order Time</th>
                <th className="px-3 py-2 font-semibold">Customer</th>
                <th className="px-3 py-2 font-semibold">Vendor / Pickup Location</th>
                <th className="px-3 py-2 font-semibold">Fulfillment</th>
                <th className="px-2 py-2 font-semibold text-center">Items</th>
                <th className="px-3 py-2 font-semibold text-right">Amount</th>
                <th className="px-3 py-2 font-semibold">Payment</th>
                <th className="px-3 py-2 font-semibold">Order Status</th>
                <th className="px-3 py-2 font-semibold">Assigned Partner</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12">
                    <EmptyState
                      title="No marketplace orders found"
                      description="No active orders match the current filter criteria. Try clearing search keywords or status tabs."
                      actionLabel="Reset All Filters"
                      onAction={handleClearFilters}
                      icon="inbox"
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedRowIds.includes(order.id);
                  const isReadyForPickup = order.status === "READY_FOR_PICKUP";
                  const totalUnits = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className={`h-12 hover:bg-[#FDFBF7] transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#FFF0E8]/40"
                          : isReadyForPickup
                          ? "bg-[#FFFDF5]"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="w-10 px-4 py-2 text-center"
                        onClick={(e) => handleToggleSelectRow(order.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-[#E4E0DB] text-[#FF5A1F] focus:ring-[#FF5A1F]"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-[#111111]">
                            #{order.orderNumber}
                          </span>
                          {isReadyForPickup && (
                            <span
                              className="w-2 h-2 rounded-full bg-[#FF5A1F]"
                              title="Requires Immediate Dispatch"
                            />
                          )}
                        </div>
                      </td>

                      {/* Order Time */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-mono text-xs font-medium">
                          {order.createdAt.includes("T")
                            ? order.createdAt.split("T")[1].slice(0, 5)
                            : order.createdAt}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            isReadyForPickup ? "text-[#D94B17]" : "text-[#6B6667]"
                          }`}
                        >
                          {order.history[order.history.length - 1]?.timestamp || "Recent"}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-medium text-[#111111]">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-[#6B6667] font-mono">
                          {order.customerPhone}
                        </div>
                      </td>

                      {/* Vendor / Pickup */}
                      <td className="px-3 py-2">
                        <div
                          className="font-medium text-[#111111] truncate max-w-[200px]"
                          title={order.vendorName}
                        >
                          {order.vendorName}
                        </div>
                        <div className="text-[10px] text-[#6B6667] flex items-center gap-1 truncate max-w-[200px]">
                          <span className="material-symbols-outlined text-[13px] text-[#FF5A1F]">
                            pin_drop
                          </span>
                          <span>{order.pickupHub}</span>
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge status={order.fulfillmentType} variant="fulfillment" />
                      </td>

                      {/* Items */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-[#F4F1EA] text-[10px] font-mono font-semibold text-[#6B6667]">
                          {totalUnits} items
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2 text-right whitespace-nowrap font-mono font-semibold text-[#111111]">
                        {formatINR(order.grandTotal)}
                      </td>

                      {/* Payment */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge status={order.paymentStatus} variant="payment" />
                      </td>

                      {/* Order Status */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge status={order.status} variant="order" />
                      </td>

                      {/* Assigned Partner */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        {order.assignedDriver ? (
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-[#20885A]">
                              two_wheeler
                            </span>
                            <div>
                              <div className="font-semibold text-xs text-[#111111]">
                                {order.assignedDriver.fullName}
                              </div>
                              <div className="text-[10px] text-[#6B6667] font-mono">
                                {order.assignedDriver.vehicleRegistration}
                              </div>
                            </div>
                          </div>
                        ) : isReadyForPickup ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#FEF2F2] text-[#DA1E28] border border-[#ffdad6]">
                            <span className="material-symbols-outlined text-[13px]">
                              warning
                            </span>
                            Unassigned — Needs Partner
                          </span>
                        ) : (
                          <span className="text-[#6B6667] text-[11px] italic">
                            Not required yet
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        {isReadyForPickup ? (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAssignDrawer(order, e)}
                            className="h-8 px-3 rounded-lg bg-[#FF5A1F] hover:bg-[#D94B17] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              person_add
                            </span>
                            <span>Assign Partner</span>
                          </button>
                        ) : (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 px-2.5 rounded-lg border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-semibold text-[#111111] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>View</span>
                            <span className="material-symbols-outlined text-[14px]">
                              chevron_right
                            </span>
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

        {/* Table Pagination Footer */}
        <div className="px-4 py-3 bg-[#F4F1EA] border-t border-[#E4E0DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667]">
          <div className="font-mono">
            Showing <strong className="text-[#111111]">1</strong> to{" "}
            <strong className="text-[#111111]">{filteredOrders.length}</strong> of{" "}
            <strong className="text-[#111111]">89</strong> active orders
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="px-2.5 py-1 rounded border border-[#E4E0DB] bg-white text-[#6B6667] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs"
            >
              Previous
            </button>
            <span className="px-2.5 py-1 rounded bg-[#FF5A1F] text-white font-semibold text-xs">
              1
            </span>
            <button className="px-2.5 py-1 rounded border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5] font-semibold text-xs">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5] font-semibold text-xs">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Manual Delivery Partner Assignment Drawer */}
      <ManualDeliveryAssignmentDrawer
        order={selectedOrderForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrderForDrawer(null);
        }}
        onConfirmAssignment={handleConfirmAssignment}
      />
    </div>
  );
}
