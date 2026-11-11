"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface VendorReview {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export default function VendorReviewsPage() {
  const [reviews] = useState<VendorReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : "0.0";
    const starPct = (target: number) =>
      total > 0
        ? Math.round((reviews.filter((r) => Math.round(r.rating) === target).length / total) * 100)
        : 0;
    return {
      total,
      avg,
      fivePct: starPct(5),
      fourPct: starPct(4),
      threePct: starPct(3),
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesCustomer = r.customerName.toLowerCase().includes(q);
        const matchesProduct = r.productName.toLowerCase().includes(q);
        const matchesComment = r.comment.toLowerCase().includes(q);
        if (!matchesCustomer && !matchesProduct && !matchesComment) return false;
      }

      if (ratingFilter !== "ALL" && r.rating !== Number(ratingFilter)) {
        return false;
      }

      return true;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("ALL");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Customer Reviews
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20">
              {stats.total > 0 ? `${stats.avg} ★ Boutique Rating` : "No Ratings Yet"}
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Buyer ratings and feedback for your store garments and packaging.
          </p>
        </div>
      </div>

      {/* Ratings Summary Card */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center p-4 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] min-w-[120px]">
            <span className="text-3xl font-bold font-mono text-[#111111]">{stats.avg}</span>
            <div className="flex items-center gap-0.5 mt-1 text-[#FF5A1F]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    Number(stats.avg) >= s ? "fill-[#FF5A1F] text-[#FF5A1F]" : "text-[#E4E0DB]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#6B6667] mt-1">{stats.total} Reviews</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6B6667] w-12">5 Star</span>
              <div className="w-36 h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A1F] rounded-full" style={{ width: `${stats.fivePct}%` }} />
              </div>
              <span className="text-[#111111] font-medium">{stats.fivePct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B6667] w-12">4 Star</span>
              <div className="w-36 h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A1F] rounded-full" style={{ width: `${stats.fourPct}%` }} />
              </div>
              <span className="text-[#111111] font-medium">{stats.fourPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B6667] w-12">3 Star</span>
              <div className="w-36 h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A1F] rounded-full" style={{ width: `${stats.threePct}%` }} />
              </div>
              <span className="text-[#111111] font-medium">{stats.threePct}%</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs text-[#6B6667] max-w-sm">
          Customer ratings directly influence boutique search ranking and Try &amp; Buy trial eligibility across the marketplace.
        </div>
      </div>

      {/* Filter Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6667]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviewer or garment..."
              className="w-full h-[36px] pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111] placeholder:text-[#6B6667]"
            />
          </div>

          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none" />
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="h-[36px] px-3 text-xs text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] rounded-[8px] flex items-center gap-1.5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      </section>

      {/* Review Cards Grid */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-8 text-center">
            <EmptyState
              title={
                reviews.length === 0
                  ? "Vendor review feed awaiting Wave 2 integration"
                  : "No customer reviews found"
              }
              description={
                reviews.length === 0
                  ? "Store-scoped review moderation and eligibility rules (O-010) will load from backend once Wave 2 vendor endpoints are wired."
                  : "Try adjusting your search query or active rating filter."
              }
              actionLabel={reviews.length > 0 ? "Clear Filters" : undefined}
              onAction={reviews.length > 0 ? clearFilters : undefined}
            />
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F4F1EA] text-[#111111] flex items-center justify-center font-medium text-xs">
                    {rev.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#111111]">
                        {rev.customerName}
                      </span>
                      {rev.verified && (
                        <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6B6667] block">
                      Garment: <strong className="text-[#111111] font-medium">{rev.productName}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-0.5 text-[#FF5A1F]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? "fill-[#FF5A1F] text-[#FF5A1F]"
                            : "text-[#E4E0DB]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#6B6667] font-mono">
                    {rev.date}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#111111] leading-relaxed pl-11">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
