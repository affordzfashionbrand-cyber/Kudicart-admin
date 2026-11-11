"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Plus,
  X,
  Package,
  Info,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import {
  exportOrdersListToCSV,
  mapBackendOrderToWebOrder,
} from "@/lib/orderMappers";
import { Order, OrderStatus } from "@/types/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

const DOWNSTREAM_TRANSIT_STATUSES: readonly OrderStatus[] = [
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNING",
  "RETURNED",
];

function formatRelativeOrderTime(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorDashboardPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  const showToast = (text: string, tone: "success" | "error" = "success") => {
    setToastMessage({ text, tone });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const ordersQuery = useQuery({
    queryKey: ["vendor-orders", "dashboard"],
    queryFn: async () => {
      const res = await adminApi.vendorOrders.list();
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
  const storeName =
    ordersQuery.data?.storeName || "Vendor Store";

  const transitionMutation = useMutation({
    mutationFn: async ({
      orderId,
      action,
    }: {
      orderId: string;
      action: "ACCEPT" | "PREPARE" | "READY";
    }) => {
      if (action === "ACCEPT") return adminApi.vendorOrders.accept(orderId);
      if (action === "PREPARE") return adminApi.vendorOrders.prepare(orderId);
      return adminApi.vendorOrders.readyForPickup(orderId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      const label =
        variables.action === "ACCEPT"
          ? "ACCEPTED"
          : variables.action === "PREPARE"
          ? "PREPARING"
          : "READY_FOR_PICKUP";
      showToast(`Order transitioned to ${label}.`);
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to update order status.", "error");
    },
  });

  const counts = useMemo(() => {
    const placed = orders.filter((o) => o.status === "PLACED").length;
    const preparing = orders.filter((o) => o.status === "PREPARING").length;
    const readyForPickup = orders.filter(
      (o) => o.status === "READY_FOR_PICKUP"
    ).length;
    const inTransitOrDone = orders.filter((o) =>
      DOWNSTREAM_TRANSIT_STATUSES.includes(o.status)
    ).length;
    const activeTotal = orders.filter(
      (o) => o.status !== "CANCELLED" && o.status !== "FAILED"
    );
    const gmv = activeTotal.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const fulfilledCount = readyForPickup + inTransitOrDone;
    const fulfillmentRate =
      activeTotal.length > 0
        ? Math.round((fulfilledCount / activeTotal.length) * 1000) / 10
        : 0;
    return {
      total: orders.length,
      placed,
      preparing,
      readyForPickup,
      inTransitOrDone,
      gmv,
      fulfillmentRate,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeFilter === "PLACED") return o.status === "PLACED";
      if (activeFilter === "PREPARING") {
        return o.status === "ACCEPTED" || o.status === "PREPARING";
      }
      if (activeFilter === "READY_FOR_PICKUP") {
        return o.status === "READY_FOR_PICKUP";
      }
      if (activeFilter === "DISPATCHED") {
        return DOWNSTREAM_TRANSIT_STATUSES.includes(o.status);
      }
      return true;
    });
  }, [orders, activeFilter]);

  const handleExportCsv = () => {
    const exported = exportOrdersListToCSV(filteredOrders, "vendor_orders");
    if (!exported) {
      showToast("No orders available to export.", "error");
      return;
    }
    showToast(`Exported ${filteredOrders.length} orders to CSV.`);
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
              Accept incoming orders, mark them{" "}
              <code className="font-mono text-[#D94B17] bg-[#FFF0E8] px-1.5 py-0.5 rounded font-medium text-[11px]">
                READY_FOR_PICKUP
              </code>{" "}
              once packed. Affordz Central Operations manually assigns certified riders for delivery.
            </p>
          </div>
        </div>
        <Link
          href="/vendor/orders"
          className="text-[#D94B17] hover:underline text-xs font-medium shrink-0 self-end sm:self-auto"
        >
          Open Full Order Queue →
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            {storeName} — Orders &amp; Fulfillment
          </h1>
          <p className="text-xs text-[#6B6667] mt-1">
            Live order fulfillment scoped to your vendor store up to Ready for Pickup.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => ordersQuery.refetch()}
            disabled={ordersQuery.isFetching}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium rounded-[8px] transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#6B6667] ${
                ordersQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium rounded-[8px] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/vendor/products"
            className="h-9 px-4 bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Manage Catalog</span>
          </Link>
        </div>
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
          <div className="flex items-center gap-2.5 text-xs text-[#B91C1C]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {(ordersQuery.error as any)?.message ||
                "Unable to load live vendor orders from backend."}
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

      {/* 4 Live Vendor KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Store Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {counts.total}
            </span>
            {counts.placed > 0 && (
              <span className="text-xs font-medium text-[#D94B17]">
                {counts.placed} pending accept
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">
            Live database count for {storeName}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Ready for Pickup
            </span>
            <Package className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#D94B17]">
              {counts.readyForPickup}
            </span>
            <span className="text-[11px] text-[#6B6667]">
              Awaiting rider assignment
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">
            Staged for central operations dispatch
          </p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Active GMV
            </span>
            <span className="font-mono text-xs text-[#6B6667]">INR</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {formatINR(counts.gmv)}
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">
            Gross total across non-cancelled orders
          </p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Packing Completion
            </span>
            <Clock className="w-4 h-4 text-[#20885A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#20885A]">
              {counts.fulfillmentRate}%
            </span>
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">
            Orders packed to READY_FOR_PICKUP or beyond
          </p>
        </div>
      </div>

      {/* Orders Management Table Card */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E0DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Recent Boutique Orders
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[11px] font-mono text-[#6B6667]">
              {filteredOrders.length} shown
            </span>
          </div>

          {/* Canonical Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "ALL", label: `All (${counts.total})` },
              { id: "PLACED", label: `Placed (${counts.placed})` },
              { id: "PREPARING", label: `Prep (${counts.preparing})` },
              {
                id: "READY_FOR_PICKUP",
                label: `Ready (${counts.readyForPickup})`,
              },
              {
                id: "DISPATCHED",
                label: `Dispatched (${counts.inTransitOrDone})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors whitespace-nowrap ${
                  activeFilter === tab.id
                    ? "bg-[#111111] text-white"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Order ID &amp; Time</th>
                <th className="px-4">Garment / Item Details</th>
                <th className="px-4 text-center">Qty</th>
                <th className="px-4 text-right">Amount</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-4 text-right">Boutique Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {ordersQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-xs text-[#6B6667]"
                  >
                    Loading live boutique orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      title="No orders in this queue"
                      description="Orders placed for your store will appear here in real time."
                      actionLabel={
                        activeFilter !== "ALL" ? "View All Orders" : undefined
                      }
                      onAction={
                        activeFilter !== "ALL"
                          ? () => setActiveFilter("ALL")
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 15).map((order) => {
                  const totalQty = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  const firstItem = order.items[0];
                  const isBusy =
                    transitionMutation.isPending &&
                    transitionMutation.variables?.orderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                    >
                      <td className="px-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-[#FF5A1F]">
                          #{order.orderNumber}
                        </div>
                        <div className="text-[11px] text-[#6B6667] mt-0.5">
                          {formatRelativeOrderTime(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="font-medium text-[#111111] truncate max-w-[260px]">
                          {firstItem
                            ? `${firstItem.title}${
                                order.items.length > 1
                                  ? ` + ${order.items.length - 1} more`
                                  : ""
                              }`
                            : "Order Items"}
                        </div>
                        <div className="text-[11px] text-[#6B6667] mt-0.5">
                          {firstItem
                            ? `Size: ${firstItem.size} • ${order.customerName}`
                            : order.customerName}
                        </div>
                      </td>
                      <td className="px-4 text-center font-mono font-medium">
                        {totalQty}
                      </td>
                      <td className="px-4 text-right font-medium tabular-nums whitespace-nowrap">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td className="px-4 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} variant="order" />
                      </td>
                      <td className="px-4 text-right whitespace-nowrap">
                        {order.status === "PLACED" && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              transitionMutation.mutate({
                                orderId: order.id,
                                action: "ACCEPT",
                              })
                            }
                            className="h-7 px-2.5 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === "ACCEPTED" && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              transitionMutation.mutate({
                                orderId: order.id,
                                action: "PREPARE",
                              })
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
                              transitionMutation.mutate({
                                orderId: order.id,
                                action: "READY",
                              })
                            }
                            className="h-7 px-2.5 rounded-[6px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium shadow-2xs transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark Ready</span>
                          </button>
                        )}
                        {order.status === "READY_FOR_PICKUP" && (
                          <span className="text-[11px] text-[#B45309] font-medium">
                            Awaiting Admin Rider
                          </span>
                        )}
                        {DOWNSTREAM_TRANSIT_STATUSES.includes(order.status) && (
                          <span className="text-[11px] text-[#20885A] font-medium">
                            In Central Fulfillment
                          </span>
                        )}
                        {(order.status === "CANCELLED" ||
                          order.status === "FAILED") && (
                          <span className="text-[11px] text-[#B91C1C] font-medium">
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667] bg-[#F7F7F5]">
          <span>Displaying live store orders for {storeName}</span>
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
