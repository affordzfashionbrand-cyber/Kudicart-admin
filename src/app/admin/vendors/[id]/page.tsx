"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_VENDORS } from "@/mocks/vendors";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VendorDocument } from "@/types/vendors";

export default function AdminVendorDetailPage() {
  const params = useParams();
  const vendorId = (params?.id as string) || "ven_7821";

  // Find vendor or default to first
  const vendor =
    MOCK_VENDORS.find((v) => v.id === vendorId) || MOCK_VENDORS[0];

  const [approvalStatus, setApprovalStatus] = useState(vendor.status);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewDoc, setPreviewDoc] = useState<VendorDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApprove = () => {
    setApprovalStatus("ACTIVE");
    setIsApproveModalOpen(false);
    setToastMessage(
      `Vendor ${vendor.storeName} (#${vendor.vendorNumber}) has been approved and activated. (Local development state)`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleReject = () => {
    setApprovalStatus("SUSPENDED");
    setIsRejectModalOpen(false);
    setToastMessage(
      `Vendor application for ${vendor.storeName} was rejected with reason: "${rejectReason || "Compliance requirements not met"}". (Local development state)`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-[#333333] animate-fadeIn">
          <span className="material-symbols-outlined text-[#20885A] text-xl">info</span>
          <span className="font-label-sm text-label-sm">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-secondary hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Back Navigation Header */}
      <div>
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-1.5 text-label-sm font-label-sm font-semibold text-secondary hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          &lt; Back to Vendors
        </Link>
      </div>

      {/* Action-Oriented Header Area */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
              {vendor.storeName}
            </h1>
            <span className="font-code-sm text-code-sm text-secondary px-2.5 py-1 bg-surface-container rounded-md border border-surface-container-highest font-medium">
              {vendor.vendorNumber}
            </span>
            <StatusBadge status={approvalStatus} variant="vendor" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-body-sm font-body-sm text-secondary">
            <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
            <span>Application Submitted {vendor.submissionDate}</span>
            <span className="text-secondary">•</span>
            <span>
              Assigned Reviewer: <strong className="text-on-surface font-medium">{vendor.assignedReviewer}</strong>
            </span>
            <span className="text-secondary">•</span>
            <span className="inline-flex items-center gap-1 text-[#20885A] font-medium">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Identity Screening Pass
            </span>
          </div>
        </div>

        {/* Header Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => alert(`Downloading merchant dossier PDF for ${vendor.storeName}...`)}
            className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface border border-surface-container-highest hover:bg-surface text-label-sm font-label-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary">download</span>
            Download Dossier (PDF)
          </button>

          {approvalStatus !== "ACTIVE" && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-[#DA1E28] border border-[#DA1E28]/40 hover:bg-[#FEF2F2] text-label-sm font-label-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">cancel</span>
              Reject Application
            </button>
          )}

          {approvalStatus !== "ACTIVE" ? (
            <button
              onClick={() => setIsApproveModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-primary-container text-surface-container-lowest hover:bg-[#D94B17] text-label-sm font-label-sm font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Approve Vendor
            </button>
          ) : (
            <button
              onClick={() => {
                setApprovalStatus("SUSPENDED");
                setToastMessage(`Vendor ${vendor.storeName} suspended. (Local development state)`);
              }}
              className="h-9 px-3.5 rounded-lg bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA] hover:bg-[#DA1E28] hover:text-white text-label-sm font-label-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">pause_circle</span>
              Suspend Store
            </button>
          )}
        </div>
      </div>

      {/* Two-Column Operational Layout (8 cols Left, 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Key Stats / Operational Summary Bar */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-surface-container-highest">
            <div className="pt-2 md:pt-0">
              <span className="text-label-xs font-label-xs text-secondary uppercase tracking-wider block">
                Category
              </span>
              <p className="text-body-sm font-body-sm-medium text-on-surface mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">checkroom</span>
                {vendor.category}
              </p>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-label-xs font-label-xs text-secondary uppercase tracking-wider block">
                Operating Hub
              </span>
              <p
                className="text-body-sm font-body-sm-medium text-on-surface mt-1 flex items-center gap-1.5 truncate"
                title={vendor.operatingHub}
              >
                <span className="material-symbols-outlined text-[16px] text-[#20885A]">hub</span>
                {vendor.operatingHub}
              </p>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-label-xs font-label-xs text-secondary uppercase tracking-wider block">
                Initial Products Catalog
              </span>
              <p className="text-body-sm font-body-sm-medium text-on-surface mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0043CE]">inventory_2</span>
                {vendor.productCount} Draft Items
              </p>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="text-label-xs font-label-xs text-secondary uppercase tracking-wider block">
                Target Fulfillment
              </span>
              <p className="text-body-sm font-body-sm-medium text-on-surface mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary-container">bolt</span>
                {vendor.targetFulfillment}
              </p>
            </div>
          </div>

          {/* 2. Business & Entity Details Panel */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden">
            <div className="px-space-lg py-3.5 border-b border-surface-container-highest bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-secondary">domain</span>
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
                  Business &amp; Entity Details
                </h3>
              </div>
              <span className="text-label-xs font-label-xs text-secondary font-medium">
                Merchant Tier: Boutique Partner
              </span>
            </div>

            <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-body-sm font-body-sm">
              <div>
                <dt className="text-label-xs font-label-xs text-secondary">Legal Entity Name</dt>
                <dd className="mt-1 font-body-md-medium text-on-surface">{vendor.legalEntityName}</dd>
              </div>

              <div>
                <dt className="text-label-xs font-label-xs text-secondary">Primary Store Contact</dt>
                <dd className="mt-1 font-body-md-medium text-on-surface flex items-center gap-1.5">
                  <span>{vendor.ownerName}</span>
                  <span className="text-label-xs font-label-xs text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                    {vendor.ownerRole}
                  </span>
                </dd>
              </div>

              <div className="md:col-span-2 pt-1 border-t border-surface-container-highest">
                <dt className="text-label-xs font-label-xs text-secondary">Registered Business Address</dt>
                <dd className="mt-1 text-on-surface flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">location_on</span>
                  <span>{vendor.registeredAddress}</span>
                </dd>
              </div>

              <div className="pt-1 border-t border-surface-container-highest">
                <dt className="text-label-xs font-label-xs text-secondary">Email Address</dt>
                <dd className="mt-1 text-on-surface font-code-xs">{vendor.email}</dd>
              </div>

              <div className="pt-1 border-t border-surface-container-highest">
                <dt className="text-label-xs font-label-xs text-secondary">Phone Number</dt>
                <dd className="mt-1 text-on-surface font-code-xs">{vendor.phone}</dd>
              </div>

              <div className="pt-1 border-t border-surface-container-highest">
                <dt className="text-label-xs font-label-xs text-secondary">GSTIN Tax Identifier</dt>
                <dd className="mt-1 text-on-surface font-code-sm font-semibold">{vendor.gstin}</dd>
              </div>

              <div className="pt-1 border-t border-surface-container-highest">
                <dt className="text-label-xs font-label-xs text-secondary">Permanent Account Number (PAN)</dt>
                <dd className="mt-1 text-on-surface font-code-sm font-semibold">{vendor.pan}</dd>
              </div>

              <div className="md:col-span-2 pt-1 border-t border-surface-container-highest">
                <dt className="text-label-xs font-label-xs text-secondary">Bank Account / Payout Destination</dt>
                <dd className="mt-1 text-on-surface flex items-center gap-3">
                  <span className="font-body-md-medium">
                    {vendor.bankDetails.bankName} {vendor.bankDetails.accountMasked}
                  </span>
                  <span className="font-code-xs text-code-xs text-secondary">
                    IFSC: {vendor.bankDetails.ifsc}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* 3. Submitted Compliance Documents Panel */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden">
            <div className="px-space-lg py-3.5 border-b border-surface-container-highest bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-secondary">verified_user</span>
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
                  Submitted Compliance Documents
                </h3>
              </div>
              <span className="text-label-xs font-label-xs font-semibold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#20885A]">
                {vendor.documents.length} of 5 Files Present
              </span>
            </div>

            <div className="divide-y divide-surface-container-highest">
              {vendor.documents.length === 0 ? (
                <div className="p-6 text-center text-secondary text-body-sm">
                  No documents submitted yet for this vendor.
                </div>
              ) : (
                vendor.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="px-space-lg py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          {doc.fileType === "JPG" || doc.fileType === "PNG"
                            ? "photo_camera"
                            : "description"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-body-sm font-body-sm-medium text-on-surface">
                          {doc.title}
                        </h4>
                        <p className="text-code-xs text-code-xs text-secondary">
                          {doc.fileType} • {doc.fileSize} • {doc.referenceOrHash}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block text-label-xs font-label-xs text-secondary bg-surface-container px-2 py-0.5 rounded">
                        {doc.uploadedAt}
                      </span>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="h-7 px-2.5 rounded border border-surface-container-highest text-label-xs font-label-xs font-semibold text-on-surface hover:bg-surface transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Preview Document
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. Initial Product Catalog Preview Panel */}
          {vendor.draftProducts.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden">
              <div className="px-space-lg py-3.5 border-b border-surface-container-highest bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-secondary">inventory</span>
                  <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
                    Initial Catalog Submission ({vendor.draftProducts.length} Drafted)
                  </h3>
                </div>
                <Link
                  href="/admin/products"
                  className="text-label-xs font-label-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View All Products
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-10 bg-surface-container-low border-b border-surface-container-highest text-label-xs font-label-xs uppercase text-secondary">
                      <th className="px-space-lg font-semibold">Item &amp; Details</th>
                      <th className="px-4 font-semibold">SKU</th>
                      <th className="px-4 font-semibold">Category</th>
                      <th className="px-4 font-semibold text-right">Price</th>
                      <th className="px-4 font-semibold text-right">Draft Stock</th>
                      <th className="px-space-lg font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm">
                    {vendor.draftProducts.map((p) => (
                      <tr key={p.id} className="h-12 hover:bg-surface-container-low transition-colors">
                        <td className="px-space-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-8 h-8 rounded object-cover border border-surface-container-highest"
                            />
                            <span className="font-body-sm-medium text-on-surface">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 font-code-sm text-code-sm text-secondary">{p.sku}</td>
                        <td className="px-4 text-secondary">{p.category}</td>
                        <td className="px-4 text-right font-code-sm text-code-sm text-on-surface font-semibold tabular-nums">
                          ₹{p.price.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 text-right font-code-sm text-code-sm text-on-surface tabular-nums">
                          {p.draftStock} units
                        </td>
                        <td className="px-space-lg text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-label-xs font-semibold bg-surface-container text-secondary">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Onboarding Checklist Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-space-md space-y-3">
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Onboarding Review Checklist
            </h4>
            <div className="space-y-2.5 text-body-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#20885A] text-lg">check_circle</span>
                <span className="text-on-surface">Entity Legal Existence Verification</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#20885A] text-lg">check_circle</span>
                <span className="text-on-surface">GSTIN Live Portal Cross-Check</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#20885A] text-lg">check_circle</span>
                <span className="text-on-surface">Bank Account Name Match (Penny Drop)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#20885A] text-lg">check_circle</span>
                <span className="text-on-surface">Physical Atelier / Storefront Geotag</span>
              </div>
            </div>
          </div>

          {/* Logistics & Dark Store Hub Linkage */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-space-md space-y-3">
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Logistics &amp; Hub Assignment
            </h4>
            <div className="space-y-2 text-body-sm">
              <div>
                <span className="text-label-xs text-secondary block">Assigned Delivery Hub</span>
                <span className="font-medium text-on-surface">{vendor.operatingHub}</span>
              </div>
              <div>
                <span className="text-label-xs text-secondary block">Primary Courier Fleet</span>
                <span className="text-on-surface">Bandra Zone EV Two-Wheelers</span>
              </div>
              <div>
                <span className="text-label-xs text-secondary block">Express Delivery SLA</span>
                <span className="text-[#20885A] font-semibold">60 Minutes Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Commercial Commission Terms Note */}
          <div className="bg-[#FFF0E8] border border-[#FFDBCE] rounded-xl p-space-md space-y-2">
            <div className="flex items-center gap-2 text-[#AE3200]">
              <span className="material-symbols-outlined text-lg">info</span>
              <h4 className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Commercial Agreement
              </h4>
            </div>
            <p className="font-body-sm text-body-sm text-[#852400]">
              Standard marketplace boutique commission rate is set at <strong>12.5%</strong>. Commission configuration remains provisional until formal physical countersignature by {vendor.ownerName}.
            </p>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-surface-container-highest max-w-2xl w-full p-space-lg shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {previewDoc.title}
                </h3>
                <p className="font-code-xs text-code-xs text-secondary mt-0.5">
                  {previewDoc.fileType} • {previewDoc.fileSize} • {previewDoc.referenceOrHash}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="h-64 bg-[#F4F1EA] rounded-lg border border-dashed border-[#E4E0DB] flex flex-col items-center justify-center text-secondary space-y-2 p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-primary">
                {previewDoc.fileType === "JPG" || previewDoc.fileType === "PNG"
                  ? "image"
                  : "picture_as_pdf"}
              </span>
              <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                {previewDoc.title}
              </p>
              <p className="font-body-sm text-body-sm text-secondary max-w-md">
                Verified compliance asset hash: {previewDoc.referenceOrHash}. Original archival file safely stored in encrypted compliance vault.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-highest">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Dialog */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-surface-container-highest max-w-md w-full p-space-lg shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#20885A] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Approve {vendor.storeName}?
                </h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Approving this application will activate the boutique on KudiCart marketplace, enable their {vendor.productCount} catalog drafts for publishing, and assign Bandra West Hub fulfillment routing.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-highest">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-surface-container-highest text-secondary hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg bg-[#20885A] hover:bg-[#15803D] font-label-sm text-label-sm font-semibold text-white transition-colors"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Dialog with Reason Field */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-surface-container-highest max-w-md w-full p-space-lg shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#DA1E28] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">cancel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Reject Application for {vendor.storeName}?
                </h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Please provide a formal rejection reason to be communicated to {vendor.ownerName}.
                </p>
              </div>
            </div>

            <div>
              <label className="font-label-xs text-label-xs text-secondary font-semibold uppercase tracking-wider block mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. GST certificate mismatch with registered entity name..."
                rows={3}
                className="w-full p-2.5 bg-surface text-body-sm text-on-surface rounded-lg border border-surface-container-highest focus:outline-none focus:border-[#DA1E28]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-highest">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-surface-container-highest text-secondary hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-[#DA1E28] hover:bg-[#B91C1C] font-label-sm text-label-sm font-semibold text-white transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
