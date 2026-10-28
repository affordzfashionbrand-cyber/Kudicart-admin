"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Package,
  Lock,
  CheckCircle2,
  X,
  Shield,
  Volume2,
  Printer,
  SlidersHorizontal,
} from "lucide-react";

export default function VendorSettingsPage() {
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoPrintInvoice, setAutoPrintInvoice] = useState(false);
  const [tamperProofTagEnforced, setTamperProofTagEnforced] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kudicart_vendor_prefs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.soundAlerts !== undefined) setSoundAlerts(parsed.soundAlerts);
        if (parsed.autoPrintInvoice !== undefined) setAutoPrintInvoice(parsed.autoPrintInvoice);
        if (parsed.tamperProofTagEnforced !== undefined) setTamperProofTagEnforced(parsed.tamperProofTagEnforced);
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveSetting = (key: string, value: boolean) => {
    const updated = {
      soundAlerts: key === "soundAlerts" ? value : soundAlerts,
      autoPrintInvoice: key === "autoPrintInvoice" ? value : autoPrintInvoice,
      tamperProofTagEnforced: key === "tamperProofTagEnforced" ? value : tamperProofTagEnforced,
    };
    try {
      localStorage.setItem("kudicart_vendor_prefs", JSON.stringify(updated));
      setFeedback("Boutique preference saved.");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      // Ignore
    }
  };

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
            Store fulfillment alerts, tamper packaging standards, and operational preferences.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Fulfillment Preferences */}
        <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
            <SlidersHorizontal className="w-4 h-4 text-[#FF5A1F]" />
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Fulfillment &amp; Dispatch Preferences
            </h2>
          </div>

          <div className="space-y-3">
            {/* Toggle 1: Sound alert */}
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
                    Play notification audio when a new customer order or Try &amp; Buy request arrives.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSoundAlerts(!soundAlerts);
                  saveSetting("soundAlerts", !soundAlerts);
                }}
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

            {/* Toggle 2: Tamper packaging tag */}
            <div className="flex items-center justify-between p-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F9F9F7]">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-[6px] bg-[#F4F1EA] text-[#111111] mt-0.5">
                  <Package className="w-4 h-4 text-[#6B6667]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#111111] block">
                    Enforce Tamper-Evident Security Seal Tag
                  </span>
                  <span className="text-[11px] text-[#6B6667] block mt-0.5">
                    Mandate that packing satchels are sealed with barcode security seals before marking READY_FOR_PICKUP.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTamperProofTagEnforced(!tamperProofTagEnforced);
                  saveSetting("tamperProofTagEnforced", !tamperProofTagEnforced);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tamperProofTagEnforced ? "bg-[#FF5A1F]" : "bg-[#E4E0DB]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tamperProofTagEnforced ? "translate-x-5" : "translate-x-0"
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
                <span>Vendor Access Boundaries</span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#C9822E] border border-[#FDE68A] text-[10px] font-medium">
                  ISOLATION NOTICE
                </span>
              </h3>
              <p className="text-xs text-[#5B4038] leading-relaxed">
                Vendor accounts are strictly scoped to their certified store catalog and orders. Fleet assignment, delivery routing, and marketplace commission terms are governed centrally by KudiCart Operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
