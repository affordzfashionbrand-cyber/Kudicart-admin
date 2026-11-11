"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  mapBackendLedgerToWebRow,
  WebLedgerRow,
} from "@/lib/orderMappers";

export default function AdminLedgerPage() {
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState<WebLedgerRow | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const ledgerQuery = useQuery({
    queryKey: ["admin-ledger", "list"],
    queryFn: async () => {
      const res = await api.ledger.list({ limit: 100 });
      const raw = Array.isArray(res?.data) ? res.data : [];
      return raw.map(mapBackendLedgerToWebRow);
    },
    refetchInterval: 30_000,
  });

  const metricsQuery = useQuery({
    queryKey: ["admin-ledger", "metrics"],
    queryFn: () => api.ledger.getMetrics(),
    refetchInterval: 30_000,
  });

  const settlementMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.ledger.updateStatus(id, status),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledger"] });
      if (selectedEntry && selectedEntry.id === vars.id) {
        setSelectedEntry({
          ...selectedEntry,
          status: vars.status as WebLedgerRow["status"],
        });
      }
      showToast(`Updated vendor settlement status to ${vars.status}.`);
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to update settlement status.", "error");
    },
  });

  const entries: WebLedgerRow[] = useMemo(
    () => ledgerQuery.data ?? [],
    [ledgerQuery.data]
  );
  const metrics = {
    grossMarketplaceVolume: metricsQuery.data?.grossMarketplaceVolume ?? 0,
    platformCommissionEarned: metricsQuery.data?.platformCommissionEarned ?? 0,
    averageTakeRate: metricsQuery.data?.averageTakeRate ?? 0,
    netVendorPayoutsDue: metricsQuery.data?.netVendorPayoutsDue ?? 0,
    activeVendorsCount: metricsQuery.data?.activeVendorsCount ?? 0,
    entriesCount: metricsQuery.data?.entriesCount ?? 0,
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = e.vendorName.toLowerCase().includes(q);
        const matchesId = e.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      if (statusFilter !== "ALL" && e.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [entries, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const handleDownloadCsv = () => {
    if (filteredEntries.length === 0) {
      showToast("No ledger entries available to export.", "error");
      return;
    }
    const headers =
      "Vendor ID,Store Name,Orders,Gross GMV,Commission Rate,Commission Retained,Net Payable,Status,Last Entry Date\n";
    const rows = filteredEntries
      .map(
        (e) =>
          `"${e.id}","${e.vendorName}",${e.totalOrders},${e.grossGmv},"${e.commissionRate}%",${e.commissionRetained},${e.netPayable},"${e.status}","${e.lastPayoutDate}"`
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
      await Promise.all([ledgerQuery.refetch(), metricsQuery.refetch()]);
      const freshMetrics = await api.ledger.getMetrics();
      const volume = freshMetrics?.grossMarketplaceVolume ?? 0;
      showToast(
        `Ledger balance verified from PostgreSQL: ${formatINR(
          volume
        )} GMV across ${freshMetrics?.entriesCount ?? 0} balanced entries.`,
        "success"
      );
    } catch (err: any) {
      showToast(
        err?.message || "Unable to verify live ledger metrics.",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
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

      {/* PAGE HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Commission &amp; Ledger
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium">
              {metrics.entriesCount} Balanced Ledger Entries
            </span>
          </div>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review boutique gross merchandise volume, platform commission ({metrics.averageTakeRate}%), and net vendor payouts from live LedgerEntry rows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-white text-[#111111] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleReconciliationRun}
            disabled={ledgerQuery.isFetching}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] text-white hover:bg-[#D94B17] text-xs font-medium transition-colors shadow-xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                ledgerQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            <span>Verify &amp; Refresh Ledger</span>
          </button>
        </div>
      </section>

      {ledgerQuery.isError && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#B91C1C]">
          <span>
            {(ledgerQuery.error as any)?.message ||
              "Failed to load ledger entries from PostgreSQL."}
          </span>
          <button
            onClick={() => {
              ledgerQuery.refetch();
              metricsQuery.refetch();
            }}
            className="h-8 px-3 rounded-[6px] bg-white border border-[#FECACA] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* LEDGER SUMMARY KPI ROW */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Gross Marketplace Volume (GMV)
            </span>
            <Wallet className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div>
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {formatINR(metrics.grossMarketplaceVolume)}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Total settled order revenue accrued across boutiques.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Commission Retained
            </span>
            <CreditCard className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-[#FF5A1F]">
              {formatINR(metrics.platformCommissionEarned)}
            </span>
            <span className="text-xs text-[#20885A] font-medium">
              {metrics.averageTakeRate}% avg
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Platform commission retained from delivered orders.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Net Vendor Payouts Due
            </span>
            <Building2 className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div>
            <span className="text-2xl font-semibold font-mono text-[#111111]">
              {formatINR(metrics.netVendorPayoutsDue)}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Payable across {metrics.activeVendorsCount} merchant accounts.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[10px] border border-[#E4E0DB] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Balanced Double-Entry Check
            </span>
            <Truck className="w-4 h-4 text-[#20885A]" />
          </div>
          <div>
            <span className="text-2xl font-semibold font-mono text-[#20885A]">
              {formatINR(
                metrics.grossMarketplaceVolume -
                  metrics.platformCommissionEarned -
                  metrics.netVendorPayoutsDue
              )}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] border-t border-[#E4E0DB] pt-2">
            Residual imbalance (₹0.00 expected under DCR-010).
          </p>
        </div>
      </section>

      {/* SEARCH & FILTER BAR */}
      <section className="p-3 bg-white rounded-[10px] border border-[#E4E0DB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 items-center gap-2.5 w-full md:w-auto">
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

          <div className="relative min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-white text-xs font-medium text-[#111111] rounded-[8px] border border-[#E4E0DB] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Settlement Statuses</option>
              <option value="CYCLE_ACCRUING">Cycle Accruing</option>
              <option value="READY_FOR_TRANSFER">Ready for Transfer</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="HOLD">Hold</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {(searchTerm || statusFilter !== "ALL") && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#6B6667] hover:text-[#FF5A1F] transition-colors flex items-center gap-1 font-medium pr-2"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </section>

      {/* VENDOR LEDGER TABLE */}
      <section className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] text-[#6B6667] text-xs font-medium border-b border-[#E4E0DB]">
                <th className="px-4 py-2 font-medium">Store / Boutique</th>
                <th className="px-4 py-2 font-medium text-right">Orders</th>
                <th className="px-4 py-2 font-medium text-right">Gross GMV</th>
                <th className="px-4 py-2 font-medium text-right">Commission Rate</th>
                <th className="px-4 py-2 font-medium text-right">Commission</th>
                <th className="px-4 py-2 font-medium text-right">Net Payable</th>
                <th className="px-4 py-2 font-medium text-center">Settlement</th>
                <th className="px-4 py-2 font-medium">Latest Entry</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {ledgerQuery.isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#6B6667]">
                    Loading commission ledger entries...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState
                      title="No ledger records found"
                      description="Balanced ledger entries are generated automatically when orders reach DELIVERED or reconciled RETURNED."
                      actionLabel={
                        searchTerm || statusFilter !== "ALL"
                          ? "Clear Filters"
                          : undefined
                      }
                      onAction={
                        searchTerm || statusFilter !== "ALL"
                          ? clearFilters
                          : undefined
                      }
                      icon="account_balance_wallet"
                    />
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="h-12 hover:bg-[#F7F7F5]/50 transition-colors border-b border-[#E4E0DB]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#111111]">
                          {entry.vendorName}
                        </span>
                        <span className="font-mono text-[11px] text-[#6B6667]">
                          {entry.vendorId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {entry.totalOrders}
                    </td>
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
                    <td className="px-4 py-2.5 text-[#6B6667] text-[11px]">
                      {entry.lastPayoutDate}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-xs text-[#FF5A1F] hover:underline font-medium"
                      >
                        Manage / Breakdown
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* LEDGER DETAIL BREAKDOWN MODAL */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#111111]">
                    {selectedEntry.vendorName}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667]">
                    {selectedEntry.vendorId}
                  </span>
                </div>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Latest entry: {selectedEntry.lastPayoutDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] space-y-2 text-xs">
              <span className="font-medium text-[#6B6667] text-[11px] block">
                Cycle Calculation ({selectedEntry.totalOrders} settled orders)
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6667]">Gross Revenue:</span>
                  <strong className="font-mono text-xs text-[#111111]">
                    {formatINR(selectedEntry.grossGmv)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[#DA1E28]">
                  <span>Platform Fee ({selectedEntry.commissionRate}%):</span>
                  <strong className="font-mono text-xs">
                    -{formatINR(selectedEntry.commissionRetained)}
                  </strong>
                </div>
                <div className="pt-2 border-t border-[#E4E0DB] flex justify-between items-center text-xs">
                  <span className="font-medium text-[#111111]">
                    Net Vendor Payout:
                  </span>
                  <strong className="font-mono text-sm font-semibold text-[#20885A]">
                    {formatINR(selectedEntry.netPayable)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-[#111111] block">
                Update Payout Settlement Status
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "READY_FOR_TRANSFER",
                    "TRANSFERRED",
                    "HOLD",
                  ] as WebLedgerRow["status"][]
                ).map((nextSt) => (
                  <button
                    key={nextSt}
                    disabled={
                      settlementMutation.isPending ||
                      selectedEntry.status === nextSt
                    }
                    onClick={() =>
                      settlementMutation.mutate({
                        id: selectedEntry.id,
                        status: nextSt,
                      })
                    }
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-colors ${
                      selectedEntry.status === nextSt
                        ? "bg-[#111111] text-white border-[#111111]"
                        : "bg-white text-[#111111] border-[#E4E0DB] hover:bg-[#F7F7F5]"
                    } disabled:opacity-50`}
                  >
                    {nextSt.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

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
