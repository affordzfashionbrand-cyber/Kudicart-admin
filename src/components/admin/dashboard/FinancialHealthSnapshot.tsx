import React from "react";
import Link from "next/link";

interface FinancialHealthSnapshotProps {
  grossVolume?: number;
  recordedTransactions?: number;
}

export function FinancialHealthSnapshot({
  grossVolume = 482450,
  recordedTransactions = 148,
}: FinancialHealthSnapshotProps) {
  return (
    <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
        <div>
          <h2 className="text-[17px] font-semibold text-[#111111]">
            Financial Summary
          </h2>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Recorded transaction totals and accounting references
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/admin/payments"
            className="font-medium text-[#FF5A1F] hover:text-[#D94B17] transition-colors"
          >
            View Payments →
          </Link>
          <span className="text-[#E4E0DB]">|</span>
          <Link
            href="/admin/ledger"
            className="font-medium text-[#6B6667] hover:text-[#111111] transition-colors"
          >
            Commission &amp; Ledger →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5">
        {/* Metric 1: Recorded Gross Volume */}
        <div className="bg-[#F7F7F5] rounded-lg p-3.5 border border-[#E4E0DB]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[#6B6667] block font-medium">
                Gross Order Value (Recorded)
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-white border border-[#E4E0DB] flex items-center justify-center text-[#6B6667] shrink-0">
                <span className="material-symbols-outlined text-[17px]">
                  payments
                </span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#111111] mt-2 leading-tight">
              ₹{(grossVolume ?? 0).toLocaleString("en-IN")}
            </div>
          </div>
          <span className="text-[11px] text-[#6B6667] block mt-1.5">
            Cumulative order volume
          </span>
        </div>

        {/* Metric 2: Recorded Transactions */}
        <div className="bg-[#F7F7F5] rounded-lg p-3.5 border border-[#E4E0DB]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[#6B6667] block font-medium">
                Recorded Transactions
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-white border border-[#E4E0DB] flex items-center justify-center text-[#6B6667] shrink-0">
                <span className="material-symbols-outlined text-[17px]">
                  receipt_long
                </span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-[#111111] mt-2 leading-tight">
              {recordedTransactions} Orders
            </div>
          </div>
          <span className="text-[11px] text-[#6B6667] block mt-1.5">
            Total marketplace orders logged
          </span>
        </div>

        {/* Metric 3: Accounting Status */}
        <div className="bg-[#F7F7F5] rounded-lg p-3.5 border border-[#E4E0DB]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[#6B6667] block font-medium">
                Settlement &amp; Reconciliation
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-white border border-[#E4E0DB] flex items-center justify-center text-[#6B6667] shrink-0">
                <span className="material-symbols-outlined text-[17px]">
                  account_balance
                </span>
              </div>
            </div>
            <div className="text-base sm:text-lg font-medium text-[#111111] mt-2 leading-tight">
              Managed via Ledger
            </div>
          </div>
          <span className="text-[11px] text-[#6B6667] block mt-1.5">
            Authoritative tracking in Payments
          </span>
        </div>
      </div>
    </section>
  );
}
