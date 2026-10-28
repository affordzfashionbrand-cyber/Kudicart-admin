"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VendorBoutique } from "@/types/vendors";
import { getDemoVendors, generateVendorsCSV } from "@/demo-data/vendors";

const PAGE_SIZE = 8;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorBoutique[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "ACTIVE" | "PENDING" | "SUSPENDED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Feedback
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const data = getDemoVendors();
    setVendors(data);
    setLoading(false);
  }, []);

  // Dynamic status counts
  const counts = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.status === "ACTIVE").length;
    const pending = vendors.filter(
      (v) =>
        v.status === "PENDING_REVIEW" ||
        v.status === "DOCS_SUBMITTED" ||
        v.status === "KYC_PENDING"
    ).length;
    const suspended = vendors.filter((v) => v.status === "SUSPENDED").length;
    return { total, active, pending, suspended };
  }, [vendors]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set).sort();
  }, [vendors]);

  // Filtered dataset
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesStore = vendor.storeName.toLowerCase().includes(q);
        const matchesOwner = vendor.ownerName.toLowerCase().includes(q);
        const matchesEmail = vendor.email.toLowerCase().includes(q);
        const matchesId = vendor.vendorNumber.toLowerCase().includes(q) || vendor.id.toLowerCase().includes(q);
        if (!matchesStore && !matchesOwner && !matchesEmail && !matchesId) return false;
      }

      if (statusTab === "ACTIVE" && vendor.status !== "ACTIVE") return false;
      if (
        statusTab === "PENDING" &&
        vendor.status !== "PENDING_REVIEW" &&
        vendor.status !== "DOCS_SUBMITTED" &&
        vendor.status !== "KYC_PENDING"
      ) {
        return false;
      }
      if (statusTab === "SUSPENDED" && vendor.status !== "SUSPENDED") return false;

      if (categoryFilter !== "ALL" && vendor.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [vendors, searchTerm, statusTab, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusTab, categoryFilter, dateFilter]);

  const totalRecords = filteredVendors.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredVendors.slice(start, start + PAGE_SIZE);
  }, [filteredVendors, currentPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusTab("ALL");
    setCategoryFilter("ALL");
    setDateFilter("ALL");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (filteredVendors.length === 0) return;
    const csvContent = generateVendorsCSV(filteredVendors);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `kudicart_vendors_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-[8px] shadow-lg flex items-center gap-3 border border-[#333333] text-xs">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#6B6667] hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Vendors
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB] text-xs font-medium tabular-nums">
              {counts.total} Boutiques ({counts.pending} Pending Review)
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Oversee marketplace boutiques, review onboarding applications, and manage partner status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-white text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#6B6667]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddVendorModalOpen(true)}
            className="h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] text-white hover:bg-[#D94B17] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center border-b border-[#E4E0DB] gap-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setStatusTab("ALL")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 border-b-2 ${
            statusTab === "ALL"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>All Vendors</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667]">
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("ACTIVE")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 border-b-2 ${
            statusTab === "ACTIVE"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Active</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667]">
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("PENDING")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 border-b-2 ${
            statusTab === "PENDING"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Pending Approvals</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#FFF0E8] text-[#D94B17] font-medium">
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("SUSPENDED")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 border-b-2 ${
            statusTab === "SUSPENDED"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Suspended</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667]">
            {counts.suspended}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6667] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search boutique name, owner, or email..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] placeholder:text-[#6B6667]/60 focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-normal"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none"
            >
              <option value="ALL">All Time</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {(searchTerm || statusTab !== "ALL" || categoryFilter !== "ALL" || dateFilter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-2.5 rounded-[8px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="text-right text-[#6B6667] text-xs">
          Showing <span className="font-semibold text-[#111111]">{filteredVendors.length}</span> of{" "}
          <span className="font-semibold text-[#111111]">{vendors.length}</span> vendors
        </div>
      </div>

      {/* Vendors Data Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4 sm:px-5 py-0 font-medium">Boutique</th>
                <th className="px-4 py-0 font-medium">Owner & Contact</th>
                <th className="px-4 py-0 font-medium">Category</th>
                <th className="px-4 py-0 font-medium text-right">Products</th>
                <th className="px-4 py-0 font-medium text-right">Active Orders</th>
                <th className="px-4 py-0 font-medium whitespace-nowrap">Submission Date</th>
                <th className="px-4 py-0 font-medium text-center whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-5 py-0 font-medium text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#6B6667]">
                    <p className="text-xs font-medium">Loading vendors...</p>
                  </td>
                </tr>
              ) : paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#6B6667]">
                    <p className="font-medium text-[#111111]">No vendor records found</p>
                    <p className="text-xs text-[#6B6667] mt-1">Try adjusting search keywords or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor) => {
                  const isPending =
                    vendor.status === "PENDING_REVIEW" ||
                    vendor.status === "DOCS_SUBMITTED" ||
                    vendor.status === "KYC_PENDING";

                  return (
                    <tr key={vendor.id} className="h-12 hover:bg-[#F7F7F5]/50 transition-colors">
                      {/* Store / Boutique */}
                      <td className="px-4 sm:px-5 py-0">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/admin/vendors/${vendor.id}`}
                            className="w-7 h-7 rounded-[6px] bg-[#F4F1EA] border border-[#E4E0DB] flex items-center justify-center font-semibold text-xs text-[#111111] shrink-0 hover:border-[#FF5A1F] transition-colors"
                          >
                            {getInitials(vendor.storeName)}
                          </Link>
                          <div>
                            <Link
                              href={`/admin/vendors/${vendor.id}`}
                              className="font-medium text-[#111111] hover:text-[#FF5A1F] transition-colors block leading-tight"
                            >
                              {vendor.storeName}
                            </Link>
                            <p className="text-xs text-[#6B6667] truncate max-w-[210px] mt-0.5">
                              {vendor.operatingHub || "Bandra West Node"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owner / Contact */}
                      <td className="px-4 py-0">
                        <p className="font-medium text-[#111111] leading-tight">
                          {vendor.ownerName}
                        </p>
                        <p className="text-xs text-[#6B6667] truncate max-w-[190px]">
                          {vendor.email}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                        {vendor.category}
                      </td>

                      {/* Products */}
                      <td className="px-4 py-0 text-right font-medium tabular-nums text-xs text-[#111111] whitespace-nowrap">
                        {vendor.productCount}
                      </td>

                      {/* Active Orders */}
                      <td className="px-4 py-0 text-right tabular-nums text-xs whitespace-nowrap">
                        {vendor.activeOrderCount > 0 ? (
                          <span className="font-semibold text-[#FF5A1F]">
                            {vendor.activeOrderCount} live
                          </span>
                        ) : (
                          <span className="text-[#6B6667]">0</span>
                        )}
                      </td>

                      {/* Submission / Reg Date */}
                      <td className="px-4 py-0 text-[#6B6667] text-xs whitespace-nowrap">
                        {vendor.submissionDate}
                      </td>

                      {/* Approval Status */}
                      <td className="px-4 py-0 text-center whitespace-nowrap">
                        <StatusBadge status={vendor.status} variant="vendor" />
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors inline-flex items-center gap-0.5 ${
                            isPending
                              ? "text-[#FF5A1F] hover:text-[#D94B17] hover:bg-[#FFF0E8]"
                              : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                          }`}
                        >
                          <span>{isPending ? "Review" : "Manage"}</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#E4E0DB] bg-[#F7F7F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667]">
          <div>
            Showing <span className="font-semibold text-[#111111]">{totalRecords === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
            <span className="font-semibold text-[#111111]">{Math.min(currentPage * PAGE_SIZE, totalRecords)}</span> of{" "}
            <span className="font-semibold text-[#111111]">{totalRecords}</span> boutiques
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] bg-white text-[#6B6667] text-xs font-medium hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-[6px] text-xs font-medium transition-colors ${
                    currentPage === p
                      ? "bg-[#FF5A1F] text-white"
                      : "border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F4F1EA]"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] bg-white text-[#6B6667] text-xs font-medium hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setIsAddVendorModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[10px] border border-[#E4E0DB] max-w-md w-full p-5 shadow-xl space-y-3"
          >
            <div>
              <h3 className="text-base font-semibold text-[#111111]">
                Add Boutique Vendor
              </h3>
              <p className="text-xs text-[#6B6667] mt-1 leading-normal">
                Boutique onboarding is initiated via the Vendor Portal onboarding flow.
              </p>
            </div>

            <div className="bg-[#F4F1EA] rounded-[8px] p-3 text-xs text-[#6B6667]">
              Not connected in this build. Administrative vendor creation requires backend server connectivity.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsAddVendorModalOpen(false)}
                className="px-3.5 py-2 rounded-[8px] bg-[#111111] text-white font-medium text-xs hover:bg-[#333333] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
