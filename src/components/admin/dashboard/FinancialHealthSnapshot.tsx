import React from "react";
import Link from "next/link";

interface FinancialHealthSnapshotProps {
  grossVolume?: number;
  successRate?: number;
  escrowRate?: number;
  failureRate?: number;
}

export function FinancialHealthSnapshot({
  grossVolume = 482450,
  successRate = 94.2,
  escrowRate = 4.1,
  failureRate = 1.7,
}: FinancialHealthSnapshotProps) {
  const successAmount = Math.round((grossVolume * successRate) / 100);
  const escrowAmount = Math.round((grossVolume * escrowRate) / 100);
  const failureAmount = Math.round((grossVolume * failureRate) / 100);

  return (
    <div className="bg-white border border-[#E4E0DB] rounded-xl p-space-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E0DB] pb-space-sm mb-space-md">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Financial Health &amp; Transaction Snapshot
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Settlement escrow clearance and payment gateway integrity for current cycle.
          </p>
        </div>
        <div className="flex items-center gap-space-md font-label-sm text-label-sm">
          <Link
            href="/admin/ledger"
            className="text-primary hover:text-pressed-orange font-semibold flex items-center gap-1"
          >
            View Payments Ledger →
          </Link>
          <span className="text-[#E4E0DB]">|</span>
          <Link
            href="/admin/reports"
            className="text-secondary hover:text-on-surface font-semibold flex items-center gap-1"
          >
            Reconciliation Reports →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
        <div className="md:col-span-3 md:border-r md:border-[#E4E0DB] md:pr-space-md">
          <span className="font-label-xs text-label-xs text-secondary block uppercase tracking-wider font-semibold">
            Gross Transaction Volume
          </span>
          <div className="flex items-baseline gap-1 mt-1 font-headline-lg text-3xl font-extrabold text-on-surface">
            <span className="text-xl font-medium text-secondary">₹</span>
            {grossVolume.toLocaleString("en-IN")}
          </div>
          <span className="font-label-xs text-label-xs text-[#20885A] block mt-1 font-medium">
            100% Settled within 24h SLA
          </span>
        </div>

        <div className="md:col-span-9 space-y-3">
          {/* Success bar */}
          <div>
            <div className="flex items-center justify-between text-body-sm mb-1 font-label-xs text-label-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#20885A]" />
                <strong className="text-on-surface">Successful Cleared Payments</strong>
              </span>
              <span className="font-code-xs text-secondary">
                ₹{successAmount.toLocaleString("en-IN")} ({successRate}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
              <div
                className="h-full bg-[#20885A] rounded-full transition-all"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Pending Escrow */}
          <div>
            <div className="flex items-center justify-between text-body-sm mb-1 font-label-xs text-label-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9822E]" />
                <strong className="text-on-surface">Pending Escrow Settlement</strong>
              </span>
              <span className="font-code-xs text-secondary">
                ₹{escrowAmount.toLocaleString("en-IN")} ({escrowRate}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
              <div
                className="h-full bg-[#C9822E] rounded-full transition-all"
                style={{ width: `${escrowRate}%` }}
              />
            </div>
          </div>

          {/* Failed / Disputes */}
          <div>
            <div className="flex items-center justify-between text-body-sm mb-1 font-label-xs text-label-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DA1E28]" />
                <strong className="text-on-surface">Payment Gateway Exceptions</strong>
              </span>
              <span className="font-code-xs text-secondary">
                ₹{failureAmount.toLocaleString("en-IN")} ({failureRate}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
              <div
                className="h-full bg-[#DA1E28] rounded-full transition-all"
                style={{ width: `${failureRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
