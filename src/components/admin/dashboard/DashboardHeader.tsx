"use client";

import React, { useState } from "react";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ onRefresh, isRefreshing = false }: DashboardHeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Today (24 Oct 2024)");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = [
    "Today (24 Oct 2024)",
    "Yesterday (23 Oct 2024)",
    "Past 7 Days",
    "Current Month (Oct 2024)",
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
          Good morning, Admin
        </h1>
        <p className="font-body-sm text-body-sm text-secondary mt-0.5">
          Your marketplace operations at a glance for 24 Oct 2024.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden md:inline-flex font-label-xs text-label-xs font-medium text-secondary px-2.5 py-1 bg-[#F4F1EA] rounded border border-[#E4E0DB]">
          Reporting Period: Today (IST)
        </span>

        {/* Period Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-[38px] px-3.5 bg-white border border-[#E4E0DB] rounded-lg font-label-sm text-label-sm font-medium text-on-surface hover:bg-[#F7F7F5] flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>{selectedPeriod}</span>
            <span className="material-symbols-outlined text-base text-secondary">
              arrow_drop_down
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-[#E4E0DB] rounded-lg shadow-lg z-30 py-1 divide-y divide-[#E4E0DB]">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-label-sm font-label-sm hover:bg-[#F7F7F5] transition-colors ${
                    selectedPeriod === period ? "text-primary font-bold bg-[#FFF0E8]/50" : "text-on-surface"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`h-[38px] w-[38px] bg-white border border-[#E4E0DB] rounded-lg text-secondary hover:text-on-surface hover:bg-[#F7F7F5] flex items-center justify-center transition-colors shadow-sm ${
            isRefreshing ? "opacity-60 cursor-not-allowed" : ""
          }`}
          title="Refresh Live Data"
        >
          <span
            className={`material-symbols-outlined text-lg ${
              isRefreshing ? "animate-spin text-primary" : ""
            }`}
          >
            refresh
          </span>
        </button>
      </div>
    </div>
  );
}
