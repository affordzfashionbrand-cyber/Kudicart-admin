"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Upload,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { HomeBanner } from "@/types/marketing";

export default function VendorBannersPage() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Submission modal/form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [placement, setPlacement] = useState<"HERO_CAROUSEL" | "EDITORIAL_STRIP" | "MODERN_REDEFINED">("HERO_CAROUSEL");
  const [targetGender, setTargetGender] = useState("All");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadBanners = useCallback(async () => {
    try {
      setError(null);
      const res = await adminApi.vendorPortal.getBanners();
      setBanners(res?.banners || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load promotional banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Banner image must be smaller than 5MB.");
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const res = await adminApi.vendorPortal.uploadMedia(file);
      if (res?.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setError(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setError("Banner title and image are required.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await adminApi.vendorPortal.createBanner({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        discountText: discountText.trim() || undefined,
        imageUrl: imageUrl.trim(),
        placement,
        targetGender,
      });
      setTitle("");
      setSubtitle("");
      setDiscountText("");
      setImageUrl("");
      setIsFormOpen(false);
      setToast("Banner submitted for Central Admin approval.");
      setTimeout(() => setToast(null), 4000);
      await loadBanners();
    } catch (err: any) {
      setError(err?.message || "Failed to submit banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (banner: HomeBanner) => {
    if (!confirm(`Delete banner "${banner.title1}"?`)) return;
    try {
      await adminApi.vendorPortal.deleteBanner(banner.id);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete banner.");
    }
  };

  const pendingCount = banners.filter((b) => b.status === "PENDING").length;
  const approvedCount = banners.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = banners.filter((b) => b.status === "REJECTED").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111111] tracking-tight">
            Promotional Banners
          </h1>
          <p className="text-xs text-[#6B6667] mt-1">
            Submit boutique campaign banners for Central Admin review. Approved banners appear on the Customer App home screen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadBanners()}
            className="h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-white text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFormOpen((v) => !v)}
            className="h-9 px-4 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Banner</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-xs font-medium text-[#20885A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-xs font-medium text-[#991B1B]">
          {error}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-[10px] border border-[#E4E0DB] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">Submitted</p>
          <p className="text-2xl font-bold text-[#111111] mt-1">{banners.length}</p>
        </div>
        <div className="rounded-[10px] border border-[#E4E0DB] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">Pending Review</p>
          <p className="text-2xl font-bold text-[#B45309] mt-1">{pendingCount}</p>
        </div>
        <div className="rounded-[10px] border border-[#E4E0DB] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">Approved &amp; Live</p>
          <p className="text-2xl font-bold text-[#20885A] mt-1">{approvedCount}</p>
        </div>
        <div className="rounded-[10px] border border-[#E4E0DB] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">Needs Revision</p>
          <p className="text-2xl font-bold text-[#DC2626] mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Upload Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-[12px] border border-[#E4E0DB] bg-white p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
              <h2 className="text-sm font-semibold text-[#111111]">Submit Promotional Banner</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-[#6B6667] hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">
                Banner Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Festive Silk Collection"
                className="w-full h-9 px-3 text-xs rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">
                Subtitle / Accent Line
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Handcrafted weaves delivered fast"
                className="w-full h-9 px-3 text-xs rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">
                Discount / Offer Text
              </label>
              <input
                type="text"
                value={discountText}
                onChange={(e) => setDiscountText(e.target.value)}
                placeholder="e.g. FLAT 30% OFF"
                className="w-full h-9 px-3 text-xs rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Placement</label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as any)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-[#E4E0DB] bg-white focus:border-[#FF5A1F] focus:outline-none"
                >
                  <option value="HERO_CAROUSEL">Home Hero Carousel</option>
                  <option value="EDITORIAL_STRIP">Editorial Strip</option>
                  <option value="MODERN_REDEFINED">Feature Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Audience</label>
                <select
                  value={targetGender}
                  onChange={(e) => setTargetGender(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-[#E4E0DB] bg-white focus:border-[#FF5A1F] focus:outline-none"
                >
                  <option value="All">All</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">
              Banner Image * (Upload or paste URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 h-9 px-3 text-xs rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] focus:outline-none"
              />
              <label className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F4F1EA] hover:bg-[#EAE6DD] text-xs font-medium text-[#111111] flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? "Uploading..." : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {imageUrl && (
            <div className="rounded-[10px] border border-[#E4E0DB] overflow-hidden max-w-md relative aspect-[16/9] bg-[#111111]">
              <img src={imageUrl} alt={title || "Banner preview"} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                {discountText && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD180]">
                    {discountText}
                  </span>
                )}
                <p className="text-base font-bold leading-tight">{title || "Banner Preview"}</p>
                {subtitle && <p className="text-xs text-white/80 mt-0.5">{subtitle}</p>}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="h-9 px-5 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      )}

      {/* Submitted Banners List */}
      {loading ? (
        <div className="rounded-[10px] border border-[#E4E0DB] bg-white p-10 text-center text-xs text-[#6B6667]">
          Loading promotional banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#D5D0C7] bg-[#FAF8F5] p-10 text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-[#A09C94] mx-auto" />
          <p className="text-sm font-semibold text-[#111111]">No promotional banners submitted yet</p>
          <p className="text-xs text-[#6B6667]">
            Upload a campaign banner to promote your boutique collections on the customer home screen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => {
            const status = banner.status || "PENDING";
            return (
              <div
                key={banner.id}
                className="rounded-[10px] border border-[#E4E0DB] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-20 w-32 rounded-[8px] overflow-hidden border border-[#E4E0DB] bg-[#F4F1EA] shrink-0">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title1}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#111111]">
                        {banner.title1} {banner.title2 ? `— ${banner.title2}` : ""}
                      </h3>
                      {status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      {status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved &amp; Live
                        </span>
                      )}
                      {status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B6667]">
                      {banner.discountText && (
                        <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-semibold">
                          {banner.discountText}
                        </span>
                      )}
                      <span>Placement: {banner.placement}</span>
                      <span>• Audience: {banner.targetGender}</span>
                    </div>

                    {status === "REJECTED" && banner.rejectionComment && (
                      <div className="mt-1.5 rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-xs text-[#991B1B]">
                        <span className="font-semibold">Admin Comment:</span> {banner.rejectionComment}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(banner)}
                  className="self-end sm:self-center rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-2 text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                  title="Delete banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
