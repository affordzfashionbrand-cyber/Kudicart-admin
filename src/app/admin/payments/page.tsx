"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  Wallet,
  AlertTriangle,
  Search,
  ChevronDown,
  FilterX,
  Eye,
  X,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  mapBackendPaymentToWebRecord,
  WebPaymentRow,
} from "@/lib/orderMappers";

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<WebPaymentRow | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const pageSize = 8;

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const paymentsQuery = useQuery({
    queryKey: ["admin-payments", "list"],
    queryFn: async () => {
      const res = await api.payments.list({ limit: 100 });
      const raw = Array.isArray(res?.data) ? res.data : [];
      return raw.map(mapBackendPaymentToWebRecord);
    },
    refetchInterval: 30_000,
  });

  const metricsQuery = useQuery({
    queryKey: ["admin-payments", "metrics"],
    queryFn: () => api.payments.getMetrics(),
    refetchInterval: 30_000,
  });

  const reconcileMutation = useMutation({
    mutationFn: () => api.payments.reconcile(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showToast(
        `Reconciliation complete: checked ${res?.checkedCount ?? 0}, reconciled ${
          res?.reconciledCount ?? 0
        }, expired ${res?.expiredCount ?? 0}.`
      );
    },
    onError: (err: any) => {
      showToast(
        err?.message || "Payment reconciliation failed.",
        "error"
      );
    },
  });

  const payments: WebPaymentRow[] = useMemo(
    () => paymentsQuery.data ?? [],
    [paymentsQuery.data]
  );
  const metrics = {
    settledToday: metricsQuery.data?.settledToday ?? 0,
    settledOrdersCount: metricsQuery.data?.settledOrdersCount ?? 0,
    captureRate: metricsQuery.data?.captureRate ?? 0,
    razorpayOnline: metricsQuery.data?.razorpayOnline ?? 0,
    razorpayOrdersCount: metricsQuery.data?.razorpayOrdersCount ?? 0,
    cashOnDelivery: metricsQuery.data?.cashOnDelivery ?? 0,
    codOrdersCount: metricsQuery.data?.codOrdersCount ?? 0,
    failedAmount: metricsQuery.data?.failedAmount ?? 0,
    failureRate: metricsQuery.data?.failureRate ?? 0,
    failedCount: metricsQuery.data?.failedCount ?? 0,
    refundedAmount: metricsQuery.data?.refundedAmount ?? 0,
    refundCount: metricsQuery.data?.refundCount ?? 0,
  };

  const activeSelectedPayment =
    selectedPayment || (payments.length > 0 ? payments[0] : null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesOrder = p.orderId.toLowerCase().includes(q);
        const matchesCustomer = p.customerName.toLowerCase().includes(q);
        const matchesRef =
          p.gatewayPaymentId.toLowerCase().includes(q) ||
          p.bankRrn.toLowerCase().includes(q);
        if (!matchesId && !matchesOrder && !matchesCustomer && !matchesRef) {
          return false;
        }
      }

      if (methodFilter !== "ALL") {
        const m = p.method.toLowerCase();
        if (methodFilter === "RAZORPAY" && m === "cod") return false;
        if (methodFilter === "COD" && m !== "cod") return false;
      }

      if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [payments, searchTerm, methodFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const clearFilters = () => {
    setSearchTerm("");
    setMethodFilter("ALL");
    setStatusFilter("ALL");
    setDateFilter("ALL");
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    if (filteredPayments.length === 0) {
      showToast("No payment records available to export.", "error");
      return;
    }
    const headers =
      "Payment ID,Order Ref,Customer Name,Amount,Method,Type,Status,Gateway Ref,Bank/Order Ref,Date\n";
    const rows = filteredPayments
      .map(
        (p) =>
          `"${p.id}","${p.orderId}","${p.customerName}",${p.amount},"${p.method}","${p.transactionType}","${p.status}","${p.gatewayPaymentId}","${p.bankRrn}","${p.date}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kudicart_payments_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showToast(`Exported ${filteredPayments.length} payment records.`);
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
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Payments
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review live Razorpay captures, refunds, COD receipts, and reconcile pending transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors appearance-none cursor-pointer focus:outline-none focus:border-[#FF5A1F]"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="PAST_7_DAYS">Past 7 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              paymentsQuery.refetch();
              metricsQuery.refetch();
            }}
            disabled={paymentsQuery.isFetching}
            className="flex items-center justify-center h-9 w-9 rounded-[8px] border border-[#E4E0DB] bg-white text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] transition-colors disabled:opacity-50"
            title="Refresh Transactions"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                paymentsQuery.isFetching ? "animate-spin text-[#FF5A1F]" : ""
              }`}
            />
          </button>

          <button
            onClick={() => reconcileMutation.mutate()}
            disabled={reconcileMutation.isPending}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] text-white text-xs font-medium hover:bg-[#D94B17] transition-colors shadow-xs disabled:opacity-60"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {reconcileMutation.isPending ? "Reconciling..." : "Reconcile Pending"}
            </span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {paymentsQuery.isError && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] flex items-center justify-between gap-3 text-xs text-[#B91C1C]">
          <span>
            {(paymentsQuery.error as any)?.message ||
              "Failed to load live payment records from backend."}
          </span>
          <button
            onClick={() => {
              paymentsQuery.refetch();
              metricsQuery.refetch();
            }}
            className="h-8 px-3 rounded-[6px] bg-white border border-[#FECACA] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* FINANCIAL SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Settled Captures
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight">
              {formatINR(metrics.settledToday)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span className="font-medium text-[#20885A]">
                {metrics.captureRate}%
              </span>{" "}
              capture rate • {metrics.settledOrdersCount} payments
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Online Gateway (Razorpay)
            </span>
            <CreditCard className="w-4 h-4 text-[#0043CE]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight">
              {formatINR(metrics.razorpayOnline)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span>{metrics.razorpayOrdersCount} digital gateway payments</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Cash on Delivery (COD)
            </span>
            <Wallet className="w-4 h-4 text-[#C9822E]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight">
              {formatINR(metrics.cashOnDelivery)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span>{metrics.codOrdersCount} doorstep collections</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Failed / Refunded
            </span>
            <AlertTriangle className="w-4 h-4 text-[#DA1E28]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#DA1E28] font-mono tracking-tight">
              {formatINR(metrics.failedAmount)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span>
                {metrics.failedCount} failed ({metrics.failureRate}%) •{" "}
                {metrics.refundCount} refunds ({formatINR(metrics.refundedAmount)})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER TOOLBAR */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Payment ID, Order ID, or customer name..."
              className="w-full h-9 pl-9 pr-3 bg-white border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] placeholder:text-[#6B6667] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Methods</option>
              <option value="RAZORPAY">Razorpay Online</option>
              <option value="COD">Cash on Delivery</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] focus:border-[#FF5A1F] outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUND_PENDING">Refund Pending</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {(searchTerm || methodFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="h-9 px-2 text-xs font-medium text-[#6B6667] hover:text-[#FF5A1F] transition-colors flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B6667] font-mono">
          <span>
            {filteredPayments.length} of {payments.length} records
          </span>
        </div>
      </section>

      {/* SPLIT-PANE: TABLE & DETAIL DOSSIER */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-7 bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                  <th className="py-2 px-3 font-medium">Payment Ref</th>
                  <th className="py-2 px-3 font-medium">Order / Group</th>
                  <th className="py-2 px-3 font-medium">Customer</th>
                  <th className="py-2 px-3 font-medium text-right">Amount</th>
                  <th className="py-2 px-3 font-medium">Method</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
                {paymentsQuery.isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#6B6667]">
                      Loading live payment transactions...
                    </td>
                  </tr>
                ) : paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10">
                      <EmptyState
                        title="No payment transactions found"
                        description="Try clearing search filters or triggering pending payment reconciliation."
                        actionLabel={
                          searchTerm || methodFilter !== "ALL" || statusFilter !== "ALL"
                            ? "Clear Filters"
                            : undefined
                        }
                        onAction={
                          searchTerm || methodFilter !== "ALL" || statusFilter !== "ALL"
                            ? clearFilters
                            : undefined
                        }
                        icon="receipt_long"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((p) => {
                    const isSelected = activeSelectedPayment?.id === p.id;
                    const isFailed = p.status === "FAILED";

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPayment(p)}
                        className={`h-11 sm:h-12 cursor-pointer transition-colors border-b border-[#E4E0DB] ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-2 border-l-[#FF5A1F]"
                            : isFailed
                            ? "bg-rose-50/20 hover:bg-[#F7F7F5]/50"
                            : "hover:bg-[#F7F7F5]/50"
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-xs font-medium text-[#FF5A1F]">
                          {p.gatewayPaymentId.slice(0, 14)}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-[#111111]">
                          {p.orderRefId ? (
                            <Link
                              href={`/admin/orders/${p.orderRefId.replace("#", "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-[#FF5A1F] transition-colors"
                            >
                              {p.orderId}
                            </Link>
                          ) : (
                            <span>{p.orderId}</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-[#111111] leading-snug">
                            {p.customerName}
                          </div>
                          <div className="text-[11px] text-[#6B6667]">{p.date}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-xs font-medium text-[#111111]">
                          {formatINR(p.amount)}
                        </td>
                        <td className="py-2 px-3 text-[#6B6667] text-xs">
                          {p.method}
                        </td>
                        <td className="py-2 px-3">
                          <StatusBadge status={p.status} variant="payment" />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(p);
                            }}
                            className={`inline-flex items-center justify-center p-1 rounded-[6px] hover:bg-[#F4F1EA] transition-colors ${
                              isSelected ? "text-[#FF5A1F]" : "text-[#6B6667]"
                            }`}
                            title="Inspect Transaction"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-[#F7F7F5] border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
            <span>
              Page {currentPage} of {totalPages} ({filteredPayments.length} Total Records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {activeSelectedPayment ? (
          <div className="xl:col-span-5 bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-medium text-[#6B6667]">
                    Transaction Details
                  </span>
                  <StatusBadge status={activeSelectedPayment.status} variant="payment" />
                </div>
                <h2 className="text-base font-semibold font-mono text-[#111111]">
                  {activeSelectedPayment.gatewayPaymentId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] transition-colors"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B6667] block">Gross Amount</span>
                <span className="text-lg font-semibold font-mono text-[#111111]">
                  {formatINR(activeSelectedPayment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6B6667] block">Net Estimate</span>
                <span className="text-sm font-semibold font-mono text-[#20885A]">
                  {formatINR(activeSelectedPayment.netSettlement)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#6B6667]">
                Associated Order / Group
              </span>
              <div className="p-3 rounded-[8px] border border-[#E4E0DB] bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {activeSelectedPayment.orderRefId ? (
                    <Link
                      href={`/admin/orders/${activeSelectedPayment.orderRefId.replace("#", "")}`}
                      className="font-mono font-medium text-[#FF5A1F] hover:underline"
                    >
                      {activeSelectedPayment.orderId}
                    </Link>
                  ) : (
                    <span className="font-mono font-medium text-[#111111]">
                      {activeSelectedPayment.orderId}
                    </span>
                  )}
                  <span className="text-[#6B6667]">
                    {activeSelectedPayment.dispatchWindow}
                  </span>
                </div>
                <div className="text-xs text-[#111111] leading-snug">
                  {activeSelectedPayment.orderDescription}
                </div>
                <div className="pt-1.5 border-t border-[#E4E0DB] flex items-center justify-between text-[11px] text-[#6B6667]">
                  <span>
                    Customer:{" "}
                    <strong className="text-[#111111] font-medium">
                      {activeSelectedPayment.customerName}
                    </strong>
                  </span>
                  <span className="font-mono">{activeSelectedPayment.date}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#6B6667]">
                Gateway Parameters
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">Provider</span>
                  <span className="font-medium text-[#111111]">
                    {activeSelectedPayment.gatewayProvider}
                  </span>
                </div>
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">Type</span>
                  <span className="font-medium text-[#111111]">
                    {activeSelectedPayment.transactionType}
                  </span>
                </div>
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">
                    Payment Ref
                  </span>
                  <span className="font-mono text-[11px] text-[#111111] truncate block">
                    {activeSelectedPayment.gatewayPaymentId}
                  </span>
                </div>
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">
                    Order / Refund Ref
                  </span>
                  <span className="font-mono text-[11px] text-[#111111] truncate block">
                    {activeSelectedPayment.bankRrn}
                  </span>
                </div>
                {activeSelectedPayment.failureReason && (
                  <div className="col-span-2 p-2.5 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] text-xs text-[#B91C1C]">
                    Failure reason: {activeSelectedPayment.failureReason}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E0DB] space-y-2">
              <button
                onClick={() => {
                  const slip = `AFFORDZ PAYMENT SLIP\n---------------------\nTransaction ID: ${activeSelectedPayment.id}\nOrder Ref: ${activeSelectedPayment.orderId}\nCustomer: ${activeSelectedPayment.customerName}\nAmount: INR ${activeSelectedPayment.amount}\nMethod: ${activeSelectedPayment.method}\nReference: ${activeSelectedPayment.gatewayPaymentId}\nDate: ${activeSelectedPayment.date}\nStatus: ${activeSelectedPayment.status}`;
                  const blob = new Blob([slip], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `receipt_${activeSelectedPayment.id}.txt`;
                  link.click();
                  showToast("Downloaded payment slip.");
                }}
                className="w-full py-2 px-3 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-[#111111] font-medium text-xs transition-colors"
              >
                Download Payment Slip
              </button>
              <p className="text-[11px] text-[#6B6667]">
                Refunds trigger automatically via Razorpay upon order cancellation, vendor rejection, or Try &amp; Buy return reconciliation (DCR-009).
              </p>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-5 bg-white border border-[#E4E0DB] rounded-[10px] p-8 text-center text-[#6B6667]">
            <Receipt className="w-8 h-8 text-[#6B6667] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#111111]">Select a transaction</p>
            <p className="text-xs text-[#6B6667] mt-1">
              Click any row to inspect payment details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
