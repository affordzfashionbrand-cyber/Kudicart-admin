"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  X,
  Package,
  User,
  ThumbsUp,
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

const INITIAL_VENDOR_REVIEWS: VendorReview[] = [
  {
    id: "vr-1",
    customerName: "Priya Sharma",
    productName: "Silk Kaftan Dress",
    rating: 5,
    date: "Oct 24, 2024",
    comment:
      "Stunning drape and the emerald green color is exactly as pictured. Fabric quality is magnificent.",
    verified: true,
  },
  {
    id: "vr-2",
    customerName: "Rohan Deshmukh",
    productName: "Structured Linen Blazer",
    rating: 5,
    date: "Oct 22, 2024",
    comment:
      "Tailoring is very crisp. Great breathable fabric for Mumbai weather. Will order another color.",
    verified: true,
  },
  {
    id: "vr-3",
    customerName: "Ananya Mehta",
    productName: "Hand-Embroidered Kurta",
    rating: 4,
    date: "Oct 19, 2024",
    comment:
      "Very neat zari embroidery work. Sleeves were slightly tighter than expected but fits nicely overall.",
    verified: true,
  },
  {
    id: "vr-4",
    customerName: "Zoya Akhtar",
    productName: "Handloom Tussar Sari",
    rating: 5,
    date: "Oct 15, 2024",
    comment:
      "Authentic handloom weave. The packaging was immaculate with boutique garment bag included.",
    verified: true,
  },
  {
    id: "vr-5",
    customerName: "Vikram Malhotra",
    productName: "Pleated Palazzo Pants",
    rating: 4,
    date: "Oct 10, 2024",
    comment:
      "Comfortable waist fit and flowy silhouette. Fast dispatch from Bandra hub.",
    verified: true,
  },
];

export default function VendorReviewsPage() {
  const [reviews] = useState<VendorReview[]>(INITIAL_VENDOR_REVIEWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");

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
              4.8 ★ Boutique Rating
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Buyer ratings and feedback on Maison Lagos garments and packaging.
          </p>
        </div>
      </div>

      {/* Ratings Summary Card */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center p-4 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] min-w-[120px]">
            <span className="text-3xl font-bold font-mono text-[#111111]">4.8</span>
            <div className="flex items-center gap-0.5 mt-1 text-[#FF5A1F]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-[#FF5A1F] text-[#FF5A1F]" />
              ))}
            </div>
            <span className="text-[11px] text-[#6B6667] mt-1">34 Reviews</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6B6667] w-12">5 Star</span>
              <div className="w-36 h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-[#FF5A1F] rounded-full" />
              </div>
              <span className="text-[#111111] font-medium">85%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B6667] w-12">4 Star</span>
              <div className="w-36 h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="w-[15%] h-full bg-[#FF5A1F] rounded-full" />
              </div>
              <span className="text-[#111111] font-medium">15%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B6667] w-12">3 Star</span>
              <div className="w-36 h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
                <div className="w-[0%] h-full bg-[#FF5A1F] rounded-full" />
              </div>
              <span className="text-[#111111] font-medium">0%</span>
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
              title="No customer reviews found"
              description="Try adjusting your search query or active rating filter."
              actionLabel="Clear Filters"
              onAction={clearFilters}
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
