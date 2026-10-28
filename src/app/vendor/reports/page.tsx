"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  X,
  ChevronDown,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface SettlementWeek {
  week: string;
  ordersCount: number;
  grossSales: number;
  commission: number;
  logisticsFee: number;
  netPayout: number;
  settlementStatus: "DISBURSED" | "SCHEDULED" | "PROCESSING";
  payoutDate: string;
}

const SETTLEMENT_DATA: SettlementWeek[] = [
  {
    week: "Oct 14 – Oct 20, 2024",
    ordersCount: 48,
    grossSales: 312450,
    commission: 46868, // 15%
    logisticsFee: 4800,
    netPayout: 260782,
    settlementStatus: "DISBURSED",
    payoutDate: "Oct 22, 2024",
  },
  {
    week: "Oct 07 – Oct 13, 2024",
    ordersCount: 42,
    grossSales: 278000,
    commission: 41700,
    logisticsFee: 4200,
    netPayout: 232100,
    settlementStatus: "DISBURSED",
    payoutDate: "Oct 15, 2024",
  },
  {
    week: "Sep 30 – Oct 06, 2024",
    ordersCount: 39,
    grossSales: 245600,
    commission: 36840,
    logisticsFee: 3900,
    netPayout: 204860,
    settlementStatus: "DISBURSED",
    payoutDate: "Oct 08, 2024",
  },
  {
    week: "Current Cycle (Oct 21 – Oct 27)",
    ordersCount: 36,
    grossSales: 242900,
    commission: 36435,
    logisticsFee: 3600,
    netPayout: 202865,
    settlementStatus: "SCHEDULED",
    payoutDate: "Oct 29, 2024",
  },
];

export default function VendorReportsPage() {
  const [data] = useState<SettlementWeek[]>(SETTLEMENT_DATA);
  const [selectedCycle, setSelectedCycle] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = [
      "Settlement Cycle",
      "Orders Fulfilled",
      "Gross Sales (INR)",
      "Marketplace Commission (INR)",
      "Logistics Fee (INR)",
      "Net Payout (INR)",
      "Settlement Status",
      "Disbursement Date",
    ];

    const rows = data.map((d) => [
      `"${d.week}"`,
      d.ordersCount,
      d.grossSales,
      d.commission,
      d.logisticsFee,
      d.netPayout,
      d.settlementStatus,
      d.payoutDate,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `maison_lagos_settlement_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Settlement CSV exported successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Boutique Reports &amp; Settlements
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20">
              Weekly Payout Ledger
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Weekly sales reconciliations, escrow disbursements, and CSV downloads.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="h-9 px-4 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Export Settlement CSV</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
            Last Disbursed Payout
          </span>
          <div className="text-2xl font-semibold font-mono text-[#111111] mt-1">
            ₹2,60,782
          </div>
          <p className="text-[11px] text-[#20885A] mt-1">Settled on Oct 22, 2024</p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
            Upcoming Cycle Payout
          </span>
          <div className="text-2xl font-semibold font-mono text-[#D94B17] mt-1">
            ₹2,02,865
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Scheduled for Oct 29, 2024</p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
            October Gross Sales
          </span>
          <div className="text-2xl font-semibold font-mono text-[#111111] mt-1">
            ₹10,78,950
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">165 Total Orders Fulfilled</p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#E4E0DB] shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
            Commission Rate
          </span>
          <div className="text-2xl font-semibold font-mono text-[#111111] mt-1">
            15.0%
          </div>
          <p className="text-[11px] text-[#6B6667] mt-1">Tier 1 Boutique Agreement</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E0DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Weekly Settlement Reconciliations
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono bg-[#F4F1EA] text-[#6B6667]">
              {data.length} cycles recorded
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Settlement Cycle</th>
                <th className="px-4 text-center">Orders</th>
                <th className="px-4 text-right">Gross GMV</th>
                <th className="px-4 text-right">Commission (15%)</th>
                <th className="px-4 text-right">Logistics Fee</th>
                <th className="px-4 text-right">Net Payout</th>
                <th className="px-4 text-center">Settlement Status</th>
                <th className="px-4 text-right">Disbursement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {data.map((cycle, idx) => (
                <tr
                  key={idx}
                  className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                >
                  <td className="px-4 whitespace-nowrap font-medium text-[#111111]">
                    {cycle.week}
                  </td>
                  <td className="px-4 text-center font-mono whitespace-nowrap">
                    {cycle.ordersCount}
                  </td>
                  <td className="px-4 text-right font-medium tabular-nums whitespace-nowrap">
                    {formatINR(cycle.grossSales)}
                  </td>
                  <td className="px-4 text-right text-[#6B6667] tabular-nums whitespace-nowrap">
                    -{formatINR(cycle.commission)}
                  </td>
                  <td className="px-4 text-right text-[#6B6667] tabular-nums whitespace-nowrap">
                    -{formatINR(cycle.logisticsFee)}
                  </td>
                  <td className="px-4 text-right font-semibold text-[#111111] tabular-nums whitespace-nowrap">
                    {formatINR(cycle.netPayout)}
                  </td>
                  <td className="px-4 text-center whitespace-nowrap">
                    {cycle.settlementStatus === "DISBURSED" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                        Disbursed
                      </span>
                    )}
                    {cycle.settlementStatus === "SCHEDULED" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                        Scheduled
                      </span>
                    )}
                  </td>
                  <td className="px-4 text-right font-mono text-[11px] text-[#6B6667] whitespace-nowrap">
                    {cycle.payoutDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
