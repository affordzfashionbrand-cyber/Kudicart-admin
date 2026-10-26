"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PaymentRecord, AdminPaymentMethod, AdminPaymentStatus } from "@/types/payments";
import { MOCK_PAYMENTS, MOCK_PAYMENT_METRICS } from "@/mocks/payments";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(MOCK_PAYMENTS[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("TODAY");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

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
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto select-none">
      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
            Payments
          </h1>
          <p className="text-body-md font-body-md text-secondary mt-0.5">
            Monitor marketplace transactions, payment verification, and gateway status across orders.
          </p>
        </div>

        <div className="flex items-center gap-space-xs self-start md:self-auto shrink-0">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface text-label-sm font-label-sm hover:bg-surface-container-low transition-colors appearance-none cursor-pointer focus:outline-none focus:border-[#FF5A1F]"
            >
              <option value="TODAY">Today, 24 Oct 2024</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="PAST_7_DAYS">Past 7 Days</option>
              <option value="ALL">All Time</option>
            </select>
            <span className="material-symbols-outlined text-secondary text-[16px] absolute right-2 top-2.5 pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setPayments([...MOCK_PAYMENTS]);
              if (!selectedPayment) setSelectedPayment(MOCK_PAYMENTS[0]);
            }}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
            title="Refresh Transactions"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-surface-container-low active:scale-[0.98] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* ================= FINANCIAL SUMMARY CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Settled Today */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between hover:border-[#FF5A1F]/30 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-xs font-label-xs uppercase tracking-wider text-secondary font-semibold">
              Settled Today
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-2xl font-bold text-on-surface font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.settledToday)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-label-xs text-secondary">
              <span className="font-semibold text-emerald-700">{MOCK_PAYMENT_METRICS.captureRate}%</span> capture rate • {MOCK_PAYMENT_METRICS.settledOrdersCount} successful orders
            </div>
          </div>
        </div>

        {/* Razorpay Online */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between hover:border-[#FF5A1F]/30 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-xs font-label-xs uppercase tracking-wider text-secondary font-semibold">
              Razorpay Online
            </span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-2xl font-bold text-on-surface font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.razorpayOnline)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-label-xs text-secondary">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>{MOCK_PAYMENT_METRICS.razorpayOrdersCount} digital gateway settlements</span>
            </div>
          </div>
        </div>

        {/* Cash on Delivery */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between hover:border-[#FF5A1F]/30 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-xs font-label-xs uppercase tracking-wider text-secondary font-semibold">
              Cash on Delivery (COD)
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-2xl font-bold text-on-surface font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.cashOnDelivery)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-label-xs text-secondary">
              <span>{MOCK_PAYMENT_METRICS.codOrdersCount} doorstep terminal collections at delivery</span>
            </div>
          </div>
        </div>

        {/* Failed / Exceptions */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between hover:border-[#FF5A1F]/30 transition-colors shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-xs font-label-xs uppercase tracking-wider text-secondary font-semibold">
              Failed / Exceptions
            </span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-2xl font-bold text-[#DA1E28] font-mono tracking-tight">
              {formatINR(MOCK_PAYMENT_METRICS.failedAmount)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-label-xs text-secondary">
              <span className="text-rose-600 font-semibold">{MOCK_PAYMENT_METRICS.failureRate}% failure rate</span> • {MOCK_PAYMENT_METRICS.failedCount} gateway timeouts
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-2.5">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Payment ID, Order ID (#KC-...), or customer name..."
              className="w-full h-9 pl-9 pr-3 bg-surface-container-low border border-surface-container-highest rounded-lg text-body-sm text-xs font-body-sm text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
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
              className="h-9 pl-3 pr-8 bg-surface-container-low border border-surface-container-highest rounded-lg text-xs font-medium text-on-surface focus:border-[#FF5A1F] focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="Razorpay UPI">Razorpay UPI</option>
              <option value="Razorpay Netbanking">Razorpay Netbanking</option>
              <option value="Razorpay Cards">Razorpay Cards</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-8 bg-surface-container-low border border-surface-container-highest rounded-lg text-xs font-medium text-on-surface focus:border-[#FF5A1F] focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || methodFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer px-2"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-secondary font-mono">
          <span>Showing {filteredPayments.length} of {payments.length} records</span>
        </div>
      </section>

      {/* ================= SPLIT-PANE: TABLE & DETAIL DOSSIER ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Payments Data Table (7 Cols) */}
        <div className="xl:col-span-7 bg-surface-container-lowest border border-surface-container-highest rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-surface-container-low border-b border-surface-container-highest text-secondary text-label-xs font-label-xs uppercase">
                  <th className="py-2 px-3 font-semibold">Payment ID</th>
                  <th className="py-2 px-3 font-semibold">Associated Order</th>
                  <th className="py-2 px-3 font-semibold">Customer</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount (INR)</th>
                  <th className="py-2 px-3 font-semibold">Gateway / Method</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">UTR / Reference</th>
                  <th className="py-2 px-3 font-semibold">Date &amp; Time</th>
                  <th className="py-2 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-xs font-body-sm">
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10">
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
                        className={`h-12 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-2 border-[#FF5A1F]"
                            : isFailed
                            ? "bg-rose-50/20 hover:bg-surface-container-low"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <td className="py-2 px-3 font-code-sm text-xs font-semibold text-primary">
                          {p.id}
                        </td>
                        <td className="py-2 px-3 font-code-sm text-xs text-on-surface font-medium hover:underline">
                          <Link href={`/admin/orders/${p.orderId.replace("#", "")}`}>
                            {p.orderId}
                          </Link>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-on-surface leading-snug">{p.customerName}</div>
                          <div className="text-[11px] text-secondary">{p.customerEmail}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-code-sm text-xs font-semibold text-on-surface">
                          {formatINR(p.amount)}
                        </td>
                        <td className="py-2 px-3 text-secondary text-xs">{p.method}</td>
                        <td className="py-2 px-3">
                          <StatusBadge status={p.status} variant="payment" />
                        </td>
                        <td className="py-2 px-3 font-code-sm text-[11px] text-secondary truncate max-w-[110px]">
                          {p.gatewayPaymentId}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-secondary whitespace-nowrap">{p.date}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(p);
                            }}
                            className={`inline-flex items-center justify-center p-1 rounded hover:bg-surface-container ${
                              isSelected ? "text-[#FF5A1F]" : "text-secondary hover:text-on-surface"
                            }`}
                            title="Inspect Transaction"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isSelected ? "visibility" : "open_in_new"}
                            </span>
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
          <div className="px-4 py-3 bg-surface-container-low border-t border-surface-container-highest flex items-center justify-between text-xs text-secondary">
            <span>
              Page {currentPage} of {totalPages} ({filteredPayments.length} Total Records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Payment Detail Drawer / Inspection Panel (5 Cols) */}
        {selectedPayment ? (
          <div className="xl:col-span-5 bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md shadow-sm space-y-4 sticky top-20">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-surface-container-highest">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-label-xs font-label-xs uppercase font-bold text-secondary tracking-wider">
                    Transaction Dossier
                  </span>
                  <StatusBadge status={selectedPayment.status} variant="payment" />
                </div>
                <h2 className="text-base font-bold font-mono text-on-surface">{selectedPayment.id}</h2>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
                title="Close Panel"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Total Amount Gross Banner */}
            <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-highest flex items-center justify-between">
              <div>
                <span className="text-label-xs text-secondary block">Gross Captured</span>
                <span className="text-xl font-bold font-mono text-on-surface">
                  {formatINR(selectedPayment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-label-xs text-secondary block">Net Central Settlement</span>
                <span className="text-sm font-semibold font-mono text-emerald-700">
                  {formatINR(selectedPayment.netSettlement)}
                </span>
              </div>
            </div>

            {/* Order Context */}
            <div className="space-y-1.5">
              <span className="text-label-xs font-bold text-secondary uppercase tracking-wider">
                Associated Order Context
              </span>
              <div className="p-3 rounded-lg border border-surface-container-highest bg-surface-container-lowest space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/orders/${selectedPayment.orderId.replace("#", "")}`}
                    className="font-mono font-semibold text-[#FF5A1F] hover:underline"
                  >
                    {selectedPayment.orderId}
                  </Link>
                  <span className="text-secondary">Dispatch Window: {selectedPayment.dispatchWindow}</span>
                </div>
                <div className="text-xs font-medium text-on-surface leading-snug">
                  {selectedPayment.orderDescription}
                </div>
                <div className="pt-1.5 border-t border-surface-container-highest flex items-center justify-between text-[11px] text-secondary">
                  <span>Payer: <strong className="text-on-surface">{selectedPayment.customerName}</strong></span>
                  <span>{selectedPayment.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Gateway Technical Attributes */}
            <div className="space-y-1.5">
              <span className="text-label-xs font-bold text-secondary uppercase tracking-wider">
                Gateway Technical Attributes
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low">
                  <span className="text-secondary text-[10px] block uppercase">Gateway Provider</span>
                  <span className="font-semibold text-on-surface">{selectedPayment.gatewayProvider}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low">
                  <span className="text-secondary text-[10px] block uppercase">Payment Method</span>
                  <span className="font-semibold text-on-surface">{selectedPayment.subMethod || selectedPayment.method}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low">
                  <span className="text-secondary text-[10px] block uppercase">Gateway Payment ID</span>
                  <span className="font-mono text-[11px] text-on-surface truncate block">
                    {selectedPayment.gatewayPaymentId}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low">
                  <span className="text-secondary text-[10px] block uppercase">Bank UTR / RRN</span>
                  <span className="font-mono text-[11px] text-on-surface truncate block">
                    {selectedPayment.bankRrn}
                  </span>
                </div>
                <div className="col-span-2 p-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low flex justify-between items-center text-xs">
                  <span className="text-secondary">Fee Deducted (2.0% MDR + GST)</span>
                  <span className="font-mono text-[#DA1E28] font-medium">-{formatINR(selectedPayment.feeDeducted)}</span>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">verified_user</span>
              <span className="font-medium">
                {selectedPayment.webhookVerified
                  ? "Webhook Verified via HMAC-SHA256 Signature"
                  : "Doorstep Physical Verification Pending Handover"}
              </span>
            </div>

            {/* Settlement Lifecycle Timeline */}
            <div className="space-y-2">
              <span className="text-label-xs font-bold text-secondary uppercase tracking-wider">
                Settlement Lifecycle Audit
              </span>
              <div className="pl-2 border-l-2 border-surface-container-highest space-y-2.5 text-xs text-secondary font-mono">
                {selectedPayment.timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-3">
                    <span
                      className={`absolute -left-[11px] top-1 w-2 h-2 rounded-full ${
                        item.completed ? "bg-emerald-600 ring-2 ring-emerald-100" : "bg-surface-container-highest"
                      }`}
                    />
                    <div className="text-on-surface font-medium">{item.title}</div>
                    <div className="text-[10px] text-secondary">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Row & Guardrail Note */}
            <div className="pt-2 border-t border-surface-container-highest space-y-2">
              <p className="text-[11px] leading-tight text-secondary italic">
                Refund and settlement mutations are governed by Central Ops Treasury policies. Local tampering restricted.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const slip = `KUDICART TRANSACTION RECEIPT\n--------------------------\nPayment ID: ${selectedPayment.id}\nOrder ID: ${selectedPayment.orderId}\nPayer: ${selectedPayment.customerName}\nAmount: INR ${selectedPayment.amount}\nMethod: ${selectedPayment.method}\nReference: ${selectedPayment.gatewayPaymentId}\nDate: ${selectedPayment.date}\nStatus: ${selectedPayment.status}`;
                    const blob = new Blob([slip], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `receipt_${selectedPayment.id.replace("#", "")}.txt`;
                    link.click();
                  }}
                  className="flex-1 py-2 px-3 rounded-lg border border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-semibold text-xs active:scale-[0.98] transition-all"
                >
                  Download Slip
                </button>
                <button
                  onClick={() =>
                    alert(
                      `Central Ops Policy: Partial refund for ${selectedPayment.id} requires Treasury Manager dual-authorization.`
                    )
                  }
                  className="flex-1 py-2 px-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold text-xs active:scale-[0.98] transition-all"
                >
                  Initiate Partial Refund
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-5 bg-surface-container-lowest border border-surface-container-highest rounded-xl p-8 text-center text-secondary">
            <span className="material-symbols-outlined text-[32px] text-secondary mb-2">touch_app</span>
            <p className="text-sm font-semibold text-on-surface">Select a payment transaction</p>
            <p className="text-xs text-secondary mt-1">Click any table row to inspect full gateway parameters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
