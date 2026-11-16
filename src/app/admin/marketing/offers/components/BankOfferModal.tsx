"use client";

import React, { useState } from "react";
import { X, Tag, Palette, ShieldCheck, Eye } from "lucide-react";
import { api } from "@/lib/api";
import type { BankOffer, CreateBankOfferInput } from "@/types/marketing";

interface BankOfferModalProps {
  offer?: BankOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const COLOR_PRESETS = [
  { name: "Axis Burgundy", hex: "#861F41" },
  { name: "HDFC Blue", hex: "#004C8F" },
  { name: "ICICI Crimson", hex: "#B02A30" },
  { name: "SBI Green", hex: "#138808" },
  { name: "OneCard Metal", hex: "#18181B" },
  { name: "Kotak Red", hex: "#ED1C24" },
  { name: "Amex Charcoal", hex: "#262626" },
  { name: "KudiCart Orange", hex: "#E05A47" },
];

export function BankOfferModal({
  offer,
  isOpen,
  onClose,
  onSaved,
}: BankOfferModalProps) {
  const isEditing = Boolean(offer);

  const [bankName, setBankName] = useState(offer?.bankName || "");
  const [badgeBgColor, setBadgeBgColor] = useState(offer?.badgeBgColor || "#861F41");
  const [title, setTitle] = useState(offer?.title || "");
  const [subtitle, setSubtitle] = useState(offer?.subtitle || "");
  const [code, setCode] = useState(offer?.code || "");
  const [discountText, setDiscountText] = useState(offer?.discountText || "");
  const [minSpendText, setMinSpendText] = useState(offer?.minSpendText || "");
  const [details, setDetails] = useState(offer?.details || "");
  const [termsUrl, setTermsUrl] = useState(offer?.termsUrl || "");
  const [displayOrder, setDisplayOrder] = useState(offer?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(offer?.isActive ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !title.trim() || !discountText.trim() || !details.trim()) {
      setError("Please fill in Bank Name, Title, Discount Text, and Detailed Terms.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: CreateBankOfferInput = {
        bankName: bankName.trim(),
        badgeBgColor,
        title: title.trim(),
        subtitle: subtitle.trim(),
        code: code.trim() || undefined,
        discountText: discountText.trim(),
        minSpendText: minSpendText.trim() || undefined,
        details: details.trim(),
        termsUrl: termsUrl.trim() || undefined,
        displayOrder: Number(displayOrder),
        isActive,
      };

      if (isEditing && offer) {
        await api.marketing.updateBankOffer(offer.id, payload);
      } else {
        await api.marketing.createBankOffer(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save bank offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-[#E4E0DB] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E0DB] px-6 py-4 bg-[#F4F1EA]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E05A47] text-white">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2C2B29]">
                {isEditing ? "Edit Partner Bank Offer" : "New Partner Bank Offer"}
              </h2>
              <p className="text-xs text-[#6E6B65]">
                Configure real-time instant discounts, ticker badges, and terms copy.
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Left Inputs */}
            <div className="space-y-4 md:col-span-7">
              {/* Bank Name & Coupon Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Bank / Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AXIS BANK"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] font-bold focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AXIS10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] font-mono uppercase focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                  Card Headline / Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10% INSTANT DISCOUNT*"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                  Subtitle / Card Qualification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. On Axis Bank Credit Cards • Min Spend ₹2,499"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                />
              </div>

              {/* Discount Text & Min Spend */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Discount Highlight *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10% OFF up to ₹1,000"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                    Minimum Spend
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,499"
                    value={minSpendText}
                    onChange={(e) => setMinSpendText(e.target.value)}
                    className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Customization */}
              <div className="space-y-2 rounded-xl border border-[#E4E0DB] bg-[#FAF8F5] p-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">
                    Bank Badge Color
                  </label>
                  <span className="font-mono text-xs text-[#2C2B29]">{badgeBgColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setBadgeBgColor(p.hex)}
                      title={p.name}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        badgeBgColor.toLowerCase() === p.hex.toLowerCase()
                          ? "scale-110 border-[#2C2B29] shadow"
                          : "border-white hover:scale-105"
                      }`}
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={badgeBgColor}
                    onChange={(e) => setBadgeBgColor(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Details Terms Copy */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6B65] mb-1">
                  Full Terms & Conditions Copy *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe full terms shown in customer app terms modal..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
                />
              </div>

              {/* Display Order & Active */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[#6E6B65]">Display Order:</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded border border-[#D5D0C7] px-2 py-1 text-xs text-[#2C2B29]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="offerActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-[#E05A47] focus:ring-[#E05A47]"
                  />
                  <label htmlFor="offerActive" className="text-xs font-medium text-[#2C2B29]">
                    Active Live
                  </label>
                </div>
              </div>
            </div>

            {/* Right Preview */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#E4E0DB] pt-6 md:pt-0 md:pl-6 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">
                <Eye className="h-4 w-4 text-[#E05A47]" />
                <span>Live Card Preview</span>
              </div>

              {/* Simulated Customer App Ticker Strip */}
              <div
                className="w-full max-w-[280px] rounded-2xl p-4 text-white shadow-lg transition-all"
                style={{ backgroundColor: badgeBgColor }}
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase">
                    {bankName || "BANK NAME"}
                  </span>
                  {code && (
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider">
                      {code}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-extrabold uppercase leading-tight">
                  {title || "10% INSTANT DISCOUNT*"}
                </h4>
                <p className="text-[11px] text-white/80 mt-1 line-clamp-2">
                  {subtitle || "On qualified bank cards"}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                  <span className="font-semibold text-white/90">
                    {discountText || "10% OFF"}
                  </span>
                  <span className="text-white/70">
                    Min: {minSpendText || "None"}
                  </span>
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
