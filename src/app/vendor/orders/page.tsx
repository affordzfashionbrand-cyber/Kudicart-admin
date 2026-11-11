"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  CheckCircle2,
  X,
  Check,
  CheckCheck,
  Package,
  AlertTriangle,
  RefreshCw,
  Ban,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { adminApi } from "@/lib/api";
import {
  formatFulfillmentBadgeLabel,
  mapBackendOrderToWebOrder,
} from "@/lib/orderMappers";
import { Order, OrderStatus } from "@/types/orders";

const VENDOR_TABS: { id: string; label: string }[] = [
  { id: "ALL", label: "All Orders" },
  { id: "PLACED", label: "New (Placed)" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "PREPARING", label: "Preparing" },
  { id: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "PICKED_UP", label: "Picked Up" },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "RETURNING", label: "Returning" },
  { id: "RETURNED", label: "Returned" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "FAILED", label: "Failed" },
];

function VendorOrdersContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearchParam = searchParams.get("search");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>(() => urlSearchParam || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (urlSearchParam !== null) {
      setSearchTerm(urlSearchParam);
    }
  }, [urlSearchParam]);
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  const showToast = (text: string, tone: "success" | "error" = "success") => {
    setToastMessage({ text, tone });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const ordersQuery = useQuery({
    queryKey: ["vendor-orders", "queue", activeTab],
    queryFn: async () => {
      const res = await adminApi.vendorOrders.list(activeTab);
      return {
        storeName: res.storeName,
        orders: res.orders.map(mapBackendOrderToWebOrder),
      };
    },
    refetchInterval: 20_000,
  });

  const orders: Order[] = useMemo(
    () => ordersQuery.data?.orders ?? [],
    [ordersQuery.data?.orders]
  );

  const transitionMutation = useMutation({
    mutationFn: async ({
      order,
      nextStatus,
      reason,
    }: {
      order: Order;
      nextStatus: "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "CANCELLED";
      reason?: string;
    }) => {
      if (nextStatus === "ACCEPTED") {
        return adminApi.vendorOrders.accept(order.id);
      }
      if (nextStatus === "PREPARING") {
        return adminApi.vendorOrders.prepare(order.id);
      }
      if (nextStatus === "READY_FOR_PICKUP") {
        return adminApi.vendorOrders.readyForPickup(order.id);
      }
      return adminApi.vendorOrders.reject(
        order.id,
        reason || "Rejected by vendor",
        order.version
      );
    },
    onSuccess: (updatedRaw, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      const mapped = mapBackendOrderToWebOrder(updatedRaw);
      if (selectedOrder && selectedOrder.id === mapped.id) {
        setSelectedOrder(mapped);
      }
      setRejectTarget(null);
      setRejectReason("");
      showToast(`Order #${variables.order.orderNumber} updated to ${variables.nextStatus}.`);
    },
    onError: (err: any) => {
      showToast(err?.message || "Order transition failed.", "error");
    },
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesNumber = o.orderNumber.toLowerCase().includes(q);
        const matchesGroup =
          (o.groupNumber || "").toLowerCase().includes(q) ||
          (o.checkoutGroupId || "").toLowerCase().includes(q);
        const matchesCustomer = o.customerName.toLowerCase().includes(q);
        const matchesCity = o.customerAddress.city.toLowerCase().includes(q);
        if (!matchesNumber && !matchesGroup && !matchesCustomer && !matchesCity) {
          return false;
        }
      }
      if (activeTab === "ALL") return true;
      return o.status === activeTab;
    });
  }, [orders, activeTab, searchTerm]);

  const checkoutGroupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) {
      if (o.checkoutGroupId) {
        counts.set(o.checkoutGroupId, (counts.get(o.checkoutGroupId) ?? 0) + 1);
      }
    }
    return counts;
  }, [orders]);

  const handleTransition = (
    order: Order,
    nextStatus: "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP"
  ) => {
    transitionMutation.mutate({ order, nextStatus });
  };

  const confirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      showToast("Please enter a rejection reason before rejecting.", "error");
      return;
    }
    transitionMutation.mutate({
      order: rejectTarget,
      nextStatus: "CANCELLED",
      reason: rejectReason.trim(),
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Boutique Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Accept, pack, and stage customer orders up to Ready for Pickup for manual Admin rider dispatch.
          </p>
        </div>

        <button
          onClick={() => ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
          className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium rounded-[8px] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-[#6B6667] ${
              ordersQuery.isFetching ? "animate-spin" : ""
            }`}
          />
          <span>Refresh Queue</span>
        </button>
      </div>

      {toastMessage && (
        <div
          className={`p-3 border rounded-[8px] flex items-center justify-between text-xs ${
            toastMessage.tone === "error"
              ? "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]"
              : "bg-[#ECFDF5] border-[#A7F3D0] text-[#20885A]"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.tone === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {ordersQuery.isError && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#B91C1C]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {(ordersQuery.error as any)?.message ||
                "Failed to load orders from backend."}
            </span>
          </div>
          <button
            onClick={() => ordersQuery.refetch()}
            className="h-8 px-3 rounded-[6px] bg-white border border-[#FECACA] text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs & Search Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {VENDOR_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#111111] text-white"
                  : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6667]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order or customer..."
            className="w-full h-[36px] pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111] placeholder:text-[#6B6667]"
          />
        </div>
      </section>

      {/* Orders Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E0DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Order Queue
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono bg-[#F4F1EA] text-[#6B6667]">
              {filteredOrders.length} of {orders.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Order ID &amp; Time</th>
                <th className="px-4">Customer &amp; Area</th>
                <th className="px-4">Items / Details</th>
                <th className="px-4">Fulfillment</th>
                <th className="px-4 text-right">Total Amount</th>
                <th className="px-4 text-center">Order Status</th>
                <th className="px-4 text-right">Vendor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {ordersQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-xs text-[#6B6667]"
                  >
                    Fetching orders from PostgreSQL...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <EmptyState
                      title="No orders found"
                      description="Try clearing your search query or switching tabs."
                      actionLabel="Show All Orders"
                      onAction={() => {
                        setSearchTerm("");
                        setActiveTab("ALL");
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isBusy =
                    transitionMutation.isPending &&
                    transitionMutation.variables?.order.id === order.id;
                  const areaText = [
                    order.customerAddress.locality,
                    order.customerAddress.city,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <tr
                      key={order.id}
                      className="h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                    >
                      <td className="px-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-[#FF5A1F]">
                          #{order.orderNumber}
                        </div>
                        {order.checkoutGroupId && (
                          <button
                            type="button"
                            onClick={() =>
                              setSearchTerm(order.groupNumber || order.checkoutGroupId || "")
                            }
                            title="Filter split orders in this checkout group"
                            className="mt-0.5 inline-flex items-center px-1.5 py-0.2 rounded-[4px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-mono hover:bg-[#DBEAFE] transition-colors"
                          >
                            Split: {order.groupNumber || order.checkoutGroupId.slice(0, 8)}
                            {(checkoutGroupCounts.get(order.checkoutGroupId) ?? 0) > 1
                              ? ` (${checkoutGroupCounts.get(order.checkoutGroupId)})`
                              : ""}
                          </button>
                        )}
                        <div className="text-[11px] text-[#6B6667] mt-0.5">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="font-medium text-[#111111]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-[#6B6667] mt-0.5">
                          {areaText || order.customerAddress.line1 || "Delivery address"}
                        </div>
                      </td>
                      <td className="px-4 max-w-[240px]">
                        <div className="truncate font-medium text-[#111111]">
                          {order.items
                            .map((i) => `${i.quantity}x ${i.title}`)
                            .join(", ") || "Order items"}
                        </div>
                        <div className="text-[11px] text-[#6B6667] truncate mt-0.5">
                          {order.items[0]
                            ? `Size: ${order.items[0].size}`
                            : `${order.items.length} item(s)`}
                        </div>
                        {order.deliveryInstructions && (
                          <div
                            className="text-[10px] text-[#D94B17] truncate mt-0.5"
                            title={order.deliveryInstructions}
                          >
                            Note: {order.deliveryInstructions}
                          </div>
                        )}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <span className="text-xs text-[#6B6667]">
                          {formatFulfillmentBadgeLabel(order)}
                        </span>
                      </td>
                      <td className="px-4 text-right font-medium tabular-nums whitespace-nowrap">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td className="px-4 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} variant="order" />
                      </td>
                      <td className="px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === "PLACED" && (
                            <>
                              <button
                                disabled={isBusy}
                                onClick={() =>
                                  handleTransition(order, "ACCEPTED")
                                }
                                className="h-7 px-2.5 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept</span>
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => {
                                  setRejectTarget(order);
                                  setRejectReason("");
                                }}
                                className="h-7 px-2.5 rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] text-xs font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {order.status === "ACCEPTED" && (
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleTransition(order, "PREPARING")
                              }
                              className="h-7 px-2.5 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Start Prep
                            </button>
                          )}
                          {order.status === "PREPARING" && (
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleTransition(order, "READY_FOR_PICKUP")
                              }
                              className="h-7 px-2.5 rounded-[6px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Mark Ready</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Order Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={confirmReject}
            className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <h3 className="text-[15px] font-semibold text-[#111111]">
                Reject Order #{rejectTarget.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#6B6667]">
              Rejecting a PLACED order cancels it, restores item inventory, and triggers a refund if already paid online.
            </p>
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1.5">
                Reason for rejection
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Selected size out of stock in boutique..."
                className="w-full p-2.5 text-xs border border-[#E4E0DB] rounded-[8px] bg-[#F7F7F5] focus:outline-none focus:border-[#FF5A1F] focus:bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-3.5 py-1.5 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={transitionMutation.isPending}
                className="px-3.5 py-1.5 bg-[#DA1E28] hover:bg-[#B91C1C] text-white rounded-[8px] text-xs font-medium disabled:opacity-50"
              >
                {transitionMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2 flex-wrap">
                <Package className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Order #{selectedOrder.orderNumber}
                </h3>
                {selectedOrder.checkoutGroupId && (
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-mono">
                    Split Group: {selectedOrder.groupNumber || selectedOrder.checkoutGroupId.slice(0, 8)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex justify-between items-center gap-4">
                <div>
                  <span className="text-[#6B6667] block">Customer:</span>
                  <span className="font-semibold text-[#111111] mt-0.5 block">
                    {selectedOrder.customerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#6B6667] block">Delivery Location:</span>
                  <span className="font-medium text-[#111111] mt-0.5 block">
                    {[
                      selectedOrder.customerAddress.locality,
                      selectedOrder.customerAddress.city,
                    ]
                      .filter(Boolean)
                      .join(", ") || selectedOrder.customerAddress.line1}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#6B6667] uppercase tracking-wider block mb-2">
                  Garments in Order
                </span>
                <div className="border border-[#E4E0DB] rounded-[8px] divide-y divide-[#E4E0DB]">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-[#111111]">
                          {item.quantity}x {item.title}
                        </div>
                        <div className="text-[11px] text-[#6B6667] mt-0.5">
                          Size: {item.size}
                          {item.trialSize ? ` • Trial size: ${item.trialSize}` : ""}
                        </div>
                      </div>
                      <div className="font-medium tabular-nums text-[#111111]">
                        {formatINR(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#E4E0DB]">
                <span className="font-medium text-[#111111]">Grand Total:</span>
                <span className="font-semibold text-sm font-mono text-[#111111]">
                  {formatINR(selectedOrder.grandTotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E4E0DB]">
              <div className="text-[11px] text-[#6B6667] flex items-center gap-2">
                <span>Status:</span>
                <StatusBadge
                  status={selectedOrder.status as OrderStatus}
                  variant="order"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedOrder.status === "PLACED" && (
                  <button
                    disabled={transitionMutation.isPending}
                    onClick={() => handleTransition(selectedOrder, "ACCEPTED")}
                    className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded-[8px] text-xs font-medium transition-colors"
                  >
                    Accept Order
                  </button>
                )}
                {selectedOrder.status === "ACCEPTED" && (
                  <button
                    disabled={transitionMutation.isPending}
                    onClick={() => handleTransition(selectedOrder, "PREPARING")}
                    className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded-[8px] text-xs font-medium transition-colors"
                  >
                    Start Prep
                  </button>
                )}
                {selectedOrder.status === "PREPARING" && (
                  <button
                    disabled={transitionMutation.isPending}
                    onClick={() =>
                      handleTransition(selectedOrder, "READY_FOR_PICKUP")
                    }
                    className="px-3.5 py-1.5 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium transition-colors"
                  >
                    Mark Ready for Pickup
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-1.5 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <div className="h-40 rounded-[10px] bg-white border border-[#E4E0DB] animate-pulse" />
        </div>
      }
    >
      <VendorOrdersContent />
    </Suspense>
  );
}
