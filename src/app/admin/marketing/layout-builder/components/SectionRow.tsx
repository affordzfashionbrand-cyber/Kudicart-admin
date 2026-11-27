"use client";

import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import type {
  CreateSectionItemInput,
  DeepLinkActionType,
  HomeSectionConfig,
  HomeSectionItem,
} from "@/types/marketing";

interface SectionRowProps {
  section: HomeSectionConfig;
  onUpdate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function SectionRow({
  section,
  onUpdate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SectionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.title || "");
  const [subtitle, setSubtitle] = useState(section.subtitle || "");

  // Flash Drop / Sale Countdown Config State
  const existingMeta = (section.metadata && typeof section.metadata === "object" ? section.metadata : {}) as Record<string, any>;
  const [isEditingFlashSale, setIsEditingFlashSale] = useState(false);
  const [flashEndsAt, setFlashEndsAt] = useState(
    existingMeta.endsAt ? new Date(existingMeta.endsAt).toISOString().slice(0, 16) : ""
  );
  const [flashMinutes, setFlashMinutes] = useState(String(existingMeta.endsInMinutes ?? 45));
  const [flashBadgeText, setFlashBadgeText] = useState(String(existingMeta.badgeText || "DROP_04 • LIVE"));
  const [notifyCustomers, setNotifyCustomers] = useState(true);
  const [savingFlashSale, setSavingFlashSale] = useState(false);

  const isFlashDrop = section.sectionKey === "FLASH_DROP";

  // Add Item Modal / Inline Form
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemTitle, setItemTitle] = useState("");
  const [itemSubtitle, setItemSubtitle] = useState("");
  const [itemBadge, setItemBadge] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemActionType, setItemActionType] = useState<DeepLinkActionType>("CATEGORY");
  const [itemActionValue, setItemActionValue] = useState("");
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const handleToggleEnable = async () => {
    try {
      await api.marketing.updateSection(section.sectionKey, {
        isEnabled: !section.isEnabled,
      });
      onUpdate();
    } catch (err: any) {
      alert(`Failed to update section: ${err.message}`);
    }
  };

  const handleSaveTitle = async () => {
    try {
      await api.marketing.updateSection(section.sectionKey, {
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
      });
      setIsEditingTitle(false);
      onUpdate();
    } catch (err: any) {
      alert(`Failed to update titles: ${err.message}`);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemImageUrl.trim()) {
      alert("Please provide an item title and image asset URL.");
      return;
    }

    try {
      setIsSubmittingItem(true);
      await api.marketing.addSectionItem(section.sectionKey, {
        title: itemTitle.trim(),
        subtitle: itemSubtitle.trim() || undefined,
        badge: itemBadge.trim() || undefined,
        imageUrl: itemImageUrl.trim(),
        actionType: itemActionType,
        actionValue: itemActionValue.trim() || undefined,
        displayOrder: (section.items?.length || 0) + 1,
      });

      setItemTitle("");
      setItemSubtitle("");
      setItemBadge("");
      setItemImageUrl("");
      setItemActionValue("");
      setIsAddingItem(false);
      onUpdate();
    } catch (err: any) {
      alert(`Failed to add item: ${err.message}`);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this curated item?")) return;
    try {
      await api.marketing.deleteSectionItem(itemId);
      onUpdate();
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  const handleSaveFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingFlashSale(true);
      const parsedMinutes = Math.max(1, parseInt(flashMinutes, 10) || 45);
      await api.marketing.updateSection(section.sectionKey, {
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        isEnabled: true,
        metadata: {
          ...existingMeta,
          endsAt: flashEndsAt ? new Date(flashEndsAt).toISOString() : null,
          endsInMinutes: parsedMinutes,
          badgeText: flashBadgeText.trim() || "DROP_04 • LIVE",
          notifyCustomers,
          updatedAt: new Date().toISOString(),
        },
      });
      setIsEditingFlashSale(false);
      onUpdate();
    } catch (err: any) {
      alert(`Failed to update flash drop schedule: ${err.message}`);
    } finally {
      setSavingFlashSale(false);
    }
  };

  const hasCuratedItems =
    section.sectionKey === "BUDGET_STORES" ||
    section.sectionKey === "TREND_RADAR" ||
    section.sectionKey === "TRENDING_CITY" ||
    section.sectionKey === "BRAND_SPOTLIGHT" ||
    section.sectionKey === "CURATED_DEALS" ||
    section.sectionKey === "LUXE_WEEKEND";

  return (
    <div className="rounded-xl border border-[#E4E0DB] bg-white shadow-sm overflow-hidden transition-all">
      {/* Main Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        {/* Order & Title */}
        <div className="flex items-center gap-3 flex-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF8F5] text-xs font-bold text-[#6E6B65] border border-[#E4E0DB]">
            #{section.displayOrder}
          </span>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2C2B29]">{section.displayName}</h3>
              <span className="rounded bg-[#F4F1EA] px-2 py-0.5 font-mono text-[10px] text-[#6E6B65]">
                {section.sectionKey}
              </span>
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Public Section Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded border border-[#D5D0C7] px-2 py-1 text-xs text-[#2C2B29]"
                />
                <input
                  type="text"
                  placeholder="Public Subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="rounded border border-[#D5D0C7] px-2 py-1 text-xs text-[#2C2B29]"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="rounded bg-[#E05A47] px-2.5 py-1 text-xs font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="text-xs text-[#6E6B65] hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit public title and subtitle"
                className="text-xs text-[#6E6B65] cursor-pointer hover:text-[#2C2B29] hover:underline"
              >
                {section.title || "No Title"} •{" "}
                <span className="italic">{section.subtitle || "No Subtitle"}</span>
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isFlashDrop && (
            <button
              type="button"
              onClick={() => setIsEditingFlashSale(!isEditingFlashSale)}
              className="flex items-center gap-1 rounded-lg border border-[#FFD9CC] bg-[#FFF0E8] px-2.5 py-1 text-xs font-semibold text-[#D94B17] hover:bg-[#FFE3D3] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sale Timer &amp; Notify</span>
            </button>
          )}
          {/* Curated Items toggle button */}
          {hasCuratedItems && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 rounded-lg border border-[#D5D0C7] bg-[#FAF8F5] px-2.5 py-1 text-xs font-medium text-[#6E6B65] hover:bg-[#F4F1EA] transition-colors"
            >
              <span>{section.items?.length || 0} Items</span>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}

          {/* Reorder Up/Down */}
          <div className="flex items-center rounded-lg border border-[#E4E0DB] bg-[#FAF8F5] p-0.5">
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              title="Move Up"
              className="p-1 text-[#6E6B65] hover:text-[#2C2B29] disabled:opacity-30 transition-colors"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              title="Move Down"
              className="p-1 text-[#6E6B65] hover:text-[#2C2B29] disabled:opacity-30 transition-colors"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          {/* Status Toggle */}
          <button
            type="button"
            onClick={handleToggleEnable}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              section.isEnabled
                ? "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]"
                : "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]"
            }`}
          >
            {section.isEnabled ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Enabled</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                <span>Disabled</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Flash Drop Sale Countdown & Notification Editor */}
      {isFlashDrop && isEditingFlashSale && (
        <form
          onSubmit={handleSaveFlashSale}
          className="border-t border-[#E4E0DB] bg-[#FFF8F5] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D94B17]">
              Flash Drop / Sale Schedule &amp; Customer Push Alert
            </h4>
            <button
              type="button"
              onClick={() => setIsEditingFlashSale(false)}
              className="text-xs text-[#6E6B65] hover:underline"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">
                Sale End Date &amp; Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={flashEndsAt}
                onChange={(e) => setFlashEndsAt(e.target.value)}
                className="w-full rounded border border-[#D5D0C7] bg-white px-2.5 py-1.5 text-xs text-[#2C2B29]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">
                Fallback Countdown (Minutes)
              </label>
              <input
                type="number"
                min={1}
                value={flashMinutes}
                onChange={(e) => setFlashMinutes(e.target.value)}
                className="w-full rounded border border-[#D5D0C7] bg-white px-2.5 py-1.5 text-xs text-[#2C2B29]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">
                Drop Pill Badge
              </label>
              <input
                type="text"
                value={flashBadgeText}
                onChange={(e) => setFlashBadgeText(e.target.value)}
                placeholder="e.g. DROP_04 • LIVE"
                className="w-full rounded border border-[#D5D0C7] bg-white px-2.5 py-1.5 text-xs text-[#2C2B29]"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-[#2C2B29]">
              <input
                type="checkbox"
                checked={notifyCustomers}
                onChange={(e) => setNotifyCustomers(e.target.checked)}
                className="h-4 w-4 rounded border-[#D5D0C7] text-[#E05A47]"
              />
              <span>Send push &amp; in-app notification to all customers on save</span>
            </label>
            <button
              type="submit"
              disabled={savingFlashSale}
              className="rounded-lg bg-[#E05A47] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#D04C39] disabled:opacity-50"
            >
              {savingFlashSale ? "Publishing Sale..." : "Save Sale & Notify"}
            </button>
          </div>
        </form>
      )}

      {/* Expanded Curated Items Section */}
      {isExpanded && hasCuratedItems && (
        <div className="border-t border-[#E4E0DB] bg-[#FAF8F5] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">
              Curated Items for {section.displayName}
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="flex items-center gap-1 rounded bg-[#E05A47] px-2.5 py-1 text-[11px] font-semibold text-white shadow hover:bg-[#D04C39]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Curated Item</span>
            </button>
          </div>

          {/* Add Item Form */}
          {isAddingItem && (
            <form
              onSubmit={handleAddItem}
              className="rounded-lg border border-[#D5D0C7] bg-white p-3 space-y-3 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Under ₹499"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full rounded border border-[#D5D0C7] px-2.5 py-1 text-xs text-[#2C2B29]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Daily Staples"
                    value={itemSubtitle}
                    onChange={(e) => setItemSubtitle(e.target.value)}
                    className="w-full rounded border border-[#D5D0C7] px-2.5 py-1 text-xs text-[#2C2B29]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. STEAL DEALS"
                    value={itemBadge}
                    onChange={(e) => setItemBadge(e.target.value)}
                    className="w-full rounded border border-[#D5D0C7] px-2.5 py-1 text-xs text-[#2C2B29]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    className="w-full rounded border border-[#D5D0C7] px-2.5 py-1 text-xs text-[#2C2B29]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">Action Type</label>
                  <select
                    value={itemActionType}
                    onChange={(e) => setItemActionType(e.target.value as DeepLinkActionType)}
                    className="w-full rounded border border-[#D5D0C7] px-2.5 py-1 text-xs text-[#2C2B29]"
                  >
                    <option value="SEARCH_QUERY">Search / Query</option>
                    <option value="CATEGORY">Category</option>
                    <option value="PRODUCT">Product</option>
                    <option value="BRAND">Brand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6E6B65] mb-1">Action Value</label>
                  <input
                    type="text"
                    placeholder="e.g. maxPrice=499 or Linen"
                    value={itemActionValue}
                    onChange={(e) => setItemActionValue(e.target.value)}
                    className="w-full rounded border border-[#D5D0C7] px-2.5 py-1 text-xs text-[#2C2B29]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="rounded border border-[#D5D0C7] px-3 py-1 text-xs text-[#6E6B65]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingItem}
                  className="rounded bg-[#E05A47] px-3 py-1 text-xs font-semibold text-white"
                >
                  {isSubmittingItem ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          )}

          {/* Curated Items List */}
          {section.items && section.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-[#E4E0DB] bg-white p-2.5 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-10 w-10 rounded object-cover border border-[#E4E0DB] shrink-0"
                      />
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#2C2B29] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#6E6B65] truncate">
                        {item.subtitle || item.actionValue || "No value"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#A09C94] italic">
              No curated items yet for this section. Click &ldquo;Add Curated Item&rdquo; above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
