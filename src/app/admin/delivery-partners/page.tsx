"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  Users,
  Radio,
  FileCheck,
  CheckCircle2,
  Search,
  ChevronDown,
  FilterX,
  Phone,
  Bike,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { DeliveryPartner } from "@/types/drivers";
import { getDemoDeliveryPartners } from "@/demo-data/drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");
  const [workPreferenceFilter, setWorkPreferenceFilter] = useState<string>("ALL");
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const loadData = () => {
    setLoading(true);
    api.deliveryPartners.list({ limit: 100 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setPartners(res.data);
        } else {
          setPartners(getDemoDeliveryPartners());
        }
      })
      .catch(() => {
        setPartners(getDemoDeliveryPartners());
      })
      .finally(() => {
        setLoading(false);
      });
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
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Delivery Partners
            </h1>
            <span className="px-2 py-0.5 rounded-[4px] text-xs font-medium bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]">
              {totalCount} Total Partners ({pendingCount} Pending Review)
            </span>
          </div>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Manage fleet partners, review KYC submissions, and monitor delivery availability.
          </p>
        </div>

        {/* Action cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
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
            className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 shadow-xs"
            title="Export filtered fleet data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Refresh fleet list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF5A1F]" : "text-[#6B6667]"}`} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* ================= OPERATIONAL KPI SUMMARY CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Partners */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">Total Partners</span>
            <Users className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-[#111111] font-mono">{totalCount}</div>
            <span className="text-xs text-[#6B6667]">Registered</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
            <span>Fleet status</span>
            <span className="font-medium text-[#111111]">Active directory</span>
          </div>
        </div>

        {/* KPI 2: Online Fleet */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">Online Fleet</span>
            <Radio className="w-4 h-4 text-[#20885A]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-[#111111] font-mono">{onlineCount}</div>
            <span className="text-[11px] text-[#20885A] font-medium bg-[#ECFDF5] px-1.5 py-0.5 rounded-[4px]">
              Available on duty
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
            <span>Availability rate</span>
            <span className="font-medium text-[#111111]">{Math.round((onlineCount / (totalCount || 1)) * 100)}% active</span>
          </div>
        </div>

        {/* KPI 3: Pending KYC Review */}
        <div className="bg-white border border-[#FDE68A] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">Pending KYC Review</span>
            <ShieldAlert className="w-4 h-4 text-[#C9822E]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-[#C9822E] font-mono">{pendingCount}</div>
            <span className="text-[11px] text-[#C9822E] font-medium bg-[#FFFBEB] px-1.5 py-0.5 rounded-[4px] border border-[#FEF08A]">
              Needs Action
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
            <span>Queue</span>
            <span className="font-medium text-[#C9822E]">Awaiting review</span>
          </div>
        </div>

        {/* KPI 4: Approved Fleet */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">Approved Fleet</span>
            <FileCheck className="w-4 h-4 text-[#20885A]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-[#111111] font-mono">{approvedCount}</div>
            <span className="text-[11px] text-[#20885A] font-medium bg-[#ECFDF5] px-1.5 py-0.5 rounded-[4px]">
              {Math.round((approvedCount / (totalCount || 1)) * 100)}% verified
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
            <span>Rejected applications</span>
            <span className="font-medium text-[#111111]">{rejectedCount}</span>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px] max-w-sm">
          <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by partner name, ID, phone, or reg plate..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E4E0DB] rounded-[8px] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] placeholder:text-[#6B6667]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* KYC Status */}
          <div className="relative">
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-[#111111] bg-white border border-[#E4E0DB] rounded-[8px] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="PENDING">Pending Review ({pendingCount})</option>
              <option value="APPROVED">Approved ({approvedCount})</option>
              <option value="REJECTED">Rejected ({rejectedCount})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Availability Status */}
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-[#111111] bg-white border border-[#E4E0DB] rounded-[8px] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All Availability</option>
              <option value="ONLINE">Online ({onlineCount})</option>
              <option value="OFFLINE">Offline ({totalCount - onlineCount})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Work Preference */}
          <div className="relative">
            <select
              value={workPreferenceFilter}
              onChange={(e) => {
                setWorkPreferenceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-[#111111] bg-white border border-[#E4E0DB] rounded-[8px] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All Work Preferences</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Vehicle Type */}
          <div className="relative">
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 text-xs font-medium text-[#111111] bg-white border border-[#E4E0DB] rounded-[8px] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All Vehicles</option>
              <option value="BIKE">Bike</option>
              <option value="SCOOTY">Scooty</option>
              <option value="EV">EV / Electric</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(searchTerm || kycFilter !== "ALL" || availabilityFilter !== "ALL" || workPreferenceFilter !== "ALL" || vehicleFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="h-9 px-2 text-xs font-medium text-[#6B6667] hover:text-[#FF5A1F] transition-colors flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </section>

      {/* ================= DATA TABLE CONTAINER ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            {/* Table Head */}
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="py-2.5 px-4 font-medium">Partner</th>
                <th className="py-2.5 px-3 font-medium">Phone</th>
                <th className="py-2.5 px-3 font-medium">Preference</th>
                <th className="py-2.5 px-3 font-medium">Vehicle</th>
                <th className="py-2.5 px-3 font-medium">Registration</th>
                <th className="py-2.5 px-3 font-medium">Availability</th>
                <th className="py-2.5 px-3 font-medium text-right">Deliveries</th>
                <th className="py-2.5 px-3 font-medium text-center">KYC Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="h-12">
                    <td className="py-2 px-4">
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
                      <Skeleton className="w-18 h-7 ml-auto rounded-[8px]" />
                    </td>
                  </tr>
                ))
              ) : paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12">
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
                  const isPending = partner.kycStatus === "PENDING";

                  return (
                    <tr
                      key={partner.id}
                      className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]"
                    >
                      {/* Partner Identity */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#F4F1EA] text-[#111111] flex items-center justify-center font-medium text-xs shrink-0">
                            {getInitials(partner.fullName)}
                          </div>
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/delivery-partners/${partner.id}`}
                              className="font-medium text-[#111111] hover:text-[#FF5A1F] transition-colors leading-tight"
                            >
                              {partner.fullName}
                            </Link>
                            <span className="font-mono text-[11px] text-[#6B6667] leading-tight">
                              {partner.driverCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 font-mono text-xs text-[#111111]">
                          <span>{partner.phone}</span>
                        </div>
                      </td>

                      {/* Work Preference */}
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#F4F1EA] text-[#6B6667]">
                          {partner.workPreference === "FULL_TIME" ? "Full-time" : "Part-time"}
                        </span>
                      </td>

                      {/* Vehicle */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Bike className="w-3.5 h-3.5 text-[#6B6667] shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium text-xs leading-tight text-[#111111]">
                              {partner.vehicleType}
                            </span>
                            <span className="text-[10px] text-[#6B6667] leading-tight">
                              {partner.vehicleModel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Registration Plate */}
                      <td className="py-2 px-3">
                        <span className="font-mono text-xs text-[#111111] font-medium bg-[#F7F7F5] px-1.5 py-0.5 rounded-[4px] border border-[#E4E0DB]">
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
                        <span className="font-mono text-xs text-[#6B6667]">
                          {partner.completedDeliveries}
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
                            className="inline-flex items-center h-7 px-2.5 rounded-[8px] bg-[#FF5A1F] text-white text-xs font-medium hover:bg-[#D94B17] transition-colors shadow-xs"
                          >
                            Review KYC
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/delivery-partners/${partner.id}`}
                            className="inline-flex items-center h-7 px-2.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors"
                          >
                            View
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
          <div className="p-3 border-t border-[#E4E0DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667] bg-[#F4F1EA]">
            <div>
              Showing{" "}
              <strong className="text-[#111111]">
                {Math.min(filteredPartners.length, (currentPage - 1) * pageSize + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-[#111111]">
                {Math.min(filteredPartners.length, currentPage * pageSize)}
              </strong>{" "}
              of <strong className="text-[#111111]">{filteredPartners.length}</strong> partners
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 border border-[#E4E0DB] rounded-[8px] bg-white hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 text-[#111111]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="px-2 text-xs font-medium text-[#111111]">
                Page {currentPage} of {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 border border-[#E4E0DB] rounded-[8px] bg-white hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 text-[#111111]"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
