"use client";

import React, { useState, useMemo } from "react";
import { VendorLedgerEntry } from "@/types/ledger";
import { MOCK_LEDGER_ENTRIES, MOCK_LEDGER_METRICS } from "@/mocks/ledger";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";

export default function AdminLedgerPage() {
  const [entries, setEntries] = useState<VendorLedgerEntry[]>(MOCK_LEDGER_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<VendorLedgerEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reconciliationNotice, setReconciliationNotice] = useState<string | null>(null);

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
  };

  const handleReconciliationRun = () => {
    setReconciliationNotice("Running ledger reconciliation against active marketplace order database...");
    setTimeout(() => {
      setReconciliationNotice("Reconciliation completed: All 42 boutique ledgers verified & balanced with bank gateway logs.");
      setTimeout(() => setReconciliationNotice(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto select-none">
      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-container-highest pb-space-md">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs">
            <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">
              Commission &amp; Ledger
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Audit Status: Balanced
            </span>
          </div>
          <p className="text-body-md text-secondary">
            Inspect boutique merchant gross merchandise value, commission retention, and net vendor payout settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cycle Badge */}
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-highest text-xs font-medium text-on-surface shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
            <span>Current Cycle: <strong>{MOCK_LEDGER_METRICS.currentCycle}</strong></span>
          </div>

          {/* Download CSV */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface border border-surface-container-highest hover:bg-surface-container-low text-xs font-semibold active:scale-[0.99] transition-transform shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">download</span>
            <span>Download Ledger CSV</span>
          </button>

          {/* Reconciliation Run Action */}
          <button
            onClick={handleReconciliationRun}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#FF5A1F] text-white hover:bg-[#D94B17] text-xs font-semibold active:scale-[0.98] transition-transform shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Reconciliation Run</span>
          </button>
        </div>
      </section>

      {/* Reconciliation Notice */}
      {reconciliationNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
          <span>{reconciliationNotice}</span>
        </div>
      )}

      {/* ================= LEDGER SUMMARY KPI ROW ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: GMV */}
        <div className="p-space-md bg-surface-container-lowest rounded-xl border border-surface-container-highest space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Gross Marketplace Volume (GMV)
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold font-mono text-on-surface">
              {formatINR(MOCK_LEDGER_METRICS.grossMarketplaceVolume)}
            </span>
          </div>
          <p className="text-label-xs text-xs text-secondary border-t border-surface-container-highest pt-2">
            Total order value captured across all merchant stores.
          </p>
        </div>

        {/* Card 2: Commission Earned */}
        <div className="p-space-md bg-surface-container-lowest rounded-xl border border-surface-container-highest space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Platform Commission Earned
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#FF5A1F]">account_balance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold font-mono text-[#FF5A1F]">
              {formatINR(MOCK_LEDGER_METRICS.platformCommissionEarned)}
            </span>
            <span className="text-label-xs text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
              +14.2%
            </span>
          </div>
          <p className="text-label-xs text-xs text-secondary border-t border-surface-container-highest pt-2">
            Weighted average take-rate: <strong className="text-on-surface">{MOCK_LEDGER_METRICS.averageTakeRate}%</strong> retained by KudiCart.
          </p>
        </div>

        {/* Card 3: Net Vendor Payouts Due */}
        <div className="p-space-md bg-surface-container-lowest rounded-xl border border-surface-container-highest space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Net Vendor Payouts Due
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">storefront</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold font-mono text-on-surface">
              {formatINR(MOCK_LEDGER_METRICS.netVendorPayoutsDue)}
            </span>
          </div>
          <p className="text-label-xs text-xs text-secondary border-t border-surface-container-highest pt-2">
            Payable to <strong className="text-on-surface">{MOCK_LEDGER_METRICS.activeVendorsCount} active verified boutiques</strong> upon cycle cutoff.
          </p>
        </div>

        {/* Card 4: Fleet Logistics Costs */}
        <div className="p-space-md bg-surface-container-lowest rounded-xl border border-surface-container-highest space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Fleet Logistics Costs
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">local_shipping</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold font-mono text-on-surface">
              {formatINR(MOCK_LEDGER_METRICS.fleetLogisticsCosts)}
            </span>
            <span className="text-label-xs text-xs text-secondary">Escrow</span>
          </div>
          <p className="text-label-xs text-xs text-secondary border-t border-surface-container-highest pt-2">
            Delivery partner disbursement pool accrued.
          </p>
        </div>
      </section>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <section className="p-space-sm bg-surface-container-lowest rounded-xl border border-surface-container-highest flex flex-col md:flex-row items-center justify-between gap-space-sm shadow-xs">
        <div className="flex flex-1 items-center gap-space-sm w-full md:w-auto">
          {/* Search field */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-2.5">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vendor boutique name or merchant ID..."
              className="w-full h-9 pl-9 pr-3 bg-surface-container-low text-xs font-body-sm text-on-surface placeholder:text-secondary rounded-lg border border-surface-container-highest focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-surface-container-low text-xs font-medium text-on-surface rounded-lg border border-surface-container-highest focus:border-[#FF5A1F] focus:ring-0 cursor-pointer appearance-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Textiles & Apparel">Textiles &amp; Apparel</option>
              <option value="Artisanal Food">Artisanal Food</option>
              <option value="Home & Decor">Home &amp; Decor</option>
              <option value="Leathercraft">Leathercraft</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-secondary absolute right-2.5 top-2.5 pointer-events-none">
              unfold_more
            </span>
          </div>

          {/* Payout Status Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-surface-container-low text-xs font-medium text-on-surface rounded-lg border border-surface-container-highest focus:border-[#FF5A1F] focus:ring-0 cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CYCLE_ACCRUING">Cycle Accruing</option>
              <option value="READY_FOR_TRANSFER">Ready for Transfer</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="HOLD">Hold</option>
            </select>
            <span className="material-symbols-outlined text-[16px] text-secondary absolute right-2.5 top-2.5 pointer-events-none">
              unfold_more
            </span>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline transition-colors flex items-center gap-1 font-semibold pr-2"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            <span>Clear Filters</span>
          </button>
        )}
      </section>

      {/* ================= VENDOR LEDGER TABLE ================= */}
      <section className="bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-10 bg-surface-container-low text-secondary text-label-xs font-label-xs uppercase tracking-wider border-b border-surface-container-highest select-none">
                <th className="px-4 py-2 font-semibold">Store / Boutique</th>
                <th className="px-4 py-2 font-semibold">Category</th>
                <th className="px-4 py-2 font-semibold text-right">Total Orders</th>
                <th className="px-4 py-2 font-semibold text-right">Gross GMV (INR ₹)</th>
                <th className="px-4 py-2 font-semibold text-right">Commission Rate</th>
                <th className="px-4 py-2 font-semibold text-right">Commission Retained</th>
                <th className="px-4 py-2 font-semibold text-right">Net Payable</th>
                <th className="px-4 py-2 font-semibold text-center">Settlement Status</th>
                <th className="px-4 py-2 font-semibold">Last Payout</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest text-xs font-body-sm text-on-surface">
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
                  <tr key={entry.id} className="h-12 hover:bg-surface-container-low transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface group-hover:text-[#FF5A1F] transition-colors">
                          {entry.vendorName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                          <span className="font-mono text-secondary">{entry.id}</span>
                          <span>•</span>
                          <span>{entry.hub}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{entry.totalOrders}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">
                      {formatINR(entry.grossGmv)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-secondary">
                      {entry.commissionRate}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#FF5A1F] font-medium">
                      {formatINR(entry.commissionRetained)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-on-surface">
                      {formatINR(entry.netPayable)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={entry.status} variant="ledger" />
                    </td>
                    <td className="px-4 py-2.5 text-secondary text-[11px]">{entry.lastPayoutDate}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                      >
                        View Breakdown
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-surface-container-highest pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-on-surface">{selectedEntry.vendorName}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-secondary">
                    {selectedEntry.id}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Operating Hub: {selectedEntry.hub} • {selectedEntry.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Financial Reconciliation Formula Card */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-secondary text-[10px]">
                Cycle Settlement Calculation ({MOCK_LEDGER_METRICS.currentCycle})
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Gross Merchandise Volume ({selectedEntry.totalOrders} orders):</span>
                  <strong className="font-mono text-sm text-on-surface">{formatINR(selectedEntry.grossGmv)}</strong>
                </div>
                <div className="flex justify-between items-center text-[#DA1E28]">
                  <span>Less Platform Take-Rate ({selectedEntry.commissionRate}%):</span>
                  <strong className="font-mono text-sm">-{formatINR(selectedEntry.commissionRetained)}</strong>
                </div>
                <div className="pt-2 border-t border-surface-container-highest flex justify-between items-center text-sm">
                  <span className="font-bold text-on-surface">Net Vendor Payout Payable:</span>
                  <strong className="font-mono text-base font-bold text-emerald-700">
                    {formatINR(selectedEntry.netPayable)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Banking Destination */}
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-highest text-xs space-y-1">
              <span className="font-semibold text-secondary uppercase text-[10px]">
                Disbursement Destination
              </span>
              <p className="font-semibold text-on-surface">{selectedEntry.payoutAccount || "Bank account on file"}</p>
              <p className="text-secondary text-[11px]">GSTIN: {selectedEntry.gstin || "27AABCV0000Z1Z0"}</p>
            </div>

            {/* Recent Orders in Cycle */}
            {selectedEntry.recentOrders && selectedEntry.recentOrders.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-secondary text-[10px]">
                  Recent Order Contributions
                </span>
                <div className="border border-surface-container-highest rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-[10px] text-secondary uppercase">
                      <tr>
                        <th className="p-2">Order</th>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-right">GMV</th>
                        <th className="p-2 text-right">Net Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-highest">
                      {selectedEntry.recentOrders.map((ord) => (
                        <tr key={ord.orderNumber}>
                          <td className="p-2 font-mono font-semibold text-primary">{ord.orderNumber}</td>
                          <td className="p-2 truncate max-w-[160px]">{ord.itemSummary}</td>
                          <td className="p-2 text-right font-mono">{formatINR(ord.orderTotal)}</td>
                          <td className="p-2 text-right font-mono font-semibold text-emerald-700">
                            {formatINR(ord.netToVendor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-surface-container-highest">
              <button
                onClick={() => setSelectedEntry(null)}
                className="h-9 px-4 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors"
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
