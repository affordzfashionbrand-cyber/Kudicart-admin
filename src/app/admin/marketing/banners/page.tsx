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
      return matchPlacement && matchGender;
    });
  }, [banners, activePlacement, activeGender]);

  // Metrics
  const activeCount = banners.filter((b) => b.isActive).length;
  const heroCount = banners.filter((b) => b.placement === "HERO_CAROUSEL").length;

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
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Live Target</p>
          <p className="text-sm font-semibold text-[#E05A47] mt-2">Zero App Redeploy</p>
        </div>
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
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              isFirst={index === 0}
              isLast={index === filteredBanners.length - 1}
            />
          ))}
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
