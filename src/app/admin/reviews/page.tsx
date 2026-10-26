"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AdminReviewItem, ReviewModerationStatus } from "@/types/reviews";
import { MOCK_REVIEWS, MOCK_REVIEWS_METRICS } from "@/mocks/reviews";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>(MOCK_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<AdminReviewItem | null>(MOCK_REVIEWS[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [boutiqueFilter, setBoutiqueFilter] = useState<string>("ALL");
  const [timeframe, setTimeframe] = useState<string>("LAST_30_DAYS");

  // Moderation state
  const [deleteModalReview, setDeleteModalReview] = useState<AdminReviewItem | null>(null);
  const [moderationToast, setModerationToast] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesProduct = r.productTitle.toLowerCase().includes(q) || r.productSku.toLowerCase().includes(q);
        const matchesCustomer = r.customerName.toLowerCase().includes(q);
        const matchesComment = r.comment.toLowerCase().includes(q);
        const matchesVendor = r.vendorName.toLowerCase().includes(q);
        if (!matchesProduct && !matchesCustomer && !matchesComment && !matchesVendor) return false;
      }

      if (ratingFilter !== "ALL" && r.rating !== Number(ratingFilter)) {
        return false;
      }

      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      if (boutiqueFilter !== "ALL" && r.vendorName !== boutiqueFilter) {
        return false;
      }

      return true;
    });
  }, [reviews, searchTerm, ratingFilter, statusFilter, boutiqueFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("ALL");
    setStatusFilter("ALL");
    setBoutiqueFilter("ALL");
  };

  const handleExportCsv = () => {
    const headers = "Review ID,Product,SKU,Boutique,Customer,Rating,Comment,Order,Date,Status\n";
    const rows = filteredReviews
      .map(
        (r) =>
          `"${r.id}","${r.productTitle}","${r.productSku}","${r.vendorName}","${r.customerName}",${r.rating},"${r.comment.replace(/"/g, '""')}","${r.orderNumber}","${r.date}","${r.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kudicart_reviews_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleConfirmDelete = () => {
    if (!deleteModalReview) return;
    const revId = deleteModalReview.id;
    setReviews((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, status: "REMOVED" as ReviewModerationStatus } : r))
    );
    if (selectedReview?.id === revId) {
      setSelectedReview((prev) => (prev ? { ...prev, status: "REMOVED" } : null));
    }
    setDeleteModalReview(null);
    setModerationToast(`Review ${revId} removed from public marketplace catalog.`);
    setTimeout(() => setModerationToast(null), 5000);
  };

  const handleApproveFlagged = (revId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, status: "PUBLISHED" as ReviewModerationStatus } : r))
    );
    if (selectedReview?.id === revId) {
      setSelectedReview((prev) => (prev ? { ...prev, status: "PUBLISHED" } : null));
    }
    setModerationToast(`Review ${revId} cleared and published.`);
    setTimeout(() => setModerationToast(null), 5000);
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto select-none">
      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Reviews &amp; Ratings
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-0.5">
            Inspect customer product feedback, monitor catalog satisfaction ratings, and moderate reported reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {/* Timeframe selector */}
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-lg text-xs font-medium text-on-surface appearance-none focus:border-[#FF5A1F] focus:ring-0 cursor-pointer shadow-xs"
            >
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="ALL_TIME">All Time</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-secondary text-sm pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => setReviews([...MOCK_REVIEWS])}
            className="h-9 w-9 rounded-lg bg-white border border-[#E4E0DB] hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface transition-colors shadow-xs"
            title="Refresh Feed"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-sm text-secondary">download</span>
            <span>Export Reviews CSV</span>
          </button>
        </div>
      </section>

      {/* Moderation Toast */}
      {moderationToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{moderationToast}</span>
        </div>
      )}

      {/* ================= OPERATIONAL SUMMARY METRICS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Rating */}
        <div className="bg-white border border-[#E4E0DB] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Average Marketplace Rating
            </span>
            <span className="material-symbols-outlined text-[#FF5A1F] text-lg">star</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold text-on-surface">
              {MOCK_REVIEWS_METRICS.averageRating}
            </span>
            <div className="flex items-center text-[#C9822E]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-sm">star</span>
              ))}
            </div>
          </div>
          <div className="text-xs text-secondary flex items-center gap-1">
            <span className="text-[#20885A] font-semibold flex items-center">
              <span className="material-symbols-outlined text-xs">trending_up</span> +0.2
            </span>
            <span>across 1,124 verified purchases</span>
          </div>
        </div>

        {/* Metric 2: Total Reviews */}
        <div className="bg-white border border-[#E4E0DB] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Total Customer Reviews
            </span>
            <span className="material-symbols-outlined text-secondary text-lg">rate_review</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold text-on-surface">
              {MOCK_REVIEWS_METRICS.totalReviews}
            </span>
            <span className="text-xs text-secondary">Reviews</span>
          </div>
          <div className="text-xs text-secondary">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#20885A] font-semibold text-xs mr-1">
              {MOCK_REVIEWS_METRICS.positivePercentage}%
            </span>
            positive 4★ &amp; 5★ customer sentiment
          </div>
        </div>

        {/* Metric 3: Rating Distribution Breakdown */}
        <div className="bg-white border border-[#E4E0DB] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-secondary mb-1">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold">
              Rating Distribution
            </span>
            <span className="font-mono text-[10px] text-secondary">100% Volume</span>
          </div>
          <div className="space-y-1 py-0.5">
            {MOCK_REVIEWS_METRICS.ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center text-[11px] gap-2">
                <span className="w-4 text-secondary font-mono">{item.stars}★</span>
                <div className="flex-1 bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.stars >= 4 ? "bg-[#20885A]" : item.stars === 3 ? "bg-[#C9822E]" : "bg-[#DA1E28]"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-on-surface">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 4: Flagged for Moderation */}
        <div className="bg-white border border-[#E4E0DB] rounded-xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1.5 h-full bg-[#C9822E]" />
          <div className="flex items-center justify-between text-secondary">
            <span className="text-label-xs font-label-xs uppercase tracking-wider font-semibold text-[#C9822E]">
              Moderation Action
            </span>
            <span className="material-symbols-outlined text-[#C9822E] text-lg">flag</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-headline-lg text-2xl font-bold text-on-surface">
              {MOCK_REVIEWS_METRICS.flaggedCount}
            </span>
            <span className="text-xs font-semibold text-[#C9822E]">Flagged for Moderation</span>
          </div>
          <div className="text-xs text-secondary space-y-0.5">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DA1E28]" />
              <span>2 containing flagged language</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9822E]" />
              <span>4 delivery packaging conflicts</span>
            </p>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <span className="material-symbols-outlined text-secondary text-base absolute left-3 top-2.5">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name, SKU, customer, or review content..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg focus:bg-white focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all placeholder:text-secondary"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-lg text-xs font-medium text-on-surface appearance-none focus:border-[#FF5A1F] focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <span className="material-symbols-outlined text-secondary text-sm absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Moderation Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-lg text-xs font-medium text-on-surface appearance-none focus:border-[#FF5A1F] focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="FLAGGED">Flagged for Review</option>
              <option value="REMOVED">Removed</option>
            </select>
            <span className="material-symbols-outlined text-secondary text-sm absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Boutique Filter */}
          <div className="relative">
            <select
              value={boutiqueFilter}
              onChange={(e) => setBoutiqueFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-lg text-xs font-medium text-on-surface appearance-none focus:border-[#FF5A1F] focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Boutiques</option>
              <option value="Luxe Heritage Clothiers">Luxe Heritage Clothiers</option>
              <option value="Kashmir Loom Heritage">Kashmir Loom Heritage</option>
              <option value="Malabar Spice Co.">Malabar Spice Co.</option>
              <option value="Deccan Metalcraft">Deccan Metalcraft</option>
              <option value="Minimalist Leather Works">Minimalist Leather Works</option>
              <option value="Artisan Silks Co.">Artisan Silks Co.</option>
            </select>
            <span className="material-symbols-outlined text-secondary text-sm absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Clear Filters */}
          {(searchTerm || ratingFilter !== "ALL" || statusFilter !== "ALL" || boutiqueFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline font-semibold px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="text-secondary text-xs flex items-center gap-1.5 shrink-0 pr-2">
          <span>Displaying {filteredReviews.length} of {reviews.length}</span>
        </div>
      </section>

      {/* ================= MAIN SPLIT-PANE: TABLE & DETAIL DOSSIER ================= */}
      <section className="grid grid-cols-12 gap-5 items-start">
        {/* Reviews Table (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E4E0DB] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-secondary text-label-xs uppercase tracking-wider font-semibold">
                  <th className="py-2 px-3">Product &amp; SKU</th>
                  <th className="py-2 px-3">Boutique</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-2">Rating</th>
                  <th className="py-2 px-3">Feedback Content</th>
                  <th className="py-2 px-2">Order</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs font-body-sm">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10">
                      <EmptyState
                        title="No reviews match filters"
                        description="Try modifying search keywords or clearing active filters."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                        icon="rate_review"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => {
                    const isSelected = selectedReview?.id === rev.id;

                    return (
                      <tr
                        key={rev.id}
                        onClick={() => setSelectedReview(rev)}
                        className={`h-14 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-2 border-[#FF5A1F]"
                            : rev.status === "FLAGGED"
                            ? "bg-amber-50/20 hover:bg-surface-container-low"
                            : rev.status === "REMOVED"
                            ? "bg-rose-50/20 opacity-60 hover:bg-surface-container-low"
                            : "hover:bg-[#F7F7F5]"
                        }`}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {rev.productImage && (
                              <img
                                src={rev.productImage}
                                alt={rev.productTitle}
                                className="w-8 h-8 rounded object-cover border border-[#E4E0DB] shrink-0"
                              />
                            )}
                            <div className="flex flex-col max-w-[140px]">
                              <span className="font-semibold text-on-surface truncate">{rev.productTitle}</span>
                              <span className="font-mono text-[10px] text-secondary">{rev.productSku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-secondary truncate max-w-[110px]">{rev.vendorName}</td>
                        <td className="py-2 px-3 font-semibold text-on-surface truncate max-w-[100px]">
                          {rev.customerName}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-0.5 text-[#C9822E] font-semibold">
                            <span>{rev.rating}★</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 max-w-[180px]">
                          <p className="line-clamp-2 text-secondary leading-snug">{rev.comment}</p>
                        </td>
                        <td className="py-2 px-2 font-mono text-[11px] text-secondary">{rev.orderNumber}</td>
                        <td className="py-2 px-2 text-[11px] text-secondary whitespace-nowrap">{rev.date}</td>
                        <td className="py-2 px-3">
                          <StatusBadge status={rev.status} variant="review" />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReview(rev);
                              }}
                              className="p-1 rounded text-secondary hover:text-[#FF5A1F] hover:bg-surface-container transition-colors"
                              title="Inspect Details"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            {rev.status !== "REMOVED" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModalReview(rev);
                                }}
                                className="p-1 rounded text-secondary hover:text-[#DA1E28] hover:bg-rose-50 transition-colors"
                                title="Moderate / Delete Review"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Inspection Detail Drawer (4 Cols) */}
        {selectedReview ? (
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#E4E0DB] rounded-xl p-5 shadow-xs space-y-4 sticky top-20">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E0DB]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-on-surface">Review Dossier</h3>
                  <StatusBadge status={selectedReview.status} variant="review" />
                </div>
                <span className="font-mono text-[11px] text-secondary">{selectedReview.id}</span>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E4E0DB] flex items-center gap-3">
              {selectedReview.productImage && (
                <img
                  src={selectedReview.productImage}
                  alt={selectedReview.productTitle}
                  className="w-12 h-12 rounded object-cover border border-[#E4E0DB]"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-on-surface truncate">{selectedReview.productTitle}</p>
                <p className="font-mono text-[11px] text-secondary">SKU: {selectedReview.productSku}</p>
                <p className="text-[11px] text-[#FF5A1F] font-medium">{selectedReview.vendorName}</p>
              </div>
            </div>

            {/* Rating Stars & Customer Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#C9822E]">
                    {[...Array(selectedReview.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-base">star</span>
                    ))}
                  </div>
                  <strong className="text-on-surface text-sm">{selectedReview.rating}.0 / 5.0</strong>
                </div>
                {selectedReview.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Verified Purchase
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-[#E4E0DB] flex justify-between text-secondary">
                <span>Customer: <strong className="text-on-surface">{selectedReview.customerName}</strong></span>
                <span>Order: <strong className="font-mono text-on-surface">{selectedReview.orderNumber}</strong></span>
              </div>
            </div>

            {/* Full Review Text */}
            <div className="space-y-1">
              <span className="font-semibold uppercase tracking-wider text-secondary text-[10px]">
                Full Customer Feedback
              </span>
              <div className="p-3 bg-white rounded-lg border border-[#E4E0DB] text-xs text-on-surface leading-relaxed italic">
                &ldquo;{selectedReview.comment}&rdquo;
              </div>
            </div>

            {/* Flag Reason (if flagged) */}
            {selectedReview.flagReason && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-amber-800">
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                  Reported Conflict Note
                </div>
                <p className="text-[11px] leading-snug">{selectedReview.flagReason}</p>
              </div>
            )}

            {/* Moderation Actions */}
            <div className="pt-2 border-t border-[#E4E0DB] space-y-2">
              <span className="font-semibold uppercase tracking-wider text-secondary text-[10px]">
                Administrative Moderation
              </span>
              <div className="flex items-center gap-2">
                {selectedReview.status === "FLAGGED" && (
                  <button
                    onClick={() => handleApproveFlagged(selectedReview.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                  >
                    Clear &amp; Publish
                  </button>
                )}
                {selectedReview.status !== "REMOVED" ? (
                  <button
                    onClick={() => setDeleteModalReview(selectedReview)}
                    className="flex-1 py-2 px-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Remove Review
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs text-secondary italic">
                    This review has been removed by Central Operations.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#E4E0DB] rounded-xl p-8 text-center text-secondary">
            <span className="material-symbols-outlined text-[32px] mb-2">touch_app</span>
            <p className="text-sm font-semibold text-on-surface">Select a customer review</p>
            <p className="text-xs text-secondary mt-1">Click any row to inspect complete feedback.</p>
          </div>
        )}
      </section>

      {/* ================= REVIEW DELETION CONFIRMATION MODAL ================= */}
      {deleteModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-[#DA1E28] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">delete</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-on-surface">Remove Customer Review?</h4>
                  <p className="text-xs text-secondary">Central Operations Content Moderation</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalReview(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-[#E4E0DB] space-y-2 text-xs">
              <p className="text-on-surface leading-snug">
                This action will hide the review by <strong>{deleteModalReview.customerName}</strong> for <strong>{deleteModalReview.productTitle}</strong> ({deleteModalReview.rating}★) from the public marketplace catalog.
              </p>
              <div className="p-2 bg-white rounded border border-[#E4E0DB] text-secondary italic text-[11px]">
                &ldquo;{deleteModalReview.comment}&rdquo;
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalReview(null)}
                className="h-9 px-4 border border-[#E4E0DB] rounded-lg font-semibold text-xs text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-9 px-4 bg-[#DA1E28] text-white rounded-lg font-semibold text-xs hover:bg-[#BA1A1A] transition-all shadow-sm"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
