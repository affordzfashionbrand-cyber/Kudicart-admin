"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface OnboardVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface CategoryOption {
  id: string;
  name: string;
  level?: number;
}

export function OnboardVendorModal({
  isOpen,
  onClose,
  onSuccess,
}: OnboardVendorModalProps) {
  // Form fields
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [operatingHub, setOperatingHub] = useState("Bandra West Node");
  const [category, setCategory] = useState("Women Ethnic");

  // Category commissions: categoryId -> commission %
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [commissions, setCommissions] = useState<Record<string, number>>({});
  const [bulkCommission, setBulkCommission] = useState("");

  // Bank details (optional)
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    temporaryPassword: string;
    loginUrl: string;
    storeName: string;
  } | null>(null);

  // Load categories
  useEffect(() => {
    if (!isOpen) return;
    api.categories
      .list({ limit: 100 })
      .then((res: any) => {
        const catList = Array.isArray(res?.data) ? res.data : [];
        setCategories(catList);
        // Initialize default empty or blank commissions
        const initialMap: Record<string, number> = {};
        catList.forEach((c: any) => {
          initialMap[c.id] = initialMap[c.id] ?? 12; // default guidance 12%, fully editable
        });
        setCommissions(initialMap);
      })
      .catch((err: any) => {
        setCategories([]);
        setCommissions({});
        setError(err?.message || "Failed to load categories from backend. Please retry.");
      });
  }, [isOpen]);

  const handleApplyBulkCommission = () => {
    const rate = Number(bulkCommission);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    const updated: Record<string, number> = {};
    categories.forEach((c) => {
      updated[c.id] = rate;
    });
    setCommissions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!storeName.trim() || !ownerName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all mandatory boutique details.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Build category commissions array
    const categoryCommissions = Object.entries(commissions).map(([catId, rate]) => ({
      categoryId: catId,
      commissionRate: Number(rate) || 0,
    }));

    if (categoryCommissions.length === 0) {
      setError("Please configure at least one category commission rate.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone.slice(-10),
        address: address.trim(),
        operatingHub,
        category,
        categoryCommissions,
        ...(initialPassword.trim() ? { password: initialPassword.trim() } : {}),
      };

      if (accountNumber.trim()) {
        payload.bankDetails = {
          accountHolder: accountHolder.trim() || ownerName.trim(),
          accountNumber: accountNumber.trim(),
          ifsc: ifsc.trim().toUpperCase(),
          bankName: bankName.trim(),
          upiId: upiId.trim() || undefined,
        };
      }

      const res = await api.vendors.onboard(payload);
      if (res?.success) {
        setCreatedCredentials({
          email: res.credentials?.email || payload.email,
          temporaryPassword: res.credentials?.temporaryPassword || "Generated & Emailed",
          loginUrl: res.credentials?.loginUrl || "https://admin.kudicart.com/login",
          storeName: payload.storeName,
        });
        onSuccess(res.message || `Vendor ${payload.storeName} onboarded successfully!`);
      } else {
        throw new Error(res?.message || "Failed to onboard vendor.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during vendor onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[12px] border border-[#E4E0DB] max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto"
      >
        {createdCredentials ? (
          // Success State
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#10B981]">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#111111]">
                Boutique Onboarded Successfully!
              </h3>
              <p className="text-xs text-[#6B6667] mt-1 max-w-md mx-auto">
                <strong>{createdCredentials.storeName}</strong> has been activated. A welcome email containing portal login credentials has been sent via Nodemailer.
              </p>
            </div>

            <div className="bg-[#F7F7F5] border border-[#E4E0DB] rounded-[10px] p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">
                Generated Credentials
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E0DB]">
                <span className="text-[#6B6667]">Portal Login URL:</span>
                <span className="font-mono font-medium text-[#111111]">{createdCredentials.loginUrl}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E0DB]">
                <span className="text-[#6B6667]">Login Email:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-[#111111]">{createdCredentials.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.email);
                      setCopiedField("email");
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="text-[#6B6667] hover:text-[#FF5A1F]"
                    title="Copy Email"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedField === "email" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#6B6667]">Portal Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#FF5A1F]">{createdCredentials.temporaryPassword}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.temporaryPassword);
                      setCopiedField("password");
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="text-[#6B6667] hover:text-[#FF5A1F]"
                    title="Copy Password"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedField === "password" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedCredentials(null);
                  setStoreName("");
                  setOwnerName("");
                  setEmail("");
                  setPhone("");
                  setAddress("");
                  setInitialPassword("");
                  onClose();
                }}
                className="px-6 py-2.5 rounded-[8px] bg-[#111111] text-white font-medium text-xs hover:bg-[#333333] transition-colors"
              >
                Close & Return to Vendors List
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#111111]">
                  Onboard Boutique Partner
                </h3>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Register merchant, set category-wise commissions, and auto-dispatch login credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6667] hover:bg-[#F4F1EA] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Store & Owner Details */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">
                1. Store & Contact Coordinates
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-[#111111] mb-1">
                    Boutique / Store Name <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Ananya Silks & Coutures"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#111111] mb-1">
                    Owner / Contact Person <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#111111] mb-1">
                    Personal / Login Email <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ananya@silks.com (Receives password)"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#111111] mb-1">
                    Mobile Phone Number <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#111111] mb-1">
                    Store Registered Address <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No, Building, Street, Area, City"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#111111] mb-1">Operating Hub Node</label>
                  <input
                    type="text"
                    value={operatingHub}
                    onChange={(e) => setOperatingHub(e.target.value)}
                    placeholder="e.g. Bandra West Node"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#111111] mb-1">Primary Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Women Ethnic"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#111111] mb-1">
                    Initial Portal Password <span className="text-[#6B6667] font-normal">(Optional — min 6 chars, or leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="e.g. Vendor@1234 (visible to you on creation)"
                    className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Category-Wise Commission Setup */}
            <div className="space-y-3 border-t border-[#E4E0DB] pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6667]">
                    2. Category-Wise Commission Rates (%)
                  </div>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">
                    Set specific platform commission percentages for each product category.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bulkCommission}
                    onChange={(e) => setBulkCommission(e.target.value)}
                    placeholder="%"
                    className="w-16 h-8 px-2 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[6px] text-center"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkCommission}
                    className="h-8 px-2.5 rounded-[6px] bg-[#F4F1EA] hover:bg-[#E4E0DB] text-xs font-medium text-[#111111] transition-colors"
                  >
                    Apply to All
                  </button>
                </div>
              </div>

              <div className="bg-[#F7F7F5] border border-[#E4E0DB] rounded-[10px] p-3 max-h-48 overflow-y-auto divide-y divide-[#E4E0DB]">
                {categories.length === 0 ? (
                  <p className="text-xs text-[#6B6667] text-center py-3">Loading categories...</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#111111]">{cat.name}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          required
                          value={commissions[cat.id] ?? ""}
                          onChange={(e) =>
                            setCommissions({
                              ...commissions,
                              [cat.id]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 h-7 px-2 text-right bg-white border border-[#E4E0DB] rounded-[6px] text-[#111111] font-mono focus:outline-none focus:border-[#FF5A1F]"
                        />
                        <span className="text-[#6B6667] font-semibold">%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 3: Bank Details (Collapsible) */}
            <div className="border-t border-[#E4E0DB] pt-3">
              <button
                type="button"
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="flex items-center justify-between w-full text-xs font-semibold text-[#111111] hover:text-[#FF5A1F] transition-colors"
              >
                <span>3. Settlement Bank Account Details (Optional)</span>
                <span className="material-symbols-outlined text-[18px]">
                  {showBankDetails ? "expand_less" : "expand_more"}
                </span>
              </button>

              {showBankDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div>
                    <label className="block font-medium text-[#111111] mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Beneficiary Name"
                      className="w-full h-8 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[6px] text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#111111] mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full h-8 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[6px] text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#111111] mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account Number"
                      className="w-full h-8 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[6px] text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#111111] mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      placeholder="e.g. HDFC0001234"
                      className="w-full h-8 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[6px] text-[#111111] uppercase"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-[#111111] mb-1">UPI ID (Optional)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. ananya@okaxis"
                      className="w-full h-8 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[6px] text-[#111111]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-[8px] border border-[#E4E0DB] bg-white text-[#6B6667] font-medium text-xs hover:bg-[#F4F1EA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-[8px] bg-[#FF5A1F] text-white font-medium text-xs hover:bg-[#D94B17] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Onboarding & Sending Email...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Onboard & Send Credentials</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
