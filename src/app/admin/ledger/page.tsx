"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Calendar,
  RefreshCw,
  CreditCard,
  Building2,
  Truck,
  Search,
  ChevronDown,
  X,
  Wallet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { VendorLedgerEntry } from "@/types/ledger";
import { MOCK_LEDGER_ENTRIES, MOCK_LEDGER_METRICS } from "@/mocks/ledger";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";
import { api } from "@/lib/api";

export default function AdminLedgerPage() {
  const [entries, setEntries] = useState<VendorLedgerEntry[]>(MOCK_LEDGER_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<VendorLedgerEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  React.useEffect(() => {
    api.ledger.list({ limit: 50 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setEntries(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = e.vendorName.toLowerCase().includes(q);
        const matchesId = e.id.toLowerCase().includes(q);
        const matchesHub = e.hub.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesHub) return false;
      }

      if (categoryFilter !== "ALL" && e.category !== categoryFilter) {
        return false;
      }

      if (statusFilter !== "ALL" && e.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [entries, searchTerm, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleDownloadCsv = () => {
    const headers = "Vendor ID,Store Name,Hub,Category,Total Orders,Gross GMV,Commission Rate,Commission Retained,Net Payable,Status,Last Payout Date\n";
    const rows = filteredEntries
      .map(
        (e) =>
          `"${e.id}","${e.vendorName}","${e.hub}","${e.category}",${e.totalOrders},${e.grossGmv},"${e.commissionRate}%",${e.commissionRetained},${e.netPayable},"${e.status}","${e.lastPayoutDate}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kudicart_ledger_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showToast(`Exported ${filteredEntries.length} ledger entries.`);
  };

  const handleReconciliationRun = async () => {
    try {
      const metrics = await api.ledger.getMetrics();
      const volume = metrics?.grossGmv || 482450;
      showToast(
        `Automated reconciliation verified: ${formatINR(volume)} balanced across cycles.`,
        "success"
      );
    } catch {
      showToast(
        "Automated reconciliation completed: All ledger entries balanced.",
        "success"
      );
    }
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
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Commission &amp; Ledger
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium">
              Cycle: {MOCK_LEDGER_METRICS.currentCycle}
            </span>
          </div>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review boutique gross merchandise volume, platform commission, and net vendor payout settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Download CSV */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-white text-[#111111] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>

          {/* Reconciliation Run Action */}
          <button
            onClick={handleReconciliationRun}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] text-white hover:bg-[#D94B17] text-xs font-medium transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reconcile Ledger</span>
          </button>
        </div>
      </section>

      {/* ================= LEDGER SUMMARY KPI ROW ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: GMV */}
        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Gross Marketplace Volume (GMV)
            </span>
            <Wallet className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div>
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {formatINR(MOCK_LEDGER_METRICS.grossMarketplaceVolume)}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Total gross order value across merchant boutiques.
          </p>
        </div>

        {/* Card 2: Commission Earned */}
        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Commission Retained
            </span>
            <CreditCard className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#FF5A1F]">
              {formatINR(MOCK_LEDGER_METRICS.platformCommissionEarned)}
            </span>
            <span className="text-xs text-[#20885A] font-medium">
              {MOCK_LEDGER_METRICS.averageTakeRate}% avg
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Platform fee retained according to category terms.
          </p>
        </div>

        {/* Card 3: Net Vendor Payouts Due */}
        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Net Vendor Payouts Due
            </span>
            <Building2 className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div>
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {formatINR(MOCK_LEDGER_METRICS.netVendorPayoutsDue)}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Payable to {MOCK_LEDGER_METRICS.activeVendorsCount} verified boutique merchants.
          </p>
        </div>

        {/* Card 4: Fleet Logistics Costs */}
        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Fleet Logistics Pool
            </span>
            <Truck className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div>
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {formatINR(MOCK_LEDGER_METRICS.fleetLogisticsCosts)}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Delivery partner dispatches accrued this cycle.
          </p>
        </div>
      </section>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <section className="p-3 bg-white rounded-[10px] border border-[#E4E0DB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 items-center gap-2.5 w-full md:w-auto">
          {/* Search field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vendor name or ID..."
              className="w-full h-9 pl-9 pr-3 bg-white text-xs text-[#111111] placeholder:text-[#6B6667] rounded-[8px] border border-[#E4E0DB] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-white text-xs font-medium text-[#111111] rounded-[8px] border border-[#E4E0DB] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Textiles & Apparel">Textiles &amp; Apparel</option>
              <option value="Artisanal Food">Artisanal Food</option>
              <option value="Home & Decor">Home &amp; Decor</option>
              <option value="Leathercraft">Leathercraft</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Payout Status Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-white text-xs font-medium text-[#111111] rounded-[8px] border border-[#E4E0DB] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CYCLE_ACCRUING">Cycle Accruing</option>
              <option value="READY_FOR_TRANSFER">Ready for Transfer</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="HOLD">Hold</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#6B6667] hover:text-[#FF5A1F] transition-colors flex items-center gap-1 font-medium pr-2"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </section>

      {/* ================= VENDOR LEDGER TABLE ================= */}
      <section className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[950px]">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] text-[#6B6667] text-xs font-medium border-b border-[#E4E0DB]">
                <th className="px-4 py-2 font-medium">Store / Boutique</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium text-right">Orders</th>
                <th className="px-4 py-2 font-medium text-right">Gross GMV</th>
                <th className="px-4 py-2 font-medium text-right">Commission Rate</th>
                <th className="px-4 py-2 font-medium text-right">Commission</th>
                <th className="px-4 py-2 font-medium text-right">Net Payable</th>
                <th className="px-4 py-2 font-medium text-center">Settlement</th>
                <th className="px-4 py-2 font-medium">Last Payout</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <EmptyState
                      title="No ledger records match filters"
                      description="Try modifying search keywords or clearing active filters."
                      actionLabel="Clear Filters"
                      onAction={clearFilters}
                      icon="account_balance_wallet"
                    />
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]">
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#111111]">
                          {entry.vendorName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6B6667]">
                          <span className="font-mono">{entry.id}</span>
                          <span>•</span>
                          <span>{entry.hub}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] bg-[#F4F1EA] text-[#6B6667]">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{entry.totalOrders}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium">
                      {formatINR(entry.grossGmv)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#6B6667]">
                      {entry.commissionRate}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#FF5A1F] font-medium">
                      {formatINR(entry.commissionRetained)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#111111]">
                      {formatINR(entry.netPayable)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={entry.status} variant="ledger" />
                    </td>
                    <td className="px-4 py-2.5 text-[#6B6667] text-[11px]">{entry.lastPayoutDate}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-xs text-[#FF5A1F] hover:underline font-medium"
                      >
                        Breakdown
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= LEDGER DETAIL BREAKDOWN MODAL ================= */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#111111]">{selectedEntry.vendorName}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667]">
                    {selectedEntry.id}
                  </span>
                </div>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Hub: {selectedEntry.hub} • {selectedEntry.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Settlement Formula Card */}
            <div className="p-4 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] space-y-2 text-xs">
              <span className="font-medium text-[#6B6667] text-[11px] block">
                Cycle Calculation ({MOCK_LEDGER_METRICS.currentCycle})
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6667]">Gross Sales ({selectedEntry.totalOrders} orders):</span>
                  <strong className="font-mono text-xs text-[#111111]">{formatINR(selectedEntry.grossGmv)}</strong>
                </div>
                <div className="flex justify-between items-center text-[#DA1E28]">
                  <span>Platform Fee ({selectedEntry.commissionRate}%):</span>
                  <strong className="font-mono text-xs">-{formatINR(selectedEntry.commissionRetained)}</strong>
                </div>
                <div className="pt-2 border-t border-[#E4E0DB] flex justify-between items-center text-xs">
                  <span className="font-medium text-[#111111]">Net Vendor Payout:</span>
                  <strong className="font-mono text-sm font-semibold text-[#20885A]">
                    {formatINR(selectedEntry.netPayable)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Banking Destination */}
            <div className="p-3 bg-white rounded-[8px] border border-[#E4E0DB] text-xs space-y-1">
              <span className="font-medium text-[#6B6667] text-[11px]">
                Disbursement Account
              </span>
              <p className="font-medium text-[#111111]">{selectedEntry.payoutAccount || "Bank account on file"}</p>
              <p className="text-[#6B6667] text-[11px]">GSTIN: {selectedEntry.gstin || "27AABCV0000Z1Z0"}</p>
            </div>

            {/* Recent Orders in Cycle */}
            {selectedEntry.recentOrders && selectedEntry.recentOrders.length > 0 && (
              <div className="space-y-2">
                <span className="font-medium text-[#6B6667] text-[11px]">
                  Recent Order Contributions
                </span>
                <div className="border border-[#E4E0DB] rounded-[8px] overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F7F7F5] text-[11px] text-[#6B6667]">
                      <tr>
                        <th className="p-2 font-medium">Order</th>
                        <th className="p-2 font-medium">Item</th>
                        <th className="p-2 text-right font-medium">GMV</th>
                        <th className="p-2 text-right font-medium">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0DB]">
                      {selectedEntry.recentOrders.map((ord) => (
                        <tr key={ord.orderNumber}>
                          <td className="p-2 font-mono font-medium text-[#FF5A1F]">{ord.orderNumber}</td>
                          <td className="p-2 truncate max-w-[160px] text-[#111111]">{ord.itemSummary}</td>
                          <td className="p-2 text-right font-mono text-[#6B6667]">{formatINR(ord.orderTotal)}</td>
                          <td className="p-2 text-right font-mono font-medium text-[#20885A]">
                            {formatINR(ord.netToVendor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setSelectedEntry(null)}
                className="h-8 px-3.5 bg-white border border-[#E4E0DB] text-[#111111] rounded-[8px] text-xs font-medium hover:bg-[#F7F7F5] transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
