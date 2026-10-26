"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_PRODUCTS } from "@/mocks/products";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AdminProductDetailPage() {
  const params = useParams();
  const productId = (params?.id as string) || "prod_klh_0102";

  // Find product or default to first
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = product.galleryImages.length > 0
    ? product.galleryImages
    : [{ url: product.primaryImageUrl, label: "Master Asset", tag: "Primary" }];

  const currentImage = images[selectedImageIndex] || images[0];

  // Commercial calculations
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : 0;

  const commissionRate = 12.5; // Provisional marketplace standard
  const commissionAmount = Math.round((product.sellingPrice * commissionRate) / 100);
  const netVendorPayout = product.sellingPrice - commissionAmount;

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto">
      {/* Navigation Jump & Context Breadcrumb */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 font-label-sm text-label-sm font-medium text-secondary hover:text-on-surface transition-colors group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span>Back to Products</span>
        </Link>
      </div>

      {/* ================= PRODUCT HEADER & ACTION BAR ================= */}
      <section className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-code-sm text-code-sm bg-surface-container text-on-surface font-semibold px-2 py-0.5 rounded border border-[#E4E0DB]">
                #SKU-{product.sku}
              </span>
              <StatusBadge status={product.listingStatus} variant="product" />
              <StatusBadge status={product.fulfillmentType} variant="fulfillment" />
              {product.tryAndBuyEligible && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                  <span className="material-symbols-outlined text-[13px]">checkroom</span>
                  Try &amp; Buy Eligible
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                {product.title}
              </h1>
              <span className="font-label-xs text-label-xs text-secondary bg-surface-container-low px-2 py-1 rounded">
                Inspection View Only
              </span>
            </div>
          </div>

          {/* Action Controls (Read-Only Operations Boundary) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/vendor/products/${product.sku}`}
              className="h-9 px-3.5 rounded-lg border border-[#E4E0DB] bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">open_in_new</span>
              <span>View in Boutique Portal</span>
            </Link>

            <button
              onClick={() => alert(`Downloading SKU Dossier for #${product.sku}...`)}
              className="h-9 px-3.5 rounded-lg border border-[#E4E0DB] bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">download</span>
              <span>Download SKU Dossier</span>
            </button>

            <button
              onClick={() => {
                const jsonBlob = new Blob([JSON.stringify(product, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(jsonBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `product_${product.sku}.json`;
                a.click();
              }}
              className="h-9 px-3.5 rounded-lg border border-[#E4E0DB] bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">data_object</span>
              <span>Export Product JSON</span>
            </button>
          </div>
        </div>

        {/* Banner note informing Central Operations boundary */}
        <div className="mt-4 pt-3 border-t border-[#E4E0DB] flex items-center gap-2 text-secondary text-label-xs font-label-xs">
          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
          <span>
            Central Operations View: SKU attributes and commercial pricing are verified read-only states. All merchant catalog revisions originate from {product.vendorName}&apos;s Boutique Workspace.
          </span>
        </div>
      </section>

      {/* ================= TWO-COLUMN CONTENT GRID (7:5 ratio) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Imagery, Narrative & Specifications */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Product Imagery & Gallery Panel */}
          <section className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB] mb-4">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">photo_library</span>
                Product Imagery &amp; Gallery
              </h2>
              <span className="font-label-xs text-label-xs text-secondary font-medium">
                {images.length} High-Resolution Assets • Studio Photography Standard Compliant
              </span>
            </div>

            {/* Primary Showcase Image */}
            <div className="relative w-full h-80 rounded-lg overflow-hidden border border-[#E4E0DB] bg-[#F4F1EA] mb-3">
              <img
                src={currentImage.url}
                alt={currentImage.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-[#111111]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-label-xs font-label-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {currentImage.label}
              </div>
              <div className="absolute top-3 right-3 bg-white/90 border border-[#E4E0DB] px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold text-on-surface">
                Color Calibrated: D65
              </div>
            </div>

            {/* Supporting Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer p-0.5 bg-white transition-all ${
                    selectedImageIndex === idx
                      ? "border-2 border-primary-container shadow-sm"
                      : "border border-[#E4E0DB] hover:border-primary-container"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover rounded-md"
                  />
                  {img.tag && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1 rounded">
                      {img.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 2. Narrative Description */}
          {product.description && (
            <section className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 space-y-2">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Catalog Narrative &amp; Craftsmanship
              </h3>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                {product.description}
              </p>
            </section>
          )}

          {/* 3. Technical Specifications Table */}
          <section className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E4E0DB] bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Verified Technical Specifications
                </h3>
              </div>
              <span className="text-label-xs font-label-xs text-secondary font-medium">
                Physical Inspection Verified
              </span>
            </div>

            <div className="divide-y divide-[#E4E0DB] text-body-sm">
              {product.specifications.map((spec, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-secondary font-medium">{spec.label}</span>
                  <span className="font-medium text-on-surface text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Pricing, Inventory & Merchant Attribution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pricing & Commercial Structure Card */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Commercial Structure &amp; Pricing
            </h3>

            <div className="flex items-baseline gap-3">
              <div className="font-headline-lg text-3xl font-extrabold text-on-surface font-code-sm">
                ₹{product.sellingPrice.toLocaleString("en-IN")}
              </div>
              {product.originalPrice && (
                <>
                  <div className="text-secondary text-base line-through font-code-sm">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </div>
                  <span className="px-2 py-0.5 rounded text-label-xs font-bold bg-[#ECFDF5] text-[#20885A]">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#E4E0DB] space-y-2 text-body-sm font-body-sm">
              <div className="flex items-center justify-between text-secondary">
                <span>Standard Platform Commission (12.5%)</span>
                <span className="font-code-sm text-on-surface font-medium">
                  ₹{commissionAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-secondary">
                <span>Estimated Vendor Net Settlement</span>
                <span className="font-code-sm text-[#20885A] font-bold">
                  ₹{netVendorPayout.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory & Stock Distribution Card */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Inventory &amp; Hub Routing
              </h3>
              <StatusBadge status={product.stockStatus} variant="stock" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-surface p-3 rounded-lg border border-[#E4E0DB]">
                <span className="text-label-xs text-secondary block uppercase tracking-wider">
                  Live Available Units
                </span>
                <span className="font-headline-md text-2xl font-bold text-on-surface font-code-sm mt-1 block">
                  {product.stockQuantity}
                </span>
              </div>

              <div className="bg-surface p-3 rounded-lg border border-[#E4E0DB]">
                <span className="text-label-xs text-secondary block uppercase tracking-wider">
                  Fulfillment Mode
                </span>
                <span className="font-label-sm font-semibold text-on-surface mt-1 block">
                  {product.fulfillmentType === "DARK_STORE" ? "Dark Store Hub" : "Vendor Fulfilled"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E0DB] space-y-2 text-body-sm">
              <div>
                <span className="text-label-xs text-secondary block">Assigned Operating Hub</span>
                <span className="font-medium text-on-surface">{product.hubAssignment}</span>
              </div>
            </div>
          </div>

          {/* Merchant Attribution Card */}
          <div className="bg-surface-container-lowest border border-[#E4E0DB] rounded-xl p-5 space-y-3">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Merchant Attribution
            </h3>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="font-body-md-medium text-body-md-medium font-bold text-on-surface">
                  {product.vendorName}
                </h4>
                <p className="text-label-xs text-secondary">Verified Boutique Merchant</p>
              </div>

              {product.vendorId && (
                <Link
                  href={`/admin/vendors/${product.vendorId}`}
                  className="h-8 px-3 rounded-lg border border-[#E4E0DB] hover:bg-surface text-primary font-label-sm text-label-sm font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Vendor</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
