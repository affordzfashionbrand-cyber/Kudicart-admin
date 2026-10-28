"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CatalogProduct,
  FulfillmentType,
  StockStatus,
  ProductListingStatus,
} from "@/types/products";
import { getDemoProducts, generateProductsCSV } from "@/demo-data/products";
import { api } from "@/lib/api";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<
    "ALL" | "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "DRAFT"
  >("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [vendorFilter, setVendorFilter] = useState("ALL");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = (showRefreshState = false) => {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    api.products.list({ limit: 100 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setProducts(res.data);
        } else {
          setProducts(getDemoProducts());
        }
      })
      .catch(() => {
        setProducts(getDemoProducts());
      })
      .finally(() => {
        setLoading(false);
        if (showRefreshState) {
          setIsRefreshing(false);
          setToastMessage("Catalog view refreshed.");
          setTimeout(() => setToastMessage(null), 3000);
        }
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Consistent dynamic counts
  const counts = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.listingStatus === "ACTIVE").length;
    const lowStock = products.filter((p) => p.stockStatus === "LOW_STOCK").length;
    const outOfStock = products.filter((p) => p.stockStatus === "OUT_OF_STOCK").length;
    const draft = products.filter(
      (p) => p.listingStatus === "DRAFT" || p.listingStatus === "REVIEW"
    ).length;

    return { total, active, lowStock, outOfStock, draft };
  }, [products]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const availableVendors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.vendorName) set.add(p.vendorName);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesVendor = product.vendorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesSku && !matchesVendor) {
          return false;
        }
      }

      if (statusTab === "ACTIVE" && product.listingStatus !== "ACTIVE") return false;
      if (statusTab === "LOW_STOCK" && product.stockStatus !== "LOW_STOCK") return false;
      if (statusTab === "OUT_OF_STOCK" && product.stockStatus !== "OUT_OF_STOCK") return false;
      if (
        statusTab === "DRAFT" &&
        product.listingStatus !== "DRAFT" &&
        product.listingStatus !== "REVIEW"
      ) {
        return false;
      }

      if (categoryFilter !== "ALL" && product.category !== categoryFilter) return false;
      if (vendorFilter !== "ALL" && product.vendorName !== vendorFilter) return false;
      if (fulfillmentFilter !== "ALL" && product.fulfillmentType !== fulfillmentFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchTerm, statusTab, categoryFilter, vendorFilter, fulfillmentFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusTab, categoryFilter, vendorFilter, fulfillmentFilter]);

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusTab("ALL");
    setCategoryFilter("ALL");
    setVendorFilter("ALL");
    setFulfillmentFilter("ALL");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) return;

    const csvContent = generateProductsCSV(filteredProducts);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kudicart_catalog_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`Exported ${filteredProducts.length} catalog items.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Products
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB] text-xs font-medium tabular-nums">
              {counts.total} Items
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Inspect marketplace catalog, product details, pricing, and stock status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing || loading}
            className="h-9 px-3 rounded-[8px] text-[#111111] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] transition-colors flex items-center justify-center shadow-xs disabled:opacity-50"
            title="Refresh catalog data"
          >
            <span className={`material-symbols-outlined text-[18px] text-[#6B6667] ${isRefreshing ? "animate-spin text-[#FF5A1F]" : ""}`}>
              refresh
            </span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-[8px] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#6B6667]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-[#E4E0DB] flex items-center gap-1 text-xs font-medium overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setStatusTab("ALL")}
          className={`px-3 py-2 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
            statusTab === "ALL"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>All Products</span>
          <span className="px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667] text-[11px] tabular-nums">
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("ACTIVE")}
          className={`px-3 py-2 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
            statusTab === "ACTIVE"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Active Listings</span>
          <span className="px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667] text-[11px] tabular-nums">
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("LOW_STOCK")}
          className={`px-3 py-2 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
            statusTab === "LOW_STOCK"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Low Stock</span>
          <span className="px-1.5 py-0.2 rounded bg-[#FFFBEB] text-[#C9822E] text-[11px] tabular-nums">
            {counts.lowStock}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("OUT_OF_STOCK")}
          className={`px-3 py-2 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
            statusTab === "OUT_OF_STOCK"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Out of Stock</span>
          <span className="px-1.5 py-0.2 rounded bg-[#FEF2F2] text-[#DA1E28] text-[11px] tabular-nums">
            {counts.outOfStock}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("DRAFT")}
          className={`px-3 py-2 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
            statusTab === "DRAFT"
              ? "border-[#FF5A1F] text-[#FF5A1F] font-semibold"
              : "border-transparent text-[#6B6667] hover:text-[#111111]"
          }`}
        >
          <span>Draft / Review</span>
          <span className="px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667] text-[11px] tabular-nums">
            {counts.draft}
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-[10px] border border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined text-[18px] text-[#6B6667] absolute left-3 top-2.5 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, brand, SKU..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] placeholder:text-[#6B6667]/60 focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-normal"
            />
          </div>

          {/* Category Selector */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 pl-3 pr-8 text-xs font-medium bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none hover:bg-white"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Vendor Selector */}
          <div className="relative">
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-9 pl-3 pr-8 text-xs font-medium bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none hover:bg-white"
            >
              <option value="ALL">All Vendors</option>
              {availableVendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Fulfillment Type */}
          <div className="relative">
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="h-9 pl-3 pr-8 text-xs font-medium bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none hover:bg-white"
            >
              <option value="ALL">All Fulfillment</option>
              <option value="DARK_STORE">Dark Store</option>
              <option value="VENDOR">Vendor Fulfilled</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {(searchTerm ||
            statusTab !== "ALL" ||
            categoryFilter !== "ALL" ||
            vendorFilter !== "ALL" ||
            fulfillmentFilter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-2.5 rounded-[8px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="text-right text-[#6B6667] text-xs">
          Showing <span className="font-semibold text-[#111111]">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold text-[#111111]">{products.length}</span> products
        </div>
      </div>

      {/* Product Data Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4 sm:px-5 py-0 font-medium">Product</th>
                <th className="px-4 py-0 font-medium whitespace-nowrap">SKU</th>
                <th className="px-4 py-0 font-medium">Vendor</th>
                <th className="px-4 py-0 font-medium">Category</th>
                <th className="px-4 py-0 font-medium text-right whitespace-nowrap">Price</th>
                <th className="px-4 py-0 font-medium text-right whitespace-nowrap">Stock</th>
                <th className="px-4 py-0 font-medium text-center whitespace-nowrap">Fulfillment</th>
                <th className="px-4 py-0 font-medium text-center whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-5 py-0 font-medium text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#6B6667]">
                    <p className="text-xs font-medium">Loading catalog items...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#6B6667]">
                    <p className="font-medium text-[#111111]">No products found</p>
                    <p className="text-xs text-[#6B6667] mt-1">Try adjusting search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="h-12 hover:bg-[#F7F7F5]/50 transition-colors">
                    {/* Product & Details */}
                    <td className="px-4 sm:px-5 py-0">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="w-8 h-8 rounded-[6px] overflow-hidden border border-[#E4E0DB] shrink-0 bg-[#F4F1EA]"
                        >
                          <img
                            src={product.primaryImageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-[#111111] hover:text-[#FF5A1F] transition-colors block leading-tight truncate max-w-[210px]"
                            title={product.title}
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs text-[#6B6667] truncate max-w-[200px] mt-0.5">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-0 font-mono text-xs text-[#6B6667] whitespace-nowrap">
                      {product.sku}
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-0">
                      <span
                        className="text-xs text-[#111111] block truncate max-w-[170px]"
                        title={product.vendorName}
                      >
                        {product.vendorName}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                      {product.category}
                    </td>

                    {/* Selling Price */}
                    <td className="px-4 py-0 text-right whitespace-nowrap">
                      <span className="font-semibold text-[#111111] tabular-nums block">
                        ₹{(product.sellingPrice ?? 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Stock Quantity */}
                    <td className="px-4 py-0 text-right whitespace-nowrap">
                      <span className="font-medium tabular-nums text-[#111111]">
                        {product.stockQuantity}
                      </span>
                      <span className="ml-1.5">
                        <StatusBadge status={product.stockStatus} variant="stock" />
                      </span>
                    </td>

                    {/* Fulfillment */}
                    <td className="px-4 py-0 text-center whitespace-nowrap">
                      <StatusBadge status={product.fulfillmentType} variant="fulfillment" />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-0 text-center whitespace-nowrap">
                      <StatusBadge status={product.listingStatus} variant="product" />
                    </td>

                    {/* Action */}
                    <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] hover:bg-[#FFF0E8] px-2 py-0.5 rounded transition-colors inline-flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#E4E0DB] bg-[#F7F7F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667]">
          <div>
            Showing <span className="font-semibold text-[#111111]">{totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
            <span className="font-semibold text-[#111111]">{Math.min(currentPage * PAGE_SIZE, totalFiltered)}</span> of{" "}
            <span className="font-semibold text-[#111111]">{totalFiltered}</span> items
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] bg-white text-[#6B6667] text-xs font-medium hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-[6px] text-xs font-medium transition-colors ${
                    currentPage === p
                      ? "bg-[#FF5A1F] text-white"
                      : "border border-[#E4E0DB] bg-white text-[#111111] hover:bg-[#F4F1EA]"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-[6px] border border-[#E4E0DB] bg-white text-[#6B6667] text-xs font-medium hover:bg-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
