"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  User,
  CreditCard,
  Edit2,
  FileCheck,
} from "lucide-react";
import { DeliveryPartnerDetail, AuditTrailEvent } from "@/types/drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

type VerificationStatus = "VERIFIED" | "FLAGGED" | "PENDING" | "UNSUBMITTED";

interface FieldVerificationState {
  status: VerificationStatus;
  issue?: string;
}

interface VerifiableFieldDef {
  id: string;
  label: string;
  category: string;
  section: "identity" | "vehicle" | "document";
}

const VERIFIABLE_FIELDS: VerifiableFieldDef[] = [
  { id: "name", label: "Full Legal Name", category: "name", section: "identity" },
  { id: "phone", label: "Primary Phone Number", category: "phone", section: "identity" },
  { id: "dob", label: "Date of Birth", category: "dob", section: "identity" },
  { id: "workPreference", label: "Work Preference", category: "workPreference", section: "identity" },
  { id: "aadhaarNumber", label: "Aadhaar Card Number", category: "aadhaarNumber", section: "identity" },
  { id: "panNumber", label: "PAN Card Number", category: "panNumber", section: "identity" },
  { id: "licenseNumber", label: "Driving Licence Number", category: "licenseNumber", section: "identity" },
  { id: "vehicleType", label: "Vehicle Class / Type", category: "vehicleType", section: "vehicle" },
  { id: "vehicleMakeModel", label: "Make & Model", category: "vehicleMakeModel", section: "vehicle" },
  { id: "vehicleReg", label: "Registration Plate Number", category: "vehicleReg", section: "vehicle" },
  { id: "docSelfie", label: "Driver Portrait / Selfie", category: "selfie", section: "document" },
  { id: "docAadhaar", label: "Aadhaar Card (Front & Back)", category: "aadhaar", section: "document" },
  { id: "docPan", label: "PAN Card (Front)", category: "pan", section: "document" },
  { id: "docDL", label: "Driving Licence (Front & Back)", category: "drivingLicence", section: "document" },
  { id: "docRC", label: "Vehicle RC (Front & Back)", category: "vehicleRc", section: "document" },
];

const PREDEFINED_ISSUES: Record<string, string[]> = {
  name: [
    "Name does not match identity documents",
    "Spelling error in legal name",
    "Incomplete full legal name",
    "Invalid name format",
  ],
  phone: [
    "Phone number unreachable or invalid",
    "Number not registered in India (+91)",
    "Phone number belongs to another active account",
  ],
  dob: [
    "Applicant is under the legal working age (18+)",
    "Date of birth mismatch with Aadhaar/PAN card",
    "Invalid date of birth format",
  ],
  workPreference: [
    "Work preference incompatible with regional hub schedule",
    "Shift availability requires operations re-assignment",
  ],
  aadhaarNumber: [
    "Aadhaar number does not match uploaded card",
    "Invalid 12-digit UID format",
    "Aadhaar already registered to another partner",
  ],
  panNumber: [
    "PAN number does not match uploaded PAN card",
    "Invalid 10-character PAN format",
    "PAN number mismatch with tax authorities",
  ],
  licenseNumber: [
    "Driving licence number mismatch with uploaded licence",
    "Licence number format is invalid",
    "Licence is reported suspended or expired",
  ],
  vehicleType: [
    "Vehicle type does not match RC document",
    "Vehicle class not permitted for delivery operations",
    "Electric vehicle specification unverified",
  ],
  vehicleMakeModel: [
    "Make/model mismatch with uploaded RC",
    "Vehicle model not listed in approved commercial fleet",
  ],
  vehicleReg: [
    "Registration plate number mismatch with RC document",
    "Invalid registration number format",
    "Plate already registered to another active partner",
  ],
  selfie: [
    "Photo is blurry or out of focus",
    "Face is partially covered (mask, sunglasses, cap)",
    "Poor lighting, glare, or dark room",
    "Selfie portrait does not match government ID photo",
    "Not a live selfie / photo of a photo",
  ],
  aadhaar: [
    "Aadhaar photo is blurry or unreadable",
    "Aadhaar card back view is missing or cropped",
    "Name or UID on card does not match entered details",
    "Aadhaar card is truncated or edges cut off",
    "Invalid or non-government Aadhaar document",
  ],
  pan: [
    "PAN card photo is blurry or unreadable",
    "PAN number on card does not match entered details",
    "Name on card does not match applicant name",
    "Card corners are cropped or obscured",
  ],
  drivingLicence: [
    "Driving licence photo is blurry or unreadable",
    "Licence is expired or past validity date",
    "Licence does not permit motorcycle/commercial vehicle class",
    "Back side of driving licence is missing or unreadable",
    "Licence number on card mismatch",
  ],
  vehicleRc: [
    "RC document photo is blurry or illegible",
    "Registration number on RC does not match vehicle plate",
    "RC has expired or road tax unpaid",
    "Owner name on RC does not match applicant",
    "RC document back view is missing or cropped",
  ],
};

