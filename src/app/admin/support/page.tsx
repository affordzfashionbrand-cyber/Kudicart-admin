"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { SupportTicketItem, TicketStatus, TicketPriority, TicketCategory } from "@/types/support";
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

  // State transition note
  const [adminNote, setAdminNote] = useState<string>(
    "Coordinated with Bandra West hub dispatch. Rider briefed on 15-min protocol + granted 5-min extension under High Value Try & Buy exemption."
  );
  const [transitionFeedback, setTransitionFeedback] = useState<string | null>(null);

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
  };

  // State Transition Sequence: OPEN -> IN_PROGRESS -> RESOLVED
  const handleTransition = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.id;
    const updated = {
      ...selectedTicket,
      status: newStatus,
      resolutionRemarks: adminNote.trim() || selectedTicket.resolutionRemarks,
      resolvedAt: newStatus === "RESOLVED" ? "Just now" : selectedTicket.resolvedAt,
    };

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    setSelectedTicket(updated);
    setTransitionFeedback(`Ticket ${ticketId} status transitioned to ${newStatus}. Internal audit note recorded.`);
    setTimeout(() => setTransitionFeedback(null), 5000);
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto select-none">
      {/* ================= SECTION 1: PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Support Tickets
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-mono text-[11px] font-semibold">
              SLA Engine Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-1 max-w-3xl">
            Track customer and merchant fulfillment issues, manage resolution workflows, and oversee operational SLAs across multi-hub deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setTickets([...MOCK_TICKETS])}
            className="h-9 px-3 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface font-label-sm text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
            title="Refresh Queue"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface font-label-sm text-xs font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export Tickets CSV</span>
          </button>
        </div>
      </section>

      {/* Transition Notification Feedback */}
      {transitionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{transitionFeedback}</span>
        </div>
      )}

      {/* ================= SECTION 2: QUEUE STATUS TABS ================= */}
      <nav className="flex items-center border-b border-surface-container-highest gap-6 text-sm">
        {/* All Tickets */}
        <button
          onClick={() => setActiveTab("ALL")}
          className={`pb-3 flex items-center gap-2 font-semibold transition-colors border-b-2 ${
            activeTab === "ALL"
              ? "text-[#FF5A1F] border-[#FF5A1F]"
              : "text-secondary hover:text-on-surface border-transparent"
          }`}
        >
          <span>All Tickets</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-mono text-[11px] font-semibold">
            {allCount}
          </span>
        </button>

        {/* Open (Action Req.) */}
        <button
          onClick={() => setActiveTab("OPEN")}
          className={`pb-3 flex items-center gap-2 font-semibold transition-colors border-b-2 ${
            activeTab === "OPEN"
              ? "text-[#C9822E] border-[#C9822E]"
              : "text-secondary hover:text-on-surface border-transparent"
          }`}
        >
          <span>Open</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[11px] font-semibold">
            {openCount} Action Req.
          </span>
        </button>

        {/* In Progress */}
        <button
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`pb-3 flex items-center gap-2 font-semibold transition-colors border-b-2 ${
            activeTab === "IN_PROGRESS"
              ? "text-[#FF5A1F] border-[#FF5A1F]"
              : "text-secondary hover:text-on-surface border-transparent"
          }`}
        >
          <span>In Progress</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5A1F] border border-orange-200 font-mono text-[11px] font-semibold">
            {inProgressCount}
          </span>
        </button>

        {/* Resolved */}
        <button
          onClick={() => setActiveTab("RESOLVED")}
          className={`pb-3 flex items-center gap-2 font-semibold transition-colors border-b-2 ${
            activeTab === "RESOLVED"
              ? "text-[#20885A] border-[#20885A]"
              : "text-secondary hover:text-on-surface border-transparent"
          }`}
        >
          <span>Resolved</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-mono text-[11px] font-semibold">
            {resolvedCount}
          </span>
        </button>
      </nav>

      {/* ================= SECTION 3: SEARCH & MULTI-PARAM FILTERS ================= */}
      <section className="bg-surface-container-lowest p-space-sm rounded-xl border border-surface-container-highest flex flex-wrap items-center justify-between gap-space-sm shadow-xs">
        <div className="flex flex-1 items-center gap-space-xs min-w-[280px] flex-wrap">
          {/* Keyword Search */}
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-2.5">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Ticket ID (#TICK-...), customer, subject, or order ID..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-surface-container-highest bg-white text-on-surface font-body-sm text-xs focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] placeholder:text-secondary"
            />
          </div>

          {/* Issue Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-surface-container-highest bg-white font-medium text-xs text-on-surface focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Try & Buy Inspection">Try &amp; Buy Inspection</option>
              <option value="Delivery Delay">Delivery Delay</option>
              <option value="Damaged Goods">Damaged Goods</option>
              <option value="Payment Failure">Payment Failure</option>
              <option value="Vendor Dispute">Vendor Dispute</option>
              <option value="Address Correction">Address Correction</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-secondary absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-surface-container-highest bg-white font-medium text-xs text-on-surface focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="NORMAL">Normal</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-secondary absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Assignee Filter */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-surface-container-highest bg-white font-medium text-xs text-on-surface focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Assignees</option>
              <option value="Rahul M.">Rahul M. (Ops Lead)</option>
              <option value="Sneha K.">Sneha K. (Finance)</option>
              <option value="Amara O.">Amara O. (Chief Ops)</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-secondary absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Clear Filters Action */}
        {(searchTerm || categoryFilter !== "ALL" || priorityFilter !== "ALL" || assigneeFilter !== "ALL") && (
          <button
            onClick={clearFilters}
            className="font-medium text-xs text-primary hover:underline flex items-center gap-1 pr-2"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>Clear Filters</span>
          </button>
        )}
      </section>

      {/* ================= SECTION 4 & 5: WORKBENCH SPLIT LAYOUT ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* Table View (7 Cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 border-b border-surface-container-highest bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">view_list</span>
              <span className="font-semibold text-xs text-on-surface">Active Operational Tickets</span>
            </div>
            <span className="font-mono text-[11px] text-secondary">
              Showing {filteredTickets.length} of {tickets.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-surface border-b border-surface-container-highest text-secondary text-label-xs uppercase tracking-wider font-semibold">
                  <th className="py-2 pl-4 pr-2">Ticket ID</th>
                  <th className="py-2 px-2">Customer / Requester</th>
                  <th className="py-2 px-2">Issue Context</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Priority</th>
                  <th className="py-2 px-2">Assignee</th>
                  <th className="py-2 pr-4 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-xs font-body-sm">
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
                        onClick={() => {
                          setSelectedTicket(tick);
                          if (tick.resolutionRemarks) setAdminNote(tick.resolutionRemarks);
                        }}
                        className={`h-14 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-4 border-l-[#FF5A1F]"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <td className="py-2 pl-4 pr-2">
                          <div className="font-mono font-semibold text-primary">{tick.id}</div>
                          <span className="text-[10px] font-mono text-secondary">{tick.timeAgo}</span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-semibold text-on-surface truncate max-w-[120px]">
                            {tick.customerName}
                          </div>
                          <div className="text-[11px] text-secondary truncate max-w-[120px]">
                            {tick.customerEmail}
                          </div>
                        </td>
                        <td className="py-2 px-2 max-w-[180px]">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[11px] truncate max-w-full">
                            {tick.category}
                          </span>
                          <div className="text-[11px] text-secondary truncate mt-0.5 font-mono">
                            {tick.orderNumber}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <StatusBadge status={tick.status} variant="ticket" />
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              tick.priority === "HIGH"
                                ? "text-[#DA1E28]"
                                : tick.priority === "MEDIUM"
                                ? "text-[#C9822E]"
                                : "text-secondary"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                tick.priority === "HIGH"
                                  ? "bg-[#DA1E28]"
                                  : tick.priority === "MEDIUM"
                                  ? "bg-[#C9822E]"
                                  : "bg-secondary"
                              }`}
                            />
                            {tick.priority}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-xs ${
                              tick.assignee === "Unassigned" ? "italic text-secondary" : "text-on-surface"
                            }`}
                          >
                            {tick.assignee}
                          </span>
                        </td>
                        <td className="py-2 pr-4 pl-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(tick);
                              if (tick.resolutionRemarks) setAdminNote(tick.resolutionRemarks);
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-semibold shadow-xs transition-all ${
                              isSelected
                                ? "bg-[#FF5A1F] text-white"
                                : "border border-surface-container-highest text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            Dossier
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
          <div className="xl:col-span-5 bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-xs p-5 space-y-4 sticky top-20">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-surface-container-highest">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-on-surface">Ticket Dossier</h2>
                  <span className="font-mono text-sm font-bold text-[#FF5A1F]">{selectedTicket.id}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-on-surface">
                    {selectedTicket.category}
                  </span>
                  <StatusBadge status={selectedTicket.status} variant="ticket" />
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      selectedTicket.priority === "HIGH"
                        ? "bg-red-50 text-[#DA1E28] border-red-200"
                        : "bg-surface-container text-secondary border-surface-container-highest"
                    }`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Customer Identity Card */}
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-highest space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">account_circle</span>
                  <strong className="text-on-surface">{selectedTicket.customerName}</strong>
                  <span className="font-mono text-secondary">{selectedTicket.customerNumber}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                  {selectedTicket.customerTier}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-secondary text-[11px] pt-1.5 border-t border-surface-container-highest/60">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span className="font-mono text-on-surface">{selectedTicket.customerPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="truncate text-on-surface">{selectedTicket.location}</span>
                </div>
              </div>
            </div>

            {/* Associated Order Context */}
            <div className="p-3 rounded-lg bg-white border border-surface-container-highest space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Associated Order</span>
                <Link
                  href={`/admin/orders/${selectedTicket.orderNumber.replace("#", "")}`}
                  className="font-mono font-bold text-[#FF5A1F] hover:underline"
                >
                  {selectedTicket.orderNumber}
                </Link>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-on-surface text-xs leading-snug">
                  {selectedTicket.orderProductSummary}
                </p>
                <span className="font-mono font-bold text-on-surface ml-2 shrink-0">
                  {formatINR(selectedTicket.orderAmount)}
                </span>
              </div>
              <div className="text-[11px] text-secondary flex items-center gap-3 pt-1 border-t border-surface-container-highest">
                <span>Status: <strong className="text-on-surface">{selectedTicket.orderDeliveryStatus}</strong></span>
                {selectedTicket.assignedCourier && (
                  <span>Courier: <strong className="text-on-surface">{selectedTicket.assignedCourier}</strong></span>
                )}
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-secondary uppercase tracking-wider text-[10px]">
                Issue Description
              </span>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-highest text-on-surface leading-relaxed italic">
                &ldquo;{selectedTicket.description}&rdquo;
              </div>
            </div>

            {/* Resolution Workflow Sequencer (OPEN -> IN_PROGRESS -> RESOLVED) */}
            <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-highest space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                  Permitted Resolution Sequence
                </span>
                <span className="font-mono text-primary font-semibold text-[11px]">
                  STAGE: {selectedTicket.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex-1 h-1.5 rounded-full ${
                    selectedTicket.status === "OPEN" || selectedTicket.status === "IN_PROGRESS" || selectedTicket.status === "RESOLVED"
                      ? "bg-emerald-600"
                      : "bg-surface-container-highest"
                  }`}
                  title="Stage 1: OPEN"
                />
                <div
                  className={`flex-1 h-1.5 rounded-full ${
                    selectedTicket.status === "IN_PROGRESS" || selectedTicket.status === "RESOLVED"
                      ? "bg-[#FF5A1F]"
                      : "bg-surface-container-highest"
                  }`}
                  title="Stage 2: IN_PROGRESS"
                />
                <div
                  className={`flex-1 h-1.5 rounded-full ${
                    selectedTicket.status === "RESOLVED" ? "bg-emerald-600" : "bg-surface-container-highest"
                  }`}
                  title="Stage 3: RESOLVED"
                />
              </div>

              {/* Administrative Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedTicket.status === "OPEN" && (
                  <button
                    onClick={() => handleTransition("IN_PROGRESS")}
                    className="h-8 px-3.5 rounded-lg bg-[#FF5A1F] text-white font-semibold text-xs hover:bg-[#D94B17] transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Start Progress</span>
                  </button>
                )}

                {selectedTicket.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleTransition("RESOLVED")}
                    className="h-8 px-3.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {selectedTicket.status === "RESOLVED" && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Resolved on {selectedTicket.resolvedAt || "24 Oct 2024"}
                  </span>
                )}
              </div>
            </div>

            {/* Internal Operational Note Logger */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-secondary uppercase tracking-wider text-[10px]">
                  Internal Administrative Note
                </label>
                <span className="text-[10px] text-secondary">Logged in Central Audit Log</span>
              </div>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Log resolution remarks, dispatch instructions, or merchant coordination specifics..."
                className="w-full rounded-lg border border-surface-container-highest bg-white text-on-surface text-xs p-2.5 focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] resize-none"
              />
            </div>

            {/* Governance Guardrail Notice */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface border border-surface-container-highest text-secondary text-[11px] leading-normal">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                verified_user
              </span>
              <p>
                Support ticket resolution records are permanently archived in the Central Operations audit log. Customer notification is triggered via automated SMS/Push.
              </p>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-5 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-8 text-center text-secondary">
            <span className="material-symbols-outlined text-[32px] mb-2">touch_app</span>
            <p className="text-sm font-semibold text-on-surface">Select a support ticket</p>
            <p className="text-xs text-secondary mt-1">Click any ticket in the queue to inspect resolution dossier.</p>
          </div>
        )}
      </section>
    </div>
  );
}
