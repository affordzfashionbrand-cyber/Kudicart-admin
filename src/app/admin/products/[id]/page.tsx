"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CatalogProduct } from "@/types/products";
import { getDemoProductById } from "@/demo-data/products";

export default function AdminProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    const found = getDemoProductById(productId);
    if (found) {
      setProduct(found);
    } else {
      setError(`Product record "${productId}" was not found.`);
    }
    setLoading(false);
  }, [productId]);

  const handleExportJson = () => {
    if (!product) return;
    const blob = new Blob([JSON.stringify(product, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kudicart_product_${product.sku}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Exported JSON for #${product.sku}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
        <div className="w-36 h-4 bg-[#E4E0DB] rounded animate-pulse" />
        <div className="h-28 bg-white rounded-[10px] border border-[#E4E0DB] p-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 h-96 bg-white rounded-[10px] border border-[#E4E0DB] animate-pulse" />
          <div className="lg:col-span-5 h-96 bg-white rounded-[10px] border border-[#E4E0DB] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8">
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <h2 className="text-base font-semibold text-[#111111]">Product Not Found</h2>
          <p className="text-xs text-[#6B6667]">
            {error || `The requested product "${productId}" was not found.`}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/products"
              className="px-3.5 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium rounded-[8px] transition-colors inline-block"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [{ url: product.primaryImageUrl, label: "Master Asset", tag: "Primary" }];

  const currentImage = images[selectedImageIndex] || images[0];

  const discountPercent = product.originalPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : 0;

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

      {/* Product Header & Action Bar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs bg-[#F4F1EA] text-[#111111] font-medium px-2 py-0.5 rounded border border-[#E4E0DB]">
                SKU: {product.sku}
              </span>
              <StatusBadge status={product.listingStatus} variant="product" />
              <StatusBadge status={product.fulfillmentType} variant="fulfillment" />
            </div>

            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              {product.title}
            </h1>
            <p className="text-xs text-[#6B6667] mt-0.5">
              Brand: {product.brand} • Vendor: {product.vendorName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportJson}
              className="h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#6B6667]">download</span>
              <span>Export Record</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (7 cols): Imagery, Narrative & Specifications */}
        <div className="lg:col-span-7 space-y-4">
          {/* Gallery Panel */}
          <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB] mb-3">
              <h2 className="text-xs font-medium text-[#111111]">
                Product Imagery
              </h2>
              <span className="text-xs text-[#6B6667]">
                {images.length} Image Assets
              </span>
            </div>

            {/* Primary Image */}
            <div className="relative w-full h-80 rounded-[8px] overflow-hidden border border-[#E4E0DB] bg-[#F4F1EA] mb-3">
              <img
                src={currentImage.url}
                alt={currentImage.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-[#111111]/80 text-white px-2 py-0.5 rounded text-xs">
                {currentImage.label}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-2.5">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square rounded-[6px] overflow-hidden cursor-pointer p-0.5 bg-white transition-all ${
                    selectedImageIndex === idx
                      ? "border-2 border-[#FF5A1F]"
                      : "border border-[#E4E0DB] hover:border-[#FF5A1F]"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover rounded-[4px]"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          {product.description && (
            <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 space-y-1.5 shadow-xs">
              <h3 className="text-xs font-medium text-[#111111]">
                Description
              </h3>
              <p className="text-xs text-[#111111] leading-relaxed">
                {product.description}
              </p>
            </section>
          )}

          {/* Technical Specifications */}
          <section className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#E4E0DB] bg-[#F7F7F5] flex items-center justify-between">
              <h3 className="text-xs font-medium text-[#111111]">
                Product Specifications
              </h3>
            </div>

            <div className="divide-y divide-[#E4E0DB] text-xs">
              {product.specifications.length === 0 ? (
                <div className="p-6 text-center text-[#6B6667]">
                  No technical specifications registered for this SKU.
                </div>
              ) : (
                product.specifications.map((spec, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[#6B6667]">{spec.label}</span>
                    <span className="font-medium text-[#111111] text-right">{spec.value}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Pricing, Inventory & Attribution */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pricing Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-medium text-[#111111]">
              Pricing
            </h3>

            <div className="flex items-baseline gap-2.5">
              <div className="text-2xl font-semibold text-[#111111] tabular-nums">
                ₹{(product.sellingPrice ?? 0).toLocaleString("en-IN")}
              </div>
              {product.originalPrice && product.originalPrice > product.sellingPrice && (
                <>
                  <div className="text-[#6B6667] text-xs line-through tabular-nums">
                    ₹{(product.originalPrice ?? 0).toLocaleString("en-IN")}
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-[#E4E0DB] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#6B6667]">
                <span>Selling Price</span>
                <span className="font-medium text-[#111111] tabular-nums">
                  ₹{(product.sellingPrice ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
              {product.originalPrice && (
                <div className="flex items-center justify-between text-[#6B6667]">
                  <span>Maximum Retail Price (MRP)</span>
                  <span className="tabular-nums">
                    ₹{(product.originalPrice ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-[#111111]">
                Inventory Status
              </h3>
              <StatusBadge status={product.stockStatus} variant="stock" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#F7F7F5] p-3 rounded-[8px] border border-[#E4E0DB]">
                <span className="text-xs text-[#6B6667] block">Available Units</span>
                <span className="text-xl font-semibold text-[#111111] tabular-nums mt-0.5 block">
                  {product.stockQuantity}
                </span>
              </div>

              <div className="bg-[#F7F7F5] p-3 rounded-[8px] border border-[#E4E0DB]">
                <span className="text-xs text-[#6B6667] block">Fulfillment</span>
                <span className="text-xs font-medium text-[#111111] mt-1 block">
                  {product.fulfillmentType === "DARK_STORE" ? "Dark Store" : "Vendor Fulfilled"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E0DB] text-xs">
              <span className="text-[#6B6667] block">Assigned Operating Hub</span>
              <span className="font-medium text-[#111111] mt-0.5 block">
                {product.hubAssignment || "Bandra West Terminal Hub, Mumbai"}
              </span>
            </div>
          </div>

          {/* Merchant Attribution Card */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 space-y-2 shadow-xs">
            <h3 className="text-xs font-medium text-[#111111]">
              Merchant Boutique
            </h3>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="font-medium text-[#111111] text-xs">
                  {product.vendorName}
                </h4>
                <p className="text-xs text-[#6B6667] mt-0.5">Boutique Partner</p>
              </div>

              {product.vendorId && (
                <Link
                  href={`/admin/vendors/${product.vendorId}`}
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View Boutique →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
