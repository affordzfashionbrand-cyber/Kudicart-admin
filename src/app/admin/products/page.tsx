"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/mocks/products";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FulfillmentType, StockStatus, ProductListingStatus } from "@/types/products";

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "DRAFT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [vendorFilter, setVendorFilter] = useState("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesVendor = product.vendorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesSku && !matchesVendor) return false;
      }

      // Status Tab
      if (statusTab === "ACTIVE" && product.listingStatus !== "ACTIVE") return false;
      if (statusTab === "LOW_STOCK" && product.stockStatus !== "LOW_STOCK") return false;
      if (statusTab === "OUT_OF_STOCK" && product.stockStatus !== "OUT_OF_STOCK") return false;
      if (statusTab === "DRAFT" && product.listingStatus !== "DRAFT" && product.listingStatus !== "REVIEW") return false;

      // Dropdown filters
      if (categoryFilter !== "ALL" && product.category !== categoryFilter) return false;
      if (vendorFilter !== "ALL" && product.vendorName !== vendorFilter) return false;
      if (fulfillmentFilter !== "ALL" && product.fulfillmentType !== fulfillmentFilter) return false;
      if (stockFilter !== "ALL" && product.stockStatus !== stockFilter) return false;

      return true;
    });
  }, [searchTerm, statusTab, categoryFilter, vendorFilter, fulfillmentFilter, stockFilter]);

  const activeCount = MOCK_PRODUCTS.filter((p) => p.listingStatus === "ACTIVE").length;
  const lowStockCount = MOCK_PRODUCTS.filter((p) => p.stockStatus === "LOW_STOCK").length;
  const outOfStockCount = MOCK_PRODUCTS.filter((p) => p.stockStatus === "OUT_OF_STOCK").length;
  const draftCount = MOCK_PRODUCTS.filter((p) => p.listingStatus === "DRAFT" || p.listingStatus === "REVIEW").length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusTab("ALL");
    setCategoryFilter("ALL");
    setVendorFilter("ALL");
    setFulfillmentFilter("ALL");
    setStockFilter("ALL");
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm">
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight">
              Products &amp; Catalog
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-surface-container-high text-secondary border border-surface-container-highest tabular-nums">
              1,842 Catalog Items
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-secondary mt-1">
            Inspect marketplace products, catalog status, pricing, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => alert("Catalog data refreshed.")}
            className="h-[36px] p-2 rounded-lg text-secondary hover:text-on-surface bg-surface-container-lowest border border-surface-container-highest hover:bg-surface-container-low transition-colors flex items-center justify-center active:scale-[0.98]"
            title="Refresh catalog data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
          <button
            onClick={() => alert("Export CSV: Generating catalog items export...")}
            className="h-[36px] px-space-md rounded-lg bg-surface-container-lowest border border-surface-container-highest hover:bg-surface-container-low text-on-surface text-label-sm font-label-sm font-semibold flex items-center gap-2 transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-surface-container-highest flex items-center gap-space-lg text-label-sm font-label-sm overflow-x-auto select-none">
        <button
          onClick={() => setStatusTab("ALL")}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            statusTab === "ALL"
              ? "border-b-2 border-primary-container text-primary-container font-semibold"
              : "border-b-2 border-transparent text-secondary hover:text-on-surface font-medium"
          }`}
        >
          <span>All Products</span>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-[11px] tabular-nums">
            {MOCK_PRODUCTS.length}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("ACTIVE")}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            statusTab === "ACTIVE"
              ? "border-b-2 border-primary-container text-primary-container font-semibold"
              : "border-b-2 border-transparent text-secondary hover:text-on-surface font-medium"
          }`}
        >
          <span>Active Listings</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-medium text-[11px] tabular-nums">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("LOW_STOCK")}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            statusTab === "LOW_STOCK"
              ? "border-b-2 border-primary-container text-primary-container font-semibold"
              : "border-b-2 border-transparent text-secondary hover:text-on-surface font-medium"
          }`}
        >
          <span>Low Stock</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-medium text-[11px] tabular-nums">
            {lowStockCount}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("OUT_OF_STOCK")}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            statusTab === "OUT_OF_STOCK"
              ? "border-b-2 border-primary-container text-primary-container font-semibold"
              : "border-b-2 border-transparent text-secondary hover:text-on-surface font-medium"
          }`}
        >
          <span>Out of Stock</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-medium text-[11px] tabular-nums">
            {outOfStockCount}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("DRAFT")}
          className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
            statusTab === "DRAFT"
              ? "border-b-2 border-primary-container text-primary-container font-semibold"
              : "border-b-2 border-transparent text-secondary hover:text-on-surface font-medium"
          }`}
        >
          <span>Draft / Review</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-medium text-[11px] tabular-nums">
            {draftCount}
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl border border-surface-container-highest flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs flex-1 min-w-[320px]">
          {/* Search input */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product title, brand, or SKU..."
              className="w-full h-[36px] pl-9 pr-3 text-body-sm font-body-sm bg-surface-container-low border border-surface-container-highest rounded-lg text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Category Selector */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-label-sm font-label-sm bg-surface-container-lowest border border-surface-container-highest rounded-lg text-on-surface focus:outline-none focus:border-primary-container cursor-pointer appearance-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Textiles & Apparel">Textiles &amp; Apparel</option>
              <option value="Artisanal Food">Artisanal Food</option>
              <option value="Home & Decor">Home &amp; Decor</option>
              <option value="Leathercraft">Leathercraft</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </span>
          </div>

          {/* Vendor Selector */}
          <div className="relative">
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-label-sm font-label-sm bg-surface-container-lowest border border-surface-container-highest rounded-lg text-on-surface focus:outline-none focus:border-primary-container cursor-pointer appearance-none"
            >
              <option value="ALL">All Vendors</option>
              <option value="Kashmir Loom Heritage">Kashmir Loom Heritage</option>
              <option value="Malabar Spice Co.">Malabar Spice Co.</option>
              <option value="Deccan Metalcraft">Deccan Metalcraft</option>
              <option value="Minimalist Leather Works">Minimalist Leather Works</option>
              <option value="Artisan Silks Co.">Artisan Silks Co.</option>
              <option value="Nilgiri Tea Planters">Nilgiri Tea Planters</option>
              <option value="Jaipur Blue Pottery">Jaipur Blue Pottery</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </span>
          </div>

          {/* Fulfillment Type */}
          <div className="relative">
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-label-sm font-label-sm bg-surface-container-lowest border border-surface-container-highest rounded-lg text-on-surface focus:outline-none focus:border-primary-container cursor-pointer appearance-none"
            >
              <option value="ALL">All Fulfillment Types</option>
              <option value="DARK_STORE">Dark Store</option>
              <option value="VENDOR">Vendor Fulfilled</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </span>
          </div>

          {/* Clear Filters */}
          {(searchTerm ||
            statusTab !== "ALL" ||
            categoryFilter !== "ALL" ||
            vendorFilter !== "ALL" ||
            fulfillmentFilter !== "ALL" ||
            stockFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="text-body-sm font-body-sm text-secondary hover:text-on-surface underline ml-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="text-body-sm font-body-sm text-secondary">
          Showing <span className="font-bold text-on-surface">{filteredProducts.length}</span> of{" "}
          {MOCK_PRODUCTS.length} products
        </div>
      </div>

      {/* Product Data Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-surface-container border-b border-surface-container-highest text-secondary text-label-xs font-label-xs uppercase tracking-wider">
                <th className="px-4 font-semibold">PRODUCT &amp; DETAILS</th>
                <th className="px-4 font-semibold">SKU</th>
                <th className="px-4 font-semibold">VENDOR / BOUTIQUE</th>
                <th className="px-4 font-semibold">CATEGORY</th>
                <th className="px-4 font-semibold text-right">SELLING PRICE</th>
                <th className="px-4 font-semibold text-right">STOCK</th>
                <th className="px-4 font-semibold text-center">FULFILLMENT</th>
                <th className="px-4 font-semibold text-center">STATUS</th>
                <th className="px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm text-on-surface">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl block mx-auto text-secondary mb-2">
                      inventory_2
                    </span>
                    <p className="font-medium text-on-surface">No products match your filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="h-14 hover:bg-surface-container-low transition-colors">
                    {/* Product & Details */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.primaryImageUrl}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover border border-surface-container-highest shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface leading-tight truncate max-w-[220px]">
                            {product.title}
                          </p>
                          <p className="text-label-xs font-label-xs text-secondary">{product.brand}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-2 font-code-sm text-code-sm text-secondary">
                      {product.sku}
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-2">
                      <span className="font-body-sm-medium text-on-surface">{product.vendorName}</span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-2 text-secondary">{product.category}</td>

                    {/* Selling Price */}
                    <td className="px-4 py-2 text-right">
                      <span className="font-code-sm text-code-sm font-bold text-on-surface tabular-nums">
                        ₹{product.sellingPrice.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && (
                        <span className="block font-code-xs text-[10px] text-tertiary line-through tabular-nums">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-2 text-right">
                      <span className="font-code-sm text-code-sm tabular-nums block font-medium">
                        {product.stockQuantity} units
                      </span>
                      <StatusBadge status={product.stockStatus} variant="stock" />
                    </td>

                    {/* Fulfillment */}
                    <td className="px-4 py-2 text-center">
                      <StatusBadge status={product.fulfillmentType} variant="fulfillment" />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2 text-center">
                      <StatusBadge status={product.listingStatus} variant="product" />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="h-7 px-2.5 text-primary hover:text-pressed-orange font-label-xs text-label-xs font-semibold inline-flex items-center gap-0.5 hover:bg-[#FFF0E8]/50 rounded transition-colors"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-surface-container-highest flex items-center justify-between text-label-xs text-secondary">
          <div>
            Showing <span className="font-semibold text-on-surface">1</span> to{" "}
            <span className="font-semibold text-on-surface">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold text-on-surface">1,842</span> items
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs opacity-50 cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-2.5 py-1 rounded border border-primary-container bg-primary-container text-surface-container-lowest text-label-xs font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs hover:bg-surface">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-surface-container-highest bg-surface-container-lowest text-secondary text-label-xs hover:bg-surface">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
