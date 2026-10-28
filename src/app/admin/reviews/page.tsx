"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  FilterX,
  Trash2,
  Eye,
  X,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AdminReviewItem } from "@/types/reviews";
import { MOCK_REVIEWS, MOCK_REVIEWS_METRICS } from "@/mocks/reviews";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

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
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    api.reviews.list({ limit: 50 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setReviews(res.data);
          setSelectedReview(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

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
    showToast(`Exported ${filteredReviews.length} reviews to CSV.`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalReview) return;
    const targetId = deleteModalReview.id;
    setDeleteModalReview(null);

    try {
      await api.reviews.delete(targetId);
      setReviews((prev) => prev.filter((r) => r.id !== targetId));
      if (selectedReview?.id === targetId) {
        setSelectedReview(null);
      }
      showToast(`Review #${targetId} removed successfully.`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to remove review.", "error");
    }
  };

  const handleApproveFlagged = async (revId: string) => {
    try {
      await api.reviews.moderate(revId, "PUBLISHED");
      setReviews((prev) =>
        prev.map((r) => (r.id === revId ? { ...r, status: "PUBLISHED" } : r))
      );
      if (selectedReview?.id === revId) {
        setSelectedReview((prev) => (prev ? { ...prev, status: "PUBLISHED" } : null));
      }
      showToast(`Review #${revId} approved and published.`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to approve review.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed top-20 right-8 z-50 p-4 rounded-[8px] shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#20885A]"
              : "bg-[#FEF2F2] border-[#ffdad6] text-[#DA1E28]"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Reviews &amp; Ratings
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Review customer product feedback and monitor catalog ratings across boutique merchants.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Timeframe selector */}
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] appearance-none focus:border-[#FF5A1F] outline-none cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="ALL_TIME">All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setReviews([...MOCK_REVIEWS]);
              showToast("Reviews refreshed.");
            }}
            className="h-9 w-9 rounded-[8px] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] flex items-center justify-center text-[#6B6667] hover:text-[#111111] transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium rounded-[8px] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* ================= OPERATIONAL SUMMARY METRICS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Rating */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Average Rating
            </span>
            <Star className="w-4 h-4 text-[#FF5A1F] fill-[#FF5A1F]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#111111]">
              {MOCK_REVIEWS_METRICS.averageRating}
            </span>
            <div className="flex items-center text-[#C9822E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#C9822E]" />
              ))}
            </div>
          </div>
          <div className="text-xs text-[#6B6667]">
            <span>Across 1,124 verified customer purchases</span>
          </div>
        </div>

        {/* Metric 2: Total Reviews */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium">
              Total Customer Reviews
            </span>
            <MessageSquare className="w-4 h-4 text-[#6B6667]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#111111]">
              {MOCK_REVIEWS_METRICS.totalReviews}
            </span>
            <span className="text-xs text-[#6B6667]">Reviews</span>
          </div>
          <div className="text-xs text-[#6B6667]">
            <span className="font-medium text-[#20885A] mr-1">
              {MOCK_REVIEWS_METRICS.positivePercentage}%
            </span>
            positive 4★ &amp; 5★ ratings
          </div>
        </div>

        {/* Metric 3: Rating Distribution Breakdown */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667] mb-1">
            <span className="text-xs font-medium">
              Rating Breakdown
            </span>
            <span className="font-mono text-[10px] text-[#6B6667]">Distribution</span>
          </div>
          <div className="space-y-1 py-0.5">
            {MOCK_REVIEWS_METRICS.ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center text-[11px] gap-2">
                <span className="w-4 text-[#6B6667] font-mono">{item.stars}★</span>
                <div className="flex-1 bg-[#F4F1EA] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.stars >= 4 ? "bg-[#20885A]" : item.stars === 3 ? "bg-[#C9822E]" : "bg-[#DA1E28]"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-[#111111]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 4: Flagged for Moderation */}
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#6B6667]">
            <span className="text-xs font-medium text-[#C9822E]">
              Flagged for Review
            </span>
            <AlertTriangle className="w-4 h-4 text-[#C9822E]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#111111]">
              {MOCK_REVIEWS_METRICS.flaggedCount}
            </span>
            <span className="text-xs font-medium text-[#C9822E]">Reports pending</span>
          </div>
          <div className="text-xs text-[#6B6667]">
            <span>Content reported for administrative check</span>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, SKU, customer, or content..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E4E0DB] rounded-[8px] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] outline-none placeholder:text-[#6B6667]"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] appearance-none focus:border-[#FF5A1F] outline-none cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Moderation Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] appearance-none focus:border-[#FF5A1F] outline-none cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="FLAGGED">Flagged for Review</option>
              <option value="REMOVED">Removed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Boutique Filter */}
          <div className="relative">
            <select
              value={boutiqueFilter}
              onChange={(e) => setBoutiqueFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-white border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] appearance-none focus:border-[#FF5A1F] outline-none cursor-pointer hover:bg-[#F7F7F5] transition-colors"
            >
              <option value="ALL">All Boutiques</option>
              <option value="Luxe Heritage Clothiers">Luxe Heritage Clothiers</option>
              <option value="Kashmir Loom Heritage">Kashmir Loom Heritage</option>
              <option value="Malabar Spice Co.">Malabar Spice Co.</option>
              <option value="Deccan Metalcraft">Deccan Metalcraft</option>
              <option value="Minimalist Leather Works">Minimalist Leather Works</option>
              <option value="Artisan Silks Co.">Artisan Silks Co.</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6667] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(searchTerm || ratingFilter !== "ALL" || statusFilter !== "ALL" || boutiqueFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="h-9 px-2 text-xs font-medium text-[#6B6667] hover:text-[#FF5A1F] transition-colors flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="text-[#6B6667] text-xs font-mono">
          <span>{filteredReviews.length} of {reviews.length}</span>
        </div>
      </section>

      {/* ================= MAIN SPLIT-PANE: TABLE & DETAIL DOSSIER ================= */}
      <section className="grid grid-cols-12 gap-5 items-start">
        {/* Reviews Table (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[#6B6667] text-xs font-medium">
                  <th className="py-2 px-3 font-medium">Product &amp; SKU</th>
                  <th className="py-2 px-3 font-medium">Boutique</th>
                  <th className="py-2 px-3 font-medium">Customer</th>
                  <th className="py-2 px-2 font-medium">Rating</th>
                  <th className="py-2 px-3 font-medium">Feedback</th>
                  <th className="py-2 px-2 font-medium">Order</th>
                  <th className="py-2 px-2 font-medium">Date</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
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
                        className={`h-12 cursor-pointer transition-colors border-b border-[#E4E0DB] ${
                          isSelected
                            ? "bg-[#FFF0E8] border-l-2 border-l-[#FF5A1F]"
                            : rev.status === "FLAGGED"
                            ? "bg-amber-50/20 hover:bg-[#F7F7F5]/50"
                            : rev.status === "REMOVED"
                            ? "bg-rose-50/20 opacity-60 hover:bg-[#F7F7F5]/50"
                            : "hover:bg-[#F7F7F5]/50"
                        }`}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {rev.productImage && (
                              <img
                                src={rev.productImage}
                                alt={rev.productTitle}
                                className="w-8 h-8 rounded-[4px] object-cover border border-[#E4E0DB] shrink-0"
                              />
                            )}
                            <div className="flex flex-col max-w-[140px]">
                              <span className="font-medium text-[#111111] truncate">{rev.productTitle}</span>
                              <span className="font-mono text-[10px] text-[#6B6667]">{rev.productSku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-[#6B6667] truncate max-w-[110px]">{rev.vendorName}</td>
                        <td className="py-2 px-3 font-medium text-[#111111] truncate max-w-[100px]">
                          {rev.customerName}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-0.5 text-[#C9822E] font-medium">
                            <span>{rev.rating}★</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 max-w-[180px]">
                          <p className="line-clamp-2 text-[#6B6667] leading-snug">{rev.comment}</p>
                        </td>
                        <td className="py-2 px-2 font-mono text-[11px] text-[#6B6667]">{rev.orderNumber}</td>
                        <td className="py-2 px-2 text-[11px] text-[#6B6667] whitespace-nowrap">{rev.date}</td>
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
                              className="p-1 rounded-[4px] text-[#6B6667] hover:text-[#FF5A1F] hover:bg-[#F4F1EA] transition-colors"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {rev.status !== "REMOVED" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModalReview(rev);
                                }}
                                className="p-1 rounded-[4px] text-[#6B6667] hover:text-[#DA1E28] hover:bg-rose-50 transition-colors"
                                title="Moderate Review"
                              >
                                <Trash2 className="w-4 h-4" />
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
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4 sticky top-20">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E0DB]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-[#111111]">Review Details</h3>
                  <StatusBadge status={selectedReview.status} variant="review" />
                </div>
                <span className="font-mono text-[11px] text-[#6B6667]">{selectedReview.id}</span>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] flex items-center gap-3">
              {selectedReview.productImage && (
                <img
                  src={selectedReview.productImage}
                  alt={selectedReview.productTitle}
                  className="w-12 h-12 rounded-[4px] object-cover border border-[#E4E0DB]"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-[#111111] truncate">{selectedReview.productTitle}</p>
                <p className="font-mono text-[11px] text-[#6B6667]">SKU: {selectedReview.productSku}</p>
                <p className="text-[11px] text-[#FF5A1F] font-medium">{selectedReview.vendorName}</p>
              </div>
            </div>

            {/* Rating Stars & Customer Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#C9822E]">
                    {[...Array(selectedReview.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C9822E]" />
                    ))}
                  </div>
                  <strong className="text-[#111111] text-sm">{selectedReview.rating}.0 / 5.0</strong>
                </div>
                {selectedReview.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] text-[11px] font-medium border border-[#A7F3D0]">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-[#E4E0DB] flex justify-between text-[#6B6667]">
                <span>Customer: <strong className="text-[#111111] font-medium">{selectedReview.customerName}</strong></span>
                <span>Order: <strong className="font-mono text-[#111111]">{selectedReview.orderNumber}</strong></span>
              </div>
            </div>

            {/* Full Review Text */}
            <div className="space-y-1">
              <span className="font-medium text-[#6B6667] text-[11px]">
                Customer Feedback
              </span>
              <div className="p-3 bg-white rounded-[8px] border border-[#E4E0DB] text-xs text-[#111111] leading-relaxed italic">
                &ldquo;{selectedReview.comment}&rdquo;
              </div>
            </div>

            {/* Flag Reason (if flagged) */}
            {selectedReview.flagReason && (
              <div className="p-3 bg-amber-50 rounded-[8px] border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1 font-medium text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Reason</span>
                </div>
                <p className="text-[11px] leading-snug">{selectedReview.flagReason}</p>
              </div>
            )}

            {/* Moderation Actions */}
            <div className="pt-2 border-t border-[#E4E0DB] space-y-2">
              <div className="flex items-center gap-2">
                {selectedReview.status === "FLAGGED" && (
                  <button
                    onClick={() => handleApproveFlagged(selectedReview.id)}
                    className="flex-1 py-2 px-3 rounded-[8px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] hover:bg-[#A7F3D0]/40 font-medium text-xs transition-colors"
                  >
                    Clear &amp; Publish
                  </button>
                )}
                {selectedReview.status !== "REMOVED" ? (
                  <button
                    onClick={() => setDeleteModalReview(selectedReview)}
                    className="flex-1 py-2 px-3 rounded-[8px] bg-[#FEF2F2] text-[#DA1E28] border border-[#ffdad6] hover:bg-[#DA1E28] hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Review</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs text-[#6B6667] italic">
                    This review is removed from the catalog.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#E4E0DB] rounded-[10px] p-8 text-center text-[#6B6667]">
            <MessageSquare className="w-8 h-8 text-[#6B6667] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#111111]">Select a customer review</p>
            <p className="text-xs text-[#6B6667] mt-1">Click any row to inspect feedback details.</p>
          </div>
        )}
      </section>

      {/* ================= REVIEW DELETION CONFIRMATION MODAL ================= */}
      {deleteModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF2F2] text-[#DA1E28] flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111111]">Remove Customer Review?</h4>
                  <p className="text-xs text-[#6B6667]">Content Moderation</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalReview(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] space-y-2 text-xs">
              <p className="text-[#111111] leading-snug">
                This action will hide the review by <strong>{deleteModalReview.customerName}</strong> for <strong>{deleteModalReview.productTitle}</strong> ({deleteModalReview.rating}★) from the public catalog.
              </p>
              <div className="p-2 bg-white rounded-[6px] border border-[#E4E0DB] text-[#6B6667] italic text-[11px]">
                &ldquo;{deleteModalReview.comment}&rdquo;
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setDeleteModalReview(null)}
                className="h-8 px-3 border border-[#E4E0DB] rounded-[8px] font-medium text-xs text-[#111111] hover:bg-[#F7F7F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-8 px-3.5 bg-[#DA1E28] text-white rounded-[8px] font-medium text-xs hover:bg-[#b91c1c] transition-colors shadow-xs"
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
