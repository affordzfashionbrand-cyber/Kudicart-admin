"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, RefreshCw, Layers, Sparkles, Filter, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { BannerCard } from "./components/BannerCard";
import { BannerModal } from "./components/BannerModal";
import type { BannerPlacement, HomeBanner } from "@/types/marketing";

export default function MarketingBannersPage() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activePlacement, setActivePlacement] = useState<string>("ALL");
  const [activeGender, setActiveGender] = useState<string>("ALL");
  const [activeStatus, setActiveStatus] = useState<string>("ALL");

  // Rejection modal state
  const [rejectTarget, setRejectTarget] = useState<HomeBanner | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setError(null);
      const data = await api.marketing.getBanners();
      setBanners(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load marketing banners.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBanners();
  };

  const handleToggleActive = async (banner: HomeBanner) => {
    try {
      const nextActive = !banner.isActive;
      await api.marketing.updateBanner(banner.id, { isActive: nextActive });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextActive } : b))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (banner: HomeBanner) => {
    if (!confirm(`Are you sure you want to delete banner "${banner.title1}"?`)) return;
    try {
      await api.marketing.deleteBanner(banner.id);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err: any) {
      alert(`Failed to delete banner: ${err.message}`);
    }
  };

  const handleApprove = async (banner: HomeBanner) => {
    try {
      setReviewingId(banner.id);
      const updated = await api.marketing.approveBanner(banner.id);
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, ...updated } : b)));
    } catch (err: any) {
      alert(`Failed to approve banner: ${err.message}`);
    } finally {
      setReviewingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    if (!rejectionComment.trim()) {
      alert("Please enter a rejection comment for the vendor.");
      return;
    }
    try {
      setReviewingId(rejectTarget.id);
      const updated = await api.marketing.rejectBanner(rejectTarget.id, rejectionComment.trim());
      setBanners((prev) => prev.map((b) => (b.id === rejectTarget.id ? { ...b, ...updated } : b)));
      setRejectTarget(null);
      setRejectionComment("");
    } catch (err: any) {
      alert(`Failed to reject banner: ${err.message}`);
    } finally {
      setReviewingId(null);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const copy = [...banners];
    const item = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = item;

    // Recalculate displayOrders
    const reordered = copy.map((b, i) => ({
      ...b,
      displayOrder: i + 1,
    }));
    setBanners(reordered);

    try {
      await api.marketing.reorderBanners(
        reordered.map((b) => ({ id: b.id, displayOrder: b.displayOrder, isActive: b.isActive }))
      );
    } catch (err: any) {
      alert(`Failed to save new order: ${err.message}`);
      fetchBanners();
    }
  };

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const matchPlacement =
        activePlacement === "ALL" || b.placement === activePlacement;
      const matchGender =
        activeGender === "ALL" || b.targetGender === activeGender || b.targetGender === "All";
      const bannerStatus = b.status || "APPROVED";
      const matchStatus = activeStatus === "ALL" || bannerStatus === activeStatus;
      return matchPlacement && matchGender && matchStatus;
    });
  }, [banners, activePlacement, activeGender, activeStatus]);

  // Metrics
  const activeCount = banners.filter((b) => b.isActive).length;
  const heroCount = banners.filter((b) => b.placement === "HERO_CAROUSEL").length;
  const pendingCount = banners.filter((b) => (b.status || "APPROVED") === "PENDING").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E05A47]">view_carousel</span>
            <h1 className="text-xl font-bold text-[#2C2B29]">Marketing Banners Studio</h1>
          </div>
          <p className="text-xs text-[#6E6B65] mt-1">
            Manage real-time customer app hero carousels, campaign banners, and product deep-links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-xs font-medium text-[#6E6B65] hover:bg-[#F4F1EA] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#E05A47] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#D04C39] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Banner</span>
          </button>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Total Banners</p>
          <p className="text-2xl font-bold text-[#2C2B29] mt-1">{banners.length}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Active Campaigns</p>
          <p className="text-2xl font-bold text-[#2E7D32] mt-1">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Hero Carousel Slots</p>
          <p className="text-2xl font-bold text-[#1E40AF] mt-1">{heroCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Pending Review</p>
          <p className="text-2xl font-bold text-[#B45309] mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Approval Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "ALL", label: "All Statuses" },
          { id: "PENDING", label: `Pending Review${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          { id: "APPROVED", label: "Approved" },
          { id: "REJECTED", label: "Rejected" },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setActiveStatus(st.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeStatus === st.id
                ? "bg-[#E05A47] text-white shadow-sm"
                : "bg-white text-[#6E6B65] border border-[#E4E0DB] hover:bg-[#F4F1EA]"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E0DB] pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "All Placements" },
            { id: "HERO_CAROUSEL", label: "Hero Carousel" },
            { id: "EDITORIAL_STRIP", label: "Editorial Strip" },
            { id: "MODERN_REDEFINED", label: "Modern Redefined" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlacement(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activePlacement === tab.id
                  ? "bg-[#2C2B29] text-white shadow-sm"
                  : "bg-white text-[#6E6B65] hover:bg-[#F4F1EA] border border-[#E4E0DB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6E6B65] font-medium">Audience:</span>
          {["ALL", "Women", "Men", "Kids"].map((gender) => (
            <button
              key={gender}
              onClick={() => setActiveGender(gender)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                activeGender === gender
                  ? "bg-[#E05A47] text-white"
                  : "bg-white text-[#6E6B65] border border-[#E4E0DB] hover:bg-[#F4F1EA]"
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#E4E0DB] bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-[#E05A47]" />
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#D5D0C7] bg-[#FAF8F5] p-6 text-center">
          <Layers className="h-10 w-10 text-[#A09C94] mb-2" />
          <h3 className="text-sm font-semibold text-[#2C2B29]">No Banners Found</h3>
          <p className="text-xs text-[#6E6B65] mt-1 max-w-sm">
            There are no banners matching the selected placement or audience filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setIsModalOpen(true);
            }}
            className="mt-4 rounded-lg bg-[#E05A47] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#D04C39]"
          >
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBanners.map((banner, index) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEdit={() => {
                setEditingBanner(banner);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDelete(banner)}
              onToggleActive={() => handleToggleActive(banner)}
              onApprove={() => handleApprove(banner)}
              onReject={() => {
                setRejectTarget(banner);
                setRejectionComment("");
              }}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              isFirst={index === 0}
              isLast={index === filteredBanners.length - 1}
            />
          ))}
        </div>
      )}

      {/* Rejection Comment Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleConfirmReject}
            className="w-full max-w-md rounded-2xl border border-[#E4E0DB] bg-white p-5 shadow-xl space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-[#2C2B29]">Reject Vendor Banner</h3>
              <p className="text-xs text-[#6E6B65] mt-1">
                Provide a clear reason so {rejectTarget.vendor?.storeName || "the vendor"} can revise &ldquo;{rejectTarget.title1}&rdquo;.
              </p>
            </div>
            <textarea
              rows={3}
              required
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="e.g. Please upload a higher-resolution 16:9 image without overlaid watermarks."
              className="w-full rounded-lg border border-[#D5D0C7] p-2.5 text-xs text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectionComment("");
                }}
                className="rounded-lg border border-[#D5D0C7] px-3 py-1.5 text-xs font-medium text-[#6E6B65]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewingId === rejectTarget.id}
                className="rounded-lg bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-50"
              >
                {reviewingId === rejectTarget.id ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <BannerModal
          banner={editingBanner}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBanner(null);
          }}
          onSaved={fetchBanners}
        />
      )}
    </div>
  );
}
