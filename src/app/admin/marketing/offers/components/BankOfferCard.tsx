"use client";

import React from "react";
import { Edit2, Trash2, ArrowUp, ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import type { BankOffer } from "@/types/marketing";

interface BankOfferCardProps {
  offer: BankOffer;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function BankOfferCard({
  offer,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BankOfferCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm hover:shadow transition-all">
      {/* Visual Badge & Info */}
      <div className="flex items-start gap-4 flex-1">
        <div
          className="flex h-16 w-24 shrink-0 flex-col items-center justify-center rounded-xl p-2 text-center text-white shadow-sm"
          style={{ backgroundColor: offer.badgeBgColor || "#111111" }}
        >
          <span className="text-[10px] font-bold tracking-wider uppercase leading-tight line-clamp-1">
            {offer.bankName}
          </span>
          {offer.code && (
            <span className="mt-1 rounded bg-white/20 px-1 py-0.2 text-[8px] font-mono font-bold tracking-widest">
              {offer.code}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#2C2B29]">{offer.title}</h3>
            {offer.code && (
              <span className="rounded bg-[#F4F1EA] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#E05A47]">
                {offer.code}
              </span>
            )}
          </div>

          <p className="text-xs text-[#6E6B65]">{offer.subtitle}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
              {offer.discountText}
            </span>
            {offer.minSpendText && (
              <span className="text-[#6E6B65] bg-[#F4F1EA] px-2 py-0.5 rounded">
                Min Spend: {offer.minSpendText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        {/* Reorder Buttons */}
        <div className="flex items-center rounded-lg border border-[#E4E0DB] bg-[#FAF8F5] p-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            title="Move Up"
            className="p-1 text-[#6E6B65] hover:text-[#2C2B29] disabled:opacity-30 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            title="Move Down"
            className="p-1 text-[#6E6B65] hover:text-[#2C2B29] disabled:opacity-30 transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        {/* Status Toggle */}
        <button
          type="button"
          onClick={onToggleActive}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            offer.isActive
              ? "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]"
              : "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]"
          }`}
        >
          {offer.isActive ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Active</span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              <span>Inactive</span>
            </>
          )}
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-[#D5D0C7] bg-white p-1.5 text-[#6E6B65] hover:bg-[#F4F1EA] hover:text-[#2C2B29] transition-colors"
        >
          <Edit2 className="h-4 w-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