function normalizePartnerDetail(raw: any): DeliveryPartnerDetail {
  if (!raw) return raw;

  const rawType = (raw.vehicleDetails?.vehicleType || raw.vehicleType || "").trim();
  const rawModel = (raw.vehicleDetails?.model || raw.vehicleModel || "").trim();
  const rawMake = (raw.vehicleDetails?.make || raw.vehicleMake || "").trim();
  const rawReg = (raw.vehicleDetails?.registrationNumber || raw.vehicleRegistration || raw.rcNumber || "").trim();

  const hasValidReg = rawReg !== "" && rawReg.toLowerCase() !== "unregistered";
  const hasVehicle = Boolean(rawType || rawModel || rawMake || hasValidReg);

  const isElectric = Boolean(
    raw.vehicleDetails?.isElectric ??
      ((rawType && rawType.toLowerCase().includes("ev")) ||
        (rawModel && rawModel.toLowerCase().includes("electric")) ||
        (rawType && rawType.toLowerCase().includes("electric")))
  );

  const vehicleType = rawType || null;
  const make = rawMake || null;
  const model = rawModel || null;
  const registrationNumber = hasValidReg ? rawReg : (hasVehicle ? "Unregistered" : null);
  const rcStatus = hasVehicle
    ? (raw.vehicleDetails?.rcStatus || raw.rcStatus || (hasValidReg ? "Verified" : "Under review"))
    : "Not submitted";

  const vehicleDetails = hasVehicle
    ? {
        vehicleType: vehicleType || null,
        make: make || null,
        model: model || null,
        registrationNumber: hasValidReg ? rawReg : null,
        isElectric,
        color: raw.vehicleDetails?.color || null,
        rcStatus: hasValidReg
          ? (raw.vehicleDetails?.rcStatus || raw.rcStatus || "Verified")
          : "Under review",
      }
    : null;

  const rawDocs: any[] = Array.isArray(raw.documents) ? raw.documents : [];
  const findDoc = (type: string, side: string = "front") =>
    rawDocs.find(
      (d: any) =>
        String(d.type).toLowerCase() === type.toLowerCase() &&
        (String(d.side).toLowerCase() === side.toLowerCase() || (!d.side && side === "front"))
    );

  const selfieDoc = findDoc("selfie", "front");
  const aadhaarFront = findDoc("aadhaar", "front");
  const aadhaarBack = findDoc("aadhaar", "back");
  const panFront = findDoc("pan", "front");
  const dlFront =
    findDoc("drivingLicence", "front") || findDoc("driving_license", "front") || findDoc("license", "front");
  const dlBack =
    findDoc("drivingLicence", "back") || findDoc("driving_license", "back") || findDoc("license", "back");
  const rcFront = findDoc("vehicleRc", "front") || findDoc("rc", "front");
  const rcBack = findDoc("vehicleRc", "back") || findDoc("rc", "back");

  const selfieUrl = raw.selfieUrl || selfieDoc?.fileUrl || undefined;

  const defaultAadhaarFrontUrl = aadhaarFront?.fileUrl || undefined;
  const defaultAadhaarBackUrl = aadhaarBack?.fileUrl || undefined;
  const defaultPanUrl = panFront?.fileUrl || undefined;
  const defaultDlFrontUrl = dlFront?.fileUrl || undefined;
  const defaultDlBackUrl = dlBack?.fileUrl || undefined;
  const defaultRcFrontUrl = rcFront?.fileUrl || undefined;
  const defaultRcBackUrl = rcBack?.fileUrl || undefined;

  const structuredDocuments = {
    selfie: {
      id: selfieDoc?.id || `doc-selfie-${raw.id}`,
      key: "selfie" as const,
      title: "Driver Portrait / Selfie",
      code: "A",
      status: (selfieDoc?.status || (selfieUrl ? "VERIFIED" : "PENDING")) as any,
      statusLabel: selfieUrl ? "Captured via Mobile App" : "Not uploaded",
      isSingleSided: true,
      metadata: selfieUrl
        ? `Uploaded: ${new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN")}`
        : "Awaiting capture",
      front: {
        label: "Live Camera Portrait",
        url: selfieUrl,
        fileRecord: selfieDoc
          ? {
              name: selfieDoc.fileName || "selfie_portrait.png",
              size: selfieDoc.fileSize || "2.9 MB",
              type: selfieDoc.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "Front-facing live portrait submitted during driver mobile onboarding.",
        status: (selfieDoc?.status || "PENDING") as any,
        dataFields: selfieUrl
          ? [
              { label: "Capture Mode", value: "Driver Front Camera" },
              { label: "Live Verification", value: "Match Passed" },
              { label: "Uploaded On", value: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN") },
            ]
          : [{ label: "Status", value: "Not captured yet" }],
      },
    },
    aadhaar: {
      id: aadhaarFront?.id || `doc-aadhaar-${raw.id}`,
      key: "aadhaar" as const,
      title: "Aadhaar Card (UIDAI Masked)",
      code: "B",
      status: (aadhaarFront?.status || "PENDING") as any,
      statusLabel: aadhaarFront?.status === "VERIFIED" ? "Verified" : defaultAadhaarFrontUrl ? "Pending Review" : "Not uploaded",
      isSingleSided: false,
      metadata: defaultAadhaarFrontUrl ? "Front and back views submitted" : "Awaiting document upload",
      front: {
        label: "Front View (Identity & Photo)",
        url: defaultAadhaarFrontUrl,
        fileRecord: aadhaarFront
          ? {
              name: aadhaarFront.fileName || "aadhaar_front.png",
              size: aadhaarFront.fileSize || "2.9 MB",
              type: aadhaarFront.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "Aadhaar card front displaying name, photo, and government emblem.",
        status: (aadhaarFront?.status || "PENDING") as any,
        dataFields: [
          { label: "Name on Card", value: raw.fullName || "Not provided" },
          { label: "Date of Birth", value: raw.dob || "Not provided" },
          {
            label: "Aadhaar UID",
            value: raw.aadhaarNumber ? String(raw.aadhaarNumber) : "Not provided",
          },
        ],
      },
      back: {
        label: "Back View (Address & QR)",
        url: defaultAadhaarBackUrl,
        fileRecord: aadhaarBack
          ? {
              name: aadhaarBack.fileName || "aadhaar_back.png",
              size: aadhaarBack.fileSize || "2.9 MB",
              type: aadhaarBack.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "Aadhaar card reverse view with address record.",
        status: (aadhaarBack?.status || "PENDING") as any,
        dataFields: [
          { label: "Address", value: raw.registeredAddress || "Not provided" },
          { label: "Format", value: "UIDAI Government Card" },
        ],
      },
    },
    pan: {
      id: panFront?.id || `doc-pan-${raw.id}`,
      key: "pan" as const,
      title: "PAN Card (Income Tax Dept)",
      code: "C",
      status: (panFront?.status || "PENDING") as any,
      statusLabel: panFront?.status === "VERIFIED" ? "Verified" : defaultPanUrl ? "Pending Review" : "Not uploaded",
      isSingleSided: true,
      metadata: defaultPanUrl ? "Permanent Account Number record" : "Awaiting document upload",
      front: {
        label: "Front View (Tax ID & Name)",
        url: defaultPanUrl,
        fileRecord: panFront
          ? {
              name: panFront.fileName || "pan_front.png",
              size: panFront.fileSize || "2.9 MB",
              type: panFront.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "Government-issued PAN Card for identity and tax verification.",
        status: (panFront?.status || "PENDING") as any,
        dataFields: [
          { label: "PAN Number", value: raw.panNumber || "Not provided" },
          { label: "Name on Card", value: raw.fullName || "Not provided" },
        ],
      },
    },
    drivingLicence: {
      id: dlFront?.id || `doc-dl-${raw.id}`,
      key: "drivingLicence" as const,
      title: "Driving Licence (Transport Dept)",
      code: "D",
      status: (dlFront?.status || "PENDING") as any,
      statusLabel: dlFront?.status === "VERIFIED" ? "Verified" : defaultDlFrontUrl ? "Pending Review" : "Not uploaded",
      isSingleSided: false,
      metadata: defaultDlFrontUrl ? "Commercial two-wheeler motor vehicle licence" : "Awaiting document upload",
      front: {
        label: "Front View (Licence No & Photo)",
        url: defaultDlFrontUrl,
        fileRecord: dlFront
          ? {
              name: dlFront.fileName || "driving_licence_front.png",
              size: dlFront.fileSize || "2.9 MB",
              type: dlFront.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "Valid Indian Driving Licence issued by RTO.",
        status: (dlFront?.status || "PENDING") as any,
        dataFields: [
          { label: "Licence Number", value: raw.licenseNumber || "Not provided" },
          { label: "Vehicle Class", value: hasVehicle ? (vehicleDetails?.vehicleType || "Commercial 2W") : "Not provided" },
        ],
      },
      back: {
        label: "Back View (Endorsements)",
        url: defaultDlBackUrl,
        fileRecord: dlBack
          ? {
              name: dlBack.fileName || "driving_licence_back.png",
              size: dlBack.fileSize || "2.9 MB",
              type: dlBack.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "Licence reverse view showing validity and endorsements.",
        status: (dlBack?.status || "PENDING") as any,
        dataFields: [{ label: "Endorsements", value: defaultDlBackUrl ? "Commercial Valid" : "Not submitted" }],
      },
    },
    vehicleRc: {
      id: rcFront?.id || `doc-rc-${raw.id}`,
      key: "vehicleRc" as const,
      title: "Vehicle Registration Certificate (RC)",
      code: "E",
      status: (rcFront?.status || "PENDING") as any,
      statusLabel: rcFront?.status === "VERIFIED" ? "Verified" : defaultRcFrontUrl ? "Pending Review" : "Not uploaded",
      isSingleSided: false,
      metadata: defaultRcFrontUrl ? "VAHAN Registry Registration Certificate" : "Awaiting document upload",
      front: {
        label: "Front View (Plate & Specs)",
        url: defaultRcFrontUrl,
        fileRecord: rcFront
          ? {
              name: rcFront.fileName || "vehicle_rc_front.png",
              size: rcFront.fileSize || "2.9 MB",
              type: rcFront.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "RC issued by Regional Transport Authority.",
        status: (rcFront?.status || "PENDING") as any,
        dataFields: [
          { label: "Registration Plate", value: vehicleDetails?.registrationNumber || "Not provided" },
          { label: "Vehicle Class", value: vehicleDetails?.vehicleType || "Not provided" },
          {
            label: "Maker / Model",
            value:
              vehicleDetails?.make || vehicleDetails?.model
                ? `${vehicleDetails.make || ""} ${vehicleDetails.model || ""}`.trim()
                : "Not provided",
          },
        ],
      },
      back: {
        label: "Back View (Tax & Validity)",
        url: defaultRcBackUrl,
        fileRecord: rcBack
          ? {
              name: rcBack.fileName || "vehicle_rc_back.png",
              size: rcBack.fileSize || "2.9 MB",
              type: rcBack.mimeType || "image/png",
              uploadedAt: new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN"),
            }
          : undefined,
        description: "RC reverse view showing tax and chassis validity.",
        status: (rcBack?.status || "PENDING") as any,
        dataFields: [{ label: "Chassis Validity", value: defaultRcBackUrl ? "Compliant" : "Not submitted" }],
      },
    },
  };

  const employmentType =
    raw.workPreference === "FULL_TIME"
      ? "Full-Time"
      : raw.workPreference === "PART_TIME"
      ? "Part-Time"
      : raw.workPreference === "WEEKEND_ONLY"
      ? "Weekend Only"
      : raw.employmentType || raw.workPreference || "Part-Time";

  return {
    ...raw,
    name: raw.fullName || raw.name || "Delivery Partner",
    fullName: raw.fullName || raw.name || "Delivery Partner",
    dob: raw.dob || null,
    aadhaarNumber: raw.aadhaarNumber || null,
    panNumber: raw.panNumber || null,
    licenseNumber: raw.licenseNumber || null,
    rcNumber: raw.rcNumber || raw.vehicleRegistration || null,
    employmentType,
    workPreference: raw.workPreference || "FULL_TIME",
    driverCode: raw.driverCode || `#DRV-${String(raw.id || "").slice(0, 4).toUpperCase()}`,
    registeredAddress: raw.registeredAddress || null,
    submissionDate:
      raw.kycStatus === "NOT_SUBMITTED"
        ? "Not submitted yet"
        : raw.submissionDate ||
          (raw.createdAt
            ? new Date(raw.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Awaiting submission"),
    assignedReviewer: raw.assignedReviewer || "Unassigned",
    terminalHub: raw.terminalHub || "Central Operations Hub",
    vehicleDetails,
    documents: structuredDocuments,
    auditTrail: (() => {
      const rawAudit = Array.isArray(raw.auditTrail) ? raw.auditTrail : [];
      const trail: AuditTrailEvent[] = rawAudit.map((log: any, idx: number) => {
        if (log.description && log.timestamp && log.title) {
          return {
            id: log.id || `audit-${idx}`,
            title: log.title,
            description: log.description,
            timestamp:
              typeof log.timestamp === "string" && log.timestamp.includes("T")
                ? new Date(log.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : log.timestamp,
            type: log.type || "neutral",
          };
        }

        let parsedDetails: any = null;
        if (typeof log.details === "string") {
          try {
            parsedDetails = JSON.parse(log.details);
          } catch {
            parsedDetails = { message: log.details };
          }
        } else if (log.details && typeof log.details === "object") {
          parsedDetails = log.details;
        }

        const action = log.action || "";
        let title = "System Update";
        let type: "primary" | "success" | "neutral" = "neutral";
        let description = "";

        if (action === "DRIVER_KYC_APPROVED") {
          title = "KYC Approved";
          type = "success";
          description = parsedDetails?.actorName
            ? `Approved by ${parsedDetails.actorName}. All credentials verified.`
            : "KYC verified and approved for fleet dispatch.";
        } else if (action === "DRIVER_KYC_REJECTED") {
          title = "KYC Application Rejected";
          type = "neutral";
          description = parsedDetails?.rejectionReason
            ? `Issues flagged: ${parsedDetails.rejectionReason.replace(/^[•\-\*]\s*/, "")}`
            : "Application rejected during administrative verification.";
        } else if (action === "DRIVER_KYC_SUBMITTED" || action === "KYC_SUBMITTED") {
          title = "Application Submitted";
          type = "primary";
          description = "Partner completed onboarding and submitted KYC documents for review.";
        } else if (action === "DRIVER_REGISTERED") {
          title = "Partner Registered";
          type = "primary";
          description = "Driver registered via Kudicart mobile app.";
        } else if (action === "DRIVER_STATUS_UPDATED") {
          title = "Status Changed";
          type = "neutral";
          description = parsedDetails?.status
            ? `Availability changed to ${parsedDetails.status}`
            : "Driver availability status updated.";
        } else {
          title =
            action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
            "Audit Event";
          description =
            parsedDetails?.message ||
            parsedDetails?.rejectionReason ||
            log.details ||
            "Administrative activity recorded.";
        }

        const date = log.createdAt || log.timestamp || Date.now();
        const formattedTimestamp = new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });

        return {
          id: log.id || `audit-${idx}`,
          title,
          description,
          timestamp: formattedTimestamp,
          type,
        };
      });

      // Include foundational milestone events if not explicitly logged
      const hasRegistered = trail.some((ev) => ev.title.toLowerCase().includes("registered"));
      if (!hasRegistered && raw.createdAt) {
        trail.push({
          id: `milestone-reg-${raw.id}`,
          title: "Partner Registered",
          description: `Driver account registered with phone ${raw.phone || "provided during onboarding"}.`,
          timestamp: new Date(raw.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          type: "primary",
        });
      }

      const hasSubmitted = trail.some((ev) => ev.title.toLowerCase().includes("submitted"));
      if (!hasSubmitted && raw.kycStatus && raw.kycStatus !== "NOT_SUBMITTED") {
        trail.unshift({
          id: `milestone-sub-${raw.id}`,
          title: "KYC Documents Submitted",
          description: "Partner completed mobile onboarding and submitted identity and vehicle documents for review.",
          timestamp:
            raw.submissionDate && raw.submissionDate !== "Awaiting submission"
              ? raw.submissionDate
              : new Date(raw.createdAt || Date.now()).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
          type: "primary",
        });
      }

      return trail;
    })(),
  };
}

function buildInitialVerificationMap(
  partner: DeliveryPartnerDetail
): Record<string, FieldVerificationState> {
  const isApproved = partner.kycStatus === "APPROVED";
  const newMap: Record<string, FieldVerificationState> = {};

  const hasValue = (fieldId: string): boolean => {
    switch (fieldId) {
      case "name":
        return Boolean(partner.fullName && partner.fullName !== "Delivery Partner");
      case "phone":
        return Boolean(partner.phone);
      case "dob":
        return Boolean(partner.dob);
      case "workPreference":
        return Boolean(partner.workPreference);
      case "aadhaarNumber":
        return Boolean(partner.aadhaarNumber);
      case "panNumber":
        return Boolean(partner.panNumber);
      case "licenseNumber":
        return Boolean(partner.licenseNumber);
      case "vehicleType":
        return Boolean(partner.vehicleDetails?.vehicleType);
      case "vehicleMakeModel":
        return Boolean(partner.vehicleDetails?.make || partner.vehicleDetails?.model);
      case "vehicleReg":
        return Boolean(
          partner.vehicleDetails?.registrationNumber &&
            partner.vehicleDetails.registrationNumber !== "Unregistered"
        );
      case "docSelfie":
        return Boolean(partner.documents?.selfie?.front?.url);
      case "docAadhaar":
        return Boolean(
          partner.documents?.aadhaar?.front?.url || partner.documents?.aadhaar?.back?.url
        );
      case "docPan":
        return Boolean(partner.documents?.pan?.front?.url);
      case "docDL":
        return Boolean(
          partner.documents?.drivingLicence?.front?.url || partner.documents?.drivingLicence?.back?.url
        );
      case "docRC":
        return Boolean(
          partner.documents?.vehicleRc?.front?.url || partner.documents?.vehicleRc?.back?.url
        );
      default:
        return false;
    }
  };

  for (const field of VERIFIABLE_FIELDS) {
    if (!hasValue(field.id)) {
      newMap[field.id] = { status: "UNSUBMITTED" };
    } else if (isApproved) {
      newMap[field.id] = { status: "VERIFIED" };
    } else {
      newMap[field.id] = { status: "PENDING" };
    }
  }

  // If partner already has a rejection reason recorded, parse and reflect flagged items
  if (partner.rejectionReason) {
    const lines = partner.rejectionReason.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[•\-\*]\s*/, "");
      const [prefix, ...rest] = cleaned.split(":");
      const reasonText = rest.join(":").trim() || cleaned;

      if (prefix) {
        const matchField = VERIFIABLE_FIELDS.find(
          (f) =>
            f.label.toLowerCase().includes(prefix.trim().toLowerCase()) ||
            prefix.trim().toLowerCase().includes(f.label.toLowerCase())
        );
        if (matchField) {
          newMap[matchField.id] = { status: "FLAGGED", issue: reasonText };
        }
      }
    }
  }

  return newMap;
}

export default function AdminDeliveryPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = (params?.id as string) || "";

  const [partner, setPartner] = useState<DeliveryPartnerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Field-level verification state for all 15 data items
  const [verificationMap, setVerificationMap] = useState<Record<string, FieldVerificationState>>({});

  // Flag Issue Modal State
  const [activeIssueModal, setActiveIssueModal] = useState<{
    fieldId: string;
    fieldLabel: string;
    category: string;
    currentIssue?: string;
  } | null>(null);
  const [customComment, setCustomComment] = useState<string>("");

  // Approval & Rejection Confirmation Modals
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // High-Resolution Image Lightbox Modal
  const [inspectDoc, setInspectDoc] = useState<{
    title: string;
    sideLabel: string;
    description?: string;
    dataFields?: { label: string; value: string }[];
    url?: string;
  } | null>(null);

  useEffect(() => {
    if (!driverId) {
      setFetchError("Missing delivery partner identifier.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    api.deliveryPartners
      .getById(driverId)
      .then((res) => {
        if (res && res.id) {
          const normalized = normalizePartnerDetail(res);
          setPartner(normalized);
          setVerificationMap(buildInitialVerificationMap(normalized));
        } else {
          setPartner(null);
          setFetchError(`Delivery partner "${driverId}" was not found.`);
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Unable to load delivery partner profile.";
        setPartner(null);
        setFetchError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [driverId]);

  const isFieldEntered = (fieldId: string) => {
    return verificationMap[fieldId]?.status !== "UNSUBMITTED";
  };

  // Compute Flagged Issues
  const flaggedItems = useMemo(() => {
    return Object.entries(verificationMap)
      .filter(([_, v]) => v.status === "FLAGGED")
      .map(([id, v]) => {
        const def = VERIFIABLE_FIELDS.find((f) => f.id === id);
        return {
          id,
          label: def?.label || id,
          category: def?.category || id,
          issue: v.issue || "Requires correction",
        };
      });
  }, [verificationMap]);

  const flaggedCount = flaggedItems.length;
  const hasAnyWrong = flaggedCount > 0;
  const verifiedCount = Object.values(verificationMap).filter((v) => v.status === "VERIFIED").length;
  const allVerified = verifiedCount === VERIFIABLE_FIELDS.length && !hasAnyWrong;

  const handleVerify = (fieldId: string) => {
    setVerificationMap((prev) => {
      const isCurrentlyVerified = prev[fieldId]?.status === "VERIFIED";
      return {
        ...prev,
        [fieldId]: {
          status: isCurrentlyVerified ? "PENDING" : "VERIFIED",
          issue: undefined,
        },
      };
    });
  };

  const handleOpenIssueModal = (fieldId: string, fieldLabel: string, category: string) => {
    const current = verificationMap[fieldId];
    setActiveIssueModal({
      fieldId,
      fieldLabel,
      category,
      currentIssue: current?.issue,
    });
    setCustomComment(current?.issue || "");
  };

  const handleSaveIssue = () => {
    if (!activeIssueModal) return;
    const comment = customComment.trim() || "Item requires re-submission or correction";
    setVerificationMap((prev) => ({
      ...prev,
      [activeIssueModal.fieldId]: { status: "FLAGGED", issue: comment },
    }));
    setActiveIssueModal(null);
    setCustomComment("");
  };

  const handleClearIssue = (fieldId: string) => {
    setVerificationMap((prev) => ({
      ...prev,
      [fieldId]: { status: "PENDING", issue: undefined },
    }));
  };

  const handleApprove = async () => {
    if (!partner) return;
    if (!allVerified) {
      setActionError("All 15 verification items must be cleared before approving KYC.");
      setShowApprovalModal(false);
      return;
    }
    try {
      await api.deliveryPartners.reviewKyc(driverId, { status: "APPROVED" });
      setPartner((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: "APPROVED",
              rejectionReason: null,
              auditTrail: [
                {
                  id: `vh-${Date.now()}`,
                  timestamp: new Date().toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                  title: "KYC Verified & Approved",
                  description: "All identity credentials, vehicle records, and photos verified.",
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

  const handleOpenRejectModal = () => {
    // Automatically compile bulleted feedback of all flagged issues
    const compiled =
      flaggedItems.length > 0
        ? flaggedItems.map((item) => `• ${item.label}: ${item.issue}`).join("\n")
        : "Verification incomplete. Please review required document and identity submissions.";
    setRejectionReason(compiled);
    setRejectionError(null);
    setShowRejectionModal(true);
  };

  const handleReject = async () => {
    if (!partner) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Please specify a reason for KYC rejection.");
      return;
    }
    const rejectedDocTypes = new Set<string>();
    for (const item of flaggedItems) {
      if (item.category === "drivingLicence" || item.id === "licenseNumber" || item.id === "docDL") {
        rejectedDocTypes.add("drivingLicence");
      } else if (item.category === "vehicleRc" || item.id === "docRC" || item.id === "vehicleReg" || item.id === "vehicleType" || item.id === "vehicleMakeModel") {
        rejectedDocTypes.add("vehicleRc");
      } else if (item.category === "aadhaar" || item.id === "aadhaarNumber" || item.id === "docAadhaar") {
        rejectedDocTypes.add("aadhaar");
      } else if (item.category === "pan" || item.id === "panNumber" || item.id === "docPan") {
        rejectedDocTypes.add("pan");
      } else if (item.category === "selfie" || item.id === "docSelfie") {
        rejectedDocTypes.add("selfie");
      }
    }

    try {
      await api.deliveryPartners.reviewKyc(driverId, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
        rejectedDocuments: Array.from(rejectedDocTypes),
      });
      setPartner((prev) => {
        if (!prev) return null;
        const updatedDocuments = { ...prev.documents };
        for (const [key, group] of Object.entries(updatedDocuments) as [string, any][]) {
          if (group && typeof group === "object") {
            const isDocFlagged = rejectedDocTypes.has(key);
            group.status = isDocFlagged ? "REJECTED" : (group.status === "REJECTED" ? "VERIFIED" : group.status);
          }
        }
        return {
          ...prev,
          kycStatus: "REJECTED",
          rejectionReason: rejectionReason.trim(),
          documents: updatedDocuments,
          auditTrail: [
            {
              id: `vh-${Date.now()}`,
              timestamp: new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              }),
              title: "KYC Rejected",
              description: rejectionReason.trim(),
              type: "neutral",
            },
            ...(prev.auditTrail || []),
          ],
        };
      });
      setShowRejectionModal(false);
      setActionError(null);
    } catch (err: any) {
      setShowRejectionModal(false);
      setActionError(err?.message || "Failed to reject partner KYC.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-[#6B6667]">
          <Link href="/admin/delivery-partners" className="hover:text-[#111111] flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Partners</span>
          </Link>
          <span className="text-[#E4E0DB]">/</span>
          <span className="font-mono">Loading...</span>
        </div>
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
      <div className="max-w-[1440px] mx-auto p-6">
        <Link
          href="/admin/delivery-partners"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B6667] hover:text-[#111111] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Delivery Partners</span>
        </Link>
        <EmptyState
          title="Delivery Partner Not Found"
          description={fetchError || "The requested delivery partner record could not be loaded."}
        />
      </div>
    );
  }

  const isPending = partner.kycStatus === "PENDING" || partner.kycStatus === "UNDER_REVIEW";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto pb-16">
      {/* ================= 1. BREADCRUMBS & TOP NAVIGATION ================= */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2 text-xs font-medium text-[#6B6667]">
          <Link
            href="/admin/delivery-partners"
            className="hover:text-[#111111] transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Partners</span>
          </Link>
          <span className="text-[#E4E0DB]">/</span>
          <span className="font-mono text-[#111111] font-semibold">{partner.driverCode}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6B6667]">
            ID: <strong className="text-[#111111] font-medium">{partner.id}</strong>
          </span>
        </div>
      </div>

      {/* ================= PRIMARY HEADER BANNER ================= */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#111111] tracking-tight">{partner.fullName}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB]">
              {partner.driverCode}
            </span>
            <StatusBadge status={partner.kycStatus} variant="kyc" />
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${
                partner.isOnline
                  ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                  : "bg-[#F7F7F5] text-[#6B6667] border-[#E4E0DB]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  partner.isOnline ? "bg-[#20885A]" : "bg-[#6B6667]"
                }`}
              />
              <span>{partner.isOnline ? "Active Online" : "Offline"}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B6667]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Submitted: {partner.submissionDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20885A]" />
              <span>Reviewer: {partner.assignedReviewer}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Terminal Hub: {partner.terminalHub}</span>
            </span>
          </div>
        </div>

        {/* Header Summary Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#6B6667] block">Field Verification</span>
            <strong className="text-xs font-semibold text-[#111111]">
              {verifiedCount} / {VERIFIABLE_FIELDS.length} Verified
            </strong>
          </div>
          {hasAnyWrong ? (
            <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[#FEF2F2] text-[#DA1E28] border border-[#FCA5A5] font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{flaggedCount} Flagged</span>
            </span>
          ) : partner.kycStatus === "NOT_SUBMITTED" ? (
            <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#9E9B98]" />
              <span>Awaiting Submission</span>
            </span>
          ) : verifiedCount === VERIFIABLE_FIELDS.length ? (
            <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>All Cleared</span>
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-[6px] bg-[#FFFBEB] text-[#C9822E] border border-[#FDE68A] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>In Review</span>
            </span>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-[#FEF2F2] border border-[#ffdad6] text-[#DA1E28] rounded-[8px] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#DA1E28] hover:text-[#991B1B]">
            <X className="w-4 h-4" />
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
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">
                  Partner Identity &amp; Operational Details
                </h3>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Exact information submitted by partner during mobile onboarding. Verify each field individually.
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phone Verified</span>
              </span>
            </div>

            {/* Individual Field Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Field 1: Full Legal Name */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.name?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Full Legal Name</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleVerify("name")}
                      title="Verify Name"
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        verificationMap.name?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenIssueModal("name", "Full Legal Name", "name")}
                      title="Flag Name Issue"
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        verificationMap.name?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <strong className="text-xs font-semibold text-[#111111] block">{partner.fullName}</strong>
                {verificationMap.name?.status === "FLAGGED" && verificationMap.name?.issue && (
                  <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="leading-tight">{verificationMap.name.issue}</span>
                  </div>
                )}
              </div>

              {/* Field 2: Primary Phone */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.phone?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Primary Phone</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleVerify("phone")}
                      title="Verify Phone"
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        verificationMap.phone?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenIssueModal("phone", "Primary Phone Number", "phone")}
                      title="Flag Phone Issue"
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        verificationMap.phone?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <strong className="font-mono text-xs font-semibold text-[#111111] block">{partner.phone}</strong>
                {verificationMap.phone?.status === "FLAGGED" && verificationMap.phone?.issue && (
                  <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="leading-tight">{verificationMap.phone.issue}</span>
                  </div>
                )}
              </div>

              {/* Field 3: Date of Birth */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.dob?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Date of Birth (DOB)</span>
                  {isFieldEntered("dob") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("dob")}
                        title="Verify Date of Birth"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.dob?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenIssueModal("dob", "Date of Birth", "dob")}
                        title="Flag DOB Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.dob?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.dob ? (
                  <strong className="text-xs font-semibold text-[#111111] block">
                    {partner.dob}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-0.5">Not entered yet</div>
                )}
                {verificationMap.dob?.status === "FLAGGED" && verificationMap.dob?.issue && (
                  <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="leading-tight">{verificationMap.dob.issue}</span>
                  </div>
                )}
              </div>

              {/* Field 4: Work Preference */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.workPreference?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Work Preference</span>
                  {isFieldEntered("workPreference") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("workPreference")}
                        title="Verify Work Preference"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.workPreference?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenIssueModal("workPreference", "Work Preference", "workPreference")
                        }
                        title="Flag Work Preference Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.workPreference?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.employmentType ? (
                  <strong className="text-xs font-semibold text-[#111111] block">
                    {partner.employmentType}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-0.5">Not entered yet</div>
                )}
                {verificationMap.workPreference?.status === "FLAGGED" &&
                  verificationMap.workPreference?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.workPreference.issue}</span>
                    </div>
                  )}
              </div>

              {/* Field 5: Aadhaar Number */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.aadhaarNumber?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Aadhaar Card UID</span>
                  {isFieldEntered("aadhaarNumber") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("aadhaarNumber")}
                        title="Verify Aadhaar Number"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.aadhaarNumber?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenIssueModal("aadhaarNumber", "Aadhaar Card Number", "aadhaarNumber")
                        }
                        title="Flag Aadhaar Number Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.aadhaarNumber?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.aadhaarNumber ? (
                  <strong className="font-mono text-xs font-semibold text-[#111111] block">
                    {partner.aadhaarNumber}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-0.5">Not entered yet</div>
                )}
                {verificationMap.aadhaarNumber?.status === "FLAGGED" &&
                  verificationMap.aadhaarNumber?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.aadhaarNumber.issue}</span>
                    </div>
                  )}
              </div>

              {/* Field 6: PAN Number */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.panNumber?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">PAN Number</span>
                  {isFieldEntered("panNumber") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("panNumber")}
                        title="Verify PAN Number"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.panNumber?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenIssueModal("panNumber", "PAN Card Number", "panNumber")}
                        title="Flag PAN Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.panNumber?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.panNumber ? (
                  <strong className="font-mono text-xs font-semibold text-[#111111] block">
                    {partner.panNumber}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-0.5">Not entered yet</div>
                )}
                {verificationMap.panNumber?.status === "FLAGGED" &&
                  verificationMap.panNumber?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.panNumber.issue}</span>
                    </div>
                  )}
              </div>

              {/* Field 7: Driving Licence Number */}
              <div
                className={`p-3 rounded-[8px] border transition-colors sm:col-span-2 md:col-span-2 ${
                  verificationMap.licenseNumber?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Driving Licence Number</span>
                  {isFieldEntered("licenseNumber") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("licenseNumber")}
                        title="Verify Licence Number"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.licenseNumber?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenIssueModal("licenseNumber", "Driving Licence Number", "licenseNumber")
                        }
                        title="Flag Licence Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.licenseNumber?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.licenseNumber ? (
                  <strong className="font-mono text-xs font-semibold text-[#111111] block">
                    {partner.licenseNumber}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-0.5">Not entered yet</div>
                )}
                {verificationMap.licenseNumber?.status === "FLAGGED" &&
                  verificationMap.licenseNumber?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.licenseNumber.issue}</span>
                    </div>
                  )}
              </div>

              {/* Field 8: Completed Deliveries */}
              <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB]">
                <span className="text-[11px] text-[#6B6667] font-medium block mb-1">
                  Completed Deliveries
                </span>
                <span className="font-mono text-sm font-semibold text-[#111111]">
                  {partner.completedDeliveries}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Fleet Vehicle Profile Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">Fleet Vehicle Profile</h3>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Verify vehicle details against the submitted Registration Certificate.
                </p>
              </div>
              {partner.vehicleDetails?.isElectric && (
                <span className="text-xs px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium">
                  Electric Vehicle
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vehicle Field 1: Vehicle Class / Type */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.vehicleType?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Vehicle Class / Type</span>
                  {isFieldEntered("vehicleType") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("vehicleType")}
                        title="Verify Vehicle Type"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.vehicleType?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenIssueModal("vehicleType", "Vehicle Class / Type", "vehicleType")
                        }
                        title="Flag Vehicle Type Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.vehicleType?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.vehicleDetails?.vehicleType ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-white border border-[#E4E0DB] text-[#111111] text-xs font-semibold">
                    <Bike className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span>{partner.vehicleDetails.vehicleType}</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-1">
                    Not entered yet
                  </div>
                )}
                {verificationMap.vehicleType?.status === "FLAGGED" &&
                  verificationMap.vehicleType?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.vehicleType.issue}</span>
                    </div>
                  )}
              </div>

              {/* Vehicle Field 2: Make & Model */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.vehicleMakeModel?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Make &amp; Model</span>
                  {isFieldEntered("vehicleMakeModel") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("vehicleMakeModel")}
                        title="Verify Make & Model"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.vehicleMakeModel?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenIssueModal("vehicleMakeModel", "Vehicle Make & Model", "vehicleMakeModel")
                        }
                        title="Flag Make/Model Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.vehicleMakeModel?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.vehicleDetails?.make || partner.vehicleDetails?.model ? (
                  <strong className="text-xs font-semibold text-[#111111] block">
                    {[partner.vehicleDetails?.make, partner.vehicleDetails?.model].filter(Boolean).join(" ")}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-1">
                    Not entered yet
                  </div>
                )}
                {verificationMap.vehicleMakeModel?.status === "FLAGGED" &&
                  verificationMap.vehicleMakeModel?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.vehicleMakeModel.issue}</span>
                    </div>
                  )}
              </div>

              {/* Vehicle Field 3: Registration Plate */}
              <div
                className={`p-3 rounded-[8px] border transition-colors ${
                  verificationMap.vehicleReg?.status === "FLAGGED"
                    ? "bg-[#FEF2F2] border-[#FCA5A5]"
                    : "bg-[#F7F7F5] border-[#E4E0DB]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] text-[#6B6667] font-medium">Registration Plate</span>
                  {isFieldEntered("vehicleReg") ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleVerify("vehicleReg")}
                        title="Verify Registration Plate"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.vehicleReg?.status === "VERIFIED"
                            ? "bg-[#20885A] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#20885A] hover:text-[#20885A]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleOpenIssueModal("vehicleReg", "Registration Plate Number", "vehicleReg")
                        }
                        title="Flag Plate Issue"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          verificationMap.vehicleReg?.status === "FLAGGED"
                            ? "bg-[#DA1E28] text-white shadow-xs"
                            : "bg-white border border-[#E4E0DB] text-[#6B6667] hover:border-[#DA1E28] hover:text-[#DA1E28]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9E9B98] bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] font-medium">
                      Not submitted
                    </span>
                  )}
                </div>
                {partner.vehicleDetails?.registrationNumber && partner.vehicleDetails.registrationNumber !== "Unregistered" ? (
                  <strong className="font-mono text-xs font-semibold text-[#111111] bg-white px-2 py-0.5 rounded-[4px] border border-[#E4E0DB] inline-block">
                    {partner.vehicleDetails.registrationNumber}
                  </strong>
                ) : (
                  <div className="text-xs text-[#9E9B98] italic py-1 font-mono">
                    Not registered
                  </div>
                )}
                {verificationMap.vehicleReg?.status === "FLAGGED" &&
                  verificationMap.vehicleReg?.issue && (
                    <div className="mt-2 pt-1.5 border-t border-[#FCA5A5] flex items-start gap-1 text-[11px] text-[#DA1E28]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">{verificationMap.vehicleReg.issue}</span>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* 3. KYC Document Dossier Inspection Workspace */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">
                  KYC Document Dossier Inspection &amp; Photos
                </h3>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Inspect high-resolution document photos and verify each credential individually.
                </p>
              </div>
              <span className="font-mono text-xs bg-[#F4F1EA] px-2 py-0.5 rounded-[4px] text-[#6B6667] border border-[#E4E0DB]">
                5 Identity Records
              </span>
            </div>

            {/* Document 1: Driver Live Selfie */}
            <div
              className={`border rounded-[8px] p-4 transition-colors ${
                verificationMap.docSelfie?.status === "FLAGGED"
                  ? "bg-[#FEF2F2] border-[#FCA5A5]"
                  : "bg-[#F7F7F5] border-[#E4E0DB]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    1
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Driver Portrait / Selfie</h4>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0] font-medium">
                    Live Photo
                  </span>
                </div>

                {/* Individual Tick / Wrong Controls */}
                {isFieldEntered("docSelfie") ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify("docSelfie")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docSelfie?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#20885A] hover:bg-[#ECFDF5]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </button>
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docSelfie", "Driver Portrait / Selfie", "selfie")
                      }
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docSelfie?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#DA1E28] hover:bg-[#FEF2F2]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Issue</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#9E9B98] bg-[#F4F1EA] px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] font-medium">
                    Awaiting upload
                  </span>
                )}
              </div>

              {verificationMap.docSelfie?.status === "FLAGGED" && verificationMap.docSelfie?.issue && (
                <div className="mb-3 p-2 bg-white border border-[#FCA5A5] rounded-[6px] flex items-center justify-between text-xs text-[#DA1E28]">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Reason:</strong> {verificationMap.docSelfie.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docSelfie", "Driver Portrait / Selfie", "selfie")
                      }
                      className="text-[11px] underline font-medium hover:text-[#991B1B]"
                    >
                      Edit
                    </button>
                    <span className="text-[#FCA5A5]">•</span>
                    <button
                      onClick={() => handleClearIssue("docSelfie")}
                      className="text-[11px] font-semibold text-[#991B1B] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Photo & Details View */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-[8px] border border-[#E4E0DB]">
                {partner.documents.selfie.front.url ? (
                  <div
                    onClick={() =>
                      setInspectDoc({
                        title: "Driver Portrait / Selfie",
                        sideLabel: "Live Camera Portrait",
                        description: partner.documents.selfie.front.description,
                        dataFields: partner.documents.selfie.front.dataFields,
                        url: partner.documents.selfie.front.url,
                      })
                    }
                    className="w-[140px] h-[140px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden shrink-0 relative group cursor-pointer shadow-xs"
                  >
                    <img
                      src={partner.documents.selfie.front.url}
                      alt="Driver Live Selfie"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                      <ZoomIn className="w-5 h-5 text-white" />
                      <span>Inspect Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-[140px] h-[140px] rounded-[6px] border border-dashed border-[#E4E0DB] bg-[#F7F7F5] flex flex-col items-center justify-center text-[#6B6667] text-[11px] gap-1 shrink-0">
                    <User className="w-6 h-6 text-[#9E9B98]" />
                    <span>Not uploaded</span>
                  </div>
                )}

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#111111]">Live Selfie Capture</p>
                    <span className="text-[11px] text-[#6B6667]">
                      {partner.documents.selfie.front.fileRecord?.name || "Not uploaded"}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6667] leading-relaxed">
                    Portrait verified against photograph on government identity cards. Click thumbnail to inspect in full resolution.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E0DB] text-xs">
                    <div>
                      <span className="text-[#6B6667] text-[11px]">Capture Mode:</span>{" "}
                      <strong className="text-[#111111]">
                        {partner.documents.selfie.front.url ? "Front Camera" : "Not captured"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6B6667] text-[11px]">File Size:</span>{" "}
                      <strong className="text-[#111111]">
                        {partner.documents.selfie.front.fileRecord?.size || "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document 2: Aadhaar Card */}
            <div
              className={`border rounded-[8px] p-4 transition-colors ${
                verificationMap.docAadhaar?.status === "FLAGGED"
                  ? "bg-[#FEF2F2] border-[#FCA5A5]"
                  : "bg-[#F7F7F5] border-[#E4E0DB]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    2
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Aadhaar Card (UIDAI Masked)</h4>
                  <StatusBadge status={partner.documents.aadhaar.status} variant="kyc" />
                </div>

                {/* Individual Tick / Wrong Controls */}
                {isFieldEntered("docAadhaar") ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify("docAadhaar")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docAadhaar?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#20885A] hover:bg-[#ECFDF5]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </button>
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docAadhaar", "Aadhaar Card (Front & Back)", "aadhaar")
                      }
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docAadhaar?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#DA1E28] hover:bg-[#FEF2F2]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Issue</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#9E9B98] bg-[#F4F1EA] px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] font-medium">
                    Awaiting upload
                  </span>
                )}
              </div>

              {verificationMap.docAadhaar?.status === "FLAGGED" && verificationMap.docAadhaar?.issue && (
                <div className="mb-3 p-2 bg-white border border-[#FCA5A5] rounded-[6px] flex items-center justify-between text-xs text-[#DA1E28]">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Reason:</strong> {verificationMap.docAadhaar.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docAadhaar", "Aadhaar Card (Front & Back)", "aadhaar")
                      }
                      className="text-[11px] underline font-medium hover:text-[#991B1B]"
                    >
                      Edit
                    </button>
                    <span className="text-[#FCA5A5]">•</span>
                    <button
                      onClick={() => handleClearIssue("docAadhaar")}
                      className="text-[11px] font-semibold text-[#991B1B] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Photos & Data Container */}
              <div className="bg-white p-3.5 rounded-[8px] border border-[#E4E0DB] space-y-3">
                {/* Photo Previews: Front and Back */}
                <div className="flex flex-wrap items-center gap-3">
                  {partner.documents.aadhaar.front.url && (
                    <div
                      onClick={() =>
                        setInspectDoc({
                          title: "Aadhaar Card",
                          sideLabel: "Front View (Identity & Photo)",
                          description: partner.documents.aadhaar.front.description,
                          dataFields: partner.documents.aadhaar.front.dataFields,
                          url: partner.documents.aadhaar.front.url,
                        })
                      }
                      className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={partner.documents.aadhaar.front.url}
                        alt="Aadhaar Front View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span>Inspect Front</span>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Front View
                      </span>
                    </div>
                  )}

                  {partner.documents.aadhaar.back?.url && (
                    <div
                      onClick={() =>
                        setInspectDoc({
                          title: "Aadhaar Card",
                          sideLabel: "Back View (Address & QR)",
                          description: partner.documents.aadhaar.back?.description,
                          dataFields: partner.documents.aadhaar.back?.dataFields,
                          url: partner.documents.aadhaar.back?.url,
                        })
                      }
                      className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={partner.documents.aadhaar.back.url}
                        alt="Aadhaar Back View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span>Inspect Back</span>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Back View
                      </span>
                    </div>
                  )}

                  {!partner.documents.aadhaar.front.url && !partner.documents.aadhaar.back?.url && (
                    <div className="w-[160px] h-[105px] rounded-[6px] border border-dashed border-[#E4E0DB] bg-[#F7F7F5] flex flex-col items-center justify-center text-[#6B6667] text-[11px] gap-1 shrink-0">
                      <FileText className="w-5 h-5 text-[#9E9B98]" />
                      <span>Not uploaded</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-[200px] text-xs space-y-1.5 pl-1">
                    <p className="font-semibold text-[#111111]">Aadhaar Card Information</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-[#E4E0DB]">
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Name on Card:</span>
                        <strong className="text-[#111111] font-medium">{partner.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">DOB on Card:</span>
                        <strong className="text-[#111111] font-medium">{partner.dob || "Not entered"}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Aadhaar Number:</span>
                        <strong className="text-[#111111] font-mono">{partner.aadhaarNumber || "Not entered"}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Document Status:</span>
                        {isFieldEntered("docAadhaar") ? (
                          <strong className="text-[#20885A] font-medium">Uploaded (Front &amp; Back)</strong>
                        ) : (
                          <strong className="text-[#9E9B98] font-medium italic">Not uploaded</strong>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document 3: PAN Card */}
            <div
              className={`border rounded-[8px] p-4 transition-colors ${
                verificationMap.docPan?.status === "FLAGGED"
                  ? "bg-[#FEF2F2] border-[#FCA5A5]"
                  : "bg-[#F7F7F5] border-[#E4E0DB]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    3
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">PAN Card (Income Tax Dept)</h4>
                  <StatusBadge status={partner.documents.pan.status} variant="kyc" />
                </div>

                {/* Individual Tick / Wrong Controls */}
                {isFieldEntered("docPan") ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify("docPan")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docPan?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#20885A] hover:bg-[#ECFDF5]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </button>
                    <button
                      onClick={() => handleOpenIssueModal("docPan", "PAN Card (Front)", "pan")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docPan?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#DA1E28] hover:bg-[#FEF2F2]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Issue</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#9E9B98] bg-[#F4F1EA] px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] font-medium">
                    Awaiting upload
                  </span>
                )}
              </div>

              {verificationMap.docPan?.status === "FLAGGED" && verificationMap.docPan?.issue && (
                <div className="mb-3 p-2 bg-white border border-[#FCA5A5] rounded-[6px] flex items-center justify-between text-xs text-[#DA1E28]">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Reason:</strong> {verificationMap.docPan.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenIssueModal("docPan", "PAN Card (Front)", "pan")}
                      className="text-[11px] underline font-medium hover:text-[#991B1B]"
                    >
                      Edit
                    </button>
                    <span className="text-[#FCA5A5]">•</span>
                    <button
                      onClick={() => handleClearIssue("docPan")}
                      className="text-[11px] font-semibold text-[#991B1B] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Photo & Details View */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-[8px] border border-[#E4E0DB]">
                {partner.documents.pan.front.url ? (
                  <div
                    onClick={() =>
                      setInspectDoc({
                        title: "PAN Card",
                        sideLabel: "Front View (Tax ID & Name)",
                        description: partner.documents.pan.front.description,
                        dataFields: partner.documents.pan.front.dataFields,
                        url: partner.documents.pan.front.url,
                      })
                    }
                    className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden shrink-0 relative group cursor-pointer shadow-xs"
                  >
                    <img
                      src={partner.documents.pan.front.url}
                      alt="PAN Front View"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                      <ZoomIn className="w-4 h-4 text-white" />
                      <span>Inspect Photo</span>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Front View
                    </span>
                  </div>
                ) : (
                  <div className="w-[160px] h-[105px] rounded-[6px] border border-dashed border-[#E4E0DB] bg-[#F7F7F5] flex flex-col items-center justify-center text-[#6B6667] text-[11px] gap-1 shrink-0">
                    <FileText className="w-5 h-5 text-[#9E9B98]" />
                    <span>Not uploaded</span>
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#111111]">Permanent Account Number (PAN)</p>
                    <span className="text-[11px] text-[#6B6667]">
                      {partner.documents.pan.front.fileRecord?.name || "Not uploaded"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E0DB]">
                    <div>
                      <span className="text-[#6B6667] text-[11px] block">PAN Number:</span>
                      <strong className="text-[#111111] font-mono font-semibold">
                        {partner.panNumber || "Not entered"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6B6667] text-[11px] block">Name on Card:</span>
                      <strong className="text-[#111111] font-medium">{partner.fullName || "—"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document 4: Driving Licence */}
            <div
              className={`border rounded-[8px] p-4 transition-colors ${
                verificationMap.docDL?.status === "FLAGGED"
                  ? "bg-[#FEF2F2] border-[#FCA5A5]"
                  : "bg-[#F7F7F5] border-[#E4E0DB]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    4
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Driving Licence (DL)</h4>
                  <StatusBadge status={partner.documents.drivingLicence.status} variant="kyc" />
                </div>

                {/* Individual Tick / Wrong Controls */}
                {isFieldEntered("docDL") ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify("docDL")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docDL?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#20885A] hover:bg-[#ECFDF5]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </button>
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docDL", "Driving Licence (Front & Back)", "drivingLicence")
                      }
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docDL?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#DA1E28] hover:bg-[#FEF2F2]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Issue</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#9E9B98] bg-[#F4F1EA] px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] font-medium">
                    Awaiting upload
                  </span>
                )}
              </div>

              {verificationMap.docDL?.status === "FLAGGED" && verificationMap.docDL?.issue && (
                <div className="mb-3 p-2 bg-white border border-[#FCA5A5] rounded-[6px] flex items-center justify-between text-xs text-[#DA1E28]">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Reason:</strong> {verificationMap.docDL.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docDL", "Driving Licence (Front & Back)", "drivingLicence")
                      }
                      className="text-[11px] underline font-medium hover:text-[#991B1B]"
                    >
                      Edit
                    </button>
                    <span className="text-[#FCA5A5]">•</span>
                    <button
                      onClick={() => handleClearIssue("docDL")}
                      className="text-[11px] font-semibold text-[#991B1B] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Photos & Data Container */}
              <div className="bg-white p-3.5 rounded-[8px] border border-[#E4E0DB] space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {partner.documents.drivingLicence.front.url && (
                    <div
                      onClick={() =>
                        setInspectDoc({
                          title: "Driving Licence",
                          sideLabel: "Front View (Licence No & Photo)",
                          description: partner.documents.drivingLicence.front.description,
                          dataFields: partner.documents.drivingLicence.front.dataFields,
                          url: partner.documents.drivingLicence.front.url,
                        })
                      }
                      className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={partner.documents.drivingLicence.front.url}
                        alt="Driving Licence Front View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span>Inspect Front</span>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Front View
                      </span>
                    </div>
                  )}

                  {partner.documents.drivingLicence.back?.url && (
                    <div
                      onClick={() =>
                        setInspectDoc({
                          title: "Driving Licence",
                          sideLabel: "Back View (Authorisation & Validity)",
                          description: partner.documents.drivingLicence.back?.description,
                          dataFields: partner.documents.drivingLicence.back?.dataFields,
                          url: partner.documents.drivingLicence.back?.url,
                        })
                      }
                      className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={partner.documents.drivingLicence.back.url}
                        alt="Driving Licence Back View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span>Inspect Back</span>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Back View
                      </span>
                    </div>
                  )}

                  {!partner.documents.drivingLicence.front.url && !partner.documents.drivingLicence.back?.url && (
                    <div className="w-[160px] h-[105px] rounded-[6px] border border-dashed border-[#E4E0DB] bg-[#F7F7F5] flex flex-col items-center justify-center text-[#6B6667] text-[11px] gap-1 shrink-0">
                      <FileText className="w-5 h-5 text-[#9E9B98]" />
                      <span>Not uploaded</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-[200px] text-xs space-y-1.5 pl-1">
                    <p className="font-semibold text-[#111111]">Licence Information</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-[#E4E0DB]">
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Licence Number:</span>
                        <strong className="text-[#111111] font-mono font-medium">
                          {partner.licenseNumber || "Not entered"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Vehicle Authorisation:</span>
                        <strong className="text-[#111111] font-medium">
                          {partner.licenseNumber ? "MCWG / 2-Wheeler" : "Not specified"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Document Validity:</span>
                        {isFieldEntered("docDL") ? (
                          <strong className="text-[#20885A] font-medium">Front &amp; Back Submitted</strong>
                        ) : (
                          <strong className="text-[#9E9B98] font-medium italic">Not uploaded</strong>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document 5: Vehicle RC */}
            <div
              className={`border rounded-[8px] p-4 transition-colors ${
                verificationMap.docRC?.status === "FLAGGED"
                  ? "bg-[#FEF2F2] border-[#FCA5A5]"
                  : "bg-[#F7F7F5] border-[#E4E0DB]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAE7DF] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111]">
                    5
                  </span>
                  <h4 className="text-xs font-semibold text-[#111111]">Vehicle Registration Certificate (RC)</h4>
                  <StatusBadge status={partner.documents.vehicleRc.status} variant="kyc" />
                </div>

                {/* Individual Tick / Wrong Controls */}
                {isFieldEntered("docRC") ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify("docRC")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docRC?.status === "VERIFIED"
                          ? "bg-[#20885A] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#20885A] hover:bg-[#ECFDF5]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </button>
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docRC", "Vehicle RC (Front & Back)", "vehicleRc")
                      }
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                        verificationMap.docRC?.status === "FLAGGED"
                          ? "bg-[#DA1E28] text-white shadow-xs"
                          : "bg-white border border-[#E4E0DB] text-[#DA1E28] hover:bg-[#FEF2F2]"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Issue</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#9E9B98] bg-[#F4F1EA] px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] font-medium">
                    Awaiting upload
                  </span>
                )}
              </div>

              {verificationMap.docRC?.status === "FLAGGED" && verificationMap.docRC?.issue && (
                <div className="mb-3 p-2 bg-white border border-[#FCA5A5] rounded-[6px] flex items-center justify-between text-xs text-[#DA1E28]">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Reason:</strong> {verificationMap.docRC.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleOpenIssueModal("docRC", "Vehicle RC (Front & Back)", "vehicleRc")
                      }
                      className="text-[11px] underline font-medium hover:text-[#991B1B]"
                    >
                      Edit
                    </button>
                    <span className="text-[#FCA5A5]">•</span>
                    <button
                      onClick={() => handleClearIssue("docRC")}
                      className="text-[11px] font-semibold text-[#991B1B] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Photos & Data Container */}
              <div className="bg-white p-3.5 rounded-[8px] border border-[#E4E0DB] space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {partner.documents.vehicleRc.front.url && (
                    <div
                      onClick={() =>
                        setInspectDoc({
                          title: "Vehicle RC",
                          sideLabel: "Front View (Plate & Specifications)",
                          description: partner.documents.vehicleRc.front.description,
                          dataFields: partner.documents.vehicleRc.front.dataFields,
                          url: partner.documents.vehicleRc.front.url,
                        })
                      }
                      className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={partner.documents.vehicleRc.front.url}
                        alt="Vehicle RC Front View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span>Inspect Front</span>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Front View
                      </span>
                    </div>
                  )}

                  {partner.documents.vehicleRc.back?.url && (
                    <div
                      onClick={() =>
                        setInspectDoc({
                          title: "Vehicle RC",
                          sideLabel: "Back View (Tax & Chassis Validity)",
                          description: partner.documents.vehicleRc.back?.description,
                          dataFields: partner.documents.vehicleRc.back?.dataFields,
                          url: partner.documents.vehicleRc.back?.url,
                        })
                      }
                      className="w-[160px] h-[105px] rounded-[6px] border border-[#E4E0DB] bg-neutral-900 overflow-hidden relative group cursor-pointer shadow-xs"
                    >
                      <img
                        src={partner.documents.vehicleRc.back.url}
                        alt="Vehicle RC Back View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <span>Inspect Back</span>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Back View
                      </span>
                    </div>
                  )}

                  {!partner.documents.vehicleRc.front.url && !partner.documents.vehicleRc.back?.url && (
                    <div className="w-[160px] h-[105px] rounded-[6px] border border-dashed border-[#E4E0DB] bg-[#F7F7F5] flex flex-col items-center justify-center text-[#6B6667] text-[11px] gap-1 shrink-0">
                      <FileText className="w-5 h-5 text-[#9E9B98]" />
                      <span>Not uploaded</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-[200px] text-xs space-y-1.5 pl-1">
                    <p className="font-semibold text-[#111111]">Registration Certificate Information</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-[#E4E0DB]">
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Plate Number:</span>
                        <strong className="text-[#111111] font-mono font-medium">
                          {partner.vehicleDetails?.registrationNumber || "Not registered"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">Make &amp; Model:</span>
                        {partner.vehicleDetails?.make || partner.vehicleDetails?.model ? (
                          <strong className="text-[#111111] font-medium">
                            {partner.vehicleDetails?.make} {partner.vehicleDetails?.model}
                          </strong>
                        ) : (
                          <span className="text-[#9E9B98] italic font-medium">Not provided</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[#6B6667] text-[11px] block">RC Status:</span>
                        {isFieldEntered("docRC") ? (
                          <strong className="text-[#20885A] font-medium">
                            {partner.vehicleDetails?.rcStatus || "Submitted"}
                          </strong>
                        ) : (
                          <span className="text-[#9E9B98] italic font-medium">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ADMIN DECISION (~35%) ================= */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-20 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto pr-0.5">
            {/* 1. Administrative Decision Card */}
            <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Administrative Decision</h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-[4px] border ${
                  isPending
                    ? "bg-[#FFFBEB] text-[#C9822E] border-[#FDE68A]"
                    : partner.kycStatus === "APPROVED"
                    ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                    : partner.kycStatus === "NOT_SUBMITTED"
                    ? "bg-[#F4F1EA] text-[#6B6667] border-[#E4E0DB]"
                    : "bg-[#FEF2F2] text-[#DA1E28] border-[#ffdad6]"
                }`}
              >
                {isPending
                  ? "Under Review"
                  : partner.kycStatus === "NOT_SUBMITTED"
                  ? "Not Submitted"
                  : partner.kycStatus}
              </span>
            </div>

            {/* Verification Progress Indicator */}
            <div className="space-y-1.5 bg-[#F7F7F5] p-3 rounded-[8px] border border-[#E4E0DB]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6667] font-medium">Verification Status:</span>
                <strong
                  className={`font-semibold ${
                    hasAnyWrong
                      ? "text-[#DA1E28]"
                      : partner.kycStatus === "NOT_SUBMITTED"
                      ? "text-[#6B6667]"
                      : "text-[#20885A]"
                  }`}
                >
                  {hasAnyWrong
                    ? `${flaggedCount} Item${flaggedCount === 1 ? "" : "s"} Flagged`
                    : partner.kycStatus === "NOT_SUBMITTED"
                    ? `${verifiedCount} / ${VERIFIABLE_FIELDS.length} Cleared (Awaiting Submission)`
                    : `${verifiedCount} / ${VERIFIABLE_FIELDS.length} Cleared`}
                </strong>
              </div>
              <div className="w-full bg-[#E4E0DB] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    hasAnyWrong
                      ? "bg-[#DA1E28]"
                      : partner.kycStatus === "NOT_SUBMITTED"
                      ? "bg-[#9E9B98]"
                      : "bg-[#20885A]"
                  }`}
                  style={{
                    width: `${Math.round((verifiedCount / VERIFIABLE_FIELDS.length) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Flagged Items Summary (if any wrong) */}
            {hasAnyWrong && (
              <div className="space-y-2 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DA1E28]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Issues Requiring Partner Action ({flaggedCount})</span>
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  {flaggedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2 p-1.5 bg-white/80 rounded border border-[#FECACA] text-[#991B1B]"
                    >
                      <div className="leading-tight">
                        <strong className="block text-[#7F1D1D]">{item.label}</strong>
                        <span className="text-[11px] text-[#991B1B]">{item.issue}</span>
                      </div>
                      <button
                        onClick={() => handleClearIssue(item.id)}
                        className="text-[10px] text-[#20885A] hover:underline font-semibold shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Action Buttons */}
            {partner.kycStatus === "NOT_SUBMITTED" ? (
              <div className="p-3.5 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] text-left space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6667]">
                  <Clock className="w-4 h-4 shrink-0 text-[#9E9B98]" />
                  <span>Application Incomplete</span>
                </div>
                <p className="text-[11px] text-[#6B6667] leading-relaxed">
                  The delivery partner has not completed their onboarding and KYC document submission yet. Administrative review will unlock once the partner submits their application.
                </p>
              </div>
            ) : partner.kycStatus === "APPROVED" && !hasAnyWrong ? (
              <div className="p-3.5 bg-[#ECFDF5] rounded-[8px] border border-[#A7F3D0] text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-[#20885A] mx-auto mb-1" />
                <p className="font-semibold text-xs text-[#20885A]">KYC Approved</p>
                <p className="text-[11px] text-[#6B6667]">Partner is fully verified for dispatch operations.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* Previous Rejection Banner (shown when KYC was rejected) */}
                {partner.kycStatus === "REJECTED" && (
                  <div className="p-3 bg-[#FEF2F2] rounded-[8px] border border-[#FCA5A5] text-left space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#DA1E28]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>KYC Application Rejected</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#FECACA] text-xs text-[#991B1B] whitespace-pre-line leading-relaxed font-mono text-[11px]">
                      {partner.rejectionReason || "Verification issues identified."}
                    </div>
                  </div>
                )}

                {/* Interactive Action Controls */}
                {!hasAnyWrong ? (
                  allVerified ? (
                    <>
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="w-full h-10 bg-[#FF5A1F] text-white text-xs font-semibold rounded-[8px] hover:bg-[#D94B17] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Partner KYC</span>
                      </button>
                      <button
                        onClick={handleOpenRejectModal}
                        className="w-full h-8 border border-[#DA1E28] text-[#DA1E28] hover:bg-[#FEF2F2] text-xs font-medium rounded-[8px] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject KYC</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#6B6667]">
                          <Clock className="w-3.5 h-3.5 text-[#9E9B98]" />
                          <span>Verification in Progress</span>
                        </div>
                        <p className="text-[11px] text-[#6B6667] leading-relaxed">
                          Verify all {VERIFIABLE_FIELDS.length} items to unlock KYC approval ({VERIFIABLE_FIELDS.length - verifiedCount} remaining).
                        </p>
                      </div>
                      <button
                        onClick={handleOpenRejectModal}
                        className="w-full h-8 border border-[#DA1E28] text-[#DA1E28] hover:bg-[#FEF2F2] text-xs font-medium rounded-[8px] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject KYC</span>
                      </button>
                    </>
                  )
                ) : (
                  <button
                    onClick={handleOpenRejectModal}
                    className="w-full h-11 bg-[#DA1E28] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-[8px] transition-all shadow-md flex items-center justify-center gap-2 ring-2 ring-[#DA1E28]/40"
                  >
                    <X className="w-4 h-4" />
                    <span>
                      Reject KYC ({flaggedCount} {flaggedCount === 1 ? "Issue" : "Issues"} Flagged)
                    </span>
                  </button>
                )}
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

            {partner.auditTrail.length === 0 ? (
              <p className="text-xs text-[#6B6667] italic py-2">No timeline events recorded yet.</p>
            ) : (
              <div className="relative space-y-4">
                {/* Continuous Timeline Connector Line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#E4E0DB]" />
                {partner.auditTrail.map((ev) => {
                  const isPrimary = ev.type === "primary";
                  const isSuccess = ev.type === "success";

                  return (
                    <div key={ev.id} className="relative flex items-start gap-3">
                      <div className="relative flex items-center justify-center shrink-0 w-5 pt-1">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shrink-0 ${
                            isPrimary
                              ? "bg-[#FF5A1F]"
                              : isSuccess
                              ? "bg-[#20885A]"
                              : "bg-[#DA1E28]"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#111111] truncate">{ev.title || "Audit Record"}</p>
                          <p className="text-[10px] text-[#6B6667] font-mono shrink-0">{ev.timestamp}</p>
                        </div>
                        <p className="text-xs text-[#6B6667] leading-snug mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* ========================================================================= */}
      {/* FLAG ISSUE MODAL (PREDEFINED & CUSTOM COMMENTS)                           */}
      {/* ========================================================================= */}
      {activeIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[12px] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#111111]">
                  Flag Issue: {activeIssueModal.fieldLabel}
                </h4>
                <p className="text-xs text-[#6B6667] mt-0.5">
                  Select a common reason or enter a custom comment to send to the driver.
                </p>
              </div>
              <button
                onClick={() => setActiveIssueModal(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Predefined Quick Reasons */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#6B6667] block uppercase tracking-wider">
                Common Predefined Issues
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(PREDEFINED_ISSUES[activeIssueModal.category] || []).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomComment(preset)}
                    className={`text-xs px-2.5 py-1.5 rounded-[6px] border text-left transition-colors ${
                      customComment === preset
                        ? "bg-[#FEF2F2] border-[#DA1E28] text-[#DA1E28] font-semibold"
                        : "bg-[#F7F7F5] border-[#E4E0DB] text-[#111111] hover:border-[#DA1E28]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Comment Field */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#6B6667] block uppercase tracking-wider">
                Rejection Note / Comment for Driver
              </span>
              <textarea
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder="e.g. Photo is blurry or face is not clearly visible. Please retake in good lighting."
                className="w-full h-24 p-3 border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:outline-hidden focus:border-[#DA1E28] focus:ring-1 focus:ring-[#DA1E28] resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#E4E0DB]">
              <div>
                {activeIssueModal.currentIssue && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClearIssue(activeIssueModal.fieldId);
                      setActiveIssueModal(null);
                    }}
                    className="h-8 px-3 text-xs font-semibold text-[#DA1E28] hover:bg-[#FEF2F2] rounded-[8px] border border-[#FCA5A5] transition-colors"
                  >
                    Clear Flag
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveIssueModal(null)}
                  className="h-8 px-3.5 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveIssue}
                  className="h-8 px-4 bg-[#DA1E28] text-white rounded-[8px] text-xs font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Flag Issue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPROVAL CONFIRMATION MODAL                                               */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#20885A] shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#111111]">
                  Approve Delivery Partner KYC
                </h4>
                <p className="text-xs text-[#6B6667] leading-relaxed">
                  Are you sure you want to approve KYC for <strong>{partner.fullName}</strong>? All 15 verification checks have cleared.
                </p>
              </div>
            </div>

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
      {/* REJECTION CONFIRMATION MODAL (WITH AGGREGATED FIELD ISSUES)                */}
      {/* ========================================================================= */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#ffdad6] flex items-center justify-center text-[#DA1E28] shrink-0">
                <X className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-[#111111]">
                  Confirm KYC Rejection
                </h4>
                <p className="text-xs text-[#6B6667] leading-relaxed">
                  The driver will receive these specific reasons on their verification screen to correct and resubmit:
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectionError(null);
                }}
                rows={5}
                className="w-full p-3 border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:outline-hidden focus:border-[#DA1E28] focus:ring-1 focus:ring-[#DA1E28] font-mono leading-relaxed"
                placeholder="Bullet points of reasons will be displayed to driver..."
              />
              {rejectionError && (
                <p className="text-[11px] text-[#DA1E28] font-medium">{rejectionError}</p>
              )}
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
                className="h-8 px-4 bg-[#DA1E28] text-white rounded-[8px] text-xs font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-RESOLUTION DOCUMENT LIGHTBOX / ZOOM MODAL                            */}
      {/* ========================================================================= */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[12px] max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#111111]">{inspectDoc.title}</h4>
                <p className="text-xs text-[#6B6667]">{inspectDoc.sideLabel}</p>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="text-[#6B6667] hover:text-[#111111] p-1 rounded hover:bg-[#F7F7F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectDoc.url ? (
              <div className="w-full h-80 rounded-[8px] overflow-hidden bg-neutral-950 flex items-center justify-center p-2">
                <img
                  src={inspectDoc.url}
                  alt={inspectDoc.title}
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>
            ) : (
              <div className="p-6 bg-[#F7F7F5] rounded-[8px] border border-dashed border-[#E4E0DB] text-center text-xs text-[#6B6667]">
                No preview photo available for this document.
              </div>
            )}

            {inspectDoc.dataFields && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F7F7F5] rounded-[8px] border border-[#E4E0DB] text-xs">
                {inspectDoc.dataFields.map((df) => (
                  <div key={df.label}>
                    <span className="text-[#6B6667] text-[11px] block">{df.label}:</span>
                    <strong className="text-[#111111] font-medium">{df.value}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setInspectDoc(null)}
                className="h-8 px-4 bg-white border border-[#E4E0DB] text-[#111111] rounded-[8px] text-xs font-semibold hover:bg-[#F7F7F5] transition-colors"
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
