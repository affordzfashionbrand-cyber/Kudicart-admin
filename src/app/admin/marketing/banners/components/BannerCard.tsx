"use client";

import React from "react";
import { Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink, Calendar, CheckCircle2, XCircle } from "lucide-react";
import type { HomeBanner } from "@/types/marketing";

interface BannerCardProps {
  banner: HomeBanner;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BannerCardProps) {
  const isExpired = banner.endDate && new Date(banner.endDate) < new Date();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm hover:shadow transition-all">
      {/* Thumbnail & Info */}
      <div className="flex items-start gap-4 flex-1">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-[#EAE7E0] border border-[#D5D0C7]">
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.title1}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#A09C94]">
              No Image
            </div>
          )}
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase backdrop-blur-sm">
            #{banner.displayOrder}
          </span>
        </div>

        <div className="space-y-1">
          {banner.tag && (
            <span className="text-[10px] font-bold tracking-wider text-[#E05A47] uppercase">
              {banner.tag}
            </span>
          )}
          <h3 className="text-sm font-bold text-[#2C2B29]">
            {banner.title1}{" "}
            {banner.title2 && (
              <span className="font-serif italic font-normal text-[#6E6B65]">
                {banner.title2}
              </span>
            )}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="rounded bg-[#F4F1EA] px-2 py-0.5 text-[10px] font-medium text-[#4A4742]">
              {banner.placement}
            </span>
            <span className="rounded bg-[#EBE7DF] px-2 py-0.5 text-[10px] font-medium text-[#4A4742]">
              Audience: {banner.targetGender}
            </span>
            <span className="flex items-center gap-1 rounded bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#1E40AF]">
              <ExternalLink className="h-3 w-3" />
              {banner.actionType}
              {banner.actionValue ? `: ${banner.actionValue}` : ""}
            </span>
          </div>

          {(banner.startDate || banner.endDate) && (
            <p className="flex items-center gap-1 text-[11px] text-[#A09C94] pt-1">
              <Calendar className="h-3 w-3" />
              {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : "Immediate"}
              {" → "}
              {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : "No Expiry"}
              {isExpired && (
                <span className="ml-1 text-[10px] font-semibold text-[#DC2626]">
                  (Expired)
                </span>
              )}
            </p>
          )}
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
            banner.isActive
              ? "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]"
              : "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]"
          }`}
        >
          {banner.isActive ? (
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
