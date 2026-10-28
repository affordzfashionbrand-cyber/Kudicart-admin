"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  Filter,
  X,
  CheckCircle2,
  ChevronDown,
  Edit2,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

interface VendorProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  listingStatus: "ACTIVE" | "DRAFT" | "ARCHIVED";
  sizes: string[];
}

const INITIAL_VENDOR_PRODUCTS: VendorProduct[] = [
  {
    id: "VP-01",
    name: "Silk Kaftan Dress",
    sku: "MLA-KAF-001",
    category: "Ethnic Wear",
    price: 14850,
    stock: 18,
    stockStatus: "IN_STOCK",
    listingStatus: "ACTIVE",
    sizes: ["38", "40", "42"],
  },
  {
    id: "VP-02",
    name: "Structured Linen Blazer",
    sku: "MLA-BLZ-002",
    category: "Western Wear",
    price: 9200,
    stock: 3,
    stockStatus: "LOW_STOCK",
    listingStatus: "ACTIVE",
    sizes: ["36", "38"],
  },
  {
    id: "VP-03",
    name: "Hand-Embroidered Kurta",
    sku: "MLA-KUR-003",
    category: "Ethnic Wear",
    price: 6450,
    stock: 24,
    stockStatus: "IN_STOCK",
    listingStatus: "ACTIVE",
    sizes: ["38", "40", "42", "44"],
  },
  {
    id: "VP-04",
    name: "Handloom Tussar Sari",
    sku: "MLA-SAR-004",
    category: "Traditional",
    price: 18500,
    stock: 6,
    stockStatus: "IN_STOCK",
    listingStatus: "ACTIVE",
    sizes: ["Free Size"],
  },
  {
    id: "VP-05",
    name: "Organza Dupatta Set",
    sku: "MLA-DUP-005",
    category: "Accessories",
    price: 4800,
    stock: 0,
    stockStatus: "OUT_OF_STOCK",
    listingStatus: "ARCHIVED",
    sizes: ["Free Size"],
  },
  {
    id: "VP-06",
    name: "Pleated Palazzo Pants",
    sku: "MLA-PAL-006",
    category: "Western Wear",
    price: 5200,
    stock: 12,
    stockStatus: "IN_STOCK",
    listingStatus: "ACTIVE",
    sizes: ["S", "M", "L"],
  },
];

export default function VendorProductsPage() {
  const [products] = useState<VendorProduct[]>(INITIAL_VENDOR_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }

      if (categoryFilter !== "ALL" && p.category !== categoryFilter) {
        return false;
      }

      if (stockFilter !== "ALL" && p.stockStatus !== stockFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setStockFilter("ALL");
  };

  const handleActionNotice = (message: string) => {
    setToastMessage(`Not connected in this build: ${message}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Boutique Catalog &amp; Stock
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20">
              {products.length} Items Listed
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Manage your boutique collections, variants, pricing, and live inventory levels.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-4 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add Product</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6667]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product or SKU..."
              className="w-full h-[36px] pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111] placeholder:text-[#6B6667]"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Ethnic Wear">Ethnic Wear</option>
              <option value="Western Wear">Western Wear</option>
              <option value="Traditional">Traditional</option>
              <option value="Accessories">Accessories</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none" />
          </div>

          {/* Stock Status Filter */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="h-[36px] px-3 text-xs text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] rounded-[8px] flex items-center gap-1.5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      </section>

      {/* Catalog Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E0DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Garments &amp; Inventory
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono bg-[#F4F1EA] text-[#6B6667]">
              {filteredProducts.length} of {products.length} shown
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Product Name &amp; SKU</th>
                <th className="px-4">Category</th>
                <th className="px-4">Available Sizes</th>
                <th className="px-4 text-right">Retail Price</th>
                <th className="px-4 text-center">Stock Units</th>
                <th className="px-4 text-center">Stock Status</th>
                <th className="px-4 text-center">Listing</th>
                <th className="px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <EmptyState
                      title="No products found"
                      description="Try adjusting your keyword search or active category filters."
                      actionLabel="Clear Filters"
                      onAction={clearFilters}
                    />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                  >
                    <td className="px-4 whitespace-nowrap">
                      <div className="font-medium text-[#111111]">
                        {product.name}
                      </div>
                      <div className="font-mono text-[11px] text-[#6B6667]">
                        {product.sku}
                      </div>
                    </td>
                    <td className="px-4 text-xs text-[#6B6667] whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.2 rounded-[4px] text-[10px] bg-[#F4F1EA] border border-[#E4E0DB] text-[#111111]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 text-right font-medium tabular-nums whitespace-nowrap">
                      {formatINR(product.price)}
                    </td>
                    <td className="px-4 text-center font-mono font-medium whitespace-nowrap">
                      {product.stock}
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {product.stockStatus === "IN_STOCK" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          In Stock
                        </span>
                      )}
                      {product.stockStatus === "LOW_STOCK" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          Low Stock
                        </span>
                      )}
                      {product.stockStatus === "OUT_OF_STOCK" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FEF2F2] text-[#DA1E28] border border-[#FCA5A5]">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {product.listingStatus === "ACTIVE" ? (
                        <span className="text-xs font-medium text-[#20885A]">Active</span>
                      ) : (
                        <span className="text-xs text-[#6B6667]">Archived</span>
                      )}
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleActionNotice("Stock adjustment requires backend catalog persistence.")}
                        className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Add Boutique Product
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] text-xs text-[#B45309] space-y-1.5">
              <p className="font-medium">
                Not connected in this build
              </p>
              <p className="text-[11px] leading-relaxed">
                Product creation and asset uploads require active backend catalog persistence and image CDN pipelines.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-[#111111] text-white rounded-[8px] text-xs font-medium hover:bg-[#333333] transition-colors"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
