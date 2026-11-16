"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, RefreshCw, Tag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { BankOfferCard } from "./components/BankOfferCard";
import { BankOfferModal } from "./components/BankOfferModal";
import type { BankOffer } from "@/types/marketing";

export default function MarketingOffersPage() {
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<BankOffer | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setError(null);
      const data = await api.marketing.getBankOffers();
      setOffers(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load partner bank offers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const handleToggleActive = async (offer: BankOffer) => {
    try {
      const nextActive = !offer.isActive;
      await api.marketing.updateBankOffer(offer.id, { isActive: nextActive });
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isActive: nextActive } : o))
      );
    } catch (err: any) {
      alert(`Failed to update offer status: ${err.message}`);
    }
  };

  const handleDelete = async (offer: BankOffer) => {
    if (!confirm(`Are you sure you want to delete bank offer "${offer.bankName} - ${offer.title}"?`)) return;
    try {
      await api.marketing.deleteBankOffer(offer.id);
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    } catch (err: any) {
      alert(`Failed to delete bank offer: ${err.message}`);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= offers.length) return;

    const copy = [...offers];
    const item = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = item;

    const reordered = copy.map((o, i) => ({
      ...o,
      displayOrder: i + 1,
    }));
    setOffers(reordered);

    try {
      await api.marketing.reorderBankOffers(
        reordered.map((o) => ({ id: o.id, displayOrder: o.displayOrder, isActive: o.isActive }))
      );
    } catch (err: any) {
      alert(`Failed to reorder offers: ${err.message}`);
      fetchOffers();
    }
  };

  const filteredOffers = useMemo(() => {
    if (statusFilter === "ACTIVE") return offers.filter((o) => o.isActive);
    if (statusFilter === "INACTIVE") return offers.filter((o) => !o.isActive);
    return offers;
  }, [offers, statusFilter]);

  const activeCount = offers.filter((o) => o.isActive).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E05A47]">local_offer</span>
            <h1 className="text-xl font-bold text-[#2C2B29]">Partner Bank Offers Manager</h1>
          </div>
          <p className="text-xs text-[#6E6B65] mt-1">
            Configure live bank partnerships, discount rates, promo codes, and terms modal content.
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
              setEditingOffer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#E05A47] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#D04C39] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Bank Offer</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Partner Banks</p>
          <p className="text-2xl font-bold text-[#2C2B29] mt-1">{offers.length}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Active in Ticker</p>
          <p className="text-2xl font-bold text-[#2E7D32] mt-1">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Instant Apply</p>
          <p className="text-sm font-semibold text-[#1E40AF] mt-2">One-Click Copy</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Ticker Rotation</p>
          <p className="text-sm font-semibold text-[#E05A47] mt-2">3.8s Isolated Interval</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E0DB] pb-3">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab
                ? "bg-[#2C2B29] text-white shadow-sm"
                : "bg-white text-[#6E6B65] hover:bg-[#F4F1EA] border border-[#E4E0DB]"
            }`}
          >
            {tab === "ALL" ? "All Bank Offers" : tab === "ACTIVE" ? "Active Now" : "Inactive"}
          </button>
        ))}
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#E4E0DB] bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-[#E05A47]" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#D5D0C7] bg-[#FAF8F5] p-6 text-center">
          <Tag className="h-10 w-10 text-[#A09C94] mb-2" />
          <h3 className="text-sm font-semibold text-[#2C2B29]">No Bank Offers Configured</h3>
          <p className="text-xs text-[#6E6B65] mt-1 max-w-sm">
            Add bank promotional partnerships to showcase in the customer app instant offer ticker.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingOffer(null);
              setIsModalOpen(true);
            }}
            className="mt-4 rounded-lg bg-[#E05A47] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#D04C39]"
          >
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer, index) => (
            <BankOfferCard
              key={offer.id}
              offer={offer}
              onEdit={() => {
                setEditingOffer(offer);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDelete(offer)}
              onToggleActive={() => handleToggleActive(offer)}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              isFirst={index === 0}
              isLast={index === filteredOffers.length - 1}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <BankOfferModal
          offer={editingOffer}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOffer(null);
          }}
          onSaved={fetchOffers}
        />
      )}
    </div>
  );
}
