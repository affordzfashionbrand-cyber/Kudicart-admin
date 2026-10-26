"use client";

import React, { useState } from "react";
import { Order } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import { MOCK_DELIVERY_PARTNERS } from "@/mocks/drivers";
import { formatINR } from "@/lib/utils";

interface ManualDeliveryAssignmentDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAssignment: (orderId: string, driver: DeliveryPartner) => Promise<void> | void;
}

export function ManualDeliveryAssignmentDrawer({
  order,
  isOpen,
  onClose,
  onConfirmAssignment,
}: ManualDeliveryAssignmentDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "TWO_WHEELER" | "EV">("ALL");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("drv-084");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  // Filter drivers
  const filteredDrivers = MOCK_DELIVERY_PARTNERS.filter((driver) => {
    // Search filter
    const matchesSearch =
      driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driverCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleRegistration.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    if (filterType === "TWO_WHEELER") {
      return matchesSearch && (driver.vehicleType === "Two-Wheeler" || driver.vehicleType.includes("Bike"));
    }
    if (filterType === "EV") {
      return matchesSearch && (driver.vehicleType === "EV / Electric" || driver.vehicleModel.toLowerCase().includes("electric") || driver.vehicleModel.toLowerCase().includes("ev") || driver.vehicleModel.toLowerCase().includes("ather") || driver.vehicleModel.toLowerCase().includes("chetak"));
    }
    return matchesSearch;
  });

  const selectedDriver = MOCK_DELIVERY_PARTNERS.find((d) => d.id === selectedDriverId) || filteredDrivers[0];

  const handleConfirm = async () => {
    if (!selectedDriver) {
      setErrorMessage("Please select a delivery partner.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirmAssignment(order.id, selectedDriver);
      setSuccessMessage(`Order #${order.orderNumber} successfully assigned to ${selectedDriver.fullName}!`);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to confirm assignment. Please retry.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity">
      {/* Drawer Container */}
      <section
        role="dialog"
        aria-labelledby="drawer-title"
        className="w-full max-w-[560px] h-full bg-surface-container-lowest border-l border-[#E4E0DB] flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <header className="h-20 px-6 border-b border-[#E4E0DB] bg-surface-container-lowest flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface" id="drawer-title">
                Manual Delivery Partner Assignment
              </h2>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-xs text-[11px] font-semibold">
                Priority Dispatch
              </span>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mt-0.5">
              Assign an eligible active partner to order{" "}
              <span className="font-code-sm font-semibold text-on-surface">#{order.orderNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2 text-[#065F46] text-body-sm font-medium animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#DA1E28]/20 flex items-center gap-2 text-[#93000a] text-body-sm font-medium">
              <span className="material-symbols-outlined text-[18px] text-[#DA1E28]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Order Dispatch Summary Card */}
          <article className="p-4 rounded-xl bg-surface-container-low border border-[#E4E0DB] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-code-sm text-code-sm font-bold text-on-surface">#{order.orderNumber}</span>
                <span className="text-secondary">•</span>
                <span className="text-body-sm font-body-sm text-secondary">
                  {order.items.reduce((acc, it) => acc + it.quantity, 0)} Items
                </span>
                <span className="text-secondary">•</span>
                <span className="text-body-sm font-body-sm text-on-surface font-semibold">
                  Total: {formatINR(order.grandTotal)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-xs text-label-xs font-semibold">
                {order.paymentMethod === "RAZORPAY" ? "Pre-Paid" : "COD"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm font-body-sm">
              <div className="space-y-1">
                <div className="text-label-xs font-label-xs text-secondary flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px] text-primary">store</span>
                  PICKUP NODE
                </div>
                <p className="text-on-surface font-medium leading-tight">{order.vendorName}</p>
                <p className="text-secondary text-body-sm">{order.pickupHub}</p>
              </div>

              <div className="space-y-1">
                <div className="text-label-xs font-label-xs text-secondary flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px] text-[#20885A]">location_on</span>
                  DROPOFF DESTINATION
                </div>
                <p className="text-on-surface font-medium leading-tight">{order.customerAddress.line1}</p>
                <p className="text-secondary text-body-sm">{order.customerAddress.locality} • Zone 4</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E0DB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary">inventory_2</span>
                <span className="text-body-sm font-body-sm text-secondary">
                  Carton Package • {order.isTryAndBuy ? "Try & Buy Active" : "Standard Dispatch"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#20885A] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                <span className="material-symbols-outlined text-[14px] material-symbols-fill">check_circle</span>
                <span className="text-label-xs font-label-xs font-semibold">Packed &amp; Verified</span>
              </div>
            </div>
          </article>

          {/* 2. Filter & Driver Availability Toolbar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-label-sm font-label-sm font-bold text-on-surface tracking-wide uppercase">
                Select Delivery Partner
              </h3>
              <span className="text-label-xs font-label-xs text-secondary">
                Manual Assignment Only
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partner name, ID, or vehicle..."
                className="w-full h-[38px] pl-9 pr-3 rounded-lg border border-[#E4E0DB] bg-surface-container-lowest text-body-sm font-body-sm focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-full text-label-xs font-label-xs font-semibold transition-all ${
                  filterType === "ALL"
                    ? "bg-on-surface text-surface-container-lowest"
                    : "bg-surface-container border border-[#E4E0DB] text-on-surface hover:bg-surface-container-high"
                }`}
              >
                All Eligible ({MOCK_DELIVERY_PARTNERS.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("TWO_WHEELER")}
                className={`px-3 py-1 rounded-full text-label-xs font-label-xs font-medium transition-all ${
                  filterType === "TWO_WHEELER"
                    ? "bg-on-surface text-surface-container-lowest"
                    : "bg-surface-container border border-[#E4E0DB] text-on-surface hover:bg-surface-container-high"
                }`}
              >
                Two-Wheeler (4)
              </button>
              <button
                type="button"
                onClick={() => setFilterType("EV")}
                className={`px-3 py-1 rounded-full text-label-xs font-label-xs font-medium transition-all ${
                  filterType === "EV"
                    ? "bg-on-surface text-surface-container-lowest"
                    : "bg-surface-container border border-[#E4E0DB] text-on-surface hover:bg-surface-container-high"
                }`}
              >
                EV / Electric (4)
              </button>
            </div>
            <p className="text-label-xs font-label-xs text-secondary">
              Manual assignment only. Showing {filteredDrivers.length} verified active partners stationed near hub.
            </p>
          </div>

          {/* 3. Delivery Partner Radio Cards */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Available Delivery Partners">
            {filteredDrivers.map((driver) => {
              const isSelected = driver.id === selectedDriverId;
              return (
                <div
                  key={driver.id}
                  role="radio"
                  tabIndex={0}
                  aria-checked={isSelected}
                  onClick={() => setSelectedDriverId(driver.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedDriverId(driver.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-2 border-primary-container bg-[#FFF0E8] shadow-xs"
                      : "border border-[#E4E0DB] bg-surface-container-lowest hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-2 border-primary-container"
                          : "border border-secondary"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary-container" />}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-body-md font-body-md-medium text-on-surface font-bold">
                            {driver.fullName}
                          </span>
                          <span className="font-code-xs text-code-xs text-secondary bg-surface-container-lowest px-1.5 py-0.5 rounded border border-[#E4E0DB]">
                            {driver.driverCode}
                          </span>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#20885A] text-label-xs font-label-xs border border-[#A7F3D0]">
                            <span className="material-symbols-outlined text-[13px] text-[#20885A]">verified_user</span>
                            <span>KYC Verified</span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-label-xs font-label-xs font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
                          Standby
                        </span>
                      </div>

                      <div className="text-body-sm font-body-sm text-secondary flex flex-wrap items-center gap-x-2">
                        <span className="font-code-sm text-code-xs font-medium text-on-surface">
                          {driver.phone}
                        </span>
                        <span>•</span>
                        <span>
                          Vehicle:{" "}
                          <strong className="text-on-surface font-medium">{driver.vehicleModel}</strong>{" "}
                          <span className="font-code-xs">({driver.vehicleRegistration})</span>
                        </span>
                      </div>

                      <div
                        className={`flex items-center justify-between pt-1 text-label-xs font-label-xs text-secondary border-t ${
                          isSelected ? "border-[#FF5A1F]/20" : "border-[#E4E0DB]"
                        }`}
                      >
                        <span>{driver.completedDeliveries} Deliveries completed</span>
                        <span className="text-on-surface font-semibold">{driver.vehicleType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Assignment Confirmation Review Card */}
          {selectedDriver && (
            <div className="p-3.5 rounded-lg bg-primary-fixed/30 border border-outline-variant flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <div className="space-y-1">
                <p className="text-label-sm font-label-sm text-on-surface font-bold">
                  Manual Dispatch Notice
                </p>
                <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                  Ready to assign order{" "}
                  <span className="font-code-sm font-bold text-primary">#{order.orderNumber}</span> to{" "}
                  <strong className="text-on-surface">{selectedDriver.fullName}</strong> (
                  {selectedDriver.vehicleModel}, {selectedDriver.vehicleRegistration}). Driver will receive immediate push notification on their mobile terminal.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="h-20 px-6 border-t border-[#E4E0DB] bg-surface-container-lowest flex items-center justify-between shrink-0">
          <div>
            <span className="text-body-sm font-body-sm text-on-surface font-medium">1 partner selected:</span>
            <div className="text-label-xs font-label-xs text-secondary mt-0.5">
              <span className="font-semibold text-on-surface">{selectedDriver?.fullName || "None"}</span>{" "}
              <span className="font-code-xs text-code-xs text-secondary">
                ({selectedDriver?.driverCode})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg border border-[#E4E0DB] bg-surface-container-lowest text-on-surface hover:bg-surface-container-low text-label-sm font-label-sm font-semibold transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedDriver}
              className="h-10 px-5 rounded-lg bg-primary-container text-white text-label-sm font-label-sm font-bold flex items-center gap-2 hover:bg-[#D94B17] transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>Confirm Manual Assignment</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
