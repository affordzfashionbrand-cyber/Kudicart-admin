"use client";

import React, { useState } from "react";
import { X, Upload, Image as ImageIcon, Sparkles, Calendar, Layers, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { DeepLinkSelector } from "./DeepLinkSelector";
import type { BannerPlacement, CreateBannerInput, DeepLinkActionType, HomeBanner } from "@/types/marketing";

interface BannerModalProps {
  banner?: HomeBanner | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function BannerModal({
  banner,
  isOpen,
  onClose,
  onSaved,
}: BannerModalProps) {
  const isEditing = Boolean(banner);

  const [placement, setPlacement] = useState<BannerPlacement>(
    banner?.placement || "HERO_CAROUSEL"
  );
  const [tag, setTag] = useState(banner?.tag || "");
  const [title1, setTitle1] = useState(banner?.title1 || "");
  const [title2, setTitle2] = useState(banner?.title2 || "");
  const [discountText, setDiscountText] = useState(banner?.discountText || "");
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || "");
  const [mobileImageUrl, setMobileImageUrl] = useState(banner?.mobileImageUrl || "");
  const [targetGender, setTargetGender] = useState(banner?.targetGender || "All");
  const [displayOrder, setDisplayOrder] = useState(banner?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [startDate, setStartDate] = useState(
    banner?.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : ""
  );
  const [endDate, setEndDate] = useState(
    banner?.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ""
  );

  // Deep Link States
  const [actionType, setActionType] = useState<DeepLinkActionType>(
    banner?.actionType || "CATEGORY"
  );
  const [actionValue, setActionValue] = useState<string | undefined>(
    banner?.actionValue || undefined
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    banner?.categoryId || undefined
  );
  const [productId, setProductId] = useState<string | undefined>(
    banner?.productId || undefined
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const res = await api.media.upload(file);
      if (res?.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to upload banner asset.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title1.trim()) {
      setError("Heading 1 is required.");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Banner image asset URL is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: CreateBannerInput = {
        placement,
        tag: tag.trim() || undefined,
        title1: title1.trim(),
        title2: title2.trim() || undefined,
        discountText: discountText.trim() || undefined,
        imageUrl: imageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim() || undefined,
        targetGender,
        actionType,
        actionValue: actionValue || undefined,
        categoryId: categoryId || undefined,
        productId: productId || undefined,
        displayOrder: Number(displayOrder),
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };

      if (isEditing && banner) {
        await api.marketing.updateBanner(banner.id, payload);
      } else {
        await api.marketing.createBanner(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to persist banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-[#E4E0DB] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E0DB] px-6 py-4 bg-[#F4F1EA]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E05A47] text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2C2B29]">
                {isEditing ? "Edit Marketing Banner" : "New Campaign Banner"}
              </h2>
              <p className="text-xs text-[#6E6B65]">
                Configure real-time promotional banners, target placements, and deep links.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6E6B65] hover:bg-white hover:text-[#2C2B29] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-[#F5C2C7] bg-[#F8D7DA] p-3 text-xs text-[#842029]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Form Details */}
            <div className="space-y-4 lg:col-span-7">
              {/* Placement & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Placement
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as BannerPlacement)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  >
                    <option value="HERO_CAROUSEL">Hero Carousel (Top)</option>
                    <option value="EDITORIAL_STRIP">Editorial Strip</option>
                    <option value="MODERN_REDEFINED">Modern Redefined</option>
                    <option value="PROMO_POPUP">Promo Popup Modal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Target Gender
                  </label>
                  <select
                    value={targetGender}
                    onChange={(e) => setTargetGender(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  >
                    <option value="All">All Audiences</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              {/* Tag / Eyebrow & Discount Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Tag / Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DROP_04 • 00:28 or TODAY'S LOOK."
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] placeholder-[#A09C94] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Discount Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 30% OFF"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] placeholder-[#A09C94] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
              </div>

              {/* Heading 1 & Heading 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Title 1 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fashion,"
                    value={title1}
                    onChange={(e) => setTitle1(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] placeholder-[#A09C94] focus:border-[#E05A47] focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Title 2 (Italic / Accent)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. now."
                    value={title2}
                    onChange={(e) => setTitle2(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] placeholder-[#A09C94] focus:border-[#E05A47] focus:outline-none font-serif italic"
                  />
                </div>
              </div>

              {/* Image Asset Uploader */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">
                  Desktop & Tablet Image Asset *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://res.cloudinary.com/.../banner.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] placeholder-[#A09C94] focus:border-[#E05A47] focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 rounded-lg border border-[#D5D0C7] bg-[#F4F1EA] px-3 py-2 text-xs font-medium text-[#2C2B29] hover:bg-[#EBE7DF] cursor-pointer transition-colors shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-[#A09C94]">
                  Recommended ratio: 16:9 or 21:9 (1200x675px). Direct Cloudinary CDN URLs supported.
                </p>
              </div>

              {/* Deep Link Selector */}
              <DeepLinkSelector
                actionType={actionType}
                actionValue={actionValue}
                categoryId={categoryId}
                productId={productId}
                onChange={(data) => {
                  setActionType(data.actionType);
                  setActionValue(data.actionValue);
                  setCategoryId(data.categoryId);
                  setProductId(data.productId);
                }}
              />

              {/* Scheduling & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Live Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-xs text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-xs text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D5D0C7] text-[#E05A47] focus:ring-[#E05A47]"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-[#2C2B29]">
                  Publish this banner live immediately
                </label>
              </div>
            </div>

            {/* Right Column: Live Mobile Preview Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-start border-t lg:border-t-0 lg:border-l border-[#E4E0DB] pt-6 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-3">
                <Eye className="h-4 w-4 text-[#E05A47]" />
                <span>Mobile App Live Preview</span>
              </div>

              {/* Mobile Phone Simulation Frame */}
              <div className="w-full max-w-[320px] rounded-[32px] border-[6px] border-[#2C2B29] bg-[#121212] p-3 shadow-xl">
                {/* Speaker notch */}
                <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-[#3A3835]" />

                {/* Simulated Screen */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#1E1E1E]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-[#A09C94] p-4 text-center">
                      <ImageIcon className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-[11px]">Upload an image to see live preview</p>
                    </div>
                  )}

                  {/* Gradient Overlay & Editorial Typography */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    {tag && (
                      <span className="mb-1 inline-block text-[9px] font-bold tracking-widest text-[#FFD180] uppercase">
                        {tag}
                      </span>
                    )}
                    <h3 className="text-lg font-bold leading-tight">
                      {title1 || "Fashion,"}{" "}
                      <span className="font-serif italic font-normal text-[#F4F1EA]">
                        {title2 || "now."}
                      </span>
                    </h3>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-medium backdrop-blur-sm">
                        {targetGender}
                      </span>
                      <span className="text-[9px] text-white/70">
                        {actionType !== "NONE" ? `Tap: ${actionType}` : "Info only"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-center">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-4 rounded-full bg-[#E05A47]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E4E0DB] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D5D0C7] bg-white px-4 py-2 text-xs font-medium text-[#6E6B65] hover:bg-[#F4F1EA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#E05A47] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#D04C39] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create & Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
