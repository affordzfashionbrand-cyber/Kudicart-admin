"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  Search,
  ChevronDown,
  Calendar,
  FilterX,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AuditEvent } from "@/types/audit";
import { MOCK_AUDIT_EVENTS } from "@/mocks/audit";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>(MOCK_AUDIT_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(
    MOCK_AUDIT_EVENTS[0]
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("LAST_7_DAYS");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  React.useEffect(() => {
    api.audit.list({ limit: 50 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setEvents(res.data);
          setSelectedEvent(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  const pageSize = 8;

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = ev.id.toLowerCase().includes(q);
        const matchesActor =
          ev.actorName.toLowerCase().includes(q) ||
          ev.actorId.toLowerCase().includes(q);
        const matchesEntity =
          ev.entityId.toLowerCase().includes(q) ||
          (ev.entityName && ev.entityName.toLowerCase().includes(q));
        const matchesAction = ev.actionType.toLowerCase().includes(q);
        const matchesSummary = ev.summary.toLowerCase().includes(q);

        if (
          !matchesId &&
          !matchesActor &&
          !matchesEntity &&
          !matchesAction &&
          !matchesSummary
        ) {
          return false;
        }
      }

      if (actionFilter !== "ALL" && ev.actionType !== actionFilter) {
        return false;
      }

      if (roleFilter !== "ALL" && ev.actorRole !== roleFilter) {
        return false;
      }

      if (entityFilter !== "ALL" && ev.entityType !== entityFilter) {
        return false;
      }

      return true;
    });
  }, [events, searchTerm, actionFilter, roleFilter, entityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("ALL");
    setRoleFilter("ALL");
    setEntityFilter("ALL");
    setDateRange("LAST_7_DAYS");
    setCurrentPage(1);
  };

  const handleCopy = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Event ID copied to clipboard.");
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = [
        "Event ID",
        "Timestamp",
        "Actor ID",
        "Actor Name",
        "Actor Role",
        "Action Type",
        "Entity ID",
        "Entity Type",
        "IP Address",
        "Details Summary",
      ];
      const rows = filteredEvents.map((e) => [
        e.id,
        `"${e.timestampFull}"`,
        e.actorId,
        `"${e.actorName}"`,
        `"${e.actorRole}"`,
        e.actionType,
        e.entityId,
        e.entityType,
        e.ipAddress,
        `"${e.summary.replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `kudicart_audit_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${filteredEvents.length} audit records.`);
    } catch {
      showToast("Export failed. Please try again.", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
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
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Audit Log
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review recorded administrative actions and operational authorization history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] rounded-[8px] text-xs font-medium text-[#111111] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <section className="bg-white p-3 rounded-[10px] border border-[#E4E0DB] shadow-xs flex flex-wrap items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by actor ID, entity ID, or action..."
            className="w-full h-9 pl-9 pr-3 bg-white border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] placeholder:text-[#6B6667] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none"
          />
        </div>

        {/* Action Type filter */}
        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Action Types</option>
            <option value="DRIVER_KYC_APPROVED">Driver KYC Approved</option>
            <option value="DRIVER_ASSIGNED_MANUAL">Driver Assigned Manual</option>
            <option value="VENDOR_APPROVED">Vendor Approved</option>
            <option value="VENDOR_REVIEW_START">Vendor Review Start</option>
            <option value="PRODUCT_STATUS_CHANGED">Product Status Changed</option>
            <option value="PRODUCT_DRAFT_SUBMIT">Product Draft Submit</option>
            <option value="PAYOUT_HOLD_UPDATED">Payout Hold Updated</option>
            <option value="CUSTOMER_TIER_UPGRADE">Customer Tier Upgrade</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Actor Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Central Ops Lead">Central Ops Lead</option>
            <option value="Admin">Admin</option>
            <option value="System Automation">System Automation</option>
            <option value="Finance Settlement">Finance Settlement</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Entity Type filter */}
        <div className="relative">
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Entities</option>
            <option value="Driver">Driver</option>
            <option value="Vendor">Vendor</option>
            <option value="Order">Order</option>
            <option value="Product">Product</option>
            <option value="Payment">Payment</option>
            <option value="Customer">Customer</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Date Range filter */}
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
          >
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="TODAY">Today</option>
            <option value="LAST_24_HOURS">Last 24 Hours</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="h-9 px-2 text-[#6B6667] hover:text-[#111111] rounded-[8px] text-xs flex items-center gap-1 transition-colors"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </section>

      {/* 2-Column Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Audit Table (8 cols / 65%) */}
        <div className="lg:col-span-8 bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden flex flex-col shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs text-[#6B6667] font-medium">
                  <th className="py-2 px-4 font-medium">Timestamp</th>
                  <th className="py-2 px-3 font-medium">Actor</th>
                  <th className="py-2 px-3 font-medium">Action</th>
                  <th className="py-2 px-3 font-medium">Entity ID</th>
                  <th className="py-2 px-3 font-medium">IP Address</th>
                  <th className="py-2 px-3 font-medium">Summary</th>
                  <th className="py-2 px-4 text-right font-medium">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <EmptyState
                        title="No audit events found"
                        description="Try resetting search keywords or active filters."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((ev) => {
                    const isSelected = selectedEvent?.id === ev.id;
                    return (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`h-11 sm:h-12 transition-colors cursor-pointer border-b border-[#E4E0DB] ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-2 border-l-[#FF5A1F]"
                            : "hover:bg-[#F7F7F5]/50"
                        }`}
                      >
                        <td className="py-2 px-4 font-mono text-[11px] whitespace-nowrap text-[#111111]">
                          {ev.timestamp}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="font-medium text-[#111111] block">
                            {ev.actorName}
                          </span>
                          <span className="font-mono text-[10px] text-[#6B6667]">
                            {ev.actorId}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <StatusBadge status={ev.actionType} variant="audit" />
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-[#FF5A1F] font-medium">
                          {ev.entityId}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-[#6B6667]">
                          {ev.ipAddress}
                        </td>
                        <td
                          className="py-2 px-3 text-[#6B6667] max-w-[180px] truncate"
                          title={ev.summary}
                        >
                          {ev.summary}
                        </td>
                        <td className="py-2 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(ev);
                            }}
                            className={`px-2.5 py-1 rounded-[8px] text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-[#FF5A1F] text-white"
                                : "border border-[#E4E0DB] text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
                            }`}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="px-4 py-3 border-t border-[#E4E0DB] bg-[#F4F1EA] flex items-center justify-between text-xs text-[#6B6667]">
            <span>
              Showing{" "}
              <strong className="text-[#111111]">
                {filteredEvents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, filteredEvents.length)}
              </strong>{" "}
              of <strong className="text-[#111111]">{filteredEvents.length}</strong> events
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] flex items-center gap-1 hover:bg-[#F7F7F5] disabled:opacity-50 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <span className="px-2 font-medium text-[#111111]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] flex items-center gap-1 hover:bg-[#F7F7F5] disabled:opacity-50 font-medium"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Event Dossier Panel (4 cols / 35%) */}
        <div className="lg:col-span-4 bg-white rounded-[10px] border border-[#E4E0DB] p-5 space-y-4 shadow-xs">
          {selectedEvent ? (
            <>
              {/* Dossier Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#111111]">Event Details</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667]">
                      {selectedEvent.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">
                    Recorded administrative event
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(selectedEvent.id)}
                    className="p-1.5 text-[#6B6667] hover:text-[#111111] rounded-[6px] hover:bg-[#F7F7F5]"
                    title="Copy Event ID"
                  >
                    {copiedId === selectedEvent.id ? (
                      <Check className="w-4 h-4 text-[#20885A]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Summary Card */}
              <div className="p-3.5 rounded-[8px] bg-[#FFF0E8]/50 border border-[#FF5A1F]/20">
                <span className="text-xs font-semibold text-[#FF5A1F] block">
                  {selectedEvent.actionType}
                </span>
                <div className="mt-1.5 text-xs text-[#111111]">
                  Target Entity:{" "}
                  <span className="font-medium text-[#FF5A1F] font-mono">
                    {selectedEvent.entityId}
                  </span>{" "}
                  {selectedEvent.entityName && (
                    <span className="text-[#6B6667]">({selectedEvent.entityName})</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#6B6667] leading-relaxed">
                  {selectedEvent.targetDescription}
                </p>
              </div>

              {/* Actor Identity Grid */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] text-[#6B6667] font-medium">
                  Actor Identity
                </h4>
                <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#F4F1EA] text-[#111111] text-xs font-medium flex items-center justify-center">
                      {selectedEvent.actorInitials}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#111111]">
                        {selectedEvent.actorName}
                      </div>
                      <div className="text-[11px] text-[#6B6667]">
                        {selectedEvent.actorRole}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] text-[#6B6667]">
                    {selectedEvent.actorId}
                  </span>
                </div>
              </div>

              {/* Technical Metadata Block */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] text-[#6B6667] font-medium">
                  Event Parameters
                </h4>
                <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] space-y-2 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-[#E4E0DB]">
                    <span className="text-[#6B6667]">Timestamp:</span>
                    <span className="font-mono text-[11px] text-[#111111] font-medium">
                      {selectedEvent.timestampFull}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#E4E0DB]">
                    <span className="text-[#6B6667]">IP Address:</span>
                    <span className="font-mono text-[11px] text-[#111111] font-medium">
                      {selectedEvent.ipAddress}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-0.5">
                    <span className="text-[#6B6667] shrink-0">User Agent:</span>
                    <span
                      className="font-mono text-[10px] text-right text-[#6B6667] truncate max-w-[190px]"
                      title={selectedEvent.userAgent}
                    >
                      {selectedEvent.userAgent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recorded Change Payload (JSON block) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] text-[#6B6667] font-medium">
                    Change Payload
                  </h4>
                  <span className="text-[10px] font-mono text-[#6B6667]">
                    JSON
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#1E1B1C] text-[#F1F1EF] font-mono text-[11px] leading-relaxed overflow-x-auto space-y-1">
                  {Object.entries(selectedEvent.changePayload).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[#FFB59E]">"{k}"</span>:{" "}
                      <span className="text-[#FDE68A]">
                        {typeof v === "string" ? `"${v}"` : String(v)}
                      </span>
                      ,
                    </div>
                  ))}
                </div>
              </div>

              {/* Contextual Link */}
              {selectedEvent.entityLink && (
                <Link
                  href={selectedEvent.entityLink}
                  className="w-full h-9 px-4 rounded-[8px] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>
                    View {selectedEvent.entityType} ({selectedEvent.entityId})
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6B6667]" />
                </Link>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#6B6667]">
              Select an event to view full audit details.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
