"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CustomerUser } from "@/types/users";
import { getDemoCustomers, generateCustomersCSV } from "@/demo-data/users";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load customers from backend with demo fallback
  const loadCustomers = () => {
    setIsLoading(true);
    setError(null);

    api.users.list({ limit: 100 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setCustomers(res.data);
        } else {
          setCustomers(getDemoCustomers());
        }
      })
      .catch(() => {
        setCustomers(getDemoCustomers());
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = customer.name.toLowerCase().includes(query);
        const matchesEmail = customer.email.toLowerCase().includes(query);
        const matchesPhone = customer.phone.toLowerCase().includes(query);
        const matchesId = customer.customerNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) {
          return false;
        }
      }

      if (statusFilter !== "ALL" && customer.status !== statusFilter) {
        return false;
      }

      if (dateFilter !== "ALL") {
        const regDate = new Date(customer.registrationDate);
        const now = new Date();
        const diffDays = (now.getTime() - regDate.getTime()) / (1000 * 3600 * 24);

        if (dateFilter === "TODAY" && diffDays > 1) return false;
        if (dateFilter === "7_DAYS" && diffDays > 7) return false;
        if (dateFilter === "30_DAYS" && diffDays > 30) return false;
      }

      return true;
    });
  }, [customers, searchTerm, statusFilter, dateFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Pagination calculations
  const totalRecords = filteredCustomers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDateFilter("ALL");
  };

  const handleExportCSV = () => {
    if (!filteredCustomers.length) return;
    const csvContent = generateCustomersCSV(filteredCustomers);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `kudicart_customers_${dateStr}.csv`);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Users
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB] text-xs font-medium tabular-nums">
              {totalRecords} Customers
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Directory of registered marketplace customers and account details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isLoading || filteredCustomers.length === 0}
            className="h-9 px-3 rounded-[8px] bg-white border border-[#E4E0DB] text-[#111111] hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px] text-[#6B6667]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
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
              placeholder="Search name, email, phone, ID..."
              className="w-full h-9 pl-9 pr-3 bg-[#F7F7F5] text-xs text-[#111111] placeholder:text-[#6B6667]/60 rounded-[8px] border border-[#E4E0DB] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-normal"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F7F5] text-xs text-[#111111] rounded-[8px] border border-[#E4E0DB] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Registration Date Dropdown */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F7F5] text-xs text-[#111111] rounded-[8px] border border-[#E4E0DB] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer font-medium"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Registered Today</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {(searchTerm || statusFilter !== "ALL" || dateFilter !== "ALL") && (
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
          Showing <span className="font-semibold text-[#111111]">{filteredCustomers.length}</span> customers
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#6B6667] space-y-2">
            <p className="text-xs font-medium">Loading customer directory...</p>
          </div>
        ) : error && customers.length === 0 ? (
          <div className="p-12 text-center text-[#6B6667] space-y-3">
            <p className="text-xs text-[#DA1E28] font-medium">{error}</p>
            <button
              type="button"
              onClick={loadCustomers}
              className="px-3 py-1.5 rounded-[8px] bg-[#FF5A1F] text-white text-xs font-medium hover:bg-[#D94B17]"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                  <th className="px-4 sm:px-5 py-0 font-medium">Customer ID</th>
                  <th className="px-4 py-0 font-medium">Customer</th>
                  <th className="px-4 py-0 font-medium whitespace-nowrap">Phone</th>
                  <th className="px-4 py-0 font-medium whitespace-nowrap">Registration Date</th>
                  <th className="px-4 py-0 font-medium text-center whitespace-nowrap">Orders</th>
                  <th className="px-4 py-0 font-medium text-right whitespace-nowrap">Total Spent</th>
                  <th className="px-4 py-0 font-medium text-center whitespace-nowrap">Status</th>
                  <th className="px-4 sm:px-5 py-0 font-medium text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#6B6667]">
                      <p className="font-medium text-[#111111]">No customers found</p>
                      <p className="text-xs text-[#6B6667] mt-1">Try modifying your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="h-12 hover:bg-[#F7F7F5]/50 transition-colors">
                      <td className="px-4 sm:px-5 py-0 font-mono text-xs font-medium text-[#111111] whitespace-nowrap">
                        <Link href={`/admin/users/${customer.id}`} className="hover:text-[#FF5A1F]">
                          {customer.customerNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#FFF0E8] text-[#D94B17] font-medium text-[11px] flex items-center justify-center shrink-0 border border-[#FF5A1F]/20">
                            {getInitials(customer.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/admin/users/${customer.id}`}
                              className="font-medium text-[#111111] hover:text-[#FF5A1F] truncate"
                            >
                              {customer.name}
                            </Link>
                            <span className="text-xs text-[#6B6667] truncate max-w-[180px]">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-0 font-mono text-xs text-[#6B6667] whitespace-nowrap tabular-nums">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                        {customer.registrationDate}
                      </td>
                      <td className="px-4 py-0 text-center whitespace-nowrap font-medium tabular-nums">
                        {customer.totalOrders}
                      </td>
                      <td className="px-4 py-0 font-semibold text-[#111111] text-right tabular-nums whitespace-nowrap">
                        ₹{customer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-0 text-center whitespace-nowrap">
                        <StatusBadge status={customer.status} variant="user" />
                      </td>
                      <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/users/${customer.id}`}
                          className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] hover:bg-[#FFF0E8] px-2 py-0.5 rounded transition-colors inline-flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && totalRecords > 0 && (
          <div className="px-4 sm:px-5 py-3 border-t border-[#E4E0DB] bg-[#F7F7F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667]">
            <div>
              Showing <span className="font-semibold text-[#111111]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-[#111111]">{Math.min(currentPage * pageSize, totalRecords)}</span> of{" "}
              <span className="font-semibold text-[#111111]">{totalRecords}</span> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] bg-white text-[#6B6667] text-xs hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={cn(
                    "w-7 h-7 rounded-[6px] border text-xs font-medium transition-colors",
                    currentPage === pg
                      ? "border-[#FF5A1F] bg-[#FF5A1F] text-white"
                      : "border-[#E4E0DB] bg-white text-[#6B6667] hover:bg-[#F4F1EA]"
                  )}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] bg-white text-[#6B6667] text-xs hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
