"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  X,
  ChevronDown,
  Eye,
  Check,
  CheckCheck,
  ArrowRight,
  Package,
  MapPin,
  Clock,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

type VendorFulfillmentStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "HANDED_OVER";

interface VendorOrder {
  id: string;
  orderNumber: string;
  placedTime: string;
  customerName: string;
  customerArea: string;
  items: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: VendorFulfillmentStatus;
  fulfillmentType: "Standard" | "Try & Buy" | "Express (60m)";
}

const INITIAL_ORDERS: VendorOrder[] = [
  {
    id: "vo-1",
    orderNumber: "KC-98210",
    placedTime: "10:14 AM (18m ago)",
    customerName: "Priya Sharma",
    customerArea: "Bandra West, Mumbai",
    items: [
      {
        title: "Silk Kaftan Dress",
        variant: "Size: 42 • Emerald Green",
        quantity: 2,
        price: 14850,
      },
    ],
    totalAmount: 14850,
    status: "PREPARING",
    fulfillmentType: "Standard",
  },
  {
    id: "vo-2",
    orderNumber: "KC-98208",
    placedTime: "09:42 AM (50m ago)",
    customerName: "Rohan Deshmukh",
    customerArea: "Khar West, Mumbai",
    items: [
      {
        title: "Structured Linen Blazer",
        variant: "Size: 38 • Raw Chalk",
        quantity: 1,
        price: 9200,
      },
    ],
    totalAmount: 9200,
    status: "READY_FOR_PICKUP",
    fulfillmentType: "Try & Buy",
  },
  {
    id: "vo-3",
    orderNumber: "KC-98205",
    placedTime: "08:30 AM (2h ago)",
    customerName: "Ananya Mehta",
    customerArea: "Juhu, Mumbai",
    items: [
      {
        title: "Hand-Embroidered Kurta",
        variant: "Size: 40 • Deep Ochre",
        quantity: 1,
        price: 6450,
      },
    ],
    totalAmount: 6450,
    status: "READY_FOR_PICKUP",
    fulfillmentType: "Express (60m)",
  },
  {
    id: "vo-4",
    orderNumber: "KC-98201",
    placedTime: "08:10 AM (2.5h ago)",
    customerName: "Vikram Malhotra",
    customerArea: "Santacruz West, Mumbai",
    items: [
      {
        title: "Pleated Palazzo Pants",
        variant: "Size: M • Ivory",
        quantity: 1,
        price: 5200,
      },
    ],
    totalAmount: 5200,
    status: "ACCEPTED",
    fulfillmentType: "Standard",
  },
  {
    id: "vo-5",
    orderNumber: "KC-98199",
    placedTime: "Yesterday 18:20",
    customerName: "Zoya Akhtar",
    customerArea: "Bandra West, Mumbai",
    items: [
      {
        title: "Handloom Tussar Sari",
        variant: "Free Size • Royal Indigo",
        quantity: 1,
        price: 18500,
      },
    ],
    totalAmount: 18500,
    status: "HANDED_OVER",
    fulfillmentType: "Standard",
  },
  {
    id: "vo-6",
    orderNumber: "KC-98194",
    placedTime: "Yesterday 16:05",
    customerName: "Kabir Bedi",
    customerArea: "Pali Hill, Mumbai",
    items: [
      {
        title: "Organza Dupatta Set",
        variant: "Free Size • Pastel Coral",
        quantity: 1,
        price: 4800,
      },
    ],
    totalAmount: 4800,
    status: "HANDED_OVER",
    fulfillmentType: "Standard",
  },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesNumber = o.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = o.customerName.toLowerCase().includes(q);
        if (!matchesNumber && !matchesCustomer) return false;
      }

      if (activeTab === "ALL") return true;
      return o.status === activeTab;
    });
  }, [orders, activeTab, searchTerm]);

  const updateStatus = (id: string, newStatus: VendorFulfillmentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    setToastMessage(`Order status updated to ${newStatus}.`);
    setTimeout(() => setToastMessage(null), 3000);
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
            Accept and prepare incoming customer orders for central dispatch handover.
          </p>
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

      {/* Tabs & Search Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ACCEPTED", label: "Accepted" },
            { id: "PREPARING", label: "Preparing" },
            { id: "READY_FOR_PICKUP", label: "Ready for Pickup" },
            { id: "HANDED_OVER", label: "Handed Over" },
          ].map((tab) => (
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

        {/* Search */}
        <div className="relative w-64">
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
                <th className="px-4 text-center">Fulfillment Status</th>
                <th className="px-4 text-right">Vendor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredOrders.length === 0 ? (
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
                filteredOrders.map((order) => (
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
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-[#6B6667] mt-0.5">
                        {order.customerArea}
                      </div>
                    </td>
                    <td className="px-4 max-w-[220px]">
                      <div className="truncate font-medium text-[#111111]">
                        {order.items.map((i) => `${i.quantity}x ${i.title}`).join(", ")}
                      </div>
                      <div className="text-[11px] text-[#6B6667] truncate mt-0.5">
                        {order.items[0]?.variant}
                      </div>
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <span className="text-xs text-[#6B6667]">
                        {order.fulfillmentType}
                      </span>
                    </td>
                    <td className="px-4 text-right font-medium tabular-nums whitespace-nowrap">
                      {formatINR(order.totalAmount)}
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {order.status === "PLACED" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]">
                          Placed
                        </span>
                      )}
                      {order.status === "ACCEPTED" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#EFF6FF] text-[#0043CE] border border-[#BFDBFE]">
                          Accepted
                        </span>
                      )}
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
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === "ACCEPTED" && (
                          <button
                            onClick={() => updateStatus(order.id, "PREPARING")}
                            className="h-7 px-2.5 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium transition-colors"
                          >
                            Start Prep
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button
                            onClick={() => updateStatus(order.id, "READY_FOR_PICKUP")}
                            className="h-7 px-2.5 rounded-[6px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex justify-between items-center">
                <div>
                  <span className="text-[#6B6667] block">Customer:</span>
                  <span className="font-semibold text-[#111111] mt-0.5 block">
                    {selectedOrder.customerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#6B6667] block">Delivery Location:</span>
                  <span className="font-medium text-[#111111] mt-0.5 block">
                    {selectedOrder.customerArea}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#6B6667] uppercase tracking-wider block mb-2">
                  Garments in Order
                </span>
                <div className="border border-[#E4E0DB] rounded-[8px] divide-y divide-[#E4E0DB]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-[#111111]">
                          {item.quantity}x {item.title}
                        </div>
                        <div className="text-[11px] text-[#6B6667] mt-0.5">
                          {item.variant}
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
                  {formatINR(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E4E0DB]">
              <div className="text-[11px] text-[#6B6667]">
                Status: <strong className="text-[#111111]">{selectedOrder.status}</strong>
              </div>
              <div className="flex items-center gap-2">
                {selectedOrder.status === "PREPARING" && (
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "READY_FOR_PICKUP");
                      setSelectedOrder(null);
                    }}
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
