"use client";

import React, { useState } from "react";
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Edit2,
  Building2,
  FileText,
} from "lucide-react";

export default function VendorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vendor boutique state
  const [storeData, setStoreData] = useState({
    businessName: "Maison Lagos Atelier",
    tagline: "Luxury Indo-African Fusion & Artisanal Handlooms",
    storeId: "VND-0492",
    tier: "Tier 1 Verified Boutique",
    managerName: "Folake Balogun",
    managerEmail: "folake@maisonlagos.com",
    managerPhone: "+91 98201 54321",
    gstin: "27AABCU9603R1ZM",
    registeredAddress: "Plot 14, Waterfield Road, Bandra West, Mumbai 400050",
    operatingHours: "10:00 AM – 08:30 PM (Mon – Sun)",
    dispatchBay: "Slot #4 • Bandra West Node",
    preparationSla: "20 minutes average pack time",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setToastMessage("Not connected in this build: Profile changes require backend persistence.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Boutique Profile
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
              Verified Boutique
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Store identity, dispatch staging bay, and authorized contact information.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] rounded-[8px] text-xs font-medium text-[#111111] flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#6B6667]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Identity Card */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-[10px] bg-[#FFF0E8] border border-[#FF5A1F]/30 flex items-center justify-center text-[#D94B17] font-semibold text-2xl shrink-0">
            ML
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[18px] font-semibold text-[#111111]">
                {storeData.businessName}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667]">
                {storeData.storeId}
              </span>
            </div>
            <p className="text-xs text-[#6B6667] mt-1">
              {storeData.tagline}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#6B6667] flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#6B6667]" />
                Bandra West, Mumbai
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#6B6667]" />
                {storeData.dispatchBay}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs shrink-0 min-w-[200px]">
          <div className="flex justify-between items-center">
            <span className="text-[#6B6667]">Tier:</span>
            <span className="font-medium text-[#111111]">Tier 1 Boutique</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6B6667]">Fulfillment SLA:</span>
            <span className="font-medium text-[#20885A]">20m Prep Time</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6B6667]">Status:</span>
            <span className="font-medium text-[#20885A]">Active &amp; Certified</span>
          </div>
        </div>
      </div>

      {/* 2-Column Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Details Card */}
        <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
            <Store className="w-4 h-4 text-[#FF5A1F]" />
            <h3 className="text-[14px] font-semibold text-[#111111]">
              Commercial Registration
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Registered Legal Name
              </span>
              <span className="font-medium text-[#111111] mt-0.5 block">
                Maison Lagos Handlooms &amp; Apparel Private Limited
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                GSTIN Registration
              </span>
              <span className="font-mono font-medium text-[#111111] mt-0.5 block">
                {storeData.gstin}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Registered Boutique Address
              </span>
              <span className="text-[#111111] mt-0.5 block">
                {storeData.registeredAddress}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Store Operating Hours
              </span>
              <span className="text-[#111111] mt-0.5 block">
                {storeData.operatingHours}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Logistics Card */}
        <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
            <User className="w-4 h-4 text-[#FF5A1F]" />
            <h3 className="text-[14px] font-semibold text-[#111111]">
              Store Management &amp; Dispatch Point
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Store Manager Contact
              </span>
              <span className="font-medium text-[#111111] mt-0.5 block">
                {storeData.managerName}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Email Address
              </span>
              <span className="font-mono text-[#111111] mt-0.5 block">
                {storeData.managerEmail}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Direct Contact Phone
              </span>
              <span className="font-mono text-[#111111] mt-0.5 block">
                {storeData.managerPhone}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6667] font-medium block">
                Designated Fleet Handover Bay
              </span>
              <span className="text-[#111111] mt-0.5 block">
                {storeData.dispatchBay} (Dedicated Rider Handover Point)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Edit Boutique Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={storeData.businessName}
                  onChange={(e) => setStoreData({ ...storeData, businessName: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  value={storeData.tagline}
                  onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    value={storeData.managerName}
                    onChange={(e) => setStoreData({ ...storeData, managerName: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={storeData.managerPhone}
                    onChange={(e) => setStoreData({ ...storeData, managerPhone: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E0DB]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
