"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { CreateDarkStoreProductInput, DarkStoreHub } from "@/types/products";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

interface CategoryOption {
  id: string;
  name: string;
  slug?: string;
  parentCategory?: string | null;
}

export default function AddDarkStoreProductPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Affordz Official Store");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [darkStoreHubId, setDarkStoreHubId] = useState("");
  const [price, setPrice] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<string>("25");
  const [readyToShip, setReadyToShip] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [fabric, setFabric] = useState("");
  const [origin, setOrigin] = useState("");
  const [image, setImage] = useState("");
  const [altText, setAltText] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Metadata loaders
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [hubs, setHubs] = useState<DarkStoreHub[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Upload state
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch categories and active hubs on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingMeta(true);

    Promise.all([
      api.categories.list().catch(() => ({ data: [] })),
      api.hubs.list().catch(() => ({ data: [] })),
    ])
      .then(([catRes, hubRes]) => {
        if (!isMounted) return;
        const catList: CategoryOption[] = (catRes?.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          parentCategory: c.parentCategory,
        }));
        setCategories(catList);
        if (catList.length > 0) {
          setCategoryId(catList[0].id);
        }

        const hubList: DarkStoreHub[] = hubRes?.data || [];
        setHubs(hubList);
        if (hubList.length > 0) {
          setDarkStoreHubId(hubList[0].id);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingMeta(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Computed discount
  const discountInfo = useMemo(() => {
    const sp = parseFloat(price);
    const mrp = parseFloat(originalPrice);
    if (!isNaN(sp) && !isNaN(mrp) && mrp > sp && sp > 0) {
      const pct = Math.round(((mrp - sp) / mrp) * 100);
      const savings = mrp - sp;
      return { pct, savings, label: `${pct}% OFF` };
    }
    return null;
  }, [price, originalPrice]);

  // Size chip toggle
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Primary image upload handler
  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image file size must be less than 5MB.");
      return;
    }

    setUploadingPrimary(true);
    setUploadError(null);

    try {
      const res = await api.media.upload(file);
      if (res?.url) {
        setImage(res.url);
        if (!altText) {
          setAltText(title ? `${title} product photo` : "Affordz Dark Store apparel product");
        }
      }
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload image to Supabase Storage.");
    } finally {
      setUploadingPrimary(false);
    }
  };

  // Gallery image upload handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map((file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not a valid image.`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds the 5MB size limit.`);
        }
        return api.media.upload(file);
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url).filter(Boolean);
      setGalleryImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Remove gallery image
  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Product title is required.";
    }
    if (!description.trim()) {
      errors.description = "Product description is required.";
    }
    if (!categoryId) {
      errors.categoryId = "Please select a category.";
    }
    if (!darkStoreHubId) {
      errors.darkStoreHubId = "Please assign a Dark Store fulfillment hub.";
    }

    const sp = parseFloat(price);
    const mrp = parseFloat(originalPrice);

    if (isNaN(sp) || sp <= 0) {
      errors.price = "Selling price must be at least ₹1.";
    }
    if (isNaN(mrp) || mrp <= 0) {
      errors.originalPrice = "Original MRP must be at least ₹1.";
    }
    if (!isNaN(sp) && !isNaN(mrp) && mrp < sp) {
      errors.originalPrice = "MRP cannot be less than selling price.";
    }

    const stock = parseInt(stockQuantity, 10);
    if (isNaN(stock) || stock < 0) {
      errors.stockQuantity = "Stock quantity cannot be negative.";
    }

    if (selectedSizes.length === 0) {
      errors.sizes = "At least one available size must be selected.";
    }

    if (!image.trim()) {
      errors.image = "Primary product image is required.";
    }
    if (!altText.trim()) {
      errors.altText = "Accessibility alt text is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    const payload: CreateDarkStoreProductInput = {
      title: title.trim(),
      brand: brand.trim() || "Affordz Official Store",
      description: description.trim(),
      categoryId,
      darkStoreHubId,
      price: Math.round(parseFloat(price)),
      originalPrice: Math.round(parseFloat(originalPrice)),
      stockQuantity: parseInt(stockQuantity, 10),
      readyToShip,
      sizes: selectedSizes,
      fabric: fabric.trim() || undefined,
      origin: origin.trim() || undefined,
      image: image.trim(),
      altText: altText.trim(),
      galleryImages: galleryImages.length > 0 ? galleryImages : [image.trim()],
      fulfillmentType: "DARK_STORE",
    };

    try {
      const res = await api.products.create(payload);
      if (res?.success) {
        setSuccessMessage(res.message || "Dark Store product created successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to create Dark Store product. Please check input fields."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-12 space-y-5">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#6B6667]">
        <Link href="/admin/dashboard" className="hover:text-[#111111] transition-colors">
          Central Operations
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/admin/products" className="hover:text-[#111111] transition-colors">
          Products
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#111111] font-medium">Add Dark Store Product</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-[#E4E0DB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#111111] tracking-tight">
              Add Dark Store Product
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-[#FFF0E8] text-[#FF5A1F] text-xs font-semibold border border-[#FFD9CC]">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Affordz Official Store • Dark Store Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6667] mt-1 max-w-2xl">
            Create and publish rapid-fulfillment inventory owned by the platform. Orders route directly
            to designated micro-fulfillment pods for 18-minute delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/products"
            className="h-9 px-3.5 rounded-[8px] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 px-4 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Publish Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] p-4 rounded-[10px] text-xs flex items-center gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#059669]">
            check_circle
          </span>
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] p-4 rounded-[10px] text-xs flex items-start gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#DC2626] shrink-0 mt-0.5">
            error
          </span>
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-sm">Listing Submission Failed</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (8 cols): Core Identity, Pricing, Specs */}
          <div className="lg:col-span-8 space-y-5">
            {/* Section 1: Product Identity */}
            <div className="bg-white rounded-[10px] p-5 sm:p-6 border border-[#E4E0DB] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
                <span className="material-symbols-outlined text-[20px] text-[#FF5A1F]">
                  inventory_2
                </span>
                <h2 className="text-sm font-semibold text-[#111111]">Product Identity</h2>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Product Title <span className="text-[#DA1E28]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pure Mulmul Silk Anarkali Kurta Set"
                    className={`w-full h-9 px-3 text-xs bg-[#F7F7F5] border ${
                      validationErrors.title ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                    } rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all`}
                  />
                  {validationErrors.title && (
                    <p className="text-[11px] text-[#DA1E28] mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#111111] mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Affordz Official Store"
                      className="w-full h-9 px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
                    />
                    <p className="text-[11px] text-[#6B6667] mt-0.5">
                      Defaults to Affordz Official Store
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111111] mb-1">
                      Fulfillment Channel
                    </label>
                    <div className="h-9 px-3 bg-[#F4F1EA] border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#111111] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#FF5A1F] font-semibold">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        DARK STORE EXPRESS
                      </span>
                      <span className="text-[11px] text-[#6B6667]">Locked (Admin Portal)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Editorial Description <span className="text-[#DA1E28]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the fabric weave, embroidery details, neckline, silhouette, and styling recommendations..."
                    className={`w-full p-3 text-xs bg-[#F7F7F5] border ${
                      validationErrors.description ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                    } rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all`}
                  />
                  {validationErrors.description && (
                    <p className="text-[11px] text-[#DA1E28] mt-1">
                      {validationErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Value */}
            <div className="bg-white rounded-[10px] p-5 sm:p-6 border border-[#E4E0DB] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#FF5A1F]">
                    payments
                  </span>
                  <h2 className="text-sm font-semibold text-[#111111]">Pricing (INR)</h2>
                </div>
                {discountInfo && (
                  <span className="px-2.5 py-0.5 rounded-[6px] bg-[#EBF5EE] text-[#198038] text-xs font-semibold border border-[#A7F3D0]">
                    {discountInfo.label} (Save ₹{discountInfo.savings.toLocaleString("en-IN")})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Selling Price (₹) <span className="text-[#DA1E28]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#6B6667]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1299"
                      className={`w-full h-9 pl-7 pr-3 text-xs bg-[#F7F7F5] border ${
                        validationErrors.price ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                      } rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-semibold`}
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-[11px] text-[#DA1E28] mt-1">{validationErrors.price}</p>
                  )}
                  <p className="text-[11px] text-[#6B6667] mt-0.5">Final customer payable amount</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Original Price / MRP (₹) <span className="text-[#DA1E28]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#6B6667]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="2499"
                      className={`w-full h-9 pl-7 pr-3 text-xs bg-[#F7F7F5] border ${
                        validationErrors.originalPrice ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                      } rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-semibold`}
                    />
                  </div>
                  {validationErrors.originalPrice && (
                    <p className="text-[11px] text-[#DA1E28] mt-1">
                      {validationErrors.originalPrice}
                    </p>
                  )}
                  <p className="text-[11px] text-[#6B6667] mt-0.5">
                    Maximum Retail Price (for strikethrough)
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Sizing & Specifications */}
            <div className="bg-white rounded-[10px] p-5 sm:p-6 border border-[#E4E0DB] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E4E0DB]">
                <span className="material-symbols-outlined text-[20px] text-[#FF5A1F]">
                  straighten
                </span>
                <h2 className="text-sm font-semibold text-[#111111]">Sizing & Fabric Attributes</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#111111]">
                      Available Sizes <span className="text-[#DA1E28]">*</span>
                    </label>
                    <span className="text-[11px] text-[#6B6667]">
                      Sizes share total unit stock
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`h-8 px-3.5 rounded-[6px] text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-[#FF5A1F] text-white border border-[#FF5A1F] shadow-xs"
                              : "bg-[#F7F7F5] text-[#111111] border border-[#E4E0DB] hover:bg-[#F4F1EA]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {validationErrors.sizes && (
                    <p className="text-[11px] text-[#DA1E28] mt-1">{validationErrors.sizes}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#111111] mb-1">
                      Fabric Weave
                    </label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder="e.g. Pure Mulmul Silk / Chiffon"
                      className="w-full h-9 px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111111] mb-1">
                      Origin Atelier / Region
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. Jaipur, Rajasthan"
                      className="w-full h-9 px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Imagery via Supabase Storage */}
            <div className="bg-white rounded-[10px] p-5 sm:p-6 border border-[#E4E0DB] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#FF5A1F]">
                    photo_library
                  </span>
                  <h2 className="text-sm font-semibold text-[#111111]">
                    Product Imagery (Supabase Storage)
                  </h2>
                </div>
                <span className="text-[11px] text-[#6B6667]">Max 5MB • JPEG, PNG, WebP</span>
              </div>

              {uploadError && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] p-2.5 rounded-[8px] text-xs">
                  {uploadError}
                </div>
              )}

              {/* Primary Image Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-[#111111]">
                  Primary Product Asset <span className="text-[#DA1E28]">*</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {image ? (
                    <div className="relative w-28 h-36 rounded-[8px] overflow-hidden border border-[#E4E0DB] bg-[#F7F7F5] shrink-0 group">
                      <img
                        src={image}
                        alt={altText || "Uploaded preview"}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#111111]/80 text-white flex items-center justify-center hover:bg-[#DA1E28] transition-colors"
                        title="Remove image"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="w-28 h-36 rounded-[8px] border-2 border-dashed border-[#E4E0DB] hover:border-[#FF5A1F] bg-[#F7F7F5] hover:bg-[#FFF0E8]/20 transition-all flex flex-col items-center justify-center cursor-pointer shrink-0 text-[#6B6667]">
                      {uploadingPrimary ? (
                        <div className="text-center p-2">
                          <span className="material-symbols-outlined text-[24px] text-[#FF5A1F] animate-spin block">
                            progress_activity
                          </span>
                          <span className="text-[10px] mt-1 block">Uploading...</span>
                        </div>
                      ) : (
                        <div className="text-center p-2">
                          <span className="material-symbols-outlined text-[24px] text-[#6B6667] group-hover:text-[#FF5A1F] block">
                            add_photo_alternate
                          </span>
                          <span className="text-[10px] font-medium mt-1 block">Upload Main</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePrimaryUpload}
                        disabled={uploadingPrimary}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#111111] mb-1">
                        Primary Asset URL / CDN Path <span className="text-[#DA1E28]">*</span>
                      </label>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://...supabase.co/storage/v1/object/public/product-images/..."
                        className={`w-full h-8 px-3 text-xs bg-[#F7F7F5] border ${
                          validationErrors.image ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                        } rounded-[6px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] font-mono`}
                      />
                      {validationErrors.image && (
                        <p className="text-[11px] text-[#DA1E28] mt-0.5">
                          {validationErrors.image}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#111111] mb-1">
                        Alt Text (Accessibility) <span className="text-[#DA1E28]">*</span>
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Descriptive text for visually impaired shoppers"
                        className={`w-full h-8 px-3 text-xs bg-[#F7F7F5] border ${
                          validationErrors.altText ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                        } rounded-[6px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]`}
                      />
                      {validationErrors.altText && (
                        <p className="text-[11px] text-[#DA1E28] mt-0.5">
                          {validationErrors.altText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="pt-3 border-t border-[#E4E0DB] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#111111]">
                    Additional Angles & Gallery Photos
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                    <span>Upload More</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleGalleryUpload}
                      disabled={uploadingGallery}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingGallery && (
                  <div className="p-3 bg-[#F4F1EA] rounded-[8px] text-xs text-[#6B6667] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] animate-spin text-[#FF5A1F]">
                      progress_activity
                    </span>
                    <span>Uploading gallery assets to Supabase Storage...</span>
                  </div>
                )}

                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                    {galleryImages.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative h-24 rounded-[6px] overflow-hidden border border-[#E4E0DB] bg-[#F7F7F5] group"
                      >
                        <img
                          src={url}
                          alt={`Gallery angle ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#111111]/80 text-white flex items-center justify-center hover:bg-[#DA1E28] transition-colors"
                          title="Remove angle"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Category, Dark Store Pod, Stock & Guarantees */}
          <div className="lg:col-span-4 space-y-5">
            {/* Category Hierarchy */}
            <div className="bg-white rounded-[10px] p-5 border border-[#E4E0DB] shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E4E0DB]">
                <span className="material-symbols-outlined text-[18px] text-[#FF5A1F]">
                  category
                </span>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Category Hierarchy
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Catalog Category <span className="text-[#DA1E28]">*</span>
                </label>
                {loadingMeta ? (
                  <div className="h-9 bg-[#F7F7F5] animate-pulse rounded-[8px]" />
                ) : (
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 text-xs font-medium bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.parentCategory ? `${c.parentCategory} → ${c.name}` : c.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
                      expand_more
                    </span>
                  </div>
                )}
                {validationErrors.categoryId && (
                  <p className="text-[11px] text-[#DA1E28] mt-1">{validationErrors.categoryId}</p>
                )}
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Category determines customer navigation and search filtering.
                </p>
              </div>
            </div>

            {/* Dark Store Hub Selection */}
            <div className="bg-white rounded-[10px] p-5 border border-[#E4E0DB] shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E4E0DB]">
                <span className="material-symbols-outlined text-[18px] text-[#FF5A1F]">hub</span>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Micro-Fulfillment Pod
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Assigned Dark Store Hub <span className="text-[#DA1E28]">*</span>
                </label>
                {loadingMeta ? (
                  <div className="h-9 bg-[#F7F7F5] animate-pulse rounded-[8px]" />
                ) : (
                  <div className="relative">
                    <select
                      value={darkStoreHubId}
                      onChange={(e) => setDarkStoreHubId(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 text-xs font-medium bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none"
                    >
                      {hubs.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {hub.name} ({hub.locality || hub.city || "Bangalore"})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
                      expand_more
                    </span>
                  </div>
                )}
                {validationErrors.darkStoreHubId && (
                  <p className="text-[11px] text-[#DA1E28] mt-1">
                    {validationErrors.darkStoreHubId}
                  </p>
                )}
              </div>

              <div className="bg-[#FFF0E8] p-3 rounded-[8px] border border-[#FFD9CC] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#FF5A1F]">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>18-Min Hyperlocal SLA</span>
                </div>
                <p className="text-[11px] text-[#6B6667]">
                  Stock assigned to this pod is staged for instantaneous rider pick and delivery.
                </p>
              </div>
            </div>

            {/* Inventory & Stock */}
            <div className="bg-white rounded-[10px] p-5 border border-[#E4E0DB] shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E4E0DB]">
                <span className="material-symbols-outlined text-[18px] text-[#FF5A1F]">
                  inventory
                </span>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Hub Inventory Stock
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Total Units at Assigned Hub <span className="text-[#DA1E28]">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="25"
                  className={`w-full h-9 px-3 text-xs bg-[#F7F7F5] border ${
                    validationErrors.stockQuantity ? "border-[#DA1E28]" : "border-[#E4E0DB]"
                  } rounded-[8px] text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] font-semibold`}
                />
                {validationErrors.stockQuantity && (
                  <p className="text-[11px] text-[#DA1E28] mt-1">
                    {validationErrors.stockQuantity}
                  </p>
                )}
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Catalog tracks single inventory pool per Dark Store listing.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E4E0DB]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-[#111111]">Ready to Ship Immediately</span>
                  <input
                    type="checkbox"
                    checked={readyToShip}
                    onChange={(e) => setReadyToShip(e.target.checked)}
                    className="w-4 h-4 accent-[#FF5A1F] rounded cursor-pointer"
                  />
                </label>
                <p className="text-[11px] text-[#6B6667] mt-0.5">
                  Allows instant order placement without cross-dock delays.
                </p>
              </div>
            </div>

            {/* Fulfillment Guarantee Card */}
            <div className="bg-[#F7F7F5] rounded-[10px] p-4 border border-[#E4E0DB] space-y-2.5">
              <h4 className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#198038]">verified</span>
                Dark Store Invariants Enforced
              </h4>
              <ul className="text-[11px] text-[#6B6667] space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#198038] font-bold">✓</span>
                  <span>
                    <strong>Try & Buy:</strong> Automatically enabled for Dark Store apparel.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#198038] font-bold">✓</span>
                  <span>
                    <strong>Platform Isolation:</strong> Bound to reserved Affordz Official Store
                    record.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#198038] font-bold">✓</span>
                  <span>
                    <strong>Audit Trail:</strong> Admin SKU creation logged with immutable actor ID.
                  </span>
                </li>
              </ul>
            </div>

            {/* Bottom Submit Action Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Publish Dark Store Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
