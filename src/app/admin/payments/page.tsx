"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  ExternalLink,
  X,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { PaymentRecord } from "@/types/payments";
import { MOCK_PAYMENTS, MOCK_PAYMENT_METRICS } from "@/mocks/payments";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";
import { api } from "@/lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(MOCK_PAYMENTS[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("TODAY");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const pageSize = 8;

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  React.useEffect(() => {
    api.payments.list({ limit: 50 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setPayments(res.data);
          setSelectedPayment(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Filter logic
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesOrder = p.orderId.toLowerCase().includes(q);
        const matchesCustomer = p.customerName.toLowerCase().includes(q);
        const matchesRef = p.gatewayPaymentId.toLowerCase().includes(q) || p.bankRrn.toLowerCase().includes(q);
        if (!matchesId && !matchesOrder && !matchesCustomer && !matchesRef) return false;
      }

      if (methodFilter !== "ALL" && p.method !== methodFilter) {
        return false;
      }

      if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [payments, searchTerm, methodFilter, statusFilter]);

  // Pagination
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
    const headers = "Payment ID,Order ID,Customer Name,Email,Amount,Method,Status,Gateway Ref,UTR,Date\n";
    const rows = filteredPayments
      .map(
        (p) =>
          `"${p.id}","${p.orderId}","${p.customerName}","${p.customerEmail}",${p.amount},"${p.method}","${p.status}","${p.gatewayPaymentId}","${p.bankRrn}","${p.date}"`
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

      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Payments
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review transaction logs, payment methods, and gateway references across customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors appearance-none cursor-pointer focus:outline-none focus:border-[#FF5A1F]"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="PAST_7_DAYS">Past 7 Days</option>
              <option value="ALL">All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setPayments([...MOCK_PAYMENTS]);
              if (!selectedPayment) setSelectedPayment(MOCK_PAYMENTS[0]);
              showToast("Payment transactions refreshed.");
            }}
            className="flex items-center justify-center h-9 w-9 rounded-[8px] border border-[#E4E0DB] bg-white text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] transition-colors"
            title="Refresh Transactions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* ================= FINANCIAL SUMMARY CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Settled Today */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Settled Today
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.settledToday)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span className="font-medium text-[#20885A]">{MOCK_PAYMENT_METRICS.captureRate}%</span> capture rate • {MOCK_PAYMENT_METRICS.settledOrdersCount} orders
            </div>
          </div>
        </div>

        {/* Online Gateway */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Online Gateway
            </span>
            <CreditCard className="w-4 h-4 text-[#0043CE]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.razorpayOnline)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span>{MOCK_PAYMENT_METRICS.razorpayOrdersCount} digital gateway payments</span>
            </div>
          </div>
        </div>

        {/* Cash on Delivery */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Cash on Delivery (COD)
            </span>
            <Wallet className="w-4 h-4 text-[#C9822E]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#111111] font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.cashOnDelivery)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span>{MOCK_PAYMENT_METRICS.codOrdersCount} doorstep collections</span>
            </div>
          </div>
        </div>

        {/* Failed / Exceptions */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B6667]">
              Failed Transactions
            </span>
            <AlertTriangle className="w-4 h-4 text-[#DA1E28]" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#DA1E28] font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.failedAmount)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B6667]">
              <span>{MOCK_PAYMENT_METRICS.failedCount} gateway drops ({MOCK_PAYMENT_METRICS.failureRate}%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Keyword Search */}
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

          {/* Payment Method */}
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
              <option value="Razorpay UPI">Razorpay UPI</option>
              <option value="Razorpay Netbanking">Razorpay Netbanking</option>
              <option value="Razorpay Cards">Razorpay Cards</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Payment Status */}
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
              <option value="REFUNDED">Refunded</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Clear Filters */}
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
          <span>{filteredPayments.length} of {payments.length} records</span>
        </div>
      </section>

      {/* ================= SPLIT-PANE: TABLE & DETAIL DOSSIER ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Payments Data Table (7 Cols) */}
        <div className="xl:col-span-7 bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                  <th className="py-2 px-3 font-medium">Payment ID</th>
                  <th className="py-2 px-3 font-medium">Order</th>
                  <th className="py-2 px-3 font-medium">Customer</th>
                  <th className="py-2 px-3 font-medium text-right">Amount</th>
                  <th className="py-2 px-3 font-medium">Method</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10">
                      <EmptyState
                        title="No transactions match filters"
                        description="Try modifying search keywords or clearing active filters."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                        icon="receipt_long"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((p) => {
                    const isSelected = selectedPayment?.id === p.id;
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
                          {p.id}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-[#111111]">
                          <Link
                            href={`/admin/orders/${p.orderId.replace("#", "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-[#FF5A1F] transition-colors"
                          >
                            {p.orderId}
                          </Link>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-[#111111] leading-snug">{p.customerName}</div>
                          <div className="text-[11px] text-[#6B6667]">{p.customerEmail}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-xs font-medium text-[#111111]">
                          {formatINR(p.amount)}
                        </td>
                        <td className="py-2 px-3 text-[#6B6667] text-xs">{p.method}</td>
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

          {/* Pagination bar */}
          <div className="px-4 py-3 bg-[#F4F1EA] border-t border-[#E4E0DB] flex items-center justify-between text-xs text-[#6B6667]">
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

        {/* Payment Detail Drawer / Inspection Panel (5 Cols) */}
        {selectedPayment ? (
          <div className="xl:col-span-5 bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4 sticky top-20">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-medium text-[#6B6667]">
                    Transaction Details
                  </span>
                  <StatusBadge status={selectedPayment.status} variant="payment" />
                </div>
                <h2 className="text-base font-semibold font-mono text-[#111111]">{selectedPayment.id}</h2>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] transition-colors"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Amount Gross Banner */}
            <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B6667] block">Gross Amount</span>
                <span className="text-lg font-semibold font-mono text-[#111111]">
                  {formatINR(selectedPayment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6B6667] block">Net Settlement</span>
                <span className="text-sm font-semibold font-mono text-[#20885A]">
                  {formatINR(selectedPayment.netSettlement)}
                </span>
              </div>
            </div>

            {/* Order Context */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#6B6667]">
                Associated Order
              </span>
              <div className="p-3 rounded-[8px] border border-[#E4E0DB] bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/orders/${selectedPayment.orderId.replace("#", "")}`}
                    className="font-mono font-medium text-[#FF5A1F] hover:underline"
                  >
                    {selectedPayment.orderId}
                  </Link>
                  <span className="text-[#6B6667]">Fulfillment: {selectedPayment.dispatchWindow}</span>
                </div>
                <div className="text-xs text-[#111111] leading-snug">
                  {selectedPayment.orderDescription}
                </div>
                <div className="pt-1.5 border-t border-[#E4E0DB] flex items-center justify-between text-[11px] text-[#6B6667]">
                  <span>Customer: <strong className="text-[#111111] font-medium">{selectedPayment.customerName}</strong></span>
                  <span className="font-mono">{selectedPayment.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Gateway Technical Attributes */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#6B6667]">
                Gateway Parameters
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">Provider</span>
                  <span className="font-medium text-[#111111]">{selectedPayment.gatewayProvider}</span>
                </div>
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">Method</span>
                  <span className="font-medium text-[#111111]">{selectedPayment.subMethod || selectedPayment.method}</span>
                </div>
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">Gateway Reference</span>
                  <span className="font-mono text-[11px] text-[#111111] truncate block">
                    {selectedPayment.gatewayPaymentId}
                  </span>
                </div>
                <div className="p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]">
                  <span className="text-[#6B6667] text-[10px] block uppercase">Bank UTR / RRN</span>
                  <span className="font-mono text-[11px] text-[#111111] truncate block">
                    {selectedPayment.bankRrn}
                  </span>
                </div>
                <div className="col-span-2 p-2.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] flex justify-between items-center text-xs">
                  <span className="text-[#6B6667]">Gateway Fee (2% + GST)</span>
                  <span className="font-mono text-[#DA1E28] font-medium">-{formatINR(selectedPayment.feeDeducted)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[#E4E0DB] space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const slip = `KUDICART PAYMENT SLIP\n---------------------\nPayment ID: ${selectedPayment.id}\nOrder ID: ${selectedPayment.orderId}\nCustomer: ${selectedPayment.customerName}\nAmount: INR ${selectedPayment.amount}\nMethod: ${selectedPayment.method}\nReference: ${selectedPayment.gatewayPaymentId}\nDate: ${selectedPayment.date}\nStatus: ${selectedPayment.status}`;
                    const blob = new Blob([slip], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `receipt_${selectedPayment.id.replace("#", "")}.txt`;
                    link.click();
                    showToast("Downloaded payment slip.");
                  }}
                  className="flex-1 py-2 px-3 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-[#111111] font-medium text-xs transition-colors"
                >
                  Download Receipt
                </button>
                <button
                  onClick={() =>
                    showToast(
                      "Not connected in this build: Payment refund requires backend connectivity.",
                      "error"
                    )
                  }
                  className="flex-1 py-2 px-3 rounded-[8px] bg-[#FEF2F2] text-[#DA1E28] border border-[#ffdad6] hover:bg-[#DA1E28] hover:text-white font-medium text-xs transition-colors"
                >
                  Initiate Refund
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-5 bg-white border border-[#E4E0DB] rounded-[10px] p-8 text-center text-[#6B6667]">
            <Receipt className="w-8 h-8 text-[#6B6667] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#111111]">Select a transaction</p>
            <p className="text-xs text-[#6B6667] mt-1">Click any row to inspect payment details.</p>
          </div>
        )}
      </section>
    </div>
  );
}
