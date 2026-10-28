import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@/types/orders";

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  variant?:
    | "order"
    | "payment"
    | "kyc"
    | "driver"
    | "fulfillment"
    | "user"
    | "vendor"
    | "product"
    | "stock"
    | "ledger"
    | "review"
    | "ticket"
    | "audit"
    | "notification";
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  variant = "order",
  className,
  showDot = false,
}: StatusBadgeProps) {
  // Normalize string for comparison
  const normalized = String(status).toUpperCase();

  // Order status badge styling
  if (variant === "order") {
    switch (normalized) {
      case "READY_FOR_PICKUP":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
              className
            )}
          >
            Ready for Pickup
          </span>
        );
      case "PLACED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]",
              className
            )}
          >
            Placed
          </span>
        );
      case "ACCEPTED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]",
              className
            )}
          >
            Accepted
          </span>
        );
      case "PREPARING":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]",
              className
            )}
          >
            Preparing
          </span>
        );
      case "ASSIGNED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]",
              className
            )}
          >
            Assigned
          </span>
        );
      case "PICKED_UP":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F1EA] text-[#475569] border border-[#E4E0DB]",
              className
            )}
          >
            Picked Up
          </span>
        );
      case "OUT_FOR_DELIVERY":
      case "IN_TRANSIT":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F1EA] text-[#475569] border border-[#E4E0DB]",
              className
            )}
          >
            In Transit
          </span>
        );
      case "DELIVERED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]",
              className
            )}
          >
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA]",
              className
            )}
          >
            Cancelled
          </span>
        );
      default:
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]",
              className
            )}
          >
            {status}
          </span>
        );
    }
  }

  // Payment status badge
  if (variant === "payment") {
    switch (normalized) {
      case "PAID":
      case "COMPLETED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
              className
            )}
          >
            Completed
          </span>
        );
      case "PENDING":
      case "PENDING (COD)":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200",
              className
            )}
          >
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200",
              className
            )}
          >
            Failed
          </span>
        );
      case "REFUNDED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200",
              className
            )}
          >
            Refunded
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // Ledger settlement badge
  if (variant === "ledger") {
    switch (normalized) {
      case "CYCLE_ACCRUING":
      case "CYCLE ACCRUING":
      case "ACCRUING":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200",
              className
            )}
          >
            Cycle Accruing
          </span>
        );
      case "READY_FOR_TRANSFER":
      case "READY FOR TRANSFER":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200",
              className
            )}
          >
            Ready for Transfer
          </span>
        );
      case "TRANSFERRED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
              className
            )}
          >
            Transferred
          </span>
        );
      case "HOLD":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200",
              className
            )}
          >
            Hold
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // Review status badge
  if (variant === "review") {
    switch (normalized) {
      case "PUBLISHED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
              className
            )}
          >
            Published
          </span>
        );
      case "FLAGGED":
      case "FLAGGED FOR REVIEW":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200",
              className
            )}
          >
            Flagged for Review
          </span>
        );
      case "REMOVED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200",
              className
            )}
          >
            Removed
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // Ticket status badge
  if (variant === "ticket") {
    switch (normalized) {
      case "OPEN":
      case "OPEN (ACTION REQ.)":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200",
              className
            )}
          >
            Open
          </span>
        );
      case "IN_PROGRESS":
      case "IN PROGRESS":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200",
              className
            )}
          >
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
              className
            )}
          >
            Resolved
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // User / Customer account status badge
  if (variant === "user") {
    switch (normalized) {
      case "ACTIVE":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#ECFDF5] text-[#20885A] font-label-xs text-label-xs font-semibold border border-[#A7F3D0]/60",
              className
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
            Active
          </span>
        );
      case "SUSPENDED":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FEF2F2] text-[#DA1E28] font-label-xs text-label-xs font-semibold border border-[#FECACA]",
              className
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#DA1E28]" />
            Suspended
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // Vendor status badge
  if (variant === "vendor") {
    switch (normalized) {
      case "ACTIVE":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]",
              className
            )}
          >
            Active
          </span>
        );
      case "PENDING_REVIEW":
      case "PENDING REVIEW":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]",
              className
            )}
          >
            Pending Review
          </span>
        );
      case "DOCS_SUBMITTED":
      case "DOCS SUBMITTED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#475569] border border-[#E4E0DB]",
              className
            )}
          >
            Docs Submitted
          </span>
        );
      case "KYC_PENDING":
      case "KYC PENDING":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]",
              className
            )}
          >
            KYC Pending
          </span>
        );
      case "SUSPENDED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA]",
              className
            )}
          >
            Suspended
          </span>
        );
      default:
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]",
              className
            )}
          >
            {status}
          </span>
        );
    }
  }

  // Product listing status badge
  if (variant === "product") {
    switch (normalized) {
      case "ACTIVE":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]",
              className
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
            Active Listing
          </span>
        );
      case "DRAFT":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-secondary border border-surface-container-highest",
              className
            )}
          >
            Draft
          </span>
        );
      case "REVIEW":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]",
              className
            )}
          >
            In Review
          </span>
        );
      case "SUSPENDED":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA]",
              className
            )}
          >
            Suspended
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // Stock status badge
  if (variant === "stock") {
    switch (normalized) {
      case "IN_STOCK":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#20885A]",
              className
            )}
          >
            In Stock
          </span>
        );
      case "LOW_STOCK":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
              className
            )}
          >
            Low Stock
          </span>
        );
      case "OUT_OF_STOCK":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DA1E28]",
              className
            )}
          >
            Out of Stock
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // KYC Status Badge
  if (variant === "kyc") {
    switch (normalized) {
      case "APPROVED":
      case "VERIFIED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]",
              className
            )}
          >
            Verified
          </span>
        );
      case "PENDING":
      case "PENDING_REVIEW":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]",
              className
            )}
          >
            Pending Review
          </span>
        );
      case "REJECTED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA]",
              className
            )}
          >
            Rejected
          </span>
        );
      default:
        return <span className={className}>{status}</span>;
    }
  }

  // Driver Online/Offline Status Badge
  if (variant === "driver") {
    switch (normalized) {
      case "ONLINE":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]",
              className
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
            Online
          </span>
        );
      case "OFFLINE":
      default:
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-low text-secondary border border-surface-container-highest",
              className
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Offline
          </span>
        );
    }
  }

  // Fulfillment badge
  if (variant === "fulfillment") {
    if (normalized === "DARK_STORE" || normalized.includes("DARK")) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]",
            className
          )}
        >
          <span className="material-symbols-outlined text-[13px]">warehouse</span>
          Dark Store
        </span>
      );
    }
    if (normalized === "VENDOR" || normalized.includes("VENDOR")) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]",
            className
          )}
        >
          <span className="material-symbols-outlined text-[13px]">store</span>
          Vendor Fulfilled
        </span>
      );
    }
    if (normalized.includes("EXPRESS")) {
      return (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
            className
          )}
        >
          Express (60m)
        </span>
      );
    }
    if (normalized.includes("TRY")) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-xs font-label-xs font-medium bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]",
            className
          )}
        >
          <span className="material-symbols-outlined text-[13px]">checkroom</span>
          Try &amp; Buy
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-surface-container text-secondary border border-surface-container-highest",
          className
        )}
      >
        Standard
      </span>
    );
  }

  // Audit action type badge
  if (variant === "audit") {
    switch (normalized) {
      case "DRIVER_KYC_APPROVED":
      case "VENDOR_APPROVED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]",
              className
            )}
          >
            {status}
          </span>
        );
      case "VENDOR_REVIEW_START":
      case "DRIVER_ASSIGNED_MANUAL":
      case "CUSTOMER_TIER_UPGRADE":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A]",
              className
            )}
          >
            {status}
          </span>
        );
      case "PAYOUT_HOLD_UPDATED":
      case "VENDOR_REJECTED":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA]",
              className
            )}
          >
            {status}
          </span>
        );
      case "PRODUCT_STATUS_CHANGED":
      case "PRODUCT_DRAFT_SUBMIT":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFF6FF] text-[#0043CE] border border-[#BFDBFE]",
              className
            )}
          >
            {status}
          </span>
        );
      default:
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F7F7F5] text-on-surface border border-[#E4E0DB]",
              className
            )}
          >
            {status}
          </span>
        );
    }
  }

  // Notification status and category badge
  if (variant === "notification") {
    switch (normalized) {
      case "KYC":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200",
              className
            )}
          >
            KYC
          </span>
        );
      case "ASSIGNMENT":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200",
              className
            )}
          >
            Assignment
          </span>
        );
      case "ORDER UPDATES":
      case "ORDER_UPDATES":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
              className
            )}
          >
            Order Updates
          </span>
        );
      case "SYSTEM ALERTS":
      case "SYSTEM_ALERTS":
      case "SYSTEM":
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200",
              className
            )}
          >
            System Alerts
          </span>
        );
      case "DELIVERED":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
              className
            )}
          >
            <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
            Delivered
          </span>
        );
      case "QUEUED":
      case "PENDING":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200",
              className
            )}
          >
            <span className="material-symbols-outlined text-[13px] text-amber-600">hourglass_top</span>
            Queued
          </span>
        );
      case "FAILED":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200",
              className
            )}
          >
            <span className="material-symbols-outlined text-[13px] text-rose-600">error</span>
            Failed
          </span>
        );
      default:
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-surface-container text-secondary",
              className
            )}
          >
            {status}
          </span>
        );
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-surface-container text-secondary",
        className
      )}
    >
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1" />}
      {status}
    </span>
  );
}
