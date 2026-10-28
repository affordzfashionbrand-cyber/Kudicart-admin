"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  FilterX,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { SupportTicketItem, TicketStatus } from "@/types/support";
import { MOCK_TICKETS } from "@/mocks/support";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(MOCK_TICKETS[0]);
  const [activeTab, setActiveTab] = useState<string>("ALL"); // ALL, OPEN, IN_PROGRESS, RESOLVED
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tab counts
  const allCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Tab filter
      if (activeTab !== "ALL" && t.status !== activeTab) {
        return false;
      }

      // Search keyword
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesCustomer = t.customerName.toLowerCase().includes(q) || t.customerEmail.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        const matchesOrder = t.orderNumber.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesSubject && !matchesOrder) return false;
      }

      // Category
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) {
        return false;
      }

      // Assignee
      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED" && t.assignee.toLowerCase() !== "unassigned") return false;
        if (assigneeFilter !== "UNASSIGNED" && !t.assignee.toLowerCase().includes(assigneeFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [tickets, activeTab, searchTerm, categoryFilter, priorityFilter, assigneeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setPriorityFilter("ALL");
    setAssigneeFilter("ALL");
  };

  const handleExportCsv = () => {
    const headers = "Ticket ID,Time,Customer,Email,Phone,Category,Order,Amount,Status,Priority,Assignee,Subject\n";
    const rows = filteredTickets
      .map(
        (t) =>
          `"${t.id}","${t.timeAgo}","${t.customerName}","${t.customerEmail}","${t.customerPhone}","${t.category}","${t.orderNumber}",${t.orderAmount},"${t.status}","${t.priority}","${t.assignee}","${t.subject.replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kudicart_support_tickets_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showToast(`Exported ${filteredTickets.length} support tickets.`);
  };

  const handleTransition = (newStatus: TicketStatus) => {
    showToast(
      "Not connected in this build: Ticket status transitions require backend service.",
      "error"
    );
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
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
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ================= SECTION 1: PAGE HEADER ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Support Tickets
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Track customer inquiries, delivery questions, and order resolution workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setTickets([...MOCK_TICKETS]);
              showToast("Support ticket list refreshed.");
            }}
            className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 shadow-xs"
            title="Refresh Queue"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* ================= SECTION 2: QUEUE STATUS TABS ================= */}
      <nav className="flex items-center border-b border-[#E4E0DB] gap-6 text-xs whitespace-nowrap overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`pb-2.5 flex items-center gap-1.5 font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "ALL"
              ? "text-[#FF5A1F] border-[#FF5A1F]"
              : "text-[#6B6667] hover:text-[#111111] border-transparent"
          }`}
        >
          <span>All Tickets</span>
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667] font-mono text-[10px]">
            {allCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("OPEN")}
          className={`pb-2.5 flex items-center gap-1.5 font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "OPEN"
              ? "text-[#C9822E] border-[#C9822E]"
              : "text-[#6B6667] hover:text-[#111111] border-transparent"
          }`}
        >
          <span>Open</span>
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A] font-mono text-[10px]">
            {openCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`pb-2.5 flex items-center gap-1.5 font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "IN_PROGRESS"
              ? "text-[#FF5A1F] border-[#FF5A1F]"
              : "text-[#6B6667] hover:text-[#111111] border-transparent"
          }`}
        >
          <span>In Progress</span>
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FFF0E8] text-[#FF5A1F] border border-[#FF5A1F]/20 font-mono text-[10px]">
            {inProgressCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("RESOLVED")}
          className={`pb-2.5 flex items-center gap-1.5 font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "RESOLVED"
              ? "text-[#20885A] border-[#20885A]"
              : "text-[#6B6667] hover:text-[#111111] border-transparent"
          }`}
        >
          <span>Resolved</span>
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] font-mono text-[10px]">
            {resolvedCount}
          </span>
        </button>
      </nav>

      {/* ================= SECTION 3: SEARCH & MULTI-PARAM FILTERS ================= */}
      <section className="bg-white p-3 rounded-[10px] border border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 items-center gap-2.5 min-w-[280px] flex-wrap">
          {/* Keyword Search */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket ID, customer, or order ID..."
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none placeholder:text-[#6B6667]"
            />
          </div>

          {/* Issue Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white font-medium text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Try & Buy Inspection">Try &amp; Buy</option>
              <option value="Delivery Delay">Delivery Delay</option>
              <option value="Damaged Goods">Damaged Goods</option>
              <option value="Payment Failure">Payment Failure</option>
              <option value="Vendor Dispute">Vendor Dispute</option>
              <option value="Address Correction">Address Correction</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white font-medium text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Assignee Filter */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white font-medium text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Assignees</option>
              <option value="Rahul M.">Rahul M.</option>
              <option value="Sneha K.">Sneha K.</option>
              <option value="Amara O.">Amara O.</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters Action */}
        {(searchTerm || categoryFilter !== "ALL" || priorityFilter !== "ALL" || assigneeFilter !== "ALL") && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#6B6667] hover:text-[#FF5A1F] flex items-center gap-1 pr-2 transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </section>

      {/* ================= SECTION 4 & 5: WORKBENCH SPLIT LAYOUT ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Table View (7 Cols) */}
        <div className="xl:col-span-7 bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[#6B6667] text-xs font-medium">
                  <th className="py-2 pl-4 pr-2 font-medium">Ticket ID</th>
                  <th className="py-2 px-2 font-medium">Customer</th>
                  <th className="py-2 px-2 font-medium">Category / Order</th>
                  <th className="py-2 px-2 font-medium">Status</th>
                  <th className="py-2 px-2 font-medium">Priority</th>
                  <th className="py-2 px-2 font-medium">Assignee</th>
                  <th className="py-2 pr-4 pl-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10">
                      <EmptyState
                        title="No support tickets match filters"
                        description="Try modifying search keywords or clearing active filters."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                        icon="support_agent"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((tick) => {
                    const isSelected = selectedTicket?.id === tick.id;

                    return (
                      <tr
                        key={tick.id}
                        onClick={() => setSelectedTicket(tick)}
                        className={`h-12 cursor-pointer transition-colors border-b border-[#E4E0DB] ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-2 border-l-[#FF5A1F]"
                            : "hover:bg-[#F7F7F5]/50"
                        }`}
                      >
                        <td className="py-2 pl-4 pr-2">
                          <div className="font-mono font-medium text-[#FF5A1F]">{tick.id}</div>
                          <span className="text-[10px] text-[#6B6667]">{tick.timeAgo}</span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-[#111111] truncate max-w-[120px]">
                            {tick.customerName}
                          </div>
                          <div className="text-[11px] text-[#6B6667] truncate max-w-[120px]">
                            {tick.customerEmail}
                          </div>
                        </td>
                        <td className="py-2 px-2 max-w-[180px]">
                          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667] text-[11px] truncate max-w-full">
                            {tick.category}
                          </span>
                          <div className="text-[11px] text-[#6B6667] truncate mt-0.5 font-mono">
                            {tick.orderNumber}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <StatusBadge status={tick.status} variant="ticket" />
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex items-center text-[11px] font-medium ${
                              tick.priority === "HIGH"
                                ? "text-[#DA1E28]"
                                : tick.priority === "MEDIUM"
                                ? "text-[#C9822E]"
                                : "text-[#6B6667]"
                            }`}
                          >
                            {tick.priority}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-xs text-[#6B6667]">
                            {tick.assignee}
                          </span>
                        </td>
                        <td className="py-2 pr-4 pl-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(tick);
                            }}
                            className={`px-2.5 py-1 rounded-[8px] text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-[#FF5A1F] text-white"
                                : "border border-[#E4E0DB] text-[#111111] hover:bg-[#F7F7F5]"
                            }`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Resolution Dossier Panel (5 Cols) */}
        {selectedTicket ? (
          <div className="xl:col-span-5 bg-white rounded-[10px] border border-[#E4E0DB] shadow-xs p-5 space-y-4 sticky top-20">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E0DB]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#111111]">Ticket Details</h2>
                  <span className="font-mono text-xs font-medium text-[#FF5A1F]">{selectedTicket.id}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[11px] text-[#6B6667]">
                    {selectedTicket.category}
                  </span>
                  <StatusBadge status={selectedTicket.status} variant="ticket" />
                  <span
                    className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium border ${
                      selectedTicket.priority === "HIGH"
                        ? "bg-red-50 text-[#DA1E28] border-red-200"
                        : "bg-[#F4F1EA] text-[#6B6667] border-[#E4E0DB]"
                    }`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Identity Card */}
            <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#6B6667]" />
                  <strong className="text-[#111111] font-medium">{selectedTicket.customerName}</strong>
                </div>
                <span className="px-1.5 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] text-[10px] font-medium">
                  {selectedTicket.customerTier}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#6B6667] text-[11px] pt-1.5 border-t border-[#E4E0DB]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-mono text-[#111111]">{selectedTicket.customerPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate text-[#111111]">{selectedTicket.location}</span>
                </div>
              </div>
            </div>

            {/* Associated Order Context */}
            <div className="p-3 rounded-[8px] bg-white border border-[#E4E0DB] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#6B6667]">
                <span className="font-medium text-[11px]">Associated Order</span>
                <Link
                  href={`/admin/orders/${selectedTicket.orderNumber.replace("#", "")}`}
                  className="font-mono font-medium text-[#FF5A1F] hover:underline"
                >
                  {selectedTicket.orderNumber}
                </Link>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-[#111111] text-xs leading-snug">
                  {selectedTicket.orderProductSummary}
                </p>
                <span className="font-mono font-medium text-[#111111] ml-2 shrink-0">
                  {formatINR(selectedTicket.orderAmount)}
                </span>
              </div>
              <div className="text-[11px] text-[#6B6667] flex items-center gap-3 pt-1 border-t border-[#E4E0DB]">
                <span>Status: <strong className="text-[#111111] font-medium">{selectedTicket.orderDeliveryStatus}</strong></span>
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-1 text-xs">
              <span className="font-medium text-[#6B6667] text-[11px]">
                Issue Description
              </span>
              <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] text-[#111111] leading-relaxed italic">
                &ldquo;{selectedTicket.description}&rdquo;
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#6B6667] text-[11px]">
                  Status Progression
                </span>
                <span className="font-mono text-xs font-medium text-[#111111]">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedTicket.status === "OPEN" && (
                  <button
                    onClick={() => handleTransition("IN_PROGRESS")}
                    className="h-8 px-3.5 rounded-[8px] bg-[#FF5A1F] text-white font-medium text-xs hover:bg-[#D94B17] transition-colors shadow-xs"
                  >
                    Start Progress
                  </button>
                )}

                {selectedTicket.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleTransition("RESOLVED")}
                    className="h-8 px-3.5 rounded-[8px] bg-[#20885A] text-white font-medium text-xs hover:bg-[#1b734c] transition-colors shadow-xs"
                  >
                    Mark as Resolved
                  </button>
                )}

                {selectedTicket.status === "RESOLVED" && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#20885A] font-medium bg-[#ECFDF5] px-2.5 py-1 rounded-[6px] border border-[#A7F3D0]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved {selectedTicket.resolvedAt || "24 Oct 2024"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-5 bg-white rounded-[10px] border border-[#E4E0DB] p-8 text-center text-[#6B6667]">
            <FileText className="w-8 h-8 text-[#6B6667] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#111111]">Select a support ticket</p>
            <p className="text-xs text-[#6B6667] mt-1">Click any ticket in the queue to inspect details.</p>
          </div>
        )}
      </section>
    </div>
  );
}
