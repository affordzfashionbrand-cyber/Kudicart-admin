"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VendorBoutique, VendorDocument } from "@/types/vendors";
import { getDemoVendorById } from "@/demo-data/vendors";
import { api } from "@/lib/api";

export default function AdminVendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.id as string;

  const [vendor, setVendor] = useState<VendorBoutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action modals & states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewDoc, setPreviewDoc] = useState<VendorDocument | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);

    api.vendors.getById(vendorId)
      .then((res) => {
        if (res && res.id) {
          setVendor(res);
        } else {
          const found = getDemoVendorById(vendorId);
          if (found) setVendor(found);
          else setError(`Vendor boutique record "${vendorId}" was not found.`);
        }
      })
      .catch(() => {
        const found = getDemoVendorById(vendorId);
        if (found) setVendor(found);
        else setError(`Vendor boutique record "${vendorId}" was not found.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [vendorId]);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApprove = async () => {
    if (!vendor) return;
    try {
      await api.vendors.approve(vendorId);
      setVendor((prev) => prev ? { ...prev, status: "ACTIVE" } : null);
      setIsApproveModalOpen(false);
      setToastMessage(`Vendor ${vendor.storeName} approved successfully.`);
    } catch (err: any) {
      setIsApproveModalOpen(false);
      setToastMessage(err?.message || "Failed to approve vendor.");
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReject = async () => {
    if (!vendor) return;
    try {
      await api.vendors.reject(vendorId, rejectReason);
      setVendor((prev) => prev ? { ...prev, status: "REJECTED" } : null);
      setIsRejectModalOpen(false);
      setToastMessage(`Vendor ${vendor.storeName} rejected.`);
    } catch (err: any) {
      setIsRejectModalOpen(false);
      setToastMessage(err?.message || "Failed to reject vendor.");
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSuspend = async () => {
    if (!vendor) return;
    try {
      const res = await api.vendors.toggleSuspend(vendorId);
      const newStatus = res?.vendor?.status || (vendor.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED");
      setVendor((prev) => prev ? { ...prev, status: newStatus } : null);
      setIsSuspendModalOpen(false);
      setToastMessage(`Vendor ${vendor.storeName} status changed to ${newStatus}.`);
    } catch (err: any) {
      setIsSuspendModalOpen(false);
      setToastMessage(err?.message || "Failed to toggle vendor suspension.");
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadDossier = () => {
    if (!vendor) return;
    const dossierText = JSON.stringify(vendor, null, 2);
    const blob = new Blob([dossierText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kudicart_dossier_${vendor.vendorNumber.replace(/[^a-zA-Z0-9]/g, "")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`Exported JSON dossier for ${vendor.storeName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
        <div className="w-36 h-4 bg-[#E4E0DB] rounded animate-pulse" />
        <div className="h-28 bg-white rounded-[10px] border border-[#E4E0DB] p-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 h-96 bg-white rounded-[10px] border border-[#E4E0DB] animate-pulse" />
          <div className="lg:col-span-4 h-96 bg-white rounded-[10px] border border-[#E4E0DB] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!vendor || error) {
    return (
      <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8">
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <h2 className="text-base font-semibold text-[#111111]">Vendor Not Found</h2>
          <p className="text-xs text-[#6B6667]">
            {error || `The requested vendor "${vendorId}" was not found.`}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/vendors"
              className="px-3.5 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium rounded-[8px] transition-colors inline-block"
            >
              Back to Vendors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPending =
    vendor.status === "PENDING_REVIEW" ||
    vendor.status === "DOCS_SUBMITTED" ||
    vendor.status === "KYC_PENDING";

  return (
    <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-[8px] shadow-lg flex items-center gap-3 border border-[#333333] text-xs">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#6B6667] hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header Area */}
      <div className="bg-white rounded-[10px] p-4 sm:p-5 border border-[#E4E0DB] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              {vendor.storeName}
            </h1>
            <span className="font-mono text-xs text-[#6B6667] px-2 py-0.5 bg-[#F4F1EA] rounded border border-[#E4E0DB] font-medium">
              {vendor.vendorNumber}
            </span>
            <StatusBadge status={vendor.status} variant="vendor" />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#6B6667]">
            <span>Submitted: <strong className="text-[#111111] font-medium">{vendor.submissionDate}</strong></span>
            <span>•</span>
            <span>Operating Hub: <strong className="text-[#111111] font-medium">{vendor.operatingHub || "Bandra West Node"}</strong></span>
            {vendor.documents.length > 0 && (
              <>
                <span>•</span>
                <span className="text-[#20885A] font-medium">
                  {vendor.documents.filter((d) => d.verified).length} of {vendor.documents.length} Documents On File
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadDossier}
            className="h-9 px-3 rounded-[8px] bg-white text-[#111111] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#6B6667]">download</span>
            <span>Export Record</span>
          </button>

          {isPending && (
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              className="h-9 px-3 rounded-[8px] bg-white text-[#DA1E28] border border-[#DA1E28]/40 hover:bg-[#FEF2F2] text-xs font-medium transition-colors"
            >
              <span>Reject</span>
            </button>
          )}

          {isPending ? (
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(true)}
              className="h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] text-white hover:bg-[#D94B17] text-xs font-medium shadow-xs transition-all"
            >
              <span>Approve Vendor</span>
            </button>
          ) : vendor.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => setIsSuspendModalOpen(true)}
              className="h-9 px-3 rounded-[8px] bg-[#FEF2F2] text-[#DA1E28] border border-[#FECACA] hover:bg-[#DA1E28] hover:text-white text-xs font-medium transition-colors"
            >
              <span>Suspend Boutique</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApprove}
              className="h-9 px-3.5 rounded-[8px] bg-[#20885A] text-white hover:bg-[#15803D] text-xs font-medium transition-colors"
            >
              <span>Reactivate Boutique</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Summary Metrics Bar */}
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-4 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-xs">
            <div>
              <span className="text-xs text-[#6B6667] block">Category</span>
              <p className="text-xs font-medium text-[#111111] mt-0.5">{vendor.category}</p>
            </div>
            <div>
              <span className="text-xs text-[#6B6667] block">Operating Hub</span>
              <p className="text-xs font-medium text-[#111111] mt-0.5 truncate">{vendor.operatingHub || "Bandra West Node"}</p>
            </div>
            <div>
              <span className="text-xs text-[#6B6667] block">Initial Catalog</span>
              <p className="text-xs font-medium text-[#111111] mt-0.5">{vendor.productCount} Items</p>
            </div>
            <div>
              <span className="text-xs text-[#6B6667] block">Fulfillment Mode</span>
              <p className="text-xs font-medium text-[#111111] mt-0.5">{vendor.targetFulfillment || "Hub Standard"}</p>
            </div>
          </div>

          {/* Business & Entity Details Panel */}
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#E4E0DB] bg-[#F7F7F5] flex items-center justify-between">
              <h3 className="text-xs font-medium text-[#111111]">
                Business Details
              </h3>
              <span className="text-xs text-[#6B6667]">
                Tier 1 Boutique
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
              <div>
                <dt className="text-xs text-[#6B6667]">Legal Entity Name</dt>
                <dd className="mt-0.5 font-medium text-[#111111]">{vendor.legalEntityName}</dd>
              </div>

              <div>
                <dt className="text-xs text-[#6B6667]">Primary Contact</dt>
                <dd className="mt-0.5 font-medium text-[#111111] flex items-center gap-1.5">
                  <span>{vendor.ownerName}</span>
                  {vendor.ownerRole && (
                    <span className="text-[11px] text-[#6B6667] bg-[#F4F1EA] px-1.5 py-0.2 rounded border border-[#E4E0DB]">
                      {vendor.ownerRole}
                    </span>
                  )}
                </dd>
              </div>

              <div className="md:col-span-2 pt-2 border-t border-[#E4E0DB]">
                <dt className="text-xs text-[#6B6667]">Registered Business Address</dt>
                <dd className="mt-0.5 text-[#111111]">{vendor.registeredAddress}</dd>
              </div>

              <div className="pt-2 border-t border-[#E4E0DB]">
                <dt className="text-xs text-[#6B6667]">Email Address</dt>
                <dd className="mt-0.5 font-mono text-[#111111] flex items-center gap-1.5">
                  <span>{vendor.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vendor.email, "email")}
                    className="text-[#6B6667] hover:text-[#FF5A1F]"
                    title="Copy Email"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedField === "email" ? "check" : "content_copy"}
                    </span>
                  </button>
                </dd>
              </div>

              <div className="pt-2 border-t border-[#E4E0DB]">
                <dt className="text-xs text-[#6B6667]">Phone Number</dt>
                <dd className="mt-0.5 font-mono tabular-nums text-[#111111] flex items-center gap-1.5">
                  <span>{vendor.phone}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vendor.phone, "phone")}
                    className="text-[#6B6667] hover:text-[#FF5A1F]"
                    title="Copy Phone"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedField === "phone" ? "check" : "content_copy"}
                    </span>
                  </button>
                </dd>
              </div>

              <div className="pt-2 border-t border-[#E4E0DB]">
                <dt className="text-xs text-[#6B6667]">GSTIN Identifier</dt>
                <dd className="mt-0.5 font-mono font-medium text-[#111111]">{vendor.gstin}</dd>
              </div>

              <div className="pt-2 border-t border-[#E4E0DB]">
                <dt className="text-xs text-[#6B6667]">Permanent Account Number (PAN)</dt>
                <dd className="mt-0.5 font-mono font-medium text-[#111111]">{vendor.pan}</dd>
              </div>

              <div className="md:col-span-2 pt-2 border-t border-[#E4E0DB]">
                <dt className="text-xs text-[#6B6667]">Bank Account / Payout Destination</dt>
                <dd className="mt-0.5 text-[#111111] flex items-center gap-3">
                  <span className="font-medium">
                    {vendor.bankDetails.bankName} {vendor.bankDetails.accountMasked}
                  </span>
                  <span className="font-mono text-[#6B6667] bg-[#F4F1EA] px-1.5 py-0.5 rounded border border-[#E4E0DB]">
                    IFSC: {vendor.bankDetails.ifsc}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* Submitted Compliance Documents */}
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#E4E0DB] bg-[#F7F7F5] flex items-center justify-between">
              <h3 className="text-xs font-medium text-[#111111]">
                Compliance Documents
              </h3>
              <span className="text-xs text-[#6B6667]">
                {vendor.documents.length} Files Uploaded
              </span>
            </div>

            <div className="divide-y divide-[#E4E0DB]">
              {vendor.documents.length === 0 ? (
                <div className="p-6 text-center text-[#6B6667] text-xs">
                  No compliance documents submitted for this vendor.
                </div>
              ) : (
                vendor.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-[#F7F7F5]/50 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-medium text-[#111111]">
                        {doc.title}
                      </h4>
                      <p className="font-mono text-[11px] text-[#6B6667] mt-0.5">
                        {doc.fileType} • {doc.fileSize} • {doc.referenceOrHash}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block text-[11px] text-[#6B6667] bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E4E0DB]">
                        {doc.uploadedAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] text-xs font-medium text-[#111111] bg-white hover:bg-[#F4F1EA] transition-colors"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Initial Product Catalog Summary */}
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#E4E0DB] bg-[#F7F7F5] flex items-center justify-between">
              <h3 className="text-xs font-medium text-[#111111]">
                Initial Catalog Submission ({vendor.draftProducts.length} Draft Items)
              </h3>
              <Link
                href="/admin/products"
                className="text-xs font-medium text-[#FF5A1F] hover:underline"
              >
                View Catalog →
              </Link>
            </div>

            {vendor.draftProducts.length === 0 ? (
              <div className="p-6 text-center text-[#6B6667] text-xs">
                No draft products registered in initial catalog submission.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                      <th className="px-4 py-0 font-medium">Item</th>
                      <th className="px-4 py-0 font-medium">SKU</th>
                      <th className="px-4 py-0 font-medium">Category</th>
                      <th className="px-4 py-0 font-medium text-right">Price</th>
                      <th className="px-4 py-0 font-medium text-right">Draft Stock</th>
                      <th className="px-4 py-0 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
                    {vendor.draftProducts.map((p) => (
                      <tr key={p.id} className="h-11 hover:bg-[#F7F7F5]/50 transition-colors">
                        <td className="px-4 py-0 font-medium text-[#111111]">{p.title}</td>
                        <td className="px-4 py-0 font-mono text-xs text-[#6B6667]">{p.sku}</td>
                        <td className="px-4 py-0 text-xs text-[#6B6667]">{p.category}</td>
                        <td className="px-4 py-0 text-right font-mono font-semibold tabular-nums text-[#111111]">
                          ₹{(p.price ?? 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-0 text-right font-medium tabular-nums text-[#111111]">
                          {p.draftStock}
                        </td>
                        <td className="px-4 py-0 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB]">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Compliance Checklist Card */}
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-medium text-[#111111]">
              Document Checklist
            </h4>
            <div className="space-y-2 text-xs">
              {vendor.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-1 border-b border-[#F4F1EA] last:border-0">
                  <span className="text-[#111111] font-medium truncate max-w-[210px]">{d.title}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    d.verified ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                  }`}>
                    {d.verified ? "Verified" : "Under Review"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hub Logistics Routing */}
          <div className="bg-white rounded-[10px] border border-[#E4E0DB] p-4 space-y-2.5 shadow-xs">
            <h4 className="text-xs font-medium text-[#111111]">
              Fulfillment Routing
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-xs text-[#6B6667] block">Assigned Terminal Hub</span>
                <span className="font-medium text-[#111111] mt-0.5 block">
                  {vendor.operatingHub || "Bandra West Node"}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E4E0DB]">
                <span className="text-xs text-[#6B6667] block">Dispatch Protocol</span>
                <span className="text-[#111111] mt-0.5 block">
                  Manual Delivery Assignment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[10px] border border-[#E4E0DB] max-w-xl w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#111111]">
                  {previewDoc.title}
                </h3>
                <p className="font-mono text-xs text-[#6B6667] mt-0.5">
                  {previewDoc.fileType} • {previewDoc.fileSize}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded text-[#6B6667] hover:text-[#111111]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="h-48 bg-[#F7F7F5] rounded-[8px] border border-dashed border-[#E4E0DB] flex flex-col items-center justify-center text-[#6B6667] space-y-1.5 p-6 text-center">
              <span className="material-symbols-outlined text-[#FF5A1F] text-[36px]">description</span>
              <p className="text-xs font-medium text-[#111111]">
                {previewDoc.title}
              </p>
              <p className="text-xs text-[#6B6667] font-mono">
                Hash: {previewDoc.referenceOrHash}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-3.5 py-2 rounded-[8px] bg-white border border-[#E4E0DB] text-[#111111] text-xs font-medium hover:bg-[#F7F7F5]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Dialog */}
      {isApproveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setIsApproveModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[10px] border border-[#E4E0DB] max-w-md w-full p-5 shadow-xl space-y-3"
          >
            <h3 className="text-base font-semibold text-[#111111]">
              Approve {vendor.storeName}?
            </h3>
            <p className="text-xs text-[#6B6667] leading-relaxed">
              Approving this application will activate the boutique on the marketplace and allow catalog publishing.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-3.5 py-2 rounded-[8px] border border-[#E4E0DB] text-[#6B6667] hover:text-[#111111] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-2 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[10px] border border-[#E4E0DB] max-w-md w-full p-5 shadow-xl space-y-3"
          >
            <h3 className="text-base font-semibold text-[#111111]">
              Reject {vendor.storeName}?
            </h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for application rejection..."
              className="w-full p-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#DA1E28] resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-[8px] border border-[#E4E0DB] text-[#6B6667] hover:text-[#111111] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 rounded-[8px] bg-[#DA1E28] hover:bg-[#B91C1C] text-white text-xs font-medium"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Dialog */}
      {isSuspendModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setIsSuspendModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[10px] border border-[#E4E0DB] max-w-md w-full p-5 shadow-xl space-y-3"
          >
            <h3 className="text-base font-semibold text-[#111111]">
              Suspend {vendor.storeName}?
            </h3>
            <p className="text-xs text-[#6B6667] leading-relaxed">
              Suspending this boutique will pause active customer checkout for their catalog items.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-3.5 py-2 rounded-[8px] border border-[#E4E0DB] text-[#6B6667] hover:text-[#111111] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSuspend}
                className="px-4 py-2 rounded-[8px] bg-[#DA1E28] hover:bg-[#B91C1C] text-white text-xs font-medium"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
