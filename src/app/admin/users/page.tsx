"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_CUSTOMERS } from "@/mocks/users";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CustomerAccountStatus } from "@/types/users";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter((customer) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(query);
        const matchesEmail = customer.email.toLowerCase().includes(query);
        const matchesPhone = customer.phone.toLowerCase().includes(query);
        const matchesId = customer.customerNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) return false;
      }

      // Status
      if (statusFilter !== "ALL" && customer.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [searchTerm, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCustomers.map((c) => c.id));
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
    setStatusFilter("ALL");
    setDateFilter("ALL");
  };

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto">
      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              User Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary border border-surface-container-highest font-label-xs text-label-xs font-semibold">
              1,420 Registered Customers
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary mt-0.5">
            Manage marketplace customers and supported application accounts.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => alert("Export CSV: Generating customer directory export...")}
            className="h-[36px] px-space-md rounded-lg bg-surface-container-lowest border border-surface-container-highest text-on-surface hover:bg-surface-container transition-colors flex items-center gap-space-xs font-label-sm text-label-sm active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* ================= FILTER & SEARCH TOOLBAR ================= */}
      <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-sm flex flex-wrap items-center justify-between gap-space-sm shadow-none">
        <div className="flex flex-wrap items-center gap-space-sm flex-1 min-w-[320px]">
          {/* Customer Search Field */}
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[17px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, phone, or email..."
              className="w-full h-[36px] pl-9 pr-3 bg-surface text-body-sm text-on-surface placeholder:text-secondary rounded-lg border border-surface-container-highest focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 bg-surface-container-lowest text-body-sm text-on-surface rounded-lg border border-surface-container-highest appearance-none focus:outline-none focus:border-primary-container cursor-pointer font-body-sm-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2 text-secondary pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 bg-surface-container-lowest text-body-sm text-on-surface rounded-lg border border-surface-container-highest appearance-none focus:outline-none focus:border-primary-container cursor-pointer font-body-sm-medium"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2 text-secondary pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "ALL" || dateFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="h-[36px] px-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1 font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="text-right text-secondary font-label-xs text-label-xs pr-1">
          Showing <span className="font-semibold text-on-surface">{filteredCustomers.length}</span>{" "}
          records of 1,420
        </div>
      </section>

      {/* ================= CUSTOMER DATA TABLE ================= */}
      <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-surface-container-low border-b border-surface-container-highest text-secondary font-label-xs text-label-xs uppercase tracking-wider">
                <th className="w-10 px-4 py-0 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCustomers.length > 0 &&
                      selectedIds.length === filteredCustomers.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-surface-container-highest text-primary-container focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-0 font-semibold">Customer ID</th>
                <th className="px-4 py-0 font-semibold">Customer</th>
                <th className="px-4 py-0 font-semibold">Phone</th>
                <th className="px-4 py-0 font-semibold">Registration Date</th>
                <th className="px-4 py-0 font-semibold">Total Orders</th>
                <th className="px-4 py-0 font-semibold text-right">Total Spent</th>
                <th className="px-4 py-0 font-semibold text-center">Account Status</th>
                <th className="px-4 py-0 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm text-on-surface">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl block mx-auto text-secondary mb-2">
                      person_search
                    </span>
                    <p className="font-medium text-on-surface">No customers match your search criteria</p>
                    <p className="text-label-xs mt-1">Try clearing filters or checking spelling</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="h-12 hover:bg-surface-container-low/60 transition-colors">
                    <td className="w-10 px-4 py-0 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(customer.id)}
                        onChange={() => handleSelectOne(customer.id)}
                        className="w-4 h-4 rounded border-surface-container-highest text-primary-container focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-0 font-code-sm text-code-sm text-secondary">
                      {customer.customerNumber}
                    </td>
                    <td className="px-4 py-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFF0E8] text-primary font-bold font-label-xs text-label-xs flex items-center justify-center shrink-0 border border-[#FFDBCE]">
                          {getInitials(customer.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-body-sm-medium text-body-sm-medium text-on-surface truncate">
                            {customer.name}
                          </span>
                          <span className="font-label-xs text-label-xs text-secondary truncate">
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-0 font-code-sm text-code-sm text-secondary tabular-nums">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-0 text-secondary">{customer.registrationDate}</td>
                    <td className="px-4 py-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-xs text-label-xs font-semibold">
                        {customer.totalOrders} orders
                      </span>
                    </td>
                    <td className="px-4 py-0 font-code-sm text-code-sm text-on-surface font-semibold text-right tabular-nums">
                      ₹{customer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-0 text-center">
                      <StatusBadge status={customer.status} variant="user" />
                    </td>
                    <td className="px-4 py-0 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/users/${customer.id}`}
                          className="h-7 px-2 text-primary font-label-xs text-label-xs font-semibold hover:bg-surface-container-high rounded transition-colors flex items-center gap-0.5"
                        >
                          <span>View Details</span>
                          <span className="material-symbols-outlined text-[14px]">
                            chevron_right
                          </span>
                        </Link>
                      </div>
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
            <span className="font-semibold text-on-surface">{filteredCustomers.length}</span> of{" "}
            <span className="font-semibold text-on-surface">1,420</span> entries
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
              3
            </button>
            <button className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs hover:bg-surface">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
