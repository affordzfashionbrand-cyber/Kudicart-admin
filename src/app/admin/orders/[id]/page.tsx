"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MOCK_ORDERS } from "@/mocks/orders";
import { Order } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import { OrderLifecycleTimeline } from "@/components/admin/OrderLifecycleTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ManualDeliveryAssignmentDrawer } from "@/components/admin/ManualDeliveryAssignmentDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  // Find order from fixtures
  const initialOrder = MOCK_ORDERS.find(
    (o) => o.id === orderId || o.orderNumber === orderId
  ) || MOCK_ORDERS[0];

  const [order, setOrder] = useState<Order>(initialOrder);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto">
        <EmptyState
          title="Order Not Found"
          description={`Could not locate marketplace record for identifier "${orderId}".`}
          actionLabel="Back to Orders Queue"
          onAction={() => router.push("/admin/orders")}
          icon="search_off"
        />
      </div>
    );
  }

  const isReadyForPickup = order.status === "READY_FOR_PICKUP";
  const isAssigned = order.status === "ASSIGNED" || !!order.assignedDriver;
  const totalUnits = order.items.reduce((acc, it) => acc + it.quantity, 0);

  const handleConfirmAssignment = (assignedOrderId: string, driver: DeliveryPartner) => {
    setOrder((prev) => ({
      ...prev,
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
        ...prev.history,
        {
          status: "ASSIGNED",
          timestamp: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST",
          performer: "Central Ops Admin",
          note: `Dispatched to ${driver.fullName}`,
        },
      ],
    }));

    setSuccessToast(`Dispatched to ${driver.fullName} (${driver.driverCode})`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#20885A] shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* ================= 1. BREADCRUMBS & TOP NAV ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#6B6667]">
          <Link href="/admin/orders" className="hover:text-[#111111] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Orders</span>
          </Link>
          <span className="text-[#E4E0DB]">/</span>
          <span className="font-mono text-[#111111] font-semibold">#{order.orderNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#6B6667]">
            Channel: <strong className="text-[#111111]">KudiCart Direct</strong>
          </span>
        </div>
      </div>

      {/* ================= 2. PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#111111] whitespace-nowrap">
              #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} variant="order" />
            {order.isTryAndBuy && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                Try &amp; Buy Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6667] mt-1.5 font-mono">
            {order.createdAt} • Hub:{" "}
            <span className="font-sans font-semibold text-[#111111]">{order.pickupHub}</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="h-9 px-3.5 bg-white text-[#111111] border border-[#E4E0DB] rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F7F7F5] transition-colors shadow-xs"
            >
              <span>More Actions</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E4E0DB] rounded-lg shadow-lg py-1 z-30 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    alert("Order invoice generated.");
                    setShowMoreActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#111111] hover:bg-[#F7F7F5] text-left"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#6B6667]">print</span>
                  <span>Print Commercial Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Contacting vendor: ${order.vendorName}`);
                    setShowMoreActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#111111] hover:bg-[#F7F7F5] text-left"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#6B6667]">call</span>
                  <span>Contact Boutique Manager</span>
                </button>
                <div className="border-t border-[#E4E0DB] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    alert("Order flagged for audit inspection.");
                    setShowMoreActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#DA1E28] hover:bg-[#FEF2F2] text-left"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#DA1E28]">flag</span>
                  <span>Flag Operational Exception</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary CTA: Assign Delivery Partner */}
          {isReadyForPickup && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="h-9 px-4 bg-[#FF5A1F] text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#D94B17] active:scale-[0.98] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>Assign Delivery Partner</span>
            </button>
          )}
        </div>
      </section>

      {/* ================= 3. ORDER LIFECYCLE TIMELINE ================= */}
      <OrderLifecycleTimeline
        currentStatus={order.status}
        history={order.history}
      />

      {/* ================= 4. TWO-COLUMN OPERATIONAL LAYOUT (65% / 35%) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          {/* ORDER ITEMS TABLE */}
          <section className="bg-white border border-[#E4E0DB] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[#E4E0DB] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-[#111111]">
                  Order Items ({order.items.length} products, {totalUnits} units)
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]">
                  Fulfillment SLA: High Priority
                </span>
              </div>
              <span className="text-xs text-[#6B6667]">
                Merchant: <strong className="text-[#111111] font-semibold">{order.vendorName}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="h-9 bg-[#F7F7F5] text-[#6B6667] border-b border-[#E4E0DB] text-[11px] font-bold uppercase tracking-wider">
                    <th className="pl-5 pr-2 w-14">Item</th>
                    <th className="px-3">Product Name &amp; Brand</th>
                    <th className="px-3">Size / Trial Option</th>
                    <th className="px-3 text-center">Qty</th>
                    <th className="px-3 text-right">Unit Price</th>
                    <th className="pr-5 pl-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0DB] text-xs">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="pl-5 pr-2 py-3.5">
                        <div className="w-12 h-14 rounded-md bg-[#F4F1EA] border border-[#E4E0DB] overflow-hidden shrink-0 flex items-center justify-center text-[#6B6667]">
                          <span className="material-symbols-outlined text-[20px]">
                            checkroom
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-[#111111] leading-tight">
                          {item.title}
                        </p>
                        <p className="font-mono text-[11px] text-[#6B6667] mt-0.5">
                          Brand: {item.brand}
                        </p>
                        {item.trialSize && (
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold text-[#FF5A1F] bg-[#FFF0E8] px-1.5 py-0.5 rounded border border-[#FF5A1F]/20">
                            Try &amp; Buy Tagged
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[#111111] block font-medium">
                          Size: {item.size}
                        </span>
                        {item.trialSize && (
                          <span className="text-[#6B6667] text-[11px] block">
                            Trial Alt: {item.trialSize}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono font-semibold text-[#111111]">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-[#6B6667]">
                        {formatINR(item.price)}
                      </td>
                      <td className="pr-5 pl-3 py-3.5 text-right font-mono font-bold text-[#111111]">
                        {formatINR(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-[#F7F7F5] border-t border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[#6B6667]">
                Packaging: <strong className="text-[#111111] font-medium">Eco-Friendly Cotton Canvas Tote + Garment Sleeves</strong>
              </span>
              <div className="flex items-center gap-5">
                <span className="text-[#6B6667]">
                  Units: <strong className="text-[#111111] font-mono font-semibold">{totalUnits}</strong>
                </span>
                <span className="text-[#6B6667]">
                  Fulfillment: <strong className="text-[#111111] font-semibold">{order.fulfillmentType}</strong>
                </span>
              </div>
            </div>
          </section>

          {/* TRY & BUY MANIFEST (Only rendered if applicable) */}
          {order.isTryAndBuy && order.tryAndBuyDetails && (
            <section className="bg-white border border-[#E4E0DB] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] flex items-center justify-center text-[#FF5A1F]">
                    <span className="material-symbols-outlined text-[19px]">checkroom</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">Try &amp; Buy Manifest</h3>
                    <p className="text-[11px] text-[#6B6667]">Doorstep Fitting Trial Verification</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                  Doorstep Trial Approved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5]">
                  <div className="flex items-center gap-1.5 text-[#6B6667] text-xs mb-1">
                    <span className="material-symbols-outlined text-[16px] text-[#FF5A1F]">verified</span>
                    <span className="font-semibold text-[#111111]">Trial Window</span>
                  </div>
                  <p className="text-xs font-bold text-[#111111]">
                    Customer Window: {order.tryAndBuyDetails.trialDurationMinutes} Minutes
                  </p>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">Fitting confirmation at customer residence</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E4E0DB] bg-[#F7F7F5]">
                  <div className="flex items-center gap-1.5 text-[#6B6667] text-xs mb-1">
                    <span className="material-symbols-outlined text-[16px] text-[#FF5A1F]">inventory_2</span>
                    <span className="font-semibold text-[#111111]">Return Manifest</span>
                  </div>
                  <p className="text-xs font-bold text-[#111111] font-mono">
                    {order.tryAndBuyDetails.returnManifestId || "TR-MNF-ACTIVE"}
                  </p>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">Tamper seals must remain intact</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#6B6667] text-[18px] shrink-0 mt-0.5">info</span>
                <p className="text-xs text-[#6B6667] leading-relaxed">
                  Delivery partner allows up to {order.tryAndBuyDetails.trialDurationMinutes} minutes for doorstep fitting. Unaccepted items must be secured into tamper-evident return satchels with customer OTP confirmation.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN (col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. DISPATCH CONTROL PANEL */}
          <section
            className={`bg-white rounded-xl p-5 shadow-xs transition-all ${
              isAssigned
                ? "border-2 border-[#A7F3D0]"
                : isReadyForPickup
                ? "border-2 border-[#F59E0B]"
                : "border border-[#E4E0DB]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isAssigned
                      ? "text-[#20885A]"
                      : isReadyForPickup
                      ? "text-[#D97706]"
                      : "text-[#6B6667]"
                  }`}
                >
                  {isAssigned ? "verified" : isReadyForPickup ? "warning" : "local_shipping"}
                </span>
                <h3 className="text-sm font-bold text-[#111111]">Dispatch Control</h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isAssigned
                    ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                    : isReadyForPickup
                    ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                    : "bg-[#F7F7F5] text-[#6B6667] border-[#E4E0DB]"
                }`}
              >
                {isAssigned
                  ? "Partner Assigned"
                  : isReadyForPickup
                  ? "Awaiting Assignment"
                  : order.status}
              </span>
            </div>

            <div className="mt-3.5 space-y-3.5">
              {isAssigned && order.assignedDriver ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#ECFDF5]/60 border border-[#A7F3D0] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#111111]">
                        {order.assignedDriver.fullName}
                      </div>
                      <div className="text-[11px] text-[#6B6667] font-mono">
                        {order.assignedDriver.vehicleModel} • {order.assignedDriver.vehicleRegistration}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#20885A] text-[20px]">
                      check_circle
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B6667]">
                    <span>Driver Contact:</span>
                    <span className="font-mono text-[#111111] font-semibold">
                      {order.assignedDriver.phone}
                    </span>
                  </div>
                </div>
              ) : isReadyForPickup ? (
                <>
                  <p className="text-xs text-[#6B6667] leading-relaxed">
                    This order is packed by {order.vendorName} and ready for pickup at {order.pickupHub}. Assign an available delivery partner now.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full h-10 bg-[#FF5A1F] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#D94B17] active:scale-[0.98] transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    <span>Assign Delivery Partner</span>
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#6B6667] leading-relaxed">
                  Dispatch assignment will be unlocked as soon as the merchant boutique finishes packing and marks the order as <code className="font-mono text-[#D94B17] font-semibold">READY_FOR_PICKUP</code>.
                </p>
              )}
            </div>
          </section>

          {/* 2. CUSTOMER & DELIVERY ADDRESS */}
          <section className="bg-white border border-[#E4E0DB] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
              <h3 className="text-sm font-bold text-[#111111]">Customer &amp; Address</h3>
              <span className="material-symbols-outlined text-[#6B6667] text-[18px]">person</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#111111]">{order.customerName}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#20885A]">
                  Verified Buyer
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-[#6B6667]">
                  <span className="material-symbols-outlined text-[15px]">phone</span>
                  <span className="font-mono text-[#111111]">{order.customerPhone}</span>
                </div>
              </div>
            </div>
            <div className="pt-2.5 border-t border-[#E4E0DB]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B6667]">
                Destination Locality
              </p>
              <p className="text-xs text-[#111111] mt-1 leading-relaxed">
                {order.customerAddress.line1}, {order.customerAddress.locality}, {order.customerAddress.city}{" "}
                {order.customerAddress.pincode}
              </p>
              <div className="mt-2.5 p-2 rounded bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2">
                <span className="material-symbols-outlined text-[#FF5A1F] text-[16px] shrink-0 mt-0.5">
                  comment
                </span>
                <p className="text-[11px] text-[#6B6667] leading-tight">
                  <strong className="text-[#111111]">Delivery Address Label:</strong>{" "}
                  {order.customerAddress.label}
                </p>
              </div>
            </div>
          </section>

          {/* 3. VENDOR & PICKUP HUB */}
          <section className="bg-white border border-[#E4E0DB] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
              <h3 className="text-sm font-bold text-[#111111]">Vendor &amp; Pickup Hub</h3>
              <span className="material-symbols-outlined text-[#6B6667] text-[18px]">store</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#111111]">{order.vendorName}</p>
                <span className="font-mono text-[11px] text-[#6B6667]">#{order.vendorId}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6667] block">
                  Pickup Hub Node:
                </span>
                <span className="font-medium text-[#111111]">{order.pickupHub}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6667] block">
                  Node Address:
                </span>
                <span className="font-medium text-[#111111]">{order.pickupAddress}</span>
              </div>
            </div>
          </section>

          {/* 4. FINANCIAL SUMMARY */}
          <section className="bg-white border border-[#E4E0DB] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
              <h3 className="text-sm font-bold text-[#111111]">Financial Summary</h3>
              <StatusBadge status={order.paymentStatus} variant="payment" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#6B6667]">
                <span>Items Total</span>
                <span className="font-mono text-[#111111]">{formatINR(order.itemTotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B6667]">
                <span>Logistics &amp; Delivery Fee</span>
                <span className="font-mono text-[#111111]">{formatINR(order.deliveryFee)}</span>
              </div>
              {order.isTryAndBuy && (
                <div className="flex justify-between text-[#6B6667]">
                  <span>Try &amp; Buy Convenience Surcharge</span>
                  <span className="font-mono text-[#111111]">{formatINR(150.0)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B6667]">
                <span>Taxes &amp; GST</span>
                <span className="font-mono text-[#111111]">{formatINR(order.taxes)}</span>
              </div>
              <div className="pt-2 border-t border-[#E4E0DB] flex justify-between items-baseline">
                <span className="font-bold text-[#111111] text-xs">Grand Total</span>
                <span className="font-mono font-bold text-base text-[#111111]">
                  {formatINR(order.grandTotal)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Manual Delivery Partner Assignment Drawer */}
      <ManualDeliveryAssignmentDrawer
        order={order}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConfirmAssignment={handleConfirmAssignment}
      />
    </div>
  );
}
