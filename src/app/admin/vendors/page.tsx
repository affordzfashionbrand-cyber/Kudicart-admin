"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_VENDORS } from "@/mocks/vendors";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VendorApprovalStatus } from "@/types/vendors";

export default function AdminVendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "ACTIVE" | "PENDING" | "SUSPENDED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.filter((vendor) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesStore = vendor.storeName.toLowerCase().includes(q);
        const matchesOwner = vendor.ownerName.toLowerCase().includes(q);
        const matchesEmail = vendor.email.toLowerCase().includes(q);
        const matchesId = vendor.vendorNumber.toLowerCase().includes(q);
        if (!matchesStore && !matchesOwner && !matchesEmail && !matchesId) return false;
      }

      // Tab filter
      if (statusTab === "ACTIVE" && vendor.status !== "ACTIVE") return false;
      if (
        statusTab === "PENDING" &&
        vendor.status !== "PENDING_REVIEW" &&
        vendor.status !== "DOCS_SUBMITTED" &&
        vendor.status !== "KYC_PENDING"
      )
        return false;
      if (statusTab === "SUSPENDED" && vendor.status !== "SUSPENDED") return false;

      // Category filter
      if (categoryFilter !== "ALL" && vendor.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [searchTerm, statusTab, categoryFilter]);

  const activeCount = MOCK_VENDORS.filter((v) => v.status === "ACTIVE").length;
  const pendingCount = MOCK_VENDORS.filter(
    (v) =>
      v.status === "PENDING_REVIEW" ||
      v.status === "DOCS_SUBMITTED" ||
      v.status === "KYC_PENDING"
  ).length;
  const suspendedCount = MOCK_VENDORS.filter((v) => v.status === "SUSPENDED").length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusTab("ALL");
    setCategoryFilter("ALL");
    setDateFilter("ALL");
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface">
              Vendor Management
            </h1>
            <span className="px-2.5 py-0.5 text-label-xs font-label-xs rounded-full bg-[#FFF0E8] text-[#852400] font-semibold border border-outline-variant">
              {MOCK_VENDORS.length} Boutiques Registered ({pendingCount} Pending Review)
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-secondary mt-0.5">
            Oversee marketplace vendor boutiques, review onboarding applications, and manage partner status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Export CSV: Generating merchant directory export...")}
            className="px-3.5 py-1.5 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-label-sm font-label-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">file_download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => alert("Add Vendor: Initiating manual boutique onboarding invitation flow...")}
            className="px-3.5 py-1.5 rounded-lg bg-primary-container text-surface-container-lowest hover:bg-pressed-orange text-label-sm font-label-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex items-center border-b border-surface-container-highest gap-1 text-label-sm font-label-sm">
        <button
          onClick={() => setStatusTab("ALL")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 ${
            statusTab === "ALL"
              ? "border-b-2 border-primary-container text-primary font-bold"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <span>All Vendors ({MOCK_VENDORS.length})</span>
        </button>

        <button
          onClick={() => setStatusTab("ACTIVE")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 ${
            statusTab === "ACTIVE"
              ? "border-b-2 border-primary-container text-primary font-bold"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <span>Active ({activeCount})</span>
        </button>

        <button
          onClick={() => setStatusTab("PENDING")}
          className={`px-3 py-2 transition-colors flex items-center gap-2 ${
            statusTab === "PENDING"
              ? "border-b-2 border-primary-container text-primary font-bold"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <span>Pending Approvals ({pendingCount})</span>
          <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
        </button>

        <button
          onClick={() => setStatusTab("SUSPENDED")}
          className={`px-3 py-2 transition-colors flex items-center gap-1.5 ${
            statusTab === "SUSPENDED"
              ? "border-b-2 border-primary-container text-primary font-bold"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <span>Suspended ({suspendedCount})</span>
        </button>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="p-3 bg-surface-container-lowest border border-surface-container-highest rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Input */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[17px]">search</span>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by boutique name, owner, or email..."
              className="w-full pl-8 pr-3 py-1.5 text-body-sm font-body-sm bg-surface-container-low border border-surface-container-highest rounded-lg text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container-low focus:outline-none focus:border-primary-container cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Textiles & Apparel">Textiles &amp; Apparel</option>
              <option value="Artisanal Food">Artisanal Food</option>
              <option value="Home & Decor">Home &amp; Decor</option>
              <option value="Leathercraft">Leathercraft</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </span>
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container-low focus:outline-none focus:border-primary-container cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="QUARTER">This Quarter</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            </span>
          </div>

          {(searchTerm || statusTab !== "ALL" || categoryFilter !== "ALL" || dateFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="text-body-sm font-body-sm text-secondary hover:text-on-surface underline ml-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="text-body-sm font-body-sm text-secondary">
          Showing <span className="font-bold text-on-surface">{filteredVendors.length}</span> of{" "}
          {MOCK_VENDORS.length} vendors
        </div>
      </div>

      {/* HIGH DENSITY DATA TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-surface-container border-b border-surface-container-highest text-secondary text-label-xs font-label-xs uppercase tracking-wider">
                <th className="px-4 font-semibold">STORE / BOUTIQUE</th>
                <th className="px-4 font-semibold">OWNER / CONTACT</th>
                <th className="px-4 font-semibold">CATEGORY</th>
                <th className="px-4 font-semibold text-right">PRODUCTS</th>
                <th className="px-4 font-semibold text-right">ACTIVE ORDERS</th>
                <th className="px-4 font-semibold">SUBMISSION / REG. DATE</th>
                <th className="px-4 font-semibold text-center">APPROVAL STATUS</th>
                <th className="px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm text-on-surface">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl block mx-auto text-secondary mb-2">
                      store
                    </span>
                    <p className="font-medium text-on-surface">No vendors match your search filters</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="h-14 hover:bg-surface-container-low transition-colors">
                    {/* Store / Boutique */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-surface-container-highest flex items-center justify-center font-bold text-label-xs text-on-surface shrink-0">
                          {getInitials(vendor.storeName)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface leading-snug">{vendor.storeName}</p>
                          <p className="text-label-xs font-label-xs text-secondary truncate max-w-[200px]">
                            {vendor.operatingHub}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner / Contact */}
                    <td className="px-4 py-2">
                      <p className="font-medium text-on-surface leading-tight">{vendor.ownerName}</p>
                      <p className="text-code-xs font-code-xs text-secondary">{vendor.email}</p>
                      <p className="text-code-xs font-code-xs text-secondary">{vendor.phone}</p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs bg-surface-container text-on-surface">
                        {vendor.category}
                      </span>
                    </td>

                    {/* Products */}
                    <td className="px-4 py-2 text-right font-code-sm font-code-sm tabular-nums text-on-surface">
                      {vendor.productCount} items
                    </td>

                    {/* Active Orders */}
                    <td className="px-4 py-2 text-right font-code-sm font-code-sm tabular-nums">
                      {vendor.activeOrderCount > 0 ? (
                        <span className="font-bold text-primary">{vendor.activeOrderCount} live</span>
                      ) : (
                        <span className="text-secondary">0 active</span>
                      )}
                    </td>

                    {/* Submission / Reg Date */}
                    <td className="px-4 py-2 text-secondary text-label-xs">
                      {vendor.submissionDate}
                    </td>

                    {/* Approval Status */}
                    <td className="px-4 py-2 text-center">
                      <StatusBadge status={vendor.status} variant="vendor" />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2 text-right">
                      {vendor.status === "PENDING_REVIEW" ||
                      vendor.status === "DOCS_SUBMITTED" ||
                      vendor.status === "KYC_PENDING" ? (
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="h-7 px-3 bg-[#FF5A1F] hover:bg-[#D94B17] text-white font-label-sm text-label-sm font-semibold rounded-lg transition-colors inline-flex items-center shadow-xs"
                        >
                          Review
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="h-7 px-2.5 border border-surface-container-highest bg-surface-container-lowest hover:bg-surface text-on-surface font-label-sm text-label-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-surface-container-highest flex items-center justify-between text-label-xs text-secondary">
          <div>
            Showing <span className="font-semibold text-on-surface">1</span> to{" "}
            <span className="font-semibold text-on-surface">{filteredVendors.length}</span> of{" "}
            <span className="font-semibold text-on-surface">48</span> boutiques
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs opacity-50 cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-2.5 py-1 rounded border border-primary-container bg-primary-container text-surface-container-lowest text-label-xs font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs hover:bg-surface">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs hover:bg-surface">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
