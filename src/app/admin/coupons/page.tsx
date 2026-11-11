"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  AdminCoupon,
  CouponDiscountType,
  CreateCouponInput,
  UpdateCouponInput,
} from "@/types/coupons";

type CouponTab = "ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED";

interface CouponFormState {
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function defaultFormState(): CouponFormState {
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    minOrderValue: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: today.toISOString().slice(0, 10),
    endDate: nextMonth.toISOString().slice(0, 10),
    isActive: true,
  };
}

function computeCouponStatus(coupon: AdminCoupon): "ACTIVE" | "INACTIVE" | "EXPIRED" {
  if (coupon.status === "ACTIVE" || coupon.status === "INACTIVE" || coupon.status === "EXPIRED") {
    return coupon.status;
  }
  if (!coupon.isActive) return "INACTIVE";
  if (coupon.endDate && new Date(coupon.endDate).getTime() < Date.now()) {
    return "EXPIRED";
  }
  return "ACTIVE";
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<CouponTab>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [formState, setFormState] = useState<CouponFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCoupons = useCallback(async (showRefreshToast = false) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await api.coupons.list();
      const rows = Array.isArray(res?.data) ? res.data : [];
      setCoupons(rows);
      if (showRefreshToast) {
        showToast("Coupons refreshed.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to load coupons from backend.";
      setCoupons([]);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons(false);
  }, [loadCoupons]);

  const filteredCoupons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const status = computeCouponStatus(coupon);
      if (statusTab !== "ALL" && status !== statusTab) {
        return false;
      }
      if (q && !coupon.code.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [coupons, searchTerm, statusTab]);

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let expired = 0;
    for (const c of coupons) {
      const s = computeCouponStatus(c);
      if (s === "ACTIVE") active += 1;
      else if (s === "INACTIVE") inactive += 1;
      else if (s === "EXPIRED") expired += 1;
    }
    return { all: coupons.length, active, inactive, expired };
  }, [coupons]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormState(defaultFormState());
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setFormState({
      code: coupon.code,
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: String(coupon.discountValue ?? 0),
      minOrderValue: String(coupon.minOrderValue ?? 0),
      maxDiscount:
        coupon.maxDiscount !== null && coupon.maxDiscount !== undefined
          ? String(coupon.maxDiscount)
          : "",
      usageLimit:
        coupon.usageLimit !== null && coupon.usageLimit !== undefined
          ? String(coupon.usageLimit)
          : "",
      startDate: toDateInputValue(coupon.startDate),
      endDate: toDateInputValue(coupon.endDate),
      isActive: Boolean(coupon.isActive),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const code = formState.code.trim().toUpperCase();
    if (!code || code.length < 3) {
      setFormError("Coupon code must be at least 3 characters.");
      return;
    }

    const discountValue = Number(formState.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setFormError("Discount value must be greater than 0.");
      return;
    }
    if (formState.discountType === "PERCENTAGE" && discountValue > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    const minOrderValue = formState.minOrderValue.trim()
      ? Number(formState.minOrderValue)
      : 0;
    if (!Number.isFinite(minOrderValue) || minOrderValue < 0) {
      setFormError("Minimum order value cannot be negative.");
      return;
    }

    if (!formState.endDate) {
      setFormError("Expiry date is required.");
      return;
    }

    const startIso = formState.startDate
      ? new Date(`${formState.startDate}T00:00:00.000Z`).toISOString()
      : undefined;
    const endIso = new Date(`${formState.endDate}T23:59:59.999Z`).toISOString();

    const maxDiscountNum = formState.maxDiscount.trim()
      ? Number(formState.maxDiscount)
      : undefined;
    const usageLimitNum = formState.usageLimit.trim()
      ? Math.floor(Number(formState.usageLimit))
      : undefined;

    if (maxDiscountNum !== undefined && (!Number.isFinite(maxDiscountNum) || maxDiscountNum <= 0)) {
      setFormError("Max discount cap must be a positive number.");
      return;
    }
    if (usageLimitNum !== undefined && (!Number.isFinite(usageLimitNum) || usageLimitNum <= 0)) {
      setFormError("Usage limit must be a positive integer.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCoupon) {
        const updatePayload: UpdateCouponInput = {
          code,
          discountType: formState.discountType,
          discountValue,
          minOrderValue,
          maxDiscount: formState.maxDiscount.trim() ? maxDiscountNum : null,
          usageLimit: formState.usageLimit.trim() ? usageLimitNum : null,
          ...(startIso ? { startDate: startIso } : {}),
          endDate: endIso,
          isActive: formState.isActive,
        };
        const res = await api.coupons.update(editingCoupon.id, updatePayload);
        const updated = res?.coupon;
        if (updated) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? updated : c))
          );
        } else {
          await loadCoupons(false);
        }
        showToast(res?.message || `Coupon ${code} updated.`, "success");
      } else {
        const createPayload: CreateCouponInput = {
          code,
          discountType: formState.discountType,
          discountValue,
          minOrderValue,
          ...(maxDiscountNum !== undefined ? { maxDiscount: maxDiscountNum } : {}),
          ...(usageLimitNum !== undefined ? { usageLimit: usageLimitNum } : {}),
          ...(startIso ? { startDate: startIso } : {}),
          endDate: endIso,
          isActive: formState.isActive,
        };
        const res = await api.coupons.create(createPayload);
        const created = res?.coupon;
        if (created) {
          setCoupons((prev) => [created, ...prev]);
        } else {
          await loadCoupons(false);
        }
        showToast(res?.message || `Coupon ${code} created.`, "success");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save coupon."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: AdminCoupon) => {
    setBusyId(coupon.id);
    try {
      const res = await api.coupons.update(coupon.id, {
        isActive: !coupon.isActive,
      });
      const updated = res?.coupon;
      if (updated) {
        setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
      } else {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c
          )
        );
      }
      showToast(
        `Coupon ${coupon.code} ${coupon.isActive ? "deactivated" : "activated"}.`,
        "success"
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update coupon status.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    setBusyId(coupon.id);
    try {
      const res = await api.coupons.delete(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      showToast(res?.message || `Coupon ${coupon.code} deleted.`, "success");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete coupon.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-8 z-50 p-4 rounded-[8px] shadow-lg border flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#20885A]"
              : "bg-[#FEF2F2] border-[#FECACA] text-[#DA1E28]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Coupons
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Create and manage promotional checkout codes, caps, and validity windows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void loadCoupons(true)}
            disabled={loading}
            className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF5A1F]" : "text-[#6B6667]"}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="h-9 px-4 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Coupon</span>
          </button>
        </div>
      </section>

      {apiError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DA1E28] rounded-[10px] px-4 py-3 text-xs flex items-center justify-between gap-3">
          <span>{apiError}</span>
          <button
            type="button"
            onClick={() => void loadCoupons(false)}
            className="px-3 py-1 rounded-[6px] bg-white border border-[#FECACA] text-[#DA1E28] font-medium hover:bg-[#FFF5F5]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Status Tabs */}
      <nav className="border-b border-[#E4E0DB] flex items-center gap-6 overflow-x-auto text-xs">
        {(
          [
            { id: "ALL", label: "All Coupons", count: counts.all },
            { id: "ACTIVE", label: "Active", count: counts.active },
            { id: "INACTIVE", label: "Inactive", count: counts.inactive },
            { id: "EXPIRED", label: "Expired", count: counts.expired },
          ] as Array<{ id: CouponTab; label: string; count: number }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusTab(tab.id)}
            className={`pb-2.5 flex items-center gap-1.5 font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
              statusTab === tab.id
                ? "text-[#FF5A1F] border-[#FF5A1F]"
                : "text-[#6B6667] hover:text-[#111111] border-transparent"
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667] font-mono text-[10px]">
              {tab.count}
            </span>
          </button>
        ))}
      </nav>

      {/* Search */}
      <section className="bg-white p-3 rounded-[10px] border border-[#E4E0DB] flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by coupon code..."
            className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs focus:border-[#FF5A1F] outline-none placeholder:text-[#6B6667]"
          />
        </div>
        <span className="text-xs text-[#6B6667] font-mono shrink-0">
          {filteredCoupons.length} coupon{filteredCoupons.length === 1 ? "" : "s"}
        </span>
      </section>

      {/* Table */}
      <section className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[#6B6667] text-xs font-medium">
                <th className="py-2 pl-4 pr-3 font-medium">Code</th>
                <th className="py-2 px-3 font-medium">Discount</th>
                <th className="py-2 px-3 font-medium">Min Order</th>
                <th className="py-2 px-3 font-medium">Usage</th>
                <th className="py-2 px-3 font-medium">Validity Window</th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 pr-4 pl-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B6667]">
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10">
                    <EmptyState
                      title="No coupons found"
                      description="Create a promotional coupon code or clear your current search filter."
                      actionLabel="Create Coupon"
                      onAction={openCreateModal}
                    />
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const status = computeCouponStatus(coupon);
                  const isBusy = busyId === coupon.id;
                  return (
                    <tr key={coupon.id} className="h-14 hover:bg-[#F7F7F5]/60">
                      <td className="py-2.5 pl-4 pr-3">
                        <div className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#111111]">
                          <Tag className="w-3.5 h-3.5 text-[#FF5A1F]" />
                          <span>{coupon.code}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#111111]">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}% OFF`
                            : `${formatINR(coupon.discountValue)} OFF`}
                        </div>
                        {coupon.maxDiscount ? (
                          <div className="text-[11px] text-[#6B6667]">
                            Cap: {formatINR(coupon.maxDiscount)}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {formatINR(coupon.minOrderValue ?? 0)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#6B6667]">
                        {coupon.usedCount ?? 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " / Unlimited"}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#6B6667]">
                        <div>Start: {toDateInputValue(coupon.startDate) || "—"}</div>
                        <div>End: {toDateInputValue(coupon.endDate) || "—"}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium border ${
                            status === "ACTIVE"
                              ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                              : status === "EXPIRED"
                                ? "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]"
                                : "bg-[#F4F1EA] text-[#6B6667] border-[#E4E0DB]"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 pl-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleToggleActive(coupon)}
                            className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] disabled:opacity-50"
                          >
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEditModal(coupon)}
                            aria-label={`Edit ${coupon.code}`}
                            className="h-7 px-2 rounded-[6px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-[#6B6667] hover:text-[#111111] disabled:opacity-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDelete(coupon)}
                            aria-label={`Delete ${coupon.code}`}
                            className="h-7 px-2 rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[12px] max-w-lg w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <h2 className="text-[15px] font-semibold text-[#111111]">
                {editingCoupon ? `Edit Coupon ${editingCoupon.code}` : "Create Coupon"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DA1E28]">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label htmlFor="coupon-code" className="block font-medium text-[#111111] mb-1">
                  Coupon Code
                </label>
                <input
                  id="coupon-code"
                  type="text"
                  required
                  value={formState.code}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g., SAVE20"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono uppercase focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="coupon-type" className="block font-medium text-[#111111] mb-1">
                  Discount Type
                </label>
                <select
                  id="coupon-type"
                  value={formState.discountType}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      discountType: e.target.value as CouponDiscountType,
                    }))
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat (INR)</option>
                </select>
              </div>

              <div>
                <label htmlFor="coupon-value" className="block font-medium text-[#111111] mb-1">
                  Discount Value
                </label>
                <input
                  id="coupon-value"
                  type="number"
                  min={1}
                  step="any"
                  required
                  value={formState.discountValue}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, discountValue: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="coupon-min-order" className="block font-medium text-[#111111] mb-1">
                  Minimum Order Value (INR)
                </label>
                <input
                  id="coupon-min-order"
                  type="number"
                  min={0}
                  step="any"
                  value={formState.minOrderValue}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, minOrderValue: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="coupon-max-discount" className="block font-medium text-[#111111] mb-1">
                  Max Discount Cap (Optional)
                </label>
                <input
                  id="coupon-max-discount"
                  type="number"
                  min={1}
                  step="any"
                  value={formState.maxDiscount}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, maxDiscount: e.target.value }))
                  }
                  placeholder="Unlimited"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="coupon-usage-limit" className="block font-medium text-[#111111] mb-1">
                  Usage Limit (Optional)
                </label>
                <input
                  id="coupon-usage-limit"
                  type="number"
                  min={1}
                  step={1}
                  value={formState.usageLimit}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, usageLimit: e.target.value }))
                  }
                  placeholder="Unlimited"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#111111]">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="accent-[#FF5A1F]"
                  />
                  <span>Active for checkout</span>
                </label>
              </div>

              <div>
                <label htmlFor="coupon-start-date" className="block font-medium text-[#111111] mb-1">
                  Start Date
                </label>
                <input
                  id="coupon-start-date"
                  type="date"
                  value={formState.startDate}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="coupon-end-date" className="block font-medium text-[#111111] mb-1">
                  Expiry Date
                </label>
                <input
                  id="coupon-end-date"
                  type="date"
                  required
                  value={formState.endDate}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingCoupon
                    ? "Save Changes"
                    : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
