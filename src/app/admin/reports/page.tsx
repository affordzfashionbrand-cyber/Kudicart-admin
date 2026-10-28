"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Store,
  Truck,
  Layers,
  Download,
  RefreshCw,
  ChevronDown,
  FilterX,
  CheckCircle2,
  AlertCircle,
  X,
  Table,
} from "lucide-react";
import {
  ReportCategory,
  ReportingPeriod,
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
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
        return "Today";
      case "YESTERDAY":
        return "Yesterday";
      case "LAST_7_DAYS":
        return "Last 7 Days";
      case "MONTH_TO_DATE":
        return "Month to Date";
      case "CUSTOM":
        return customStart && customEnd
          ? `${customStart} to ${customEnd}`
          : "Custom Date Range";
    }
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "ORDERS":
        return <ShoppingBag className="w-4 h-4" />;
      case "VENDORS":
        return <Store className="w-4 h-4" />;
      case "DRIVERS":
        return <Truck className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  // Demonstration client-side CSV export
  const handleDownloadCsv = () => {
    setIsExporting(true);

    try {
      let csvContent = "";
      const filename = `kudicart_${activeCategory.toLowerCase()}_report.csv`;

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

      showToast(`Exported ${activeCategory.toLowerCase()} report successfully.`);
    } catch {
      showToast("Export generation failed. Please try again.", "error");
    } finally {
      setIsExporting(false);
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Reports &amp; Data Exports
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Generate operational reports, inspect dataset previews, and export CSV files across domains.
          </p>
        </div>
      </div>

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
              className={`bg-white rounded-[10px] p-4 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? "border-2 border-[#FF5A1F] shadow-xs"
                  : "border border-[#E4E0DB] hover:border-[#6B6667]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${
                      isSelected
                        ? "bg-[#FFF0E8] text-[#FF5A1F]"
                        : "bg-[#F4F1EA] text-[#6B6667]"
                    }`}
                  >
                    {getCategoryIcon(cfg.id)}
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-medium text-[#FF5A1F] bg-[#FFF0E8] px-2 py-0.5 rounded-[4px]">
                      Active
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-[#111111]">
                  {cfg.title}
                </h2>
                <p className="text-xs text-[#6B6667] mt-1 leading-relaxed">
                  {cfg.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E4E0DB] flex items-center justify-between text-[11px] text-[#6B6667]">
                <span className="font-mono">{cfg.domain}</span>
                <span className={isSelected ? "font-medium text-[#FF5A1F]" : ""}>
                  {isSelected ? "Selected" : "Select"}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Filter & Reporting-Period Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Segmented Range & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Reporting Period Segmented Control */}
            <div className="inline-flex bg-[#F7F7F5] p-1 border border-[#E4E0DB] rounded-[8px]">
              {(
                [
                  { id: "TODAY", label: "Today" },
                  { id: "YESTERDAY", label: "Yesterday" },
                  { id: "LAST_7_DAYS", label: "Last 7 Days" },
                  { id: "MONTH_TO_DATE", label: "Month to Date" },
                  { id: "CUSTOM", label: "Custom" },
                ] as const
              ).map((p) => {
                const isActive = period === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`px-2.5 py-1 text-xs rounded-[6px] transition-colors ${
                      isActive
                        ? "bg-[#FF5A1F] text-white font-medium shadow-xs"
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
              <div className="flex items-center gap-2 bg-[#F7F7F5] p-1 border border-[#E4E0DB] rounded-[8px] text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white border border-[#E4E0DB] rounded-[6px] px-2 py-0.5 text-xs text-[#111111] outline-none focus:border-[#FF5A1F]"
                />
                <span className="text-[#6B6667]">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white border border-[#E4E0DB] rounded-[6px] px-2 py-0.5 text-xs text-[#111111] outline-none focus:border-[#FF5A1F]"
                />
              </div>
            )}

            {/* Hub Filter */}
            <div className="relative">
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="h-9 bg-white border border-[#E4E0DB] rounded-[8px] pl-3 pr-8 text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">All Hubs</option>
                <option value="Bandra West">Bandra West</option>
                <option value="Colaba Flagship">Colaba Flagship</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 bg-white border border-[#E4E0DB] rounded-[8px] pl-3 pr-8 text-xs text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none appearance-none cursor-pointer"
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
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="h-9 px-2 text-xs text-[#6B6667] hover:text-[#111111] rounded-[8px] transition-colors flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Right: Record Pill & Download Action */}
          <div className="flex items-center gap-2.5 self-end xl:self-auto shrink-0">
            <span className="text-xs text-[#6B6667] font-mono">
              Preview (First 10 Records)
            </span>

            <button
              onClick={handleDownloadCsv}
              disabled={isExporting}
              className="h-9 px-3.5 bg-[#FF5A1F] hover:bg-[#D94B17] transition-colors text-white rounded-[8px] text-xs font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Download CSV"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Report Preview Workspace & Table */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
        {/* Table Area Header */}
        <div className="px-4 py-3 border-b border-[#E4E0DB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#6B6667]" />
            <h3 className="text-xs font-semibold text-[#111111]">
              {activeConfig.title} Preview{" "}
              <span className="text-[#6B6667] font-normal">
                ({getPeriodLabel()})
              </span>
            </h3>
          </div>
        </div>

        {/* Dynamic Table Content based on active category */}
        <div className="overflow-x-auto">
          {activeCategory === "ORDERS" && (
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs text-[#6B6667] font-medium">
                  <th className="px-4 py-2 font-medium">Order ID</th>
                  <th className="px-3 py-2 font-medium">Date &amp; Time</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium text-right">Items</th>
                  <th className="px-3 py-2 font-medium text-right">Gross GMV</th>
                  <th className="px-3 py-2 font-medium text-right">Commission</th>
                  <th className="px-3 py-2 font-medium">Delivery Partner</th>
                  <th className="px-4 py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
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
                      className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]"
                    >
                      <td className="px-4 py-2 font-mono font-medium text-[#111111]">
                        {row.orderId}
                      </td>
                      <td className="px-3 py-2 text-[#6B6667] font-mono text-[11px]">
                        {row.dateTime}
                      </td>
                      <td className="px-3 py-2 font-medium text-[#111111]">
                        {row.customerName}
                      </td>
                      <td className="px-3 py-2 text-[#111111]">{row.vendorName}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.itemsCount}</td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-[#111111]">
                        {formatINR(row.grossGmv)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[#20885A]">
                        {formatINR(row.commission)}
                      </td>
                      <td className="px-3 py-2 text-[#6B6667]">{row.deliveryPartner}</td>
                      <td className="px-4 py-2 text-center">
                        <StatusBadge status={row.status} variant="order" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeCategory === "VENDORS" && (
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs text-[#6B6667] font-medium">
                  <th className="px-4 py-2 font-medium">Vendor ID</th>
                  <th className="px-3 py-2 font-medium">Boutique</th>
                  <th className="px-3 py-2 font-medium">Hub</th>
                  <th className="px-3 py-2 font-medium text-right">Orders</th>
                  <th className="px-3 py-2 font-medium text-right">Gross Sales</th>
                  <th className="px-3 py-2 font-medium text-right">Rate</th>
                  <th className="px-3 py-2 font-medium text-right">Commission</th>
                  <th className="px-3 py-2 font-medium text-right">Net Payable</th>
                  <th className="px-4 py-2 font-medium text-center">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
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
                      className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]"
                    >
                      <td className="px-4 py-2 font-mono font-medium text-[#111111]">
                        {row.vendorId}
                      </td>
                      <td className="px-3 py-2 font-medium text-[#111111]">
                        {row.boutiqueName}
                      </td>
                      <td className="px-3 py-2 text-[#6B6667]">{row.operatingHub}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.deliveredOrders}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-[#111111]">
                        {formatINR(row.grossSales)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[#6B6667]">
                        {row.commissionRate.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[#20885A]">
                        {formatINR(row.commissionRetained)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[#111111]">
                        {formatINR(row.netPayable)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <StatusBadge status={row.settlementStatus} variant="ledger" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeCategory === "DRIVERS" && (
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs text-[#6B6667] font-medium">
                  <th className="px-4 py-2 font-medium">Partner ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Vehicle</th>
                  <th className="px-3 py-2 font-medium text-right">Hours</th>
                  <th className="px-3 py-2 font-medium text-right">Runs</th>
                  <th className="px-3 py-2 font-medium text-right">Avg Time</th>
                  <th className="px-3 py-2 font-medium text-right">Payout Total</th>
                  <th className="px-4 py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
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
                      className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]"
                    >
                      <td className="px-4 py-2 font-mono font-medium text-[#111111]">
                        {row.partnerId}
                      </td>
                      <td className="px-3 py-2 font-medium text-[#111111]">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-[#6B6667]">{row.vehicleType}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.activeHours}h</td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-[#111111]">
                        {row.completedRuns}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[#6B6667]">
                        {row.avgDeliveryMinutes}m
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[#111111]">
                        {formatINR(row.payoutTotal)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium ${
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
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs text-[#6B6667] font-medium">
                  <th className="px-4 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Title &amp; Brand</th>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium">Hub</th>
                  <th className="px-3 py-2 font-medium text-right">Stock</th>
                  <th className="px-3 py-2 font-medium text-right">MRP</th>
                  <th className="px-3 py-2 font-medium text-right">Price</th>
                  <th className="px-4 py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
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
                      className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]"
                    >
                      <td className="px-4 py-2 font-mono font-medium text-[#111111]">
                        {row.sku}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-[#111111]">
                          {row.title}
                        </div>
                        <div className="text-[11px] text-[#6B6667]">{row.brand}</div>
                      </td>
                      <td className="px-3 py-2 text-[#111111]">{row.vendor}</td>
                      <td className="px-3 py-2 text-[#6B6667]">{row.nodeHub}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        <span
                          className={`font-medium ${
                            row.lowStockAlert ? "text-[#DA1E28]" : "text-[#111111]"
                          }`}
                        >
                          {row.stockQty}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono line-through text-[#6B6667]">
                        {formatINR(row.mrp)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-[#111111]">
                        {formatINR(row.sellingPrice)}
                      </td>
                      <td className="px-4 py-2 text-center">
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
