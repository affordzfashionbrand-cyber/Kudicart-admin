"use client";

import React, { useState, useMemo } from "react";
import {
  ReportCategory,
  ReportingPeriod,
  OrdersReportRow,
  VendorReportRow,
  DriverReportRow,
  CatalogReportRow,
} from "@/types/reports";
import {
  REPORT_CONFIGS,
  MOCK_ORDERS_REPORT,
  MOCK_VENDORS_REPORT,
  MOCK_DRIVERS_REPORT,
  MOCK_CATALOG_REPORT,
} from "@/mocks/reports";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";

export default function AdminReportsPage() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>("ORDERS");
  const [period, setPeriod] = useState<ReportingPeriod>("LAST_7_DAYS");
  const [hubFilter, setHubFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Active report configuration
  const activeConfig = useMemo(() => {
    return (
      REPORT_CONFIGS.find((cfg) => cfg.id === activeCategory) ||
      REPORT_CONFIGS[0]
    );
  }, [activeCategory]);

  // Filtered rows for Orders report
  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS_REPORT.filter((row) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "Delivered" && row.status !== "Delivered") return false;
        if (statusFilter === "In-Transit" && row.status !== "In-Transit") return false;
        if (statusFilter === "Ready for Pickup" && row.status !== "Ready for Pickup")
          return false;
      }
      return true;
    });
  }, [statusFilter]);

  // Filtered rows for Vendors report
  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS_REPORT.filter((row) => {
      if (hubFilter !== "ALL" && !row.operatingHub.includes(hubFilter)) return false;
      if (statusFilter !== "ALL" && row.settlementStatus !== statusFilter) return false;
      return true;
    });
  }, [hubFilter, statusFilter]);

  // Filtered rows for Drivers report
  const filteredDrivers = useMemo(() => {
    return MOCK_DRIVERS_REPORT.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      return true;
    });
  }, [statusFilter]);

  // Filtered rows for Catalog report
  const filteredCatalog = useMemo(() => {
    return MOCK_CATALOG_REPORT.filter((row) => {
      if (hubFilter !== "ALL" && !row.nodeHub.includes(hubFilter)) return false;
      if (statusFilter === "LOW_STOCK" && !row.lowStockAlert) return false;
      return true;
    });
  }, [hubFilter, statusFilter]);

  const clearFilters = () => {
    setPeriod("LAST_7_DAYS");
    setHubFilter("ALL");
    setStatusFilter("ALL");
    setCustomStart("");
    setCustomEnd("");
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "TODAY":
        return "Today (IST)";
      case "YESTERDAY":
        return "Yesterday (IST)";
      case "LAST_7_DAYS":
        return "Last 7 Days: 18–24 Oct 2024";
      case "MONTH_TO_DATE":
        return "Month to Date: October 2024";
      case "CUSTOM":
        return customStart && customEnd
          ? `${customStart} to ${customEnd}`
          : "Custom Date Range";
    }
  };

  // Demonstration client-side CSV export
  const handleDownloadCsv = () => {
    setIsExporting(true);
    setExportNotice(null);

    try {
      let csvContent = "";
      let filename = `kudicart_${activeCategory.toLowerCase()}_report.csv`;

      if (activeCategory === "ORDERS") {
        const headers = [
          "Order ID",
          "Date & Time",
          "Customer",
          "Vendor",
          "Items",
          "Gross GMV (INR)",
          "Commission (INR)",
          "Delivery Partner",
          "Status",
        ];
        const rows = filteredOrders.map((r) => [
          r.orderId,
          r.dateTime,
          `"${r.customerName}"`,
          `"${r.vendorName}"`,
          r.itemsCount,
          r.grossGmv,
          r.commission,
          `"${r.deliveryPartner}"`,
          r.status,
        ]);
        csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      } else if (activeCategory === "VENDORS") {
        const headers = [
          "Vendor ID",
          "Boutique Name",
          "Operating Hub",
          "Delivered Orders",
          "Gross Sales (INR)",
          "Commission Rate (%)",
          "Commission Retained (INR)",
          "Net Payable (INR)",
          "Settlement Status",
        ];
        const rows = filteredVendors.map((r) => [
          r.vendorId,
          `"${r.boutiqueName}"`,
          `"${r.operatingHub}"`,
          r.deliveredOrders,
          r.grossSales,
          r.commissionRate,
          r.commissionRetained,
          r.netPayable,
          r.settlementStatus,
        ]);
        csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      } else if (activeCategory === "DRIVERS") {
        const headers = [
          "Partner ID",
          "Partner Name",
          "Vehicle Type",
          "Active Hours",
          "Completed Runs",
          "Avg Delivery (Min)",
          "Payout Total (INR)",
          "Status",
        ];
        const rows = filteredDrivers.map((r) => [
          r.partnerId,
          `"${r.name}"`,
          `"${r.vehicleType}"`,
          r.activeHours,
          r.completedRuns,
          r.avgDeliveryMinutes,
          r.payoutTotal,
          r.status,
        ]);
        csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      } else {
        const headers = [
          "SKU",
          "Title",
          "Brand",
          "Vendor",
          "Node Hub",
          "Stock Qty",
          "Low Stock Alert",
          "MRP (INR)",
          "Selling Price (INR)",
          "Status",
        ];
        const rows = filteredCatalog.map((r) => [
          r.sku,
          `"${r.title}"`,
          `"${r.brand}"`,
          `"${r.vendor}"`,
          `"${r.nodeHub}"`,
          r.stockQty,
          r.lowStockAlert ? "YES" : "NO",
          r.mrp,
          r.sellingPrice,
          r.status,
        ]);
        csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice("Report exported successfully as demonstrative CSV dataset.");
      setTimeout(() => setExportNotice(null), 4000);
    } catch {
      setExportNotice("Export generation failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-[#6B6667] mt-1">
            Generate operational reports, preview sample dataset rows, and export CSV files across marketplace domains.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#20885A]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
            Report Engine: Active
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFFBEB] text-[#C9822E] border border-[#C9822E]/20">
            <span className="material-symbols-outlined text-[14px]">schema</span>
            Provisional Export Schema
          </span>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Top 4 Report Category Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {REPORT_CONFIGS.map((cfg) => {
          const isSelected = activeCategory === cfg.id;
          return (
            <div
              key={cfg.id}
              onClick={() => {
                setActiveCategory(cfg.id);
                setStatusFilter("ALL");
              }}
              className={`bg-white rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? "border-2 border-[#FF5A1F] ring-2 ring-[#FF5A1F]/10 shadow-sm"
                  : "border border-[#E4E0DB] hover:border-[#6B6667] hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-[#FFF0E8] text-[#FF5A1F]"
                        : "bg-[#F4F1EA] text-[#6B6667]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {cfg.icon}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF5A1F] bg-[#FFF0E8] px-2 py-0.5 rounded">
                      Active Selection
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#6B6667] font-medium">
                      {cfg.domain}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-[#111111]">
                  {cfg.title}
                </h2>
                <p className="text-xs text-[#6B6667] mt-1.5 leading-relaxed">
                  {cfg.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E0DB] flex items-center justify-between text-[11px] text-[#6B6667]">
                <span className="font-mono">{cfg.schemaTag}</span>
                {isSelected ? (
                  <span className="font-semibold text-[#FF5A1F] flex items-center gap-0.5">
                    Selected
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                  </span>
                ) : (
                  <span className="hover:text-[#111111] flex items-center gap-0.5">
                    Select
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Filter & Reporting-Period Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Segmented Range & Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Reporting Period Segmented Control */}
            <div className="inline-flex bg-[#F7F7F5] p-1 border border-[#E4E0DB] rounded-lg">
              {(
                [
                  { id: "TODAY", label: "Today" },
                  { id: "YESTERDAY", label: "Yesterday" },
                  { id: "LAST_7_DAYS", label: "Last 7 Days" },
                  { id: "MONTH_TO_DATE", label: "Month to Date" },
                  { id: "CUSTOM", label: "Custom Range" },
                ] as const
              ).map((p) => {
                const isActive = period === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                      isActive
                        ? "bg-[#FF5A1F] text-white font-semibold shadow-xs"
                        : "text-[#6B6667] hover:text-[#111111]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Pickers when CUSTOM is active */}
            {period === "CUSTOM" && (
              <div className="flex items-center gap-2 bg-[#F7F7F5] p-1 border border-[#E4E0DB] rounded-lg text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white border border-[#E4E0DB] rounded px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#FF5A1F]"
                />
                <span className="text-[#6B6667]">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white border border-[#E4E0DB] rounded px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#FF5A1F]"
                />
              </div>
            )}

            <div className="h-6 w-[1px] bg-[#E4E0DB] hidden md:block" />

            {/* Hub Filter (for Vendors, Orders, Catalog) */}
            <div className="relative">
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="h-[38px] bg-white border border-[#E4E0DB] rounded-lg pl-3 pr-8 text-xs text-[#111111] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">All Operating Hubs</option>
                <option value="Bandra West">Bandra West (BW-01)</option>
                <option value="Colaba Flagship">Colaba Flagship (CB-02)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#6B6667] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-[38px] bg-white border border-[#E4E0DB] rounded-lg pl-3 pr-8 text-xs text-[#111111] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                {activeCategory === "ORDERS" && (
                  <>
                    <option value="Delivered">Delivered Only</option>
                    <option value="In-Transit">In-Transit</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                  </>
                )}
                {activeCategory === "VENDORS" && (
                  <>
                    <option value="SETTLED">Settled</option>
                    <option value="PENDING_CYCLE">Pending Cycle</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                  </>
                )}
                {activeCategory === "DRIVERS" && (
                  <>
                    <option value="Active Online">Active Online</option>
                    <option value="Off Duty">Off Duty</option>
                  </>
                )}
                {activeCategory === "CATALOG" && (
                  <>
                    <option value="LOW_STOCK">Low Stock Warnings</option>
                  </>
                )}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#6B6667] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="h-[38px] px-3 text-xs text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Clear Filters</span>
            </button>
          </div>

          {/* Right: Record Pill & Download Action */}
          <div className="flex items-center gap-3 self-end xl:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#F7F7F5] border border-[#E4E0DB] text-[#6B6667] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              Preview (First 10 Records)
            </span>

            <button
              onClick={handleDownloadCsv}
              disabled={isExporting}
              className="h-[38px] px-4 bg-[#FF5A1F] hover:bg-[#D94B17] active:scale-[0.99] transition-all text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isExporting ? "hourglass_top" : "download"}
              </span>
              <span>{isExporting ? "Exporting..." : "Download CSV"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Report Preview Workspace & Table */}
      <section className="bg-white border border-[#E4E0DB] rounded-xl overflow-hidden shadow-2xs">
        {/* Table Area Header */}
        <div className="px-4 py-3.5 border-b border-[#E4E0DB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#6B6667] text-[20px]">
              table_chart
            </span>
            <h3 className="text-sm font-bold text-[#111111]">
              {activeConfig.title} Preview{" "}
              <span className="text-[#6B6667] font-normal">
                ({getPeriodLabel()})
              </span>
            </h3>
          </div>
          <span className="text-[11px] text-[#6B6667] bg-[#F7F7F5] border border-[#E4E0DB] px-2.5 py-1 rounded-md">
            Provisional Schema — Illustrative records
          </span>
        </div>

        {/* Dynamic Table Content based on active category */}
        <div className="overflow-x-auto">
          {activeCategory === "ORDERS" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[11px] text-[#6B6667] uppercase tracking-wider font-semibold">
                  <th className="px-4">Order ID</th>
                  <th className="px-3">Order Date & Time</th>
                  <th className="px-3">Customer</th>
                  <th className="px-3">Vendor / Boutique</th>
                  <th className="px-3 text-right">Items</th>
                  <th className="px-3 text-right">Gross GMV</th>
                  <th className="px-3 text-right">Commission</th>
                  <th className="px-3">Delivery Partner</th>
                  <th className="px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <EmptyState
                        title="No matching report records"
                        description="Try adjusting your status filter or reporting period."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((row) => (
                    <tr
                      key={row.orderId}
                      className="h-12 hover:bg-[#F7F7F5] transition-colors"
                    >
                      <td className="px-4 font-mono font-semibold text-[#111111]">
                        {row.orderId}
                      </td>
                      <td className="px-3 text-[#6B6667] font-mono text-[11px]">
                        {row.dateTime}
                      </td>
                      <td className="px-3 font-medium text-[#111111]">
                        {row.customerName}
                      </td>
                      <td className="px-3 text-[#111111]">{row.vendorName}</td>
                      <td className="px-3 text-right font-mono">{row.itemsCount}</td>
                      <td className="px-3 text-right font-mono font-semibold text-[#111111]">
                        {formatINR(row.grossGmv)}
                      </td>
                      <td className="px-3 text-right font-mono text-[#20885A]">
                        {formatINR(row.commission)}
                      </td>
                      <td className="px-3 text-[#6B6667]">{row.deliveryPartner}</td>
                      <td className="px-4 text-center">
                        <StatusBadge status={row.status} variant="order" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeCategory === "VENDORS" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[11px] text-[#6B6667] uppercase tracking-wider font-semibold">
                  <th className="px-4">Vendor ID</th>
                  <th className="px-3">Boutique Store</th>
                  <th className="px-3">Operating Hub</th>
                  <th className="px-3 text-right">Delivered Orders</th>
                  <th className="px-3 text-right">Gross Sales</th>
                  <th className="px-3 text-right">Commission Rate</th>
                  <th className="px-3 text-right">Commission Retained</th>
                  <th className="px-3 text-right">Net Payable</th>
                  <th className="px-4 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <EmptyState
                        title="No matching vendor records"
                        description="Try adjusting your hub or settlement filter."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((row) => (
                    <tr
                      key={row.vendorId}
                      className="h-12 hover:bg-[#F7F7F5] transition-colors"
                    >
                      <td className="px-4 font-mono font-semibold text-[#111111]">
                        {row.vendorId}
                      </td>
                      <td className="px-3 font-semibold text-[#111111]">
                        {row.boutiqueName}
                      </td>
                      <td className="px-3 text-[#6B6667]">{row.operatingHub}</td>
                      <td className="px-3 text-right font-mono">
                        {row.deliveredOrders}
                      </td>
                      <td className="px-3 text-right font-mono text-[#111111]">
                        {formatINR(row.grossSales)}
                      </td>
                      <td className="px-3 text-right font-mono text-[#6B6667]">
                        {row.commissionRate.toFixed(1)}%
                      </td>
                      <td className="px-3 text-right font-mono text-[#20885A]">
                        {formatINR(row.commissionRetained)}
                      </td>
                      <td className="px-3 text-right font-mono font-bold text-[#111111]">
                        {formatINR(row.netPayable)}
                      </td>
                      <td className="px-4 text-center">
                        <StatusBadge status={row.settlementStatus} variant="ledger" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeCategory === "DRIVERS" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[11px] text-[#6B6667] uppercase tracking-wider font-semibold">
                  <th className="px-4">Partner ID</th>
                  <th className="px-3">Partner Name</th>
                  <th className="px-3">Vehicle Class</th>
                  <th className="px-3 text-right">Active Hours</th>
                  <th className="px-3 text-right">Completed Runs</th>
                  <th className="px-3 text-right">Avg Delivery Time</th>
                  <th className="px-3 text-right">Payout Total</th>
                  <th className="px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <EmptyState
                        title="No matching driver records"
                        description="Try resetting your driver availability filter."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((row) => (
                    <tr
                      key={row.partnerId}
                      className="h-12 hover:bg-[#F7F7F5] transition-colors"
                    >
                      <td className="px-4 font-mono font-semibold text-[#111111]">
                        {row.partnerId}
                      </td>
                      <td className="px-3 font-semibold text-[#111111]">
                        {row.name}
                      </td>
                      <td className="px-3 text-[#6B6667]">{row.vehicleType}</td>
                      <td className="px-3 text-right font-mono">{row.activeHours}h</td>
                      <td className="px-3 text-right font-mono font-semibold text-[#111111]">
                        {row.completedRuns}
                      </td>
                      <td className="px-3 text-right font-mono text-[#6B6667]">
                        {row.avgDeliveryMinutes}m
                      </td>
                      <td className="px-3 text-right font-mono font-bold text-[#111111]">
                        {formatINR(row.payoutTotal)}
                      </td>
                      <td className="px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            row.status.includes("Online")
                              ? "bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]"
                              : "bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeCategory === "CATALOG" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[11px] text-[#6B6667] uppercase tracking-wider font-semibold">
                  <th className="px-4">SKU Code</th>
                  <th className="px-3">Product Title & Brand</th>
                  <th className="px-3">Boutique Vendor</th>
                  <th className="px-3">Operating Hub Node</th>
                  <th className="px-3 text-right">Stock Qty</th>
                  <th className="px-3 text-right">MRP</th>
                  <th className="px-3 text-right">Selling Price</th>
                  <th className="px-4 text-center">Catalog Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs">
                {filteredCatalog.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <EmptyState
                        title="No matching product records"
                        description="Try resetting your hub or stock filter."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCatalog.map((row) => (
                    <tr
                      key={row.sku}
                      className="h-12 hover:bg-[#F7F7F5] transition-colors"
                    >
                      <td className="px-4 font-mono font-semibold text-[#111111]">
                        {row.sku}
                      </td>
                      <td className="px-3">
                        <div className="font-semibold text-[#111111]">
                          {row.title}
                        </div>
                        <div className="text-[11px] text-[#6B6667]">{row.brand}</div>
                      </td>
                      <td className="px-3 text-[#111111]">{row.vendor}</td>
                      <td className="px-3 text-[#6B6667]">{row.nodeHub}</td>
                      <td className="px-3 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            row.lowStockAlert ? "text-[#DA1E28]" : "text-[#111111]"
                          }`}
                        >
                          {row.stockQty}
                        </span>
                        {row.lowStockAlert && (
                          <span className="block text-[10px] text-[#DA1E28] font-semibold">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-3 text-right font-mono line-through text-[#6B6667]">
                        {formatINR(row.mrp)}
                      </td>
                      <td className="px-3 text-right font-mono font-bold text-[#111111]">
                        {formatINR(row.sellingPrice)}
                      </td>
                      <td className="px-4 text-center">
                        <StatusBadge status={row.status} variant="product" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
