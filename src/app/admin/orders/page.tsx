"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  Calendar,
  FilterX,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Bike,
  AlertTriangle,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import {
  getDemoOrders,
  calculateOrderStats,
  exportOrdersToCSV,
} from "@/demo-data/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ManualDeliveryAssignmentDrawer } from "@/components/admin/ManualDeliveryAssignmentDrawer";
import { formatINR } from "@/lib/utils";

type TabFilter = "ALL" | OrderStatus;

const CANONICAL_STATUS_TABS: { id: TabFilter; label: string }[] = [
  { id: "ALL", label: "All Orders" },
  { id: "PLACED", label: "Placed" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "PREPARING", label: "Preparing" },
  { id: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "PICKED_UP", label: "Picked Up" },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { id: "DELIVERED", label: "Delivered" },
];

const PAGE_SIZE = 8;

export default function AdminMarketplaceOrdersPage() {
  const router = useRouter();

  // Primary data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Assignment Drawer state
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load demonstration orders
  const loadOrders = useCallback((isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const data = getDemoOrders();
    setOrders(data);
    setIsLoading(false);

    if (isRefresh) {
      setTimeout(() => {
        setIsRefreshing(false);
        showToast("Orders list refreshed.");
      }, 300);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Compute dynamic counts per status
  const orderStats = useMemo(() => {
    return calculateOrderStats(orders);
  }, [orders]);

  // Dynamic count map for tabs
  const getTabCount = (tabId: TabFilter): number => {
    switch (tabId) {
      case "ALL":
        return orderStats.all;
      case "PLACED":
        return orderStats.placed;
      case "ACCEPTED":
        return orderStats.accepted;
      case "PREPARING":
        return orderStats.preparing;
      case "READY_FOR_PICKUP":
        return orderStats.readyForPickup;
      case "ASSIGNED":
        return orderStats.assigned;
      case "PICKED_UP":
        return orderStats.pickedUp;
      case "OUT_FOR_DELIVERY":
        return orderStats.outForDelivery;
      case "DELIVERED":
        return orderStats.delivered;
      default:
        return 0;
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab filter
      if (activeTab !== "ALL" && order.status !== activeTab) {
        return false;
      }

      // 2. Status dropdown filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      // 3. Fulfillment filter
      if (fulfillmentFilter !== "ALL" && order.fulfillmentType !== fulfillmentFilter) {
        return false;
      }

      // 4. Date range filter
      if (dateRangeFilter !== "ALL") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        if (dateRangeFilter === "TODAY") {
          const isToday =
            orderDate.getUTCDate() === now.getUTCDate() &&
            orderDate.getUTCMonth() === now.getUTCMonth() &&
            orderDate.getUTCFullYear() === now.getUTCFullYear();
          if (!isToday) return false;
        } else if (dateRangeFilter === "7DAYS") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateRangeFilter === "30DAYS") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < thirtyDaysAgo) return false;
        }
      }

      // 5. Search query
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
  }, [orders, activeTab, statusFilter, fulfillmentFilter, dateRangeFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, fulfillmentFilter, dateRangeFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

  // Handle drawer open for manual partner assignment
  const handleOpenAssignDrawer = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.status !== "READY_FOR_PICKUP" && order.status !== "ASSIGNED") {
      showToast(
        `Order #${order.orderNumber} is in "${order.status}" status. Only orders Ready for Pickup can be assigned.`,
        "error"
      );
      return;
    }
    setSelectedOrderForDrawer(order);
    setIsDrawerOpen(true);
  };

  // Handle assignment completion in UI-only mode
  const handleConfirmAssignment = async (orderId: string, driver: DeliveryPartner) => {
    showToast(
      "Not connected in this build: Delivery partner assignment requires backend service.",
      "error"
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveTab("ALL");
    setSearchQuery("");
    setStatusFilter("ALL");
    setFulfillmentFilter("ALL");
    setDateRangeFilter("ALL");
    setCurrentPage(1);
  };

  // Real CSV Export
  const handleExportCSV = () => {
    const success = exportOrdersToCSV(filteredOrders, "kudicart_marketplace_orders");
    if (success) {
      showToast(`Exported ${filteredOrders.length} orders to CSV successfully.`);
    } else {
      showToast("No orders available to export.", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed top-20 right-8 z-50 p-4 rounded-[8px] shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#20885A]"
              : "bg-[#FEF2F2] border-[#ffdad6] text-[#DA1E28]"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Marketplace Orders
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#F4F1EA] text-[#6B6667] text-xs font-medium font-mono">
              {orderStats.all} Total
            </span>
          </div>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review customer orders and coordinate fulfillment across boutique vendors.
          </p>
        </div>

        {/* Header Actions: Refresh & Export */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors disabled:opacity-50"
            title="Refresh marketplace orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FF5A1F]" : "text-[#6B6667]"}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= ORDER STATUS TABS ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none custom-scrollbar border-b border-[#E4E0DB] whitespace-nowrap">
        {CANONICAL_STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-t-[8px] text-xs font-medium transition-all shrink-0 border-b-2 -mb-[1px] ${
                isActive
                  ? "border-[#FF5A1F] text-[#FF5A1F] bg-[#FFF0E8]/40"
                  : "border-transparent text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] ${
                  isActive
                    ? "bg-[#FF5A1F] text-white font-semibold"
                    : "bg-[#F4F1EA] text-[#6B6667]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <div className="p-3 bg-white rounded-[10px] border border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[260px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer, vendor..."
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[#E4E0DB] bg-white text-xs text-[#111111] placeholder:text-[#6B6667] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
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
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Fulfillment Type Dropdown */}
          <div className="relative">
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Fulfillment Types</option>
              <option value="Standard">Standard</option>
              <option value="Express (60m)">Express (60m)</option>
              <option value="Try & Buy">Try &amp; Buy</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#6B6667] absolute left-2.5 top-2.5 pointer-events-none" />
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="h-9 pl-8 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="h-9 px-3 rounded-[8px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] text-xs font-medium transition-colors inline-flex items-center gap-1"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* ================= DATA TABLE CONTAINER ================= */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4 py-2 font-medium">Order ID</th>
                <th className="px-3 py-2 font-medium">Order Time</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Vendor / Pickup Location</th>
                <th className="px-3 py-2 font-medium">Fulfillment</th>
                <th className="px-2 py-2 font-medium text-center">Items</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
                <th className="px-3 py-2 font-medium">Payment</th>
                <th className="px-3 py-2 font-medium">Order Status</th>
                <th className="px-3 py-2 font-medium">Assigned Partner</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-xs text-[#6B6667]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F] mx-auto mb-2" />
                    <span>Loading marketplace orders...</span>
                  </td>
                </tr>
              ) : apiError ? (
                <tr>
                  <td colSpan={11} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto text-xs text-[#DA1E28] space-y-2">
                      <AlertCircle className="w-8 h-8 mx-auto" />
                      <p className="font-semibold">{apiError}</p>
                      <button
                        type="button"
                        onClick={() => loadOrders()}
                        className="px-3 py-1.5 rounded-[8px] bg-[#DA1E28] text-white font-medium text-xs inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12">
                    <EmptyState
                      title="No marketplace orders found"
                      description="No orders match the current filter or search criteria."
                      actionLabel="Reset All Filters"
                      onAction={handleClearFilters}
                      icon="inbox"
                    />
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isReadyForPickup = order.status === "READY_FOR_PICKUP";
                  const totalUnits = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className={`h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors cursor-pointer border-b border-[#E4E0DB] ${
                        isReadyForPickup ? "bg-[#FFF0E8]/20" : ""
                      }`}
                    >
                      {/* Order ID */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="font-mono font-medium text-[#111111]">
                          #{order.orderNumber}
                        </span>
                      </td>

                      {/* Order Time */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-mono text-xs font-medium text-[#111111]">
                          {order.createdAt.includes("T")
                            ? order.createdAt.split("T")[1].slice(0, 5)
                            : order.createdAt}
                        </div>
                        <div className="text-[11px] text-[#6B6667]">
                          {order.history[order.history.length - 1]?.timestamp || "Recent"}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-medium text-[#111111]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-[#6B6667] font-mono whitespace-nowrap">
                          {order.customerPhone}
                        </div>
                      </td>

                      {/* Vendor / Pickup */}
                      <td className="px-3 py-2">
                        <div
                          className="font-medium text-[#111111] truncate max-w-[190px]"
                          title={order.vendorName}
                        >
                          {order.vendorName}
                        </div>
                        <div className="text-[11px] text-[#6B6667] flex items-center gap-1 truncate max-w-[190px]">
                          <MapPin className="w-3 h-3 text-[#FF5A1F] shrink-0" />
                          <span title={order.pickupHub}>{order.pickupHub}</span>
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge status={order.fulfillmentType} variant="fulfillment" />
                      </td>

                      {/* Items */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[11px] font-mono text-[#6B6667]">
                          {totalUnits} {totalUnits === 1 ? "item" : "items"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2 text-right whitespace-nowrap font-mono font-medium text-[#111111]">
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
                            <Bike className="w-3.5 h-3.5 text-[#20885A] shrink-0" />
                            <div>
                              <div className="font-medium text-xs text-[#111111]">
                                {order.assignedDriver.fullName}
                              </div>
                              <div className="text-[11px] text-[#6B6667] font-mono whitespace-nowrap">
                                {order.assignedDriver.vehicleRegistration}
                              </div>
                            </div>
                          </div>
                        ) : isReadyForPickup ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FEF2F2] text-[#DA1E28] border border-[#ffdad6]">
                            <AlertTriangle className="w-3 h-3" />
                            Awaiting Partner
                          </span>
                        ) : (
                          <span className="text-[#6B6667] text-[11px]">
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
                            className="h-8 px-2.5 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium shadow-xs transition-colors inline-flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        ) : (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 px-2.5 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#6B6667]" />
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

        {/* ================= PAGINATION FOOTER ================= */}
        <div className="px-4 py-3 bg-[#F4F1EA] border-t border-[#E4E0DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667]">
          <div className="font-mono">
            Showing <strong className="text-[#111111]">{filteredOrders.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-[#111111]">
              {Math.min(startIndex + PAGE_SIZE, filteredOrders.length)}
            </strong>{" "}
            of <strong className="text-[#111111]">{filteredOrders.length}</strong> orders
            {filteredOrders.length !== orders.length && (
              <span className="text-[#6B6667] font-sans">
                {" "}(filtered from {orders.length} total)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="px-2.5 py-1 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 rounded-[8px] font-medium text-xs transition-colors ${
                    isCurrent
                      ? "bg-[#FF5A1F] text-white shadow-xs"
                      : "border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="px-2.5 py-1 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors"
            >
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
