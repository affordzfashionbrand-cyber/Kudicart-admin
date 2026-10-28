"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Printer,
  Store,
  Truck,
  Shirt,
  Clock,
  Package,
  Info,
  User,
  Phone,
  MapPin,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Order } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import { getDemoOrderById } from "@/demo-data/orders";
import { OrderLifecycleTimeline } from "@/components/admin/OrderLifecycleTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ManualDeliveryAssignmentDrawer } from "@/components/admin/ManualDeliveryAssignmentDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load order by ID from demonstration dataset
  useEffect(() => {
    if (!orderId) return;

    setIsLoading(true);
    setLoadError(null);

    const found = getDemoOrderById(orderId);
    if (found) {
      setOrder(found);
    } else {
      setLoadError(`Could not locate marketplace record for identifier "${orderId}".`);
    }
    setIsLoading(false);
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs text-[#6B6667]">
          <Link href="/admin/orders" className="hover:text-[#111111] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <span>/</span>
          <span className="font-mono">Loading...</span>
        </div>

        <div className="h-16 rounded-[10px] bg-white border border-[#E4E0DB] p-4 animate-pulse flex items-center justify-between" />
        <div className="h-28 rounded-[10px] bg-white border border-[#E4E0DB] p-4 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-96 rounded-[10px] bg-white border border-[#E4E0DB] animate-pulse" />
          <div className="lg:col-span-4 h-96 rounded-[10px] bg-white border border-[#E4E0DB] animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto">
        <EmptyState
          title="Order Not Found"
          description={loadError || `Could not locate marketplace record for identifier "${orderId}".`}
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

  const handleConfirmAssignment = async (assignedOrderId: string, driver: DeliveryPartner) => {
    showToast(
      "Not connected in this build: Delivery partner assignment requires backend service.",
      "error"
    );
  };

  const handlePrintInvoice = () => {
    setShowMoreActions(false);
    window.print();
  };

  const handleContactVendor = () => {
    setShowMoreActions(false);
    showToast(`Boutique Contact: ${order.vendorName} • Pickup Hub: ${order.pickupHub}`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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

      {/* ================= 1. BREADCRUMBS & TOP NAV ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#6B6667]">
          <Link href="/admin/orders" className="hover:text-[#111111] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <span className="text-[#E4E0DB]">/</span>
          <span className="font-mono text-[#111111] font-semibold">#{order.orderNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#6B6667]">
            Channel: <strong className="text-[#111111] font-medium">KudiCart Direct</strong>
          </span>
        </div>
      </div>

      {/* ================= 2. PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[26px] font-semibold font-mono tracking-tight text-[#111111] whitespace-nowrap">
              #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} variant="order" />
            {order.isTryAndBuy && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-medium bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                Try &amp; Buy Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6667] mt-1 font-mono">
            Created: {order.createdAt} • Hub:{" "}
            <span className="font-sans font-medium text-[#111111]">{order.pickupHub}</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="h-9 px-3.5 bg-white text-[#111111] border border-[#E4E0DB] rounded-[8px] text-xs font-medium flex items-center gap-1.5 hover:bg-[#F7F7F5] transition-colors shadow-xs"
            >
              <span>Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6667]" />
            </button>

            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E4E0DB] rounded-[8px] shadow-lg py-1 z-30">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#111111] hover:bg-[#F7F7F5] text-left"
                >
                  <Printer className="w-3.5 h-3.5 text-[#6B6667]" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={handleContactVendor}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#111111] hover:bg-[#F7F7F5] text-left"
                >
                  <Store className="w-3.5 h-3.5 text-[#6B6667]" />
                  <span>Boutique Contact Info</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary CTA: Assign Delivery Partner */}
          {isReadyForPickup && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="h-9 px-4 bg-[#FF5A1F] text-white rounded-[8px] text-xs font-medium flex items-center gap-2 hover:bg-[#D94B17] transition-colors shadow-xs"
            >
              <Truck className="w-4 h-4" />
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
          <section className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[#E4E0DB] flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[14px] font-semibold text-[#111111]">
                Order Items ({order.items.length} {order.items.length === 1 ? "product" : "products"}, {totalUnits} {totalUnits === 1 ? "unit" : "units"})
              </h2>
              <span className="text-xs text-[#6B6667]">
                Merchant: <strong className="text-[#111111] font-medium">{order.vendorName}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="h-10 bg-[#F7F7F5] text-[#6B6667] border-b border-[#E4E0DB] text-xs font-medium">
                    <th className="pl-5 pr-2 w-14">Item</th>
                    <th className="px-3">Product Name &amp; Brand</th>
                    <th className="px-3">Size / Option</th>
                    <th className="px-3 text-center">Qty</th>
                    <th className="px-3 text-right">Unit Price</th>
                    <th className="pr-5 pl-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="pl-5 pr-2 py-3.5">
                        <div className="w-12 h-14 rounded-[6px] bg-[#F4F1EA] border border-[#E4E0DB] overflow-hidden shrink-0 flex items-center justify-center text-[#6B6667]">
                          <Shirt className="w-5 h-5" />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-[#111111] leading-tight">
                          {item.title}
                        </p>
                        <p className="font-mono text-[11px] text-[#6B6667] mt-0.5">
                          Brand: {item.brand}
                        </p>
                        {item.trialSize && (
                          <span className="inline-block mt-1 text-[10px] font-medium text-[#FF5A1F] bg-[#FFF0E8] px-1.5 py-0.5 rounded-[4px] border border-[#FF5A1F]/20">
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
                      <td className="px-3 py-3.5 text-center font-mono font-medium text-[#111111]">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-[#6B6667]">
                        {formatINR(item.price)}
                      </td>
                      <td className="pr-5 pl-3 py-3.5 text-right font-mono font-medium text-[#111111]">
                        {formatINR(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-[#F7F7F5] border-t border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[#6B6667]">
                Packaging: <strong className="text-[#111111] font-medium">Standard Boutique Package</strong>
              </span>
              <div className="flex items-center gap-5">
                <span className="text-[#6B6667]">
                  Units: <strong className="text-[#111111] font-mono font-medium">{totalUnits}</strong>
                </span>
                <span className="text-[#6B6667]">
                  Fulfillment: <strong className="text-[#111111] font-medium">{order.fulfillmentType}</strong>
                </span>
              </div>
            </div>
          </section>

          {/* TRY & BUY MANIFEST (Only rendered if applicable) */}
          {order.isTryAndBuy && order.tryAndBuyDetails && (
            <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-[#FFF0E8] flex items-center justify-center text-[#FF5A1F]">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111111]">Try &amp; Buy Details</h3>
                    <p className="text-[11px] text-[#6B6667]">Doorstep Fitting Trial Verification</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] text-xs font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                  Doorstep Trial
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <div className="flex items-center gap-1.5 text-[#6B6667] text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span className="font-medium text-[#111111]">Trial Window</span>
                  </div>
                  <p className="text-xs font-medium text-[#111111]">
                    {order.tryAndBuyDetails.trialDurationMinutes} Minutes Window
                  </p>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">Fitting confirmation at customer address</p>
                </div>

                <div className="p-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <div className="flex items-center gap-1.5 text-[#6B6667] text-xs mb-1">
                    <Package className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span className="font-medium text-[#111111]">Return Manifest</span>
                  </div>
                  <p className="text-xs font-medium text-[#111111] font-mono">
                    {order.tryAndBuyDetails.returnManifestId || "TR-MNF-ACTIVE"}
                  </p>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">Tamper seals must remain intact</p>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#6B6667] shrink-0 mt-0.5" />
                <p className="text-xs text-[#6B6667] leading-relaxed">
                  Delivery partner allows up to {order.tryAndBuyDetails.trialDurationMinutes} minutes for doorstep fitting. Unaccepted items must be secured into return satchels with customer confirmation.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN (col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. DISPATCH CONTROL PANEL */}
          <section
            className={`bg-white rounded-[10px] p-5 shadow-xs transition-all ${
              isAssigned
                ? "border border-[#A7F3D0]"
                : isReadyForPickup
                ? "border border-[#FDE68A]"
                : "border border-[#E4E0DB]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                {isAssigned ? (
                  <Check className="w-4 h-4 text-[#20885A]" />
                ) : isReadyForPickup ? (
                  <AlertTriangle className="w-4 h-4 text-[#C9822E]" />
                ) : (
                  <Truck className="w-4 h-4 text-[#6B6667]" />
                )}
                <h3 className="text-sm font-semibold text-[#111111]">Dispatch Control</h3>
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-[4px] border ${
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
                  <div className="p-3 rounded-[8px] bg-[#ECFDF5]/60 border border-[#A7F3D0] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-[#111111]">
                        {order.assignedDriver.fullName}
                      </div>
                      <div className="text-[11px] text-[#6B6667] font-mono">
                        {order.assignedDriver.vehicleModel} • {order.assignedDriver.vehicleRegistration}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B6667]">
                    <span>Driver Contact:</span>
                    <span className="font-mono text-[#111111] font-medium">
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
                    className="w-full h-9 bg-[#FF5A1F] text-white rounded-[8px] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#D94B17] transition-colors shadow-xs"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Assign Delivery Partner</span>
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#6B6667] leading-relaxed">
                  Dispatch assignment will be unlocked as soon as the merchant finishes packing and marks the order as <code className="font-mono text-[#D94B17] font-medium">READY_FOR_PICKUP</code>.
                </p>
              )}
            </div>
          </section>

          {/* 2. CUSTOMER & DELIVERY ADDRESS */}
          <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
              <h3 className="text-sm font-semibold text-[#111111]">Customer &amp; Address</h3>
              <User className="w-4 h-4 text-[#6B6667]" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#111111]">{order.customerName}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A]">
                  Verified Buyer
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-[#6B6667]">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-mono text-[#111111]">{order.customerPhone}</span>
                </div>
              </div>
            </div>
            <div className="pt-2.5 border-t border-[#E4E0DB]">
              <p className="text-[11px] font-medium text-[#6B6667]">
                Destination Locality
              </p>
              <p className="text-xs text-[#111111] mt-1 leading-relaxed">
                {order.customerAddress.line1}, {order.customerAddress.locality}, {order.customerAddress.city}{" "}
                {order.customerAddress.pincode}
              </p>
              <div className="mt-2.5 p-2 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#6B6667] leading-tight">
                  <strong className="text-[#111111] font-medium">Delivery Label:</strong>{" "}
                  {order.customerAddress.label}
                </p>
              </div>
            </div>
          </section>

          {/* 3. VENDOR & PICKUP HUB */}
          <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
              <h3 className="text-sm font-semibold text-[#111111]">Vendor &amp; Pickup Hub</h3>
              <Store className="w-4 h-4 text-[#6B6667]" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#111111]">{order.vendorName}</p>
                <span className="font-mono text-[11px] text-[#6B6667]">#{order.vendorId}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-medium text-[#6B6667] block">
                  Pickup Hub:
                </span>
                <span className="font-medium text-[#111111]">{order.pickupHub}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#6B6667] block">
                  Hub Address:
                </span>
                <span className="font-medium text-[#111111]">{order.pickupAddress}</span>
              </div>
            </div>
          </section>

          {/* 4. FINANCIAL SUMMARY */}
          <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0DB]">
              <h3 className="text-sm font-semibold text-[#111111]">Financial Summary</h3>
              <StatusBadge status={order.paymentStatus} variant="payment" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#6B6667]">
                <span>Items Total</span>
                <span className="font-mono text-[#111111]">{formatINR(order.itemTotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B6667]">
                <span>Logistics Fee</span>
                <span className="font-mono text-[#111111]">{formatINR(order.deliveryFee)}</span>
              </div>
              {order.isTryAndBuy && (
                <div className="flex justify-between text-[#6B6667]">
                  <span>Try &amp; Buy Surcharge</span>
                  <span className="font-mono text-[#111111]">{formatINR(150.0)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B6667]">
                <span>Taxes &amp; GST</span>
                <span className="font-mono text-[#111111]">{formatINR(order.taxes)}</span>
              </div>
              <div className="pt-2 border-t border-[#E4E0DB] flex justify-between items-baseline">
                <span className="font-medium text-[#111111] text-xs">Grand Total</span>
                <span className="font-mono font-semibold text-[17px] text-[#111111]">
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
