"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DeliveryPartner, KycStatus } from "@/types/drivers";
import { getDeliveryPartners } from "@/lib/api/drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");
  const [workPreferenceFilter, setWorkPreferenceFilter] = useState<string>("ALL");
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");

  // Selection & Pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await getDeliveryPartners();
      setPartners(res.data);
      if (res.isFallback) {
        setIsFallbackNotice(true);
      } else {
        setIsFallbackNotice(false);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to load delivery partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered partner list
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      // Search query matches name, driverCode, phone, vehicleReg
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = p.fullName.toLowerCase().includes(query);
        const matchesCode = p.driverCode.toLowerCase().includes(query);
        const matchesPhone = p.phone.toLowerCase().includes(query);
        const matchesReg = p.vehicleRegistration.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesPhone && !matchesReg) {
          return false;
        }
      }

      // KYC filter
      if (kycFilter !== "ALL" && p.kycStatus !== kycFilter) {
        return false;
      }

      // Availability filter
      if (availabilityFilter === "ONLINE" && !p.isOnline) return false;
      if (availabilityFilter === "OFFLINE" && p.isOnline) return false;

      // Work preference filter
      if (workPreferenceFilter !== "ALL" && p.workPreference !== workPreferenceFilter) {
        return false;
      }

      // Vehicle filter
      if (vehicleFilter !== "ALL") {
        const vType = p.vehicleType.toLowerCase();
        if (vehicleFilter === "BIKE" && !vType.includes("bike")) return false;
        if (vehicleFilter === "SCOOTY" && !vType.includes("scooty")) return false;
        if (vehicleFilter === "EV" && !vType.includes("ev") && !vType.includes("electric")) return false;
      }

      return true;
    });
  }, [partners, searchTerm, kycFilter, availabilityFilter, workPreferenceFilter, vehicleFilter]);

  // Derived operational metrics
  const totalCount = partners.length;
  const onlineCount = partners.filter((p) => p.isOnline).length;
  const pendingCount = partners.filter((p) => p.kycStatus === "PENDING").length;
  const approvedCount = partners.filter((p) => p.kycStatus === "APPROVED").length;
  const rejectedCount = partners.filter((p) => p.kycStatus === "REJECTED").length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredPartners.length / pageSize) || 1;
  const paginatedPartners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, currentPage, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPartners.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setKycFilter("ALL");
    setAvailabilityFilter("ALL");
    setWorkPreferenceFilter("ALL");
    setVehicleFilter("ALL");
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto select-none">
      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Delivery Partners
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9822E]" />
              {totalCount} Registered Fleet Partners ({pendingCount} Pending KYC)
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary">
            Manage marketplace delivery fleet, review verification KYC status, and monitor operational partner availability.
          </p>
        </div>

        {/* Action cluster */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              const headers = "ID,Code,Name,Phone,Preference,Vehicle,Registration,Online,Deliveries,KYC\n";
              const rows = partners
                .map((p) => `"${p.id}","${p.driverCode}","${p.fullName}","${p.phone}","${p.workPreference}","${p.vehicleModel}","${p.vehicleRegistration}",${p.isOnline},${p.completedDeliveries},"${p.kycStatus}"`)
                .join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `kudicart_fleet_export_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
            className="h-9 px-3.5 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-xs"
            title="Export filtered fleet data to CSV"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export Fleet CSV</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-xs"
            title="Refresh fleet list"
          >
            <span className={`material-symbols-outlined text-[18px] text-secondary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* API Notice / Status Banner */}
      {isFallbackNotice && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700">info</span>
            <span>
              <strong>Operational Fixture Mode:</strong> Central Ops Backend (http://localhost:3001) is currently unreachable. Displaying verified local fleet fixtures.
            </span>
          </div>
          <button onClick={loadData} className="underline font-semibold hover:text-amber-800">
            Retry Connection
          </button>
        </div>
      )}

      {/* ================= OPERATIONAL KPI SUMMARY CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Partners */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm font-medium text-secondary">Total Delivery Partners</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">group</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-headline-lg text-2xl font-bold text-on-surface font-mono">{totalCount}</div>
            <span className="font-label-xs text-label-xs text-secondary font-medium">Fleet active capacity</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest flex items-center justify-between text-xs text-secondary">
            <span>Riders enrolled</span>
            <span className="font-medium text-on-surface">100% On-grid</span>
          </div>
        </div>

        {/* KPI 2: Online Fleet */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm font-medium text-secondary">Online Fleet</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20885A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#20885A]" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-headline-lg text-2xl font-bold text-on-surface font-mono">{onlineCount}</div>
            <span className="font-label-xs text-label-xs text-[#20885A] font-semibold bg-[#ECFDF5] px-1.5 py-0.5 rounded">
              Active on duty
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest flex items-center justify-between text-xs text-secondary">
            <span>Standby & in-transit</span>
            <span className="font-medium text-on-surface">{Math.round((onlineCount / (totalCount || 1)) * 100)}% Available</span>
          </div>
        </div>

        {/* KPI 3: Pending KYC Review */}
        <div className="bg-surface-container-lowest border border-[#FDE68A] rounded-xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-[#C9822E]" />
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm font-medium text-secondary">Pending KYC Review</span>
            <span className="material-symbols-outlined text-[#C9822E] text-[20px]">assignment_late</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-headline-lg text-2xl font-bold text-[#C9822E] font-mono">{pendingCount}</div>
            <span className="font-label-xs text-label-xs text-[#C9822E] font-semibold bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FEF08A]">
              Needs Admin Action
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest flex items-center justify-between text-xs text-secondary">
            <span>Awaiting verification</span>
            <span className="font-medium text-[#C9822E]">Review queue active</span>
          </div>
        </div>

        {/* KPI 4: Approved Fleet */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm font-medium text-secondary">Approved Fleet</span>
            <span className="material-symbols-outlined text-[#20885A] text-[20px]">verified</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-headline-lg text-2xl font-bold text-on-surface font-mono">{approvedCount}</div>
            <span className="font-label-xs text-label-xs text-[#20885A] font-semibold">
              {Math.round((approvedCount / (totalCount || 1)) * 100)}% rate
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest flex items-center justify-between text-xs text-secondary">
            <span>{rejectedCount} Rejected applications</span>
            <span className="font-medium text-on-surface">Compliance ready</span>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by partner name, driver ID (#DRV-...), or phone..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-surface-container-low border border-surface-container-highest rounded-lg focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] font-body-sm placeholder:text-secondary"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* KYC Status */}
          <div className="relative">
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-on-surface bg-white border border-surface-container-highest rounded-lg appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="PENDING">Pending Review ({pendingCount})</option>
              <option value="APPROVED">Approved ({approvedCount})</option>
              <option value="REJECTED">Rejected ({rejectedCount})</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-secondary text-[16px] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Availability Status */}
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-on-surface bg-white border border-surface-container-highest rounded-lg appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="ALL">All Availability</option>
              <option value="ONLINE">Online ({onlineCount})</option>
              <option value="OFFLINE">Offline ({totalCount - onlineCount})</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-secondary text-[16px] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Work Preference */}
          <div className="relative">
            <select
              value={workPreferenceFilter}
              onChange={(e) => {
                setWorkPreferenceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-on-surface bg-white border border-surface-container-highest rounded-lg appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="ALL">All Preferences</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-secondary text-[16px] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Vehicle Type */}
          <div className="relative">
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-on-surface bg-white border border-surface-container-highest rounded-lg appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="ALL">All Vehicles</option>
              <option value="BIKE">Bike</option>
              <option value="SCOOTY">Scooty</option>
              <option value="EV">EV / Electric</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-secondary text-[16px] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Clear Filters */}
          {(searchTerm || kycFilter !== "ALL" || availabilityFilter !== "ALL" || workPreferenceFilter !== "ALL" || vehicleFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="h-9 px-2 text-xs font-semibold text-secondary hover:text-[#FF5A1F] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Clear</span>
            </button>
          )}
        </div>
      </section>

      {/* ================= HIGH-DENSITY DATA TABLE ================= */}
      <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Head */}
            <thead>
              <tr className="h-10 bg-surface-container-low border-b border-surface-container-highest text-secondary font-label-xs text-label-xs uppercase tracking-wider">
                <th className="w-10 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedPartners.length > 0 &&
                      paginatedPartners.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-surface-container-highest text-[#FF5A1F] focus:ring-[#FF5A1F] w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 font-semibold text-secondary">PARTNER</th>
                <th className="py-2.5 px-3 font-semibold text-secondary">PHONE</th>
                <th className="py-2.5 px-3 font-semibold text-secondary">WORK PREFERENCE</th>
                <th className="py-2.5 px-3 font-semibold text-secondary">VEHICLE</th>
                <th className="py-2.5 px-3 font-semibold text-secondary">REGISTRATION NO.</th>
                <th className="py-2.5 px-3 font-semibold text-secondary">ONLINE STATUS</th>
                <th className="py-2.5 px-3 font-semibold text-secondary text-right">COMPLETED DELIVERIES</th>
                <th className="py-2.5 px-3 font-semibold text-secondary text-center">KYC STATUS</th>
                <th className="py-2.5 px-4 font-semibold text-secondary text-right">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-surface-container-highest font-body-sm text-on-surface">
              {loading ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="h-12">
                    <td className="px-4 text-center">
                      <Skeleton className="w-4 h-4 mx-auto rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="w-24 h-3 rounded" />
                          <Skeleton className="w-16 h-2.5 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-24 h-3.5 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-16 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-28 h-3.5 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-20 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-16 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Skeleton className="w-12 h-3.5 ml-auto rounded" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Skeleton className="w-20 h-5 mx-auto rounded-full" />
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Skeleton className="w-18 h-7 ml-auto rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <EmptyState
                      title="No delivery partners match criteria"
                      description="Try modifying search keywords or clearing active filters."
                      actionLabel="Clear Filters"
                      onAction={clearFilters}
                      icon="person_search"
                    />
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((partner) => {
                  const isSelected = selectedIds.includes(partner.id);
                  const isPending = partner.kycStatus === "PENDING";
                  const isEV =
                    partner.vehicleType.toLowerCase().includes("ev") ||
                    partner.vehicleType.toLowerCase().includes("electric");

                  return (
                    <tr
                      key={partner.id}
                      className={`h-12 hover:bg-surface-container-low transition-colors group ${
                        isSelected ? "bg-surface-container-low/70" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(partner.id)}
                          className="rounded border-surface-container-highest text-[#FF5A1F] focus:ring-[#FF5A1F] w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Partner Identity */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(partner.fullName)}
                          </div>
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/delivery-partners/${partner.id}`}
                              className="font-semibold text-on-surface hover:text-[#FF5A1F] transition-colors leading-tight text-xs"
                            >
                              {partner.fullName}
                            </Link>
                            <span className="font-code-sm text-[11px] text-secondary leading-tight">
                              {partner.driverCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 font-mono text-xs text-on-surface">
                          <span>{partner.phone}</span>
                          <span
                            className="material-symbols-outlined text-[14px] text-[#20885A]"
                            title="Verified Phone Number"
                          >
                            check_circle
                          </span>
                        </div>
                      </td>

                      {/* Work Preference */}
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-secondary border border-surface-container-highest">
                          {partner.workPreference === "FULL_TIME" ? "Full-time" : "Part-time"}
                        </span>
                      </td>

                      {/* Vehicle */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`material-symbols-outlined text-[16px] ${
                              isEV ? "text-[#FF5A1F]" : "text-secondary"
                            }`}
                          >
                            {isEV ? "electric_scooter" : "two_wheeler"}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs leading-tight">
                              {partner.vehicleType}
                            </span>
                            <span className="text-[10px] text-secondary leading-tight">
                              {partner.vehicleModel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Registration Plate */}
                      <td className="py-2 px-3">
                        <span className="font-code-sm text-xs text-on-surface font-medium bg-surface-container-low px-1.5 py-0.5 rounded border border-surface-container-highest tracking-wide">
                          {partner.vehicleRegistration}
                        </span>
                      </td>

                      {/* Online Status */}
                      <td className="py-2 px-3">
                        <StatusBadge
                          status={partner.isOnline ? "ONLINE" : "OFFLINE"}
                          variant="driver"
                        />
                      </td>

                      {/* Completed Deliveries */}
                      <td className="py-2 px-3 text-right">
                        <span className="font-code-sm text-xs font-semibold text-secondary">
                          {partner.completedDeliveries} deliveries
                        </span>
                      </td>

                      {/* KYC Status */}
                      <td className="py-2 px-3 text-center">
                        <StatusBadge status={partner.kycStatus} variant="kyc" />
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-4 text-right">
                        {isPending ? (
                          <Link
                            href={`/admin/delivery-partners/${partner.id}`}
                            className="inline-flex items-center h-7 px-3 rounded-lg bg-[#FF5A1F] text-white font-label-xs text-label-xs font-semibold hover:bg-[#D94B17] active:scale-[0.98] transition-all shadow-xs"
                          >
                            Review KYC
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/delivery-partners/${partner.id}`}
                            className="inline-flex items-center h-7 px-3 rounded-lg border border-surface-container-highest bg-white text-on-surface font-label-xs text-label-xs font-semibold hover:bg-surface-container-low active:scale-[0.98] transition-all"
                          >
                            View Details
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

        {/* ================= TABLE FOOTER & PAGINATION ================= */}
        {!loading && filteredPartners.length > 0 && (
          <div className="p-3 border-t border-surface-container-highest flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary bg-surface-container-lowest">
            <div>
              Showing{" "}
              <strong className="text-on-surface">
                {Math.min(filteredPartners.length, (currentPage - 1) * pageSize + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-on-surface">
                {Math.min(filteredPartners.length, currentPage * pageSize)}
              </strong>{" "}
              of <strong className="text-on-surface">{filteredPartners.length}</strong> delivery partners
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 border border-surface-container-highest rounded-lg bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Previous</span>
              </button>

              <div className="px-2 text-xs font-semibold text-on-surface">
                Page {currentPage} of {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 border border-surface-container-highest rounded-lg bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
