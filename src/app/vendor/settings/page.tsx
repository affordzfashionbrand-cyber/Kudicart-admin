"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  SlidersHorizontal,
  Volume2,
  Shield,
  CheckCircle2,
  X,
  Percent,
  Save,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export default function VendorSettingsPage() {
  const queryClient = useQueryClient();
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Store Hours State
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [schedule, setSchedule] = useState<
    Record<string, { isOpen: boolean; open: string; close: string }>
  >({
    monday: { isOpen: true, open: "10:00", close: "21:00" },
    tuesday: { isOpen: true, open: "10:00", close: "21:00" },
    wednesday: { isOpen: true, open: "10:00", close: "21:00" },
    thursday: { isOpen: true, open: "10:00", close: "21:00" },
    friday: { isOpen: true, open: "10:00", close: "21:00" },
    saturday: { isOpen: true, open: "10:00", close: "21:00" },
    sunday: { isOpen: false, open: "10:00", close: "19:00" },
  });

  const storeStatusQuery = useQuery({
    queryKey: ["vendor-store-status"],
    queryFn: () => api.vendorPortal.getStoreStatus(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (storeStatusQuery.data) {
      if (storeStatusQuery.data.autoScheduleEnabled !== undefined) {
        setAutoSchedule(Boolean(storeStatusQuery.data.autoScheduleEnabled));
      }
      if (
        storeStatusQuery.data.operatingHours &&
        typeof storeStatusQuery.data.operatingHours === "object"
      ) {
        setSchedule((prev) => ({
          ...prev,
          ...(storeStatusQuery.data.operatingHours as any),
        }));
      }
    }
  }, [storeStatusQuery.data]);

  const saveHoursMutation = useMutation({
    mutationFn: async () => {
      return api.vendorPortal.updateOperatingHours({
        operatingHours: schedule,
        autoScheduleEnabled: autoSchedule,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-store-status"] });
      setFeedback(res.message || "Operating hours saved successfully.");
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      setErrorFeedback(err?.message || "Failed to update operating hours.");
      setTimeout(() => setErrorFeedback(null), 4000);
    },
  });

  const handleDayChange = (
    day: string,
    field: "isOpen" | "open" | "close",
    val: any
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { isOpen: true, open: "10:00", close: "21:00" }),
        [field]: val,
      },
    }));
  };

  const categoryCommissions = storeStatusQuery.data?.categoryCommissions || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Boutique Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#EFF6FF] text-[#0043CE] border border-[#BFDBFE]">
              Store Configuration
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Store operating hours, order arrival alerts, and platform commission terms.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[#20885A] hover:text-[#111111]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorFeedback && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] flex items-center justify-between text-xs text-[#B91C1C]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
            <span>{errorFeedback}</span>
          </div>
          <button onClick={() => setErrorFeedback(null)} className="text-[#B91C1C] hover:text-[#111111]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Store Operating Hours & Timings */}
        <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E0DB]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF5A1F]" />
              <h2 className="text-[14px] font-semibold text-[#111111]">
                Store Timing &amp; Operating Schedule
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[#111111] cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSchedule}
                  onChange={(e) => setAutoSchedule(e.target.checked)}
                  className="rounded border-[#E4E0DB] text-[#FF5A1F] focus:ring-[#FF5A1F]"
                />
                <span>Enforce Automatic Schedule</span>
              </label>
            </div>
          </div>

          <p className="text-xs text-[#6B6667]">
            When the store is closed or outside operating hours, customers will see your products marked as{' '}
            <span className="font-semibold text-[#111111]">&ldquo;Currently unavailable. Please check back when vendor is online&rdquo;</span>.
          </p>

          <div className="divide-y divide-[#E4E0DB] border border-[#E4E0DB] rounded-[8px] overflow-hidden text-xs">
            {DAYS_OF_WEEK.map((day) => {
              const current = schedule[day.id] || { isOpen: true, open: "10:00", close: "21:00" };
              return (
                <div
                  key={day.id}
                  className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    !current.isOpen ? "bg-[#F9F9F7]" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 w-36">
                    <input
                      type="checkbox"
                      id={`day-${day.id}`}
                      checked={current.isOpen}
                      onChange={(e) => handleDayChange(day.id, "isOpen", e.target.checked)}
                      className="rounded border-[#E4E0DB] text-[#FF5A1F] focus:ring-[#FF5A1F]"
                    />
                    <label
                      htmlFor={`day-${day.id}`}
                      className={`font-semibold cursor-pointer ${
                        current.isOpen ? "text-[#111111]" : "text-[#6B6667]"
                      }`}
                    >
                      {day.label}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    {current.isOpen ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#6B6667] text-[11px]">Opens:</span>
                          <input
                            type="time"
                            value={current.open}
                            onChange={(e) => handleDayChange(day.id, "open", e.target.value)}
                            className="h-7 px-2 border border-[#E4E0DB] rounded-[6px] text-xs font-mono bg-[#F7F7F5] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                          />
                        </div>
                        <span className="text-[#6B6667]">–</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#6B6667] text-[11px]">Closes:</span>
                          <input
                            type="time"
                            value={current.close}
                            onChange={(e) => handleDayChange(day.id, "close", e.target.value)}
                            className="h-7 px-2 border border-[#E4E0DB] rounded-[6px] text-xs font-mono bg-[#F7F7F5] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                          />
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-[#B91C1C] font-medium bg-[#FEF2F2] px-2.5 py-0.5 rounded border border-[#FECACA]">
                        Closed All Day
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={saveHoursMutation.isPending}
              onClick={() => saveHoursMutation.mutate()}
              className="px-4 py-2 rounded-[8px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveHoursMutation.isPending ? "Saving..." : "Save Operating Schedule"}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Platform Commission Rates */}
        <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
            <Percent className="w-4 h-4 text-[#FF5A1F]" />
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Category-Wise Platform Commission Rates
            </h2>
          </div>

          <p className="text-xs text-[#6B6667]">
            The following category commission rates were agreed during onboarding and are authoritatively deducted 
            from gross customer payments upon fulfillment.
          </p>

          <div className="border border-[#E4E0DB] rounded-[8px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="h-8 bg-[#F7F7F5] text-[#6B6667] border-b border-[#E4E0DB]">
                  <th className="px-4 font-medium">Product Category</th>
                  <th className="px-4 font-medium text-right">Commission Claimed</th>
                  <th className="px-4 font-medium text-right">Vendor Settlement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB]">
                {categoryCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-[#6B6667]">
                      No category commission overrides found. Standard merchant terms apply.
                    </td>
                  </tr>
                ) : (
                  categoryCommissions.map((cc) => (
                    <tr key={cc.id || cc.categoryId} className="h-9 hover:bg-[#F9F9F7]">
                      <td className="px-4 font-medium text-[#111111]">{cc.categoryName}</td>
                      <td className="px-4 text-right font-mono font-semibold text-[#FF5A1F]">
                        {cc.commissionRate}%
                      </td>
                      <td className="px-4 text-right font-mono font-semibold text-[#10B981]">
                        {(100 - cc.commissionRate).toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Fulfillment & Alert Preferences */}
        <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
            <SlidersHorizontal className="w-4 h-4 text-[#FF5A1F]" />
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Fulfillment &amp; Dispatch Preferences
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F9F9F7]">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-[6px] bg-[#F4F1EA] text-[#111111] mt-0.5">
                  <Volume2 className="w-4 h-4 text-[#6B6667]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#111111] block">
                    Acoustic Order Arrival Chime
                  </span>
                  <span className="text-[11px] text-[#6B6667] block mt-0.5">
                    Play notification audio and show web alerts when a new order arrives.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundAlerts ? "bg-[#FF5A1F]" : "bg-[#E4E0DB]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    soundAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="rounded-[10px] border border-[#E4E0DB] bg-[#FFFBEB] p-5 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#FEF3C7] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-[#C9822E]" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-[14px] font-semibold text-[#111111] flex items-center gap-2">
                <span>Vendor Access Boundaries &amp; Data Privacy</span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#C9822E] border border-[#FDE68A] text-[10px] font-medium">
                  VERIFIED TENANCY
                </span>
              </h3>
              <p className="text-xs text-[#5B4038] leading-relaxed">
                Customer personal details are redacted to protect consumer privacy. Delivery dispatch is assigned centrally by KudiCart Operations, and assigned rider details will appear directly in your order detail view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
