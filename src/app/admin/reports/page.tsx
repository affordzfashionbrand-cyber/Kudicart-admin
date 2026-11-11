"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  Truck,
  Package,
  Lock,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";

type ReportCategory = "ORDERS" | "VENDORS" | "DRIVERS" | "CATALOG";

const REPORT_SPECS: Array<{
  id: ReportCategory;
  title: string;
  description: string;
  openDecisions: string;
  liveHref: string;
  liveLabel: string;
}> = [
  {
    id: "ORDERS",
    title: "Orders & Fulfillment Report",
    description:
      "Order lifecycle volume, dispatch SLAs, return manifests, and split-order metrics.",
    openDecisions: "O-014 / O-015 / O-016",
    liveHref: "/admin/orders",
    liveLabel: "Open Live Orders",
  },
  {
    id: "VENDORS",
    title: "Vendor Settlements & Commission Report",
    description:
      "Merchant gross sales, commission formulas, payout cycles, and settlement exports.",
    openDecisions: "O-013 / O-015 / O-016",
    liveHref: "/admin/vendors",
    liveLabel: "Open Live Boutiques",
  },
  {
    id: "DRIVERS",
    title: "Fleet & Delivery Partner Report",
    description:
      "Rider verification, trip completions, and payout reconciliation summaries.",
    openDecisions: "O-009 / O-015 / O-016",
    liveHref: "/admin/delivery-partners",
    liveLabel: "Open Live Fleet",
  },
  {
    id: "CATALOG",
    title: "Catalog & Inventory Export",
    description:
      "Product attributes, stock thresholds, and dark store vs merchant inventory summaries.",
    openDecisions: "O-004 / O-015 / O-016",
    liveHref: "/admin/products",
    liveLabel: "Open Live Catalog",
  },
];

function getCategoryIcon(category: ReportCategory) {
  switch (category) {
    case "ORDERS":
      return <ShoppingBag className="w-4 h-4" />;
    case "VENDORS":
      return <Store className="w-4 h-4" />;
    case "DRIVERS":
      return <Truck className="w-4 h-4" />;
    case "CATALOG":
      return <Package className="w-4 h-4" />;
  }
}

export default function AdminReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("ORDERS");
  const activeSpec =
    REPORT_SPECS.find((item) => item.id === selectedCategory) || REPORT_SPECS[0];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Reports &amp; Exports
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
              Pending O-014–O-016 Specification
            </span>
          </div>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Platform reporting views and scheduled CSV export builders.
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Disabled pending O-016 CSV export specification"
          className="h-9 px-4 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] text-[#6B6667] text-xs font-medium flex items-center gap-2 cursor-not-allowed shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>CSV Export Gated (O-016)</span>
        </button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {REPORT_SPECS.map((cfg) => {
          const isSelected = selectedCategory === cfg.id;
          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => setSelectedCategory(cfg.id)}
              className={`text-left bg-white rounded-[10px] p-4 flex flex-col justify-between transition-all ${
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
                  <span className="text-[10px] font-mono text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-[4px]">
                    {cfg.openDecisions}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-[#111111]">{cfg.title}</h2>
                <p className="text-xs text-[#6B6667] mt-1 leading-relaxed">
                  {cfg.description}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E4E0DB] flex items-center justify-between text-[11px] text-[#6B6667]">
                <span>Specification Status</span>
                <span className="font-medium text-[#B45309]">Gated</span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-8 shadow-xs space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-[#111111]">
                {activeSpec.title} — Pending {activeSpec.openDecisions} Specification
              </h3>
            </div>
            <p className="text-xs text-[#6B6667] leading-relaxed max-w-2xl">
              Aggregated report definitions (<span className="font-mono text-[#111111]">O-014</span>,{" "}
              <span className="font-mono text-[#111111]">O-015</span>) and CSV column contracts (
              <span className="font-mono text-[#111111]">O-016</span>) are explicitly deferred per{" "}
              <span className="font-mono text-[#111111]">DCR-015</span>. Unapproved mock report figures and static CSV exports have been removed so operational decisions rely only on verified backend data.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={activeSpec.liveHref}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium transition-colors shadow-xs"
          >
            <span>{activeSpec.liveLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
