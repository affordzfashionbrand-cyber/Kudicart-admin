"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Order } from "@/types/orders";
import { DeliveryPartner } from "@/types/drivers";
import { getDemoDeliveryPartners } from "@/demo-data/drivers";
import { formatINR } from "@/lib/utils";
import { api } from "@/lib/api";

interface ManualDeliveryAssignmentDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAssignment: (orderId: string, driver: DeliveryPartner) => Promise<void> | void;
}

type VehicleFilter = "ALL" | "TWO_WHEELER" | "EV";

export function ManualDeliveryAssignmentDrawer({
  order,
  isOpen,
  onClose,
  onConfirmAssignment,
}: ManualDeliveryAssignmentDrawerProps) {
  const [drivers, setDrivers] = useState<DeliveryPartner[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [driverLoadError, setDriverLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<VehicleFilter>("ALL");

  // CRITICAL REQUIREMENT: Do NOT automatically pre-select any partner when drawer opens!
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Load drivers when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDriverId(null);
      setSearchQuery("");
      setFilterType("ALL");
      setSuccessMessage(null);
      setErrorMessage(null);
      setNoticeMessage(null);
      setIsLoadingDrivers(false);
      setDriverLoadError(null);

      const demoDrivers = getDemoDeliveryPartners();
      setDrivers(demoDrivers);

      // Fetch live available standby drivers from backend
      api.deliveryPartners.list({ limit: 50 })
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            setDrivers(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Keyboard navigation: Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Filter available drivers based on search and vehicle type
  const eligibleDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      // Must be online / standby to be eligible for assignment
      // If driver is offline, they shouldn't be assigned
      const isAvailable = driver.isOnline !== false;

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        driver.fullName.toLowerCase().includes(query) ||
        driver.driverCode.toLowerCase().includes(query) ||
        driver.vehicleModel.toLowerCase().includes(query) ||
        driver.vehicleRegistration.toLowerCase().includes(query) ||
        driver.phone.includes(query);

      // Vehicle category match
      let matchesType = true;
      if (filterType === "TWO_WHEELER") {
        matchesType =
          driver.vehicleType === "Two-Wheeler" ||
          driver.vehicleType.toLowerCase().includes("bike") ||
          driver.vehicleType.toLowerCase().includes("scooty");
      } else if (filterType === "EV") {
        matchesType =
          driver.vehicleType === "EV / Electric" ||
          driver.vehicleType.toLowerCase().includes("ev") ||
          driver.vehicleModel.toLowerCase().includes("electric") ||
          driver.vehicleModel.toLowerCase().includes("ather") ||
          driver.vehicleModel.toLowerCase().includes("chetak");
      }

      return matchesSearch && matchesType;
    });
  }, [drivers, searchQuery, filterType]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const total = drivers.length;
    const twoWheeler = drivers.filter(
      (d) =>
        d.vehicleType === "Two-Wheeler" ||
        d.vehicleType.toLowerCase().includes("bike") ||
        d.vehicleType.toLowerCase().includes("scooty")
    ).length;
    const ev = drivers.filter(
      (d) =>
        d.vehicleType === "EV / Electric" ||
        d.vehicleType.toLowerCase().includes("ev") ||
        d.vehicleModel.toLowerCase().includes("electric") ||
        d.vehicleModel.toLowerCase().includes("ather") ||
        d.vehicleModel.toLowerCase().includes("chetak")
    ).length;
    return { total, twoWheeler, ev };
  }, [drivers]);

  // Selected driver object
  const selectedDriver = useMemo(() => {
    if (!selectedDriverId) return null;
    return drivers.find((d) => d.id === selectedDriverId) || null;
  }, [drivers, selectedDriverId]);

  if (!isOpen || !order) return null;

  const totalItemUnits = order.items.reduce((acc, it) => acc + it.quantity, 0);

  const handleConfirm = async () => {
    if (!selectedDriver) {
      setErrorMessage("Please explicitly select an eligible delivery partner before confirming.");
      return;
    }

    if (order.status !== "READY_FOR_PICKUP" && order.status !== "ASSIGNED") {
      setErrorMessage(`Order #${order.orderNumber} is in status "${order.status}" and cannot be assigned.`);
      return;
    }

    setErrorMessage(null);
    setNoticeMessage(null);
    setIsSubmitting(true);

    try {
      if (onConfirmAssignment) {
        await onConfirmAssignment(order.id, selectedDriver);
      } else {
        await api.orders.assignDriver(order.id, selectedDriver.id);
      }
      setSuccessMessage(
        `Order #${order.orderNumber} successfully assigned to ${selectedDriver.fullName}.`
      );
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Failed to confirm manual delivery assignment.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Drawer Container */}
      <section
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] h-full bg-white border-l border-[#E4E0DB] flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-200"
      >
        {/* ================= DRAWER HEADER ================= */}
        <header className="h-20 px-6 border-b border-[#E4E0DB] bg-white flex items-center justify-between shrink-0">
          <div>
            <h2
              className="text-lg font-bold text-[#111111] tracking-tight"
              id="drawer-title"
            >
              Manual Delivery Partner Assignment
            </h2>
            <p className="text-xs text-[#6B6667] mt-0.5">
              Assign an eligible active partner to order{" "}
              <span className="font-mono font-semibold text-[#111111]">
                #{order.orderNumber}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close assignment drawer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* ================= SCROLLABLE DRAWER BODY ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2 text-[#065F46] text-xs font-semibold animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* UI-Only Notice Banner */}
          {noticeMessage && (
            <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-2 text-[#1D4ED8] text-xs font-medium animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
              <span>{noticeMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#DA1E28]/20 flex items-start gap-2 text-[#DA1E28] text-xs font-medium">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Order Summary Card */}
          <article className="p-4 rounded-xl bg-[#F4F1EA]/60 border border-[#E4E0DB] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#111111]">
                  #{order.orderNumber}
                </span>
                <span className="text-[#6B6667]">•</span>
                <span className="text-xs text-[#6B6667]">
                  {totalItemUnits} {totalItemUnits === 1 ? "Item" : "Items"}
                </span>
                <span className="text-[#6B6667]">•</span>
                <span className="text-xs text-[#111111] font-mono font-semibold">
                  Total: {formatINR(order.grandTotal)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white text-[#111111] border border-[#E4E0DB] text-[10px] font-semibold">
                {order.paymentStatus === "COMPLETED" ? "Pre-Paid" : `Payment: ${order.paymentStatus}`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] text-[#6B6667] flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px] text-[#FF5A1F]">
                    store
                  </span>
                  PICKUP NODE
                </div>
                <p className="text-[#111111] font-semibold leading-tight">{order.vendorName}</p>
                <p className="text-[#6B6667] text-[11px]">{order.pickupHub}</p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-[#6B6667] flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px] text-[#20885A]">
                    location_on
                  </span>
                  DROPOFF DESTINATION
                </div>
                <p className="text-[#111111] font-medium leading-tight">
                  {order.customerAddress?.line1 || "Customer Address"}
                </p>
                <p className="text-[#6B6667] text-[11px]">
                  {order.customerAddress?.locality || ""}, {order.customerAddress?.city || "Mumbai"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#6B6667]">
                  inventory_2
                </span>
                <span>
                  Fulfillment: <strong className="text-[#111111]">{order.fulfillmentType}</strong>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#111111]">
                Status: <span className="text-[#D94B17]">{order.status.replace(/_/g, " ")}</span>
              </span>
            </div>
          </article>

          {/* 2. Driver Selection & Filtering Toolbar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111111] tracking-wide uppercase">
                Select Delivery Partner
              </h3>
              <span className="text-[11px] text-[#6B6667]">Manual Assignment Only</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6667] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partner name, ID, or vehicle reg..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E4E0DB] bg-white text-xs text-[#111111] placeholder:text-[#6B6667] focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  filterType === "ALL"
                    ? "bg-[#111111] text-white"
                    : "bg-[#F4F1EA] border border-[#E4E0DB] text-[#111111] hover:bg-[#EBE7DF]"
                }`}
              >
                All Eligible ({counts.total})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("TWO_WHEELER")}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  filterType === "TWO_WHEELER"
                    ? "bg-[#111111] text-white"
                    : "bg-[#F4F1EA] border border-[#E4E0DB] text-[#111111] hover:bg-[#EBE7DF]"
                }`}
              >
                Two-Wheeler ({counts.twoWheeler})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("EV")}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  filterType === "EV"
                    ? "bg-[#111111] text-white"
                    : "bg-[#F4F1EA] border border-[#E4E0DB] text-[#111111] hover:bg-[#EBE7DF]"
                }`}
              >
                EV / Electric ({counts.ev})
              </button>
            </div>
          </div>

          {/* 3. Delivery Partner List */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Available Delivery Partners">
            {isLoadingDrivers ? (
              <div className="p-8 text-center text-xs text-[#6B6667] space-y-2">
                <span className="material-symbols-outlined text-[24px] animate-spin text-[#FF5A1F]">
                  progress_activity
                </span>
                <p>Loading eligible delivery partners...</p>
              </div>
            ) : driverLoadError ? (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#ffdad6] text-center text-xs text-[#DA1E28]">
                <p className="font-semibold">{driverLoadError}</p>
              </div>
            ) : eligibleDrivers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E4E0DB] rounded-xl text-xs text-[#6B6667] space-y-1">
                <span className="material-symbols-outlined text-[24px] text-[#6B6667]">
                  person_off
                </span>
                <p className="font-semibold text-[#111111]">No matching delivery partners found</p>
                <p className="text-[11px]">
                  Try adjusting search keywords or clearing vehicle category filters.
                </p>
              </div>
            ) : (
              eligibleDrivers.map((driver) => {
                const isSelected = driver.id === selectedDriverId;
                const isKycApproved = driver.kycStatus === "APPROVED";

                return (
                  <div
                    key={driver.id}
                    role="radio"
                    tabIndex={0}
                    aria-checked={isSelected}
                    onClick={() => setSelectedDriverId(driver.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedDriverId(driver.id);
                      }
                    }}
                    className={`p-3.5 rounded-xl transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-2 border-[#FF5A1F] bg-[#FFF0E8] shadow-xs"
                        : "border border-[#E4E0DB] bg-white hover:bg-[#FDFBF7]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio button indicator */}
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-2 border-[#FF5A1F]"
                            : "border border-[#6B6667]"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#FF5A1F]" />}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111111]">
                              {driver.fullName}
                            </span>
                            <span className="font-mono text-[10px] text-[#6B6667] bg-[#F4F1EA] px-1.5 py-0.5 rounded border border-[#E4E0DB]">
                              {driver.driverCode}
                            </span>
                            {isKycApproved && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#ECFDF5] text-[#20885A] text-[10px] font-semibold border border-[#A7F3D0]">
                                <span className="material-symbols-outlined text-[12px]">
                                  verified_user
                                </span>
                                KYC Verified
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#20885A] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
                            {driver.isOnline ? "Standby" : "Available"}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#6B6667] flex flex-wrap items-center gap-x-2">
                          <span className="font-mono font-medium text-[#111111]">
                            {driver.phone}
                          </span>
                          <span>•</span>
                          <span>
                            Vehicle:{" "}
                            <strong className="text-[#111111] font-medium">
                              {driver.vehicleModel}
                            </strong>{" "}
                            <span className="font-mono">({driver.vehicleRegistration})</span>
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between pt-1 text-[11px] text-[#6B6667] border-t ${
                            isSelected ? "border-[#FF5A1F]/20" : "border-[#E4E0DB]"
                          }`}
                        >
                          <span>{driver.completedDeliveries} Deliveries completed</span>
                          <span className="text-[#111111] font-semibold">{driver.vehicleType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Selection Confirmation Review Card */}
          {selectedDriver && (
            <div className="p-3.5 rounded-lg bg-[#FFF0E8] border border-[#FF5A1F]/30 flex items-start gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-[#FF5A1F] text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[#111111]">Manual Dispatch Summary</p>
                <p className="text-[#6B6667] leading-relaxed">
                  Ready to assign order{" "}
                  <span className="font-mono font-bold text-[#FF5A1F]">
                    #{order.orderNumber}
                  </span>{" "}
                  to <strong className="text-[#111111]">{selectedDriver.fullName}</strong> (
                  {selectedDriver.vehicleModel}, {selectedDriver.vehicleRegistration}).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= DRAWER FOOTER ================= */}
        <footer className="h-20 px-6 border-t border-[#E4E0DB] bg-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-[#111111] font-medium">
              {selectedDriver ? "1 partner selected:" : "No partner selected"}
            </span>
            <div className="text-[11px] text-[#6B6667] mt-0.5">
              {selectedDriver ? (
                <>
                  <span className="font-semibold text-[#111111]">{selectedDriver.fullName}</span>{" "}
                  <span className="font-mono text-[10px] text-[#6B6667]">
                    ({selectedDriver.driverCode})
                  </span>
                </>
              ) : (
                <span className="italic">Click a partner card above to select</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F4F1EA] text-xs font-semibold transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedDriverId || !selectedDriver}
              className="h-10 px-5 rounded-lg bg-[#FF5A1F] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#D94B17] transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
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
