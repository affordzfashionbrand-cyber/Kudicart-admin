"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, LayoutTemplate, Layers, CheckCircle2, Eye, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { SectionRow } from "./components/SectionRow";
import type { HomeSectionConfig } from "@/types/marketing";

export default function LayoutBuilderPage() {
  const [sections, setSections] = useState<HomeSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setError(null);
      const data = await api.marketing.getSections();
      setSections(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load homepage sections.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSections();
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const item = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = item;

    const reordered = copy.map((sec, i) => ({
      ...sec,
      displayOrder: i + 1,
    }));
    setSections(reordered);

    try {
      await api.marketing.reorderSections(
        reordered.map((s) => ({
          sectionKey: s.sectionKey,
          displayOrder: s.displayOrder,
          isEnabled: s.isEnabled,
        }))
      );
    } catch (err: any) {
      alert(`Failed to save layout order: ${err.message}`);
      fetchSections();
    }
  };

  const enabledCount = sections.filter((s) => s.isEnabled).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E05A47]">dashboard_customize</span>
            <h1 className="text-xl font-bold text-[#2C2B29]">Homepage Layout Builder</h1>
          </div>
          <p className="text-xs text-[#6E6B65] mt-1">
            Reorder vertical content sections, toggle module visibility, and configure curated items.
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
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Master Sections</p>
          <p className="text-2xl font-bold text-[#2C2B29] mt-1">{sections.length}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Active Visible</p>
          <p className="text-2xl font-bold text-[#2E7D32] mt-1">{enabledCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Payload Latency</p>
          <p className="text-sm font-semibold text-[#1E40AF] mt-2">&lt; 50ms Unified API</p>
        </div>
        <div className="rounded-xl border border-[#E4E0DB] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B65]">Cache Policy</p>
          <p className="text-sm font-semibold text-[#E05A47] mt-2">Auto-Invalidated</p>
        </div>
      </div>

      {/* Section List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#E4E0DB] bg-white">
          <RefreshCw className="h-6 w-6 animate-spin text-[#E05A47]" />
        </div>
      ) : sections.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#D5D0C7] bg-[#FAF8F5] p-6 text-center">
          <LayoutTemplate className="h-10 w-10 text-[#A09C94] mb-2" />
          <h3 className="text-sm font-semibold text-[#2C2B29]">No Sections Found</h3>
          <p className="text-xs text-[#6E6B65] mt-1">
            Section configurations will be auto-generated by the backend on first launch.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionRow
              key={section.id || section.sectionKey}
              section={section}
              onUpdate={fetchSections}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
