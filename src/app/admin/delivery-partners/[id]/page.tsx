"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Calendar,
  MapPin,
  Bike,
  FileText,
  ZoomIn,
  History,
  Phone,
  Clock,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  DeliveryPartnerDetail,
} from "@/types/drivers";
import { getDemoDeliveryPartnerById } from "@/demo-data/drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

export default function AdminDeliveryPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = (params?.id as string) || "drv-118";

  const [partner, setPartner] = useState<DeliveryPartnerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
  const [actionError, setActionError] = useState<string | null>(null);

  // Document Lightbox
  const [inspectDoc, setInspectDoc] = useState<{
    title: string;
    sideLabel: string;
    description?: string;
    dataFields?: { label: string; value: string }[];
    url?: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    api.deliveryPartners.getById(driverId)
      .then((res) => {
        if (res && res.id) {
          setPartner(res);
        } else {
          const data = getDemoDeliveryPartnerById(driverId);
          if (data) setPartner(data);
          else setFetchError("Partner not found");
        }
      })
      .catch(() => {
        const data = getDemoDeliveryPartnerById(driverId);
        if (data) setPartner(data);
        else setFetchError("Partner not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [driverId]);

  const handleApprove = async () => {
    if (!partner) return;
    try {
      await api.deliveryPartners.reviewKyc(driverId, { status: "APPROVED" });
      setPartner((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: "APPROVED",
              auditTrail: [
                {
                  id: `vh-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  title: "KYC Verified",
                  description: "All identity documents verified and approved.",
                  type: "success",
                },
                ...(prev.auditTrail || []),
              ],
            }
          : null
      );
      setShowApprovalModal(false);
      setActionError(null);
    } catch (err: any) {
      setShowApprovalModal(false);
      setActionError(err?.message || "Failed to approve partner KYC.");
    }
  };

  const handleReject = async () => {
    if (!partner) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Please specify a reason for KYC rejection.");
      return;
    }
    try {
      await api.deliveryPartners.reviewKyc(driverId, {
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
                  id: `vh-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  title: "KYC Rejected",
                  description: rejectionReason.trim(),
                  type: "neutral",
                },
                ...(prev.auditTrail || []),
              ],
            }
          : null
      );
      setShowRejectionModal(false);
      setRejectionReason("");
      setActionError(null);
    } catch (err: any) {
      setShowRejectionModal(false);
      setActionError(err?.message || "Failed to reject partner KYC.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1440px] mx-auto p-4">
        <Skeleton className="w-64 h-8 rounded-[8px]" />
        <Skeleton className="w-full h-32 rounded-[10px]" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Skeleton className="w-full h-48 rounded-[10px]" />
            <Skeleton className="w-full h-48 rounded-[10px]" />
            <Skeleton className="w-full h-96 rounded-[10px]" />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Skeleton className="w-full h-80 rounded-[10px]" />
            <Skeleton className="w-full h-64 rounded-[10px]" />
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

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      {/* ================= OPERATIONAL HEADER AREA ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs">
        {/* Back Link */}
        <div className="mb-2">
          <Link
            href="/admin/delivery-partners"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#6B6667] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Partners</span>
          </Link>
        </div>

        {/* Identity & Status Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
                {partner.fullName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#111111] font-medium border border-[#E4E0DB]">
                {partner.driverCode}
              </span>
              <StatusBadge status={partner.kycStatus} variant="kyc" />
              <StatusBadge
                status={partner.isOnline ? "ONLINE" : "OFFLINE"}
                variant="driver"
              />
            </div>

            {/* Submission Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#6B6667]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Submitted: <strong className="text-[#111111] font-medium">{partner.submissionDate}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Reviewer: <strong className="text-[#111111] font-medium">{partner.assignedReviewer}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Terminal Hub: <strong className="text-[#111111] font-medium">{partner.terminalHub}</strong>
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
                  className="h-9 px-3.5 border border-[#ffdad6] bg-[#FEF2F2] text-[#DA1E28] text-xs font-medium rounded-[8px] hover:bg-[#DA1E28] hover:text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject KYC</span>
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="h-9 px-4 bg-[#FF5A1F] text-white text-xs font-medium rounded-[8px] hover:bg-[#D94B17] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve KYC</span>
                </button>
              </>
            )}
            {partner.kycStatus === "APPROVED" && (
              <span className="h-9 px-3.5 bg-[#ECFDF5] text-[#20885A] text-xs font-medium rounded-[8px] border border-[#A7F3D0] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>KYC Approved</span>
              </span>
            )}
            {partner.kycStatus === "REJECTED" && (
              <span className="h-9 px-3.5 bg-[#FEF2F2] text-[#DA1E28] text-xs font-medium rounded-[8px] border border-[#ffdad6] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>KYC Rejected</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Action Error Feedback */}
      {actionError && (
        <div className="p-3 bg-[#FEF2F2] border border-[#ffdad6] text-[#DA1E28] rounded-[8px] flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#DA1E28] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ================= WORKSPACE CANVAS (65% / 35%) ================= */}
      <div className="grid grid-cols-12 gap-5">
        {/* ================= LEFT COLUMN: DETAILS & KYC DOCS (~65%) ================= */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* 1. Partner Identity & Operational Details Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <h3 className="text-sm font-semibold text-[#111111]">
                Partner Identity &amp; Operational Details
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phone Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Full Legal Name</p>
                <p className="text-xs font-semibold text-[#111111]">{partner.fullName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Primary Phone</p>
                <div className="flex items-center gap-1.5">
                  <p className="font-mono text-xs font-medium text-[#111111]">{partner.phone}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Work Preference</p>
                <p className="text-xs font-medium text-[#111111]">
                  {partner.workPreference === "FULL_TIME" ? "Full-Time" : "Part-Time"}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Completed Deliveries</p>
                <span className="font-mono text-base font-semibold text-[#111111]">
                  {partner.completedDeliveries}
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-[11px] text-[#6B6667] font-medium">
                  Registered Residential Address
                </p>
                <p className="text-xs text-[#111111] leading-relaxed">
                  {partner.registeredAddress}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Fleet Vehicle Profile Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <h3 className="text-sm font-semibold text-[#111111]">
                Fleet Vehicle Profile
              </h3>
              {partner.vehicleDetails.isElectric && (
                <span className="text-xs px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium">
                  Electric Vehicle
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Vehicle Class</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#F4F1EA] text-[#111111] text-xs font-medium">
                  <Bike className="w-3.5 h-3.5 text-[#6B6667]" />
                  <span>{partner.vehicleDetails.vehicleType}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Make &amp; Model</p>
                <p className="text-xs font-medium text-[#111111]">{partner.vehicleDetails.model}</p>
                <p className="text-[10px] text-[#6B6667]">{partner.vehicleDetails.make}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">Registration Plate</p>
                <p className="font-mono text-xs font-medium text-[#111111] bg-[#F7F7F5] px-2 py-1 rounded-[4px] border border-[#E4E0DB] inline-block">
                  {partner.vehicleDetails.registrationNumber}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6667] font-medium">RC Status</p>
                <div className="flex items-center gap-1 text-xs font-medium text-[#20885A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{partner.vehicleDetails.rcStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. KYC Document Dossier Inspection Workspace */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">
                  KYC Document Dossier Inspection
                </h3>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Verify submitted identity credentials and vehicle documentation.
                </p>
              </div>
              <span className="font-mono text-xs bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] text-[#6B6667] border border-[#E4E0DB]">
                5 Verification Records
              </span>
            </div>

            {/* Document A: Driver Live Selfie */}
            <div className="border border-[#E4E0DB] rounded-[8px] p-4 bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    1
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Driver Portrait / Selfie</h4>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium">
                    Submitted
                  </span>
                </div>
                <span className="text-[11px] text-[#6B6667]">
                  {partner.documents.selfie.metadata}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-[8px] border border-[#E4E0DB]">
                <div
                  onClick={() =>
                    setInspectDoc({
                      title: "Driver Portrait / Selfie",
                      sideLabel: "Camera Portrait",
                      description: partner.documents.selfie.front.description,
                      dataFields: partner.documents.selfie.front.dataFields,
                      url: partner.documents.selfie.front.url,
                    })
                  }
                  className="w-[140px] h-[140px] rounded-[6px] border border-[#E4E0DB] bg-[#F7F7F5] overflow-hidden shrink-0 relative group cursor-pointer"
                >
                  <img
                    src={partner.documents.selfie.front.url}
                    alt="Driver Live Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-xs text-[#6B6667] leading-relaxed">
                    Portrait verified against photograph on government identity cards.
                  </p>
                  <div className="text-[#6B6667] font-mono text-[11px] flex flex-wrap gap-3 pt-1.5 border-t border-[#E4E0DB]">
                    <span>File: {partner.documents.selfie.front.fileRecord?.name}</span>
                    <span>Size: {partner.documents.selfie.front.fileRecord?.size}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document B: Aadhaar Card */}
            <div className="border border-[#E4E0DB] rounded-[8px] p-4 bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    2
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Aadhaar Card</h4>
                  <StatusBadge status={partner.documents.aadhaar.status} variant="kyc" />
                </div>
                <button
                  onClick={() =>
                    setInspectDoc({
                      title: "Aadhaar Card",
                      sideLabel: "Identity Details",
                      description: partner.documents.aadhaar.front.description,
                      dataFields: [
                        ...(partner.documents.aadhaar.front.dataFields || []),
                        ...(partner.documents.aadhaar.back?.dataFields || []),
                      ],
                    })
                  }
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View Details
                </button>
              </div>

              <div className="bg-white p-3 rounded-[8px] border border-[#E4E0DB] text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {partner.documents.aadhaar.front.dataFields?.map((df) => (
                    <div key={df.label}>
                      <span className="text-[#6B6667]">{df.label}:</span>{" "}
                      <strong className="text-[#111111] font-medium">{df.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Document C: PAN Card */}
            <div className="border border-[#E4E0DB] rounded-[8px] p-4 bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    3
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">PAN Card</h4>
                  <StatusBadge status={partner.documents.pan.status} variant="kyc" />
                </div>
                <button
                  onClick={() =>
                    setInspectDoc({
                      title: "PAN Card",
                      sideLabel: "Tax Identification",
                      description: partner.documents.pan.front.description,
                      dataFields: partner.documents.pan.front.dataFields,
                    })
                  }
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View Details
                </button>
              </div>

              <div className="bg-white p-3 rounded-[8px] border border-[#E4E0DB] text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {partner.documents.pan.front.dataFields?.map((df) => (
                    <div key={df.label}>
                      <span className="text-[#6B6667]">{df.label}:</span>{" "}
                      <strong className="text-[#111111] font-medium">{df.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Document D: Driving Licence */}
            <div className="border border-[#E4E0DB] rounded-[8px] p-4 bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    4
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Driving Licence (DL)</h4>
                  <StatusBadge status={partner.documents.drivingLicence.status} variant="kyc" />
                </div>
                <button
                  onClick={() =>
                    setInspectDoc({
                      title: "Driving Licence",
                      sideLabel: "Licence Verification",
                      description: partner.documents.drivingLicence.front.description,
                      dataFields: partner.documents.drivingLicence.front.dataFields,
                    })
                  }
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View Details
                </button>
              </div>

              <div className="bg-white p-3 rounded-[8px] border border-[#E4E0DB] text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {partner.documents.drivingLicence.front.dataFields?.map((df: { label: string; value: string }) => (
                    <div key={df.label}>
                      <span className="text-[#6B6667]">{df.label}:</span>{" "}
                      <strong className="text-[#111111] font-medium">{df.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Document E: Vehicle Registration Certificate */}
            <div className="border border-[#E4E0DB] rounded-[8px] p-4 bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    5
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Vehicle RC</h4>
                  <StatusBadge status={partner.documents.vehicleRc.status} variant="kyc" />
                </div>
                <button
                  onClick={() =>
                    setInspectDoc({
                      title: "Vehicle RC",
                      sideLabel: "Registration Certificate",
                      description: partner.documents.vehicleRc.front.description,
                      dataFields: partner.documents.vehicleRc.front.dataFields,
                    })
                  }
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View Details
                </button>
              </div>

              <div className="bg-white p-3 rounded-[8px] border border-[#E4E0DB] text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {partner.documents.vehicleRc.front.dataFields?.map((df) => (
                    <div key={df.label}>
                      <span className="text-[#6B6667]">{df.label}:</span>{" "}
                      <strong className="text-[#111111] font-medium">{df.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ADMIN DECISION (~35%) ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* 1. Administrative Decision Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Administrative Decision</h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-[4px] border ${
                  isPending
                    ? "bg-[#FFFBEB] text-[#C9822E] border-[#FDE68A]"
                    : partner.kycStatus === "APPROVED"
                    ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                    : "bg-[#FEF2F2] text-[#DA1E28] border-[#ffdad6]"
                }`}
              >
                {isPending ? "Action Required" : partner.kycStatus}
              </span>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#6B6667]">
                Verification Checklist
              </p>

              <label className="flex items-start gap-2.5 p-2 rounded-[6px] bg-[#F7F7F5] border border-[#E4E0DB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.selfieMatch}
                  onChange={(e) => setChecklist({ ...checklist, selfieMatch: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#111111]">
                  Driver selfie matches government photo ID
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-[6px] bg-[#F7F7F5] border border-[#E4E0DB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.aadhaarValid}
                  onChange={(e) => setChecklist({ ...checklist, aadhaarValid: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#111111]">
                  Aadhaar data matches residential record
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-[6px] bg-[#F7F7F5] border border-[#E4E0DB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.panMatch}
                  onChange={(e) => setChecklist({ ...checklist, panMatch: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#111111]">
                  PAN card matches tax information
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-[6px] bg-[#F7F7F5] border border-[#E4E0DB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.dlValid}
                  onChange={(e) => setChecklist({ ...checklist, dlValid: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#111111]">
                  Driving Licence is valid
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-[6px] bg-[#F7F7F5] border border-[#E4E0DB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.rcMatch}
                  onChange={(e) => setChecklist({ ...checklist, rcMatch: e.target.checked })}
                  className="mt-0.5 rounded text-[#FF5A1F] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#111111]">
                  Vehicle RC matches registered vehicle
                </span>
              </label>
            </div>

            {/* Decision Action Buttons */}
            {isPending ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="w-full h-9 bg-[#FF5A1F] text-white text-xs font-medium rounded-[8px] hover:bg-[#D94B17] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Partner KYC</span>
                </button>
                <button
                  onClick={() => {
                    setRejectionReason("");
                    setRejectionError(null);
                    setShowRejectionModal(true);
                  }}
                  className="w-full h-9 border border-[#DA1E28] text-[#DA1E28] hover:bg-[#FEF2F2] text-xs font-medium rounded-[8px] transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject KYC</span>
                </button>
              </div>
            ) : partner.kycStatus === "APPROVED" ? (
              <div className="p-3 bg-[#ECFDF5] rounded-[8px] border border-[#A7F3D0] text-center">
                <CheckCircle2 className="w-5 h-5 text-[#20885A] mx-auto mb-1" />
                <p className="font-medium text-xs text-[#20885A]">KYC Approved</p>
                <p className="text-[11px] text-[#6B6667] mt-0.5">Partner is eligible for dispatch assignment.</p>
              </div>
            ) : (
              <div className="p-3 bg-[#FEF2F2] rounded-[8px] border border-[#ffdad6] text-center">
                <AlertCircle className="w-5 h-5 text-[#DA1E28] mx-auto mb-1" />
                <p className="font-medium text-xs text-[#DA1E28]">KYC Rejected</p>
                <p className="text-[11px] text-[#6B6667] mt-0.5">{partner.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* 2. Audit Trail & Verification Timeline */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                <History className="w-4 h-4 text-[#6B6667]" />
                <span>Verification Timeline</span>
              </h3>
            </div>

            <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E4E0DB]">
              {partner.auditTrail.map((ev) => {
                const isPrimary = ev.type === "primary";
                const isSuccess = ev.type === "success";

                return (
                  <div key={ev.id} className="relative">
                    <span
                      className={`absolute -left-5 top-1 w-2 h-2 rounded-full border border-white ${
                        isPrimary
                          ? "bg-[#FF5A1F]"
                          : isSuccess
                          ? "bg-[#20885A]"
                          : "bg-[#6B6667]"
                      }`}
                    />
                    <p className="text-[11px] font-medium text-[#111111]">{ev.timestamp}</p>
                    <p className="text-xs text-[#6B6667] leading-snug">{ev.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KYC APPROVAL CONFIRMATION MODAL                                           */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ECFDF5] text-[#20885A] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111111]">
                    Approve KYC for {partner.fullName}?
                  </h4>
                  <p className="text-xs text-[#6B6667]">Central Operations Compliance Review</p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B6667] leading-relaxed">
              Confirm that all submitted identity and vehicle documents comply with marketplace requirements.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="h-8 px-3 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="h-8 px-3.5 bg-[#FF5A1F] text-white rounded-[8px] text-xs font-medium hover:bg-[#D94B17] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KYC REJECTION CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF2F2] text-[#DA1E28] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111111]">
                    Reject KYC for {partner.fullName}
                  </h4>
                  <p className="text-xs text-[#6B6667]">Request Document Correction</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#6B6667] leading-relaxed">
                Provide an explanation for rejection.
              </p>

              {/* Rejection Reason Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#111111]">
                  Rejection Reason <span className="text-[#DA1E28]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectionError) setRejectionError(null);
                  }}
                  placeholder="Explain why submitted documents could not be approved..."
                  className={`w-full p-2.5 text-xs bg-white border rounded-[8px] focus:outline-none focus:ring-1 ${
                    rejectionError
                      ? "border-[#DA1E28] focus:ring-[#DA1E28]"
                      : "border-[#E4E0DB] focus:border-[#FF5A1F] focus:ring-[#FF5A1F]"
                  }`}
                />
                {rejectionError && (
                  <p className="text-[11px] text-[#DA1E28] font-medium">{rejectionError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="h-8 px-3 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="h-8 px-3.5 bg-[#DA1E28] text-white rounded-[8px] text-xs font-medium hover:bg-[#b91c1c] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOCUMENT LIGHTBOX / ZOOM MODAL                                            */}
      {/* ========================================================================= */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h4 className="text-sm font-semibold text-[#111111]">{inspectDoc.title}</h4>
                <p className="text-xs text-[#6B6667]">{inspectDoc.sideLabel}</p>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inspectDoc.url ? (
              <div className="w-full h-72 rounded-[8px] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={inspectDoc.url}
                  alt={inspectDoc.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="p-4 bg-[#F7F7F5] rounded-[8px] border border-dashed border-[#E4E0DB] space-y-3">
                <p className="text-xs text-[#6B6667]">{inspectDoc.description}</p>
                {inspectDoc.dataFields && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E0DB]">
                    {inspectDoc.dataFields.map((df) => (
                      <div key={df.label} className="text-xs">
                        <span className="text-[#6B6667]">{df.label}:</span>{" "}
                        <strong className="text-[#111111] font-medium">{df.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setInspectDoc(null)}
                className="h-8 px-3.5 bg-white border border-[#E4E0DB] text-[#111111] rounded-[8px] text-xs font-medium hover:bg-[#F7F7F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
