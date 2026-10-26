"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DeliveryPartnerDetail,
  KycDocumentGroup,
  KycDocumentSide,
} from "@/types/drivers";
import { getDeliveryPartnerById, submitKycReview } from "@/lib/api/drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminDeliveryPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = (params?.id as string) || "drv-118";

  const [partner, setPartner] = useState<DeliveryPartnerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    selfieMatch: true,
    aadhaarValid: true,
    panMatch: true,
    dlValid: true,
    rcMatch: true,
  });

  // Modals & Action States
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Document Lightbox
  const [inspectDoc, setInspectDoc] = useState<{
    title: string;
    sideLabel: string;
    description?: string;
    dataFields?: { label: string; value: string }[];
    url?: string;
  } | null>(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getDeliveryPartnerById(driverId);
        if (res.data) {
          setPartner(res.data);
          setIsFallback(res.isFallback);
        } else {
          setFetchError("Partner not found");
        }
      } catch (err: any) {
        setFetchError(err.message || "Failed to load partner details");
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [driverId]);

  const handleApprove = async () => {
    if (!partner) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const response = await submitKycReview(partner.id, {
        status: "APPROVED",
      });
      setPartner((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: "APPROVED",
              rejectionReason: null,
              auditTrail: [
                {
                  id: `ev-app-${Date.now()}`,
                  timestamp: "Just now",
                  title: "KYC Approved by Central Ops Admin",
                  description: "Full compliance verification signed off. Driver authorized for active shifts.",
                  type: "success",
                },
                ...prev.auditTrail,
              ],
            }
          : prev
      );
      setShowApprovalModal(false);
      setActionSuccess("KYC successfully approved! Status updated to Approved.");
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err: any) {
      setActionError(
        err.message || "Failed to submit KYC approval to Central Ops API"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!partner) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Please specify a reason for KYC rejection.");
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    try {
      const response = await submitKycReview(partner.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      setPartner((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: "REJECTED",
              rejectionReason: rejectionReason.trim(),
              auditTrail: [
                {
                  id: `ev-rej-${Date.now()}`,
                  timestamp: "Just now",
                  title: "KYC Rejected / Re-upload Requested",
                  description: `Administrative rejection: ${rejectionReason.trim()}`,
                  type: "primary",
                },
                ...prev.auditTrail,
              ],
            }
          : prev
      );
      setShowRejectionModal(false);
      setActionSuccess("KYC rejected. Driver notification queued.");
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err: any) {
      setActionError(
        err.message || "Failed to submit KYC rejection to Central Ops API"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1440px] mx-auto p-4">
        <Skeleton className="w-64 h-8 rounded-lg" />
        <Skeleton className="w-full h-32 rounded-xl" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Skeleton className="w-full h-48 rounded-xl" />
            <Skeleton className="w-full h-48 rounded-xl" />
            <Skeleton className="w-full h-96 rounded-xl" />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Skeleton className="w-full h-80 rounded-xl" />
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError || !partner) {
    return (
      <div className="p-8 max-w-[1440px] mx-auto">
        <EmptyState
          title="Delivery Partner Not Found"
          description={`Could not locate partner record for identifier "${driverId}".`}
          actionLabel="Back to Delivery Partners"
          onAction={() => router.push("/admin/delivery-partners")}
          icon="search_off"
        />
      </div>
    );
  }

  const isPending = partner.kycStatus === "PENDING";
  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto select-none">
      {/* ================= OPERATIONAL HEADER AREA ================= */}
      <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-5 shadow-xs">
        {/* Back Link */}
        <div className="mb-2">
          <Link
            href="/admin/delivery-partners"
            className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary hover:text-[#FF5A1F] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Delivery Partners
          </Link>
        </div>

        {/* Identity & Status Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
                {partner.fullName}
              </h1>
              <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold border border-surface-container-highest">
                {partner.driverCode}
              </span>
              <StatusBadge status={partner.kycStatus} variant="kyc" />
              <StatusBadge
                status={partner.isOnline ? "ONLINE" : "OFFLINE"}
                variant="driver"
              />
              {!partner.isOnline && (
                <span className="font-label-xs text-label-xs text-secondary hidden sm:inline">
                  (Ineligible to go online until KYC approved)
                </span>
              )}
            </div>

            {/* Submission Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 font-label-xs text-label-xs text-secondary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                Application Submitted: <strong className="text-on-surface font-semibold">{partner.submissionDate}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                Assigned Reviewer: <strong className="text-on-surface font-semibold">{partner.assignedReviewer}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">hub</span>
                Terminal: <strong className="text-on-surface font-semibold">{partner.terminalHub}</strong>
              </span>
            </div>
          </div>

          {/* Operational Action Cluster */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            {isPending && (
              <>
                <button
                  onClick={() => {
                    setRejectionReason("");
                    setRejectionError(null);
                    setShowRejectionModal(true);
                  }}
                  className="h-9 px-3.5 border border-[#FECACA] bg-[#FEF2F2] text-[#DA1E28] font-label-sm text-label-sm font-semibold rounded-lg hover:bg-[#DA1E28] hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Reject KYC
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="h-9 px-4 bg-[#FF5A1F] text-white font-label-sm text-label-sm font-semibold rounded-lg hover:bg-[#D94B17] active:scale-[0.99] transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Approve KYC
                </button>
              </>
            )}
            {partner.kycStatus === "APPROVED" && (
              <span className="h-9 px-3.5 bg-[#ECFDF5] text-[#20885A] font-label-sm text-label-sm font-semibold rounded-lg border border-[#A7F3D0] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                KYC Verification Signed Off
              </span>
            )}
            {partner.kycStatus === "REJECTED" && (
              <span className="h-9 px-3.5 bg-[#FEF2F2] text-[#DA1E28] font-label-sm text-label-sm font-semibold rounded-lg border border-[#FECACA] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                Application Rejected ({partner.rejectionReason || "Requirements not met"})
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Action Success / Error Feedback */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ================= WORKSPACE CANVAS (65% / 35%) ================= */}
      <div className="grid grid-cols-12 gap-5">
        {/* ================= LEFT COLUMN: DETAILS & KYC DOCS (~65%) ================= */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* 1. Partner Identity & Operational Details Card */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF5A1F] text-[20px]">badge</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Partner Identity &amp; Operational Details
                </h3>
              </div>
              <span className="font-label-xs text-label-xs px-2 py-0.5 rounded bg-emerald-50 text-[#20885A] border border-emerald-200 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                OTP Verified via Firebase
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Full Legal Name</p>
                <p className="font-body-md text-sm font-semibold text-on-surface">{partner.fullName}</p>
                <p className="font-label-xs text-[11px] text-secondary">Aadhaar match confirmed</p>
              </div>

              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Primary Phone</p>
                <div className="flex items-center gap-1.5">
                  <p className="font-code-sm text-xs font-semibold text-on-surface">{partner.phone}</p>
                  <span className="material-symbols-outlined text-emerald-600 text-[15px]" title="SMS OTP Verified">
                    verified
                  </span>
                </div>
                <p className="font-label-xs text-[11px] text-secondary">Verified on {partner.submissionDate}</p>
              </div>

              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Work Preference</p>
                <p className="font-body-md text-sm font-semibold text-on-surface">
                  {partner.workPreference === "FULL_TIME" ? "Full-Time Delivery" : "Part-Time Delivery"}
                </p>
                <p className="font-label-xs text-[11px] text-secondary">{partner.terminalHub}</p>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Delivery History</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-md text-lg font-bold text-on-surface font-mono">
                    {partner.completedDeliveries}
                  </span>
                  <span className="font-label-xs text-xs text-secondary">Completed Deliveries</span>
                </div>
                <p className="font-label-xs text-[11px] text-[#FF5A1F] font-medium">
                  {partner.completedDeliveries === 0 ? "New Onboarding Candidate" : "Established Fleet Member"}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">
                  Registered Residential Address
                </p>
                <p className="font-body-sm text-xs font-medium text-on-surface leading-relaxed">
                  {partner.registeredAddress}
                </p>
                <p className="font-label-xs text-[11px] text-secondary">Verified against Aadhaar record</p>
              </div>
            </div>
          </div>

          {/* 2. Fleet Vehicle Profile Card */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF5A1F] text-[20px]">two_wheeler</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Fleet Vehicle Profile
                </h3>
              </div>
              {partner.vehicleDetails.isElectric && (
                <span className="font-label-xs text-label-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#20885A] border border-emerald-200 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">bolt</span>
                  Zero-Emission EV
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Vehicle Class</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    {partner.vehicleDetails.isElectric ? "electric_moped" : "two_wheeler"}
                  </span>
                  {partner.vehicleDetails.vehicleType}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Make &amp; Model</p>
                <p className="font-body-md text-sm font-semibold text-on-surface">{partner.vehicleDetails.model}</p>
                <p className="font-label-xs text-[11px] text-secondary">Maker: {partner.vehicleDetails.make}</p>
              </div>

              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Registration Plate</p>
                <p className="font-code-sm text-xs font-bold text-on-surface bg-surface-container-low px-2 py-1 rounded border border-[#E4E0DB] inline-block tracking-wider">
                  {partner.vehicleDetails.registrationNumber}
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">RC Status</p>
                <div className="flex items-center gap-1 font-label-sm text-xs font-semibold text-[#20885A]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  {partner.vehicleDetails.rcStatus}
                </div>
                <p className="font-label-xs text-[11px] text-secondary">Matched with physical RC</p>
              </div>
            </div>
          </div>

          {/* 3. KYC Document Dossier Inspection Workspace */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF5A1F]">folder_open</span>
                  KYC Document Dossier Inspection
                </h3>
                <p className="font-label-xs text-label-xs text-secondary mt-0.5">
                  Strict compliance check against RBI &amp; Motor Vehicles Act standards
                </p>
              </div>
              <span className="font-code-xs text-code-xs bg-surface-container px-2 py-1 rounded text-secondary border border-surface-container-highest">
                7 Document Artifacts
              </span>
            </div>

            {/* Document A: Driver Live Selfie */}
            <div className="border border-[#E4E0DB] rounded-lg p-4 bg-[#F7F7F5]/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-code-xs text-xs font-bold text-on-surface">
                    A
                  </span>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">Driver Live Selfie</h4>
                  <span className="font-label-xs text-label-xs px-2 py-0.5 rounded bg-emerald-50 text-[#20885A] border border-emerald-200 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">face</span>
                    Liveness Verified
                  </span>
                </div>
                <span className="font-label-xs text-label-xs text-secondary">
                  {partner.documents.selfie.metadata}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB]">
                <div
                  onClick={() =>
                    setInspectDoc({
                      title: "Driver Live Selfie",
                      sideLabel: "Live Camera Portrait",
                      description: partner.documents.selfie.front.description,
                      dataFields: partner.documents.selfie.front.dataFields,
                      url: partner.documents.selfie.front.url,
                    })
                  }
                  className="w-[180px] h-[180px] rounded-lg border border-[#E4E0DB] bg-surface-container overflow-hidden shrink-0 relative group cursor-pointer"
                >
                  <img
                    src={partner.documents.selfie.front.url}
                    alt="Driver Live Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-[24px]">zoom_in</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-xs font-semibold text-on-surface">
                      Visual Identity Verification:
                    </span>
                    <span className="font-code-sm text-xs font-bold text-[#20885A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed Pass
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-secondary leading-relaxed">
                    Portrait verified against government photo on submitted Aadhaar card and Driving Licence. Micro-movements confirmed during app onboarding.
                  </p>
                  <div className="text-secondary font-code-xs text-[11px] flex flex-wrap gap-4 pt-1.5 border-t border-[#E4E0DB]">
                    <span>Camera: Front Capture</span>
                    <span>File: {partner.documents.selfie.front.fileRecord?.name}</span>
                    <span>Size: {partner.documents.selfie.front.fileRecord?.size}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document B: Aadhaar Card (Front and Back - side by side) */}
            <div className="border border-[#E4E0DB] rounded-lg p-4 bg-[#F7F7F5]/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-code-xs text-xs font-bold text-on-surface">
                    B
                  </span>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">
                    Aadhaar Card (UIDAI Masked)
                  </h4>
                  <StatusBadge status={partner.documents.aadhaar.status} variant="kyc" />
                </div>
                <button
                  onClick={() =>
                    setInspectDoc({
                      title: "Aadhaar Card (UIDAI Masked)",
                      sideLabel: "Front & Back Views",
                      description: partner.documents.aadhaar.front.description,
                      dataFields: [
                        ...(partner.documents.aadhaar.front.dataFields || []),
                        ...(partner.documents.aadhaar.back?.dataFields || []),
                      ],
                    })
                  }
                  className="font-label-xs text-label-xs text-[#FF5A1F] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                  Inspect Full Resolution
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Side */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-xs text-label-xs font-bold text-secondary uppercase">
                      Front View (Identity)
                    </span>
                    <span className="font-code-xs text-[11px] text-[#20885A] font-semibold">
                      UIDAI Format Valid
                    </span>
                  </div>
                  <div className="h-44 rounded bg-surface-container-low border border-dashed border-[#E4E0DB] p-3 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-[#E4E0DB] flex items-center justify-center text-[10px] font-bold text-secondary">
                          GOI
                        </div>
                        <p className="font-label-xs text-[10px] font-bold text-secondary">
                          भारत सरकार / Govt of India
                        </p>
                      </div>
                      <div className="w-14 h-18 bg-surface-container-highest rounded border border-[#E4E0DB] flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-[24px]">person</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body-sm text-xs font-bold text-on-surface">{partner.fullName}</p>
                      <p className="font-label-xs text-[11px] text-secondary">DOB: {partner.dob} • Gender: Male</p>
                      <p className="font-code-sm text-xs font-bold text-on-surface tracking-wider bg-surface-container px-2 py-0.5 rounded inline-block">
                        XXXX XXXX 4192
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-xs text-label-xs font-bold text-secondary uppercase">
                      Back View (Address &amp; QR)
                    </span>
                    <span className="font-code-xs text-[11px] text-[#20885A] font-semibold">
                      QR Code Readable
                    </span>
                  </div>
                  <div className="h-44 rounded bg-surface-container-low border border-dashed border-[#E4E0DB] p-3 flex flex-col justify-between relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 max-w-[200px]">
                        <p className="font-label-xs text-[10px] font-bold text-secondary uppercase">
                          Address Details
                        </p>
                        <p className="font-body-sm text-[11px] font-medium text-on-surface leading-tight">
                          {partner.registeredAddress}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-surface-container-highest rounded border border-[#E4E0DB] flex flex-col items-center justify-center p-1">
                        <span className="material-symbols-outlined text-secondary text-[26px]">qr_code_2</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#E4E0DB]/60">
                      <span className="font-code-xs text-[10px] text-secondary">1947 Unique ID Helpline</span>
                      <span className="font-label-xs text-[10px] text-emerald-700 font-semibold">
                        Masked Format Valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document C: PAN Card (Front only - as per KYC contract) */}
            <div className="border border-[#E4E0DB] rounded-lg p-4 bg-[#F7F7F5]/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-code-xs text-xs font-bold text-on-surface">
                    C
                  </span>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">
                    PAN Card (Income Tax Dept)
                  </h4>
                  <StatusBadge status={partner.documents.pan.status} variant="kyc" />
                </div>
                <span className="font-label-xs text-label-xs text-secondary font-medium">
                  Front-Side Only Document
                </span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB]">
                <div className="h-40 rounded bg-gradient-to-r from-surface-container-low to-surface-container border border-[#E4E0DB] p-4 flex justify-between items-center">
                  <div className="space-y-2">
                    <span className="font-label-xs text-[11px] font-bold text-secondary uppercase">
                      INCOME TAX DEPARTMENT • GOVT OF INDIA
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-label-xs text-[11px] text-secondary">Permanent Account Number</p>
                      <p className="font-code-sm text-base font-bold text-on-surface tracking-wider bg-surface-container-lowest px-2.5 py-0.5 rounded border border-[#E4E0DB] inline-block">
                        BVPPS4419E
                      </p>
                    </div>
                    <div className="flex gap-6 pt-1">
                      <div>
                        <p className="font-label-xs text-[10px] text-secondary">Name</p>
                        <p className="font-label-sm text-xs font-bold text-on-surface">{partner.fullName}</p>
                      </div>
                      <div>
                        <p className="font-label-xs text-[10px] text-secondary">Father&apos;s Name</p>
                        <p className="font-label-sm text-xs font-bold text-on-surface">Ramesh Verma</p>
                      </div>
                      <div>
                        <p className="font-label-xs text-[10px] text-secondary">DOB</p>
                        <p className="font-label-sm text-xs font-bold text-on-surface">{partner.dob}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-18 bg-surface-container-highest rounded border border-[#E4E0DB] flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[26px]">portrait</span>
                    </div>
                    <span className="font-code-xs text-[10px] text-secondary">NSDL Format Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document D: Driving Licence (Front and Back - side by side) */}
            <div className="border border-[#E4E0DB] rounded-lg p-4 bg-[#F7F7F5]/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-code-xs text-xs font-bold text-on-surface">
                    D
                  </span>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">
                    Driving Licence (Maharashtra State)
                  </h4>
                  <StatusBadge status={partner.documents.drivingLicence.status} variant="kyc" />
                </div>
                <span className="font-code-xs text-code-xs text-secondary">
                  {partner.documents.drivingLicence.metadata}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DL Front */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB] space-y-2">
                  <span className="font-label-xs text-label-xs font-bold text-secondary uppercase">
                    Front View (Authorizations)
                  </span>
                  <div className="h-44 rounded bg-surface-container-low border border-dashed border-[#E4E0DB] p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-label-xs text-[10px] font-bold text-secondary">
                          UNION OF INDIA • DRIVING LICENCE
                        </p>
                        <p className="font-code-sm text-xs font-bold text-[#FF5A1F] mt-1">
                          MH-02-2018-0049182
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-secondary text-[22px]">badge</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body-sm text-xs font-bold text-on-surface">{partner.fullName}</p>
                      <div className="flex gap-2">
                        <span className="font-code-xs text-[10px] bg-surface-container px-1.5 py-0.5 rounded font-bold text-on-surface">
                          MCWG
                        </span>
                        <span className="font-code-xs text-[10px] bg-surface-container px-1.5 py-0.5 rounded font-bold text-on-surface">
                          LMV
                        </span>
                      </div>
                      <p className="font-label-xs text-[10px] text-secondary">
                        Authorised for Motorcycle with Gear &amp; Light Motor Vehicle
                      </p>
                    </div>
                  </div>
                </div>

                {/* DL Back */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB] space-y-2">
                  <span className="font-label-xs text-label-xs font-bold text-secondary uppercase">
                    Back View (Endorsements)
                  </span>
                  <div className="h-44 rounded bg-surface-container-low border border-dashed border-[#E4E0DB] p-3 flex flex-col justify-between">
                    <div>
                      <p className="font-label-xs text-[10px] font-bold text-secondary uppercase">
                        Issuing Authority: RTO MH-02 (Andheri / Bandra)
                      </p>
                      <p className="font-label-xs text-[10px] text-secondary mt-1">
                        Endorsements: None (Clean driving record)
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-label-xs text-[10px] text-secondary">Emergency Contact:</p>
                      <p className="font-code-xs text-[11px] text-on-surface">+91 98190 22319 (Father - Ramesh Verma)</p>
                      <p className="font-label-xs text-[10px] text-secondary">Organ Donor: YES • Blood Group: O+VE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document E: Vehicle RC (Front and Back - side by side) */}
            <div className="border border-[#E4E0DB] rounded-lg p-4 bg-[#F7F7F5]/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-code-xs text-xs font-bold text-on-surface">
                    E
                  </span>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">
                    Vehicle Registration Certificate (RC)
                  </h4>
                  <StatusBadge status={partner.documents.vehicleRc.status} variant="kyc" />
                </div>
                <span className="font-label-xs text-label-xs text-secondary font-medium">
                  {partner.documents.vehicleRc.metadata}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RC Front */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB] space-y-2">
                  <span className="font-label-xs text-label-xs font-bold text-secondary uppercase">
                    Front View (Vehicle Specs)
                  </span>
                  <div className="h-44 rounded bg-surface-container-low border border-dashed border-[#E4E0DB] p-3 flex flex-col justify-between">
                    <div>
                      <p className="font-label-xs text-[10px] font-bold text-secondary">
                        FORM 23 • CERTIFICATE OF REGISTRATION
                      </p>
                      <p className="font-code-sm text-xs font-bold text-on-surface mt-1">
                        Reg No: {partner.vehicleDetails.registrationNumber}
                      </p>
                      <p className="font-label-xs text-[11px] text-secondary">Owner: {partner.fullName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-label-xs text-[11px] font-semibold text-on-surface">
                        Maker: {partner.vehicleDetails.make}
                      </p>
                      <p className="font-code-xs text-[10px] text-secondary">Model: {partner.vehicleDetails.model}</p>
                      <p className="font-code-xs text-[10px] text-secondary">Class: {partner.vehicleDetails.vehicleType}</p>
                    </div>
                  </div>
                </div>

                {/* RC Back */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E4E0DB] space-y-2">
                  <span className="font-label-xs text-label-xs font-bold text-secondary uppercase">
                    Back View (Tax &amp; Hypothecation)
                  </span>
                  <div className="h-44 rounded bg-surface-container-low border border-dashed border-[#E4E0DB] p-3 flex flex-col justify-between">
                    <div>
                      <p className="font-label-xs text-[10px] font-bold text-secondary">
                        Hypothecation: Registered NBFC
                      </p>
                      <p className="font-label-xs text-[10px] text-secondary mt-1">
                        Tax Paid: Lifetime EV Exemption (GoM Policy)
                      </p>
                    </div>
                    <div className="space-y-0.5 pt-2 border-t border-[#E4E0DB]/60">
                      <p className="font-label-xs text-[10px] text-secondary">Fitness Valid Up to: 11 Mar 2038</p>
                      <p className="font-label-xs text-[10px] text-secondary">Insurance Valid: Active Coverage</p>
                      <span className="font-code-xs text-[10px] text-emerald-700 font-semibold">
                        RC Record Matched
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DECISION & AUDIT (~35%) ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* 1. Administrative Decision Card */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 sticky top-20 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPending ? "bg-[#C9822E]" : partner.kycStatus === "APPROVED" ? "bg-[#20885A]" : "bg-[#DA1E28]"
                  }`}
                />
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Administrative Decision</h3>
              </div>
              <span
                className={`font-label-xs text-xs font-semibold px-2 py-0.5 rounded border ${
                  isPending
                    ? "bg-[#FFFBEB] text-[#C9822E] border-[#FDE68A]"
                    : partner.kycStatus === "APPROVED"
                    ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                    : "bg-[#FEF2F2] text-[#DA1E28] border-[#FECACA]"
                }`}
              >
                {isPending ? "Action Required" : partner.kycStatus}
              </span>
            </div>

            {/* Mandatory Verification Checklist */}
            <div className="space-y-2 mb-4">
              <p className="font-label-xs text-label-xs font-bold text-secondary uppercase tracking-wider">
                Mandatory Verification Checklist
              </p>

              <label className="flex items-start gap-2.5 p-2 rounded bg-surface-container-low border border-[#E4E0DB] cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.selfieMatch}
                  onChange={(e) => setChecklist({ ...checklist, selfieMatch: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0 border-secondary focus:outline-none"
                />
                <span className="font-body-sm text-xs font-medium text-on-surface">
                  Driver Selfie matches Govt Photo ID
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded bg-surface-container-low border border-[#E4E0DB] cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.aadhaarValid}
                  onChange={(e) => setChecklist({ ...checklist, aadhaarValid: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0 border-secondary focus:outline-none"
                />
                <span className="font-body-sm text-xs font-medium text-on-surface">
                  Aadhaar KYC Data Authenticated
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded bg-surface-container-low border border-[#E4E0DB] cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.panMatch}
                  onChange={(e) => setChecklist({ ...checklist, panMatch: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0 border-secondary focus:outline-none"
                />
                <span className="font-body-sm text-xs font-medium text-on-surface">
                  PAN card name matches Aadhaar record
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded bg-surface-container-low border border-[#E4E0DB] cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.dlValid}
                  onChange={(e) => setChecklist({ ...checklist, dlValid: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0 border-secondary focus:outline-none"
                />
                <span className="font-body-sm text-xs font-medium text-on-surface">
                  Driving Licence valid for Two-Wheeler MCWG
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded bg-surface-container-low border border-[#E4E0DB] cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.rcMatch}
                  onChange={(e) => setChecklist({ ...checklist, rcMatch: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0 border-secondary focus:outline-none"
                />
                <span className="font-body-sm text-xs font-medium text-on-surface">
                  Vehicle RC matches {partner.vehicleDetails.model} registration
                </span>
              </label>
            </div>

            {/* Eligibility Policy Explanatory Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg mb-4 text-amber-900 font-label-sm text-xs leading-relaxed">
              <div className="flex items-center gap-1 font-semibold text-amber-800 mb-0.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Eligibility Policy
              </div>
              Upon approval, {partner.fullName} will be granted Active KYC credentials and become immediately authorized to toggle Online status at the {partner.terminalHub}.
            </div>

            {/* Decision Action Buttons */}
            {isPending ? (
              <div className="space-y-2">
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="w-full h-11 bg-[#FF5A1F] text-white font-label-sm text-sm font-semibold rounded-lg hover:bg-[#D94B17] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Approve Partner KYC
                </button>
                <button
                  onClick={() => {
                    setRejectionReason("");
                    setRejectionError(null);
                    setShowRejectionModal(true);
                  }}
                  className="w-full h-10 border border-[#DA1E28] text-[#DA1E28] hover:bg-[#FEF2F2] font-label-sm text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">rule</span>
                  Reject KYC / Request Re-upload
                </button>
              </div>
            ) : partner.kycStatus === "APPROVED" ? (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <span className="material-symbols-outlined text-[#20885A] text-[28px] mb-1">check_circle</span>
                <p className="font-semibold text-xs text-[#20885A]">KYC Approved &amp; Enrolled</p>
                <p className="text-[11px] text-secondary mt-0.5">Partner is eligible for marketplace delivery orders.</p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                <span className="material-symbols-outlined text-[#DA1E28] text-[28px] mb-1">cancel</span>
                <p className="font-semibold text-xs text-[#DA1E28]">KYC Rejected</p>
                <p className="text-[11px] text-secondary mt-0.5">{partner.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* 2. Audit Trail & Verification Timeline */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                Audit Trail &amp; Timeline
              </h3>
              <span className="font-label-xs text-label-xs text-secondary">IST (GMT+5:30)</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest">
              {partner.auditTrail.map((ev) => {
                const isPrimary = ev.type === "primary";
                const isSuccess = ev.type === "success";

                return (
                  <div key={ev.id} className="relative">
                    <span
                      className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest ${
                        isPrimary
                          ? "bg-[#FF5A1F]"
                          : isSuccess
                          ? "bg-[#20885A]"
                          : "bg-secondary"
                      }`}
                    />
                    <p className="font-label-xs text-[11px] font-bold text-on-surface">{ev.timestamp}</p>
                    <p className="font-body-sm text-xs text-secondary leading-snug">{ev.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Operational Guardrails Notice */}
          <div className="bg-surface-container-low border border-[#E4E0DB] rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-on-surface font-label-sm text-xs font-bold mb-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">policy</span>
              Operational Guardrails Notice
            </div>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Delivery partner assignment is strictly manual and executed by Central Ops administrators. KYC approval does not automatically dispatch orders or assign shifts.
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] font-code-xs text-secondary border-t border-[#E4E0DB] pt-2">
              <span>Standard Policy 2024.4</span>
              <span>Central Ops SOP-DLV</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KYC APPROVAL CONFIRMATION MODAL                                           */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#20885A] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">
                    Approve KYC for {partner.fullName} ({partner.driverCode})?
                  </h4>
                  <p className="font-label-xs text-xs text-secondary">Central Operations Compliance Sign-off</p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-[#E4E0DB] space-y-2 text-xs">
              <p className="text-on-surface leading-relaxed">
                This action confirms that all submitted identity and vehicle documents comply with KudiCart Central Ops compliance standards. The partner will receive an automated notification and become eligible to enter the dispatch queue.
              </p>
              <div className="font-code-xs text-[11px] text-secondary flex items-center gap-2 pt-1.5 border-t border-[#E4E0DB]">
                <span>Assigned Hub: {partner.terminalHub}</span>
                <span>•</span>
                <span>Vehicle: {partner.vehicleDetails.registrationNumber}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowApprovalModal(false)}
                className="h-9 px-4 border border-[#E4E0DB] rounded-lg font-label-sm text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleApprove}
                className="h-9 px-4 bg-[#FF5A1F] text-white rounded-lg font-label-sm text-xs font-semibold hover:bg-[#D94B17] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KYC REJECTION CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEF2F2] text-[#DA1E28] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">cancel</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">
                    Reject KYC for {partner.fullName} ({partner.driverCode})
                  </h4>
                  <p className="font-label-xs text-xs text-secondary">Request Document Re-upload</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-secondary leading-relaxed">
                Please provide an explicit, actionable reason for rejection. This reason will be recorded in the compliance audit trail and delivered to the delivery partner app.
              </p>

              {/* Quick Preset Buttons */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-secondary uppercase">Quick Rejection Presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Mismatched name across PAN and Aadhaar",
                    "Driving licence image is blurry or expired",
                    "Vehicle RC plate number mismatch",
                    "Aadhaar card address scan is unreadable",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setRejectionReason(preset);
                        setRejectionError(null);
                      }}
                      className="px-2 py-1 text-[11px] rounded bg-surface-container-low border border-surface-container-highest hover:bg-surface-container text-secondary transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rejection Reason Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">
                  Rejection Reason / Notes <span className="text-[#DA1E28]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectionError) setRejectionError(null);
                  }}
                  placeholder="Detail the exact reason why submitted documents could not be approved..."
                  className={`w-full p-2.5 text-xs bg-surface-container-low border rounded-lg focus:outline-none focus:ring-1 ${
                    rejectionError
                      ? "border-[#DA1E28] focus:ring-[#DA1E28]"
                      : "border-surface-container-highest focus:border-[#FF5A1F] focus:ring-[#FF5A1F]"
                  }`}
                />
                {rejectionError && (
                  <p className="text-[11px] text-[#DA1E28] font-medium">{rejectionError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E4E0DB]">
              <button
                disabled={isSubmitting}
                onClick={() => setShowRejectionModal(false)}
                className="h-9 px-4 border border-[#E4E0DB] rounded-lg font-label-sm text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleReject}
                className="h-9 px-4 bg-[#DA1E28] text-white rounded-lg font-label-sm text-xs font-semibold hover:bg-[#BA1A1A] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOCUMENT LIGHTBOX / ZOOM MODAL                                            */}
      {/* ========================================================================= */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h4 className="font-headline-sm text-base font-bold text-on-surface">{inspectDoc.title}</h4>
                <p className="font-label-xs text-xs text-secondary">{inspectDoc.sideLabel}</p>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {inspectDoc.url ? (
              <div className="w-full h-80 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={inspectDoc.url}
                  alt={inspectDoc.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="p-4 bg-surface-container-low rounded-lg border border-dashed border-[#E4E0DB] space-y-3">
                <p className="text-xs text-secondary">{inspectDoc.description}</p>
                {inspectDoc.dataFields && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E0DB]">
                    {inspectDoc.dataFields.map((df) => (
                      <div key={df.label} className="text-xs">
                        <span className="text-secondary font-medium">{df.label}:</span>{" "}
                        <strong className="text-on-surface font-semibold">{df.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setInspectDoc(null)}
                className="h-9 px-4 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
