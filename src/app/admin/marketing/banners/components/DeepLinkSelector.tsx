"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Link as LinkIcon, Tag, ShoppingBag, FolderTree, ExternalLink, Ban } from "lucide-react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { DeepLinkActionType } from "@/types/marketing";

interface DeepLinkSelectorProps {
  actionType: DeepLinkActionType;
  actionValue?: string | null;
  categoryId?: string | null;
  productId?: string | null;
  onChange: (data: {
    actionType: DeepLinkActionType;
    actionValue?: string;
    categoryId?: string;
    productId?: string;
  }) => void;
}

export function DeepLinkSelector({
  actionType,
  actionValue,
  categoryId,
  productId,
  onChange,
}: DeepLinkSelectorProps) {
  // Category state
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Product state
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Load categories on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);
    api.categories
      .list({ limit: 100 })
      .then((res) => {
        if (isMounted && res?.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Search products when query changes
  useEffect(() => {
    if (actionType !== "PRODUCT") return;

    const timer = setTimeout(() => {
      if (!productQuery && !productId) return;
      setLoadingProducts(true);
      api.products
        .list({ search: productQuery || undefined, limit: 10 })
        .then((res) => {
          if (res?.data) {
            setProductResults(res.data);
            if (productId && !selectedProduct) {
              const matched = res.data.find((p: any) => p.id === productId);
              if (matched) setSelectedProduct(matched);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingProducts(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [productQuery, actionType, productId]);

  return (
    <div className="space-y-4 rounded-xl border border-[#E4E0DB] bg-[#FAF8F5] p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">
          Deep-Link Target & Navigation
        </label>
        <span className="text-xs text-[#A09C94]">Destination on banner tap</span>
      </div>

      {/* Action Type Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          { type: "CATEGORY", label: "Category", icon: FolderTree },
          { type: "PRODUCT", label: "Product", icon: ShoppingBag },
          { type: "BRAND", label: "Brand", icon: Tag },
          { type: "SEARCH_QUERY", label: "Search", icon: Search },
          { type: "EXTERNAL_URL", label: "Web Link", icon: ExternalLink },
          { type: "NONE", label: "None", icon: Ban },
        ].map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              onChange({
                actionType: type as DeepLinkActionType,
                actionValue: type === "NONE" ? undefined : actionValue || undefined,
                categoryId: type === "CATEGORY" ? categoryId || undefined : undefined,
                productId: type === "PRODUCT" ? productId || undefined : undefined,
              })
            }
            className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
              actionType === type
                ? "border-[#E05A47] bg-[#FFF5F3] text-[#E05A47] shadow-sm font-semibold"
                : "border-[#E4E0DB] bg-white text-[#6E6B65] hover:border-[#CDC8C0] hover:text-[#2C2B29]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Target Content Configuration based on Selected Action Type */}
      <div className="mt-2">
        {actionType === "CATEGORY" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2C2B29]">Select Target Category</label>
            <select
              value={categoryId || actionValue || ""}
              onChange={(e) => {
                const catId = e.target.value;
                const cat = categories.find((c) => c.id === catId || c.slug === catId);
                onChange({
                  actionType: "CATEGORY",
                  actionValue: cat?.slug || catId,
                  categoryId: catId,
                });
              }}
              className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
            >
              <option value="">-- Choose Category Catalog --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.gender || "All"})
                </option>
              ))}
            </select>
          </div>
        )}

        {actionType === "PRODUCT" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#2C2B29]">Search & Bind Hero Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A09C94]" />
              <input
                type="text"
                placeholder="Search products by title, SKU, or brand..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="w-full rounded-lg border border-[#D5D0C7] bg-white pl-9 pr-3 py-2 text-sm text-[#2C2B29] placeholder-[#A09C94] focus:border-[#E05A47] focus:outline-none"
              />
            </div>

            {selectedProduct && (
              <div className="flex items-center justify-between rounded-lg border border-[#D1E7DD] bg-[#E8F5E9] p-2.5">
                <div className="flex items-center gap-3">
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.title}
                      className="h-10 w-10 rounded object-cover border border-[#D5D0C7]"
                    />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[#1B5E20]">{selectedProduct.title}</p>
                    <p className="text-[11px] text-[#2E7D32]">
                      {selectedProduct.brand} • {formatINR(selectedProduct.price)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    onChange({ actionType: "PRODUCT", actionValue: undefined, productId: undefined });
                  }}
                  className="text-xs font-medium text-[#C62828] hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {!selectedProduct && productResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-[#E4E0DB] bg-white divide-y divide-[#E4E0DB]">
                {productResults.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(prod);
                      onChange({
                        actionType: "PRODUCT",
                        actionValue: prod.id,
                        productId: prod.id,
                      });
                    }}
                    className="flex w-full items-center justify-between p-2 text-left hover:bg-[#F4F1EA] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {prod.image && (
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-[#2C2B29] line-clamp-1">{prod.title}</p>
                        <p className="text-[10px] text-[#6E6B65]">{prod.brand} • {formatINR(prod.price)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#E05A47] font-semibold">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {actionType === "BRAND" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2C2B29]">Target Brand Name</label>
            <input
              type="text"
              placeholder="e.g. SUPERDRY, ADIDAS, BUDA JEANS CO"
              value={actionValue || ""}
              onChange={(e) =>
                onChange({
                  actionType: "BRAND",
                  actionValue: e.target.value,
                })
              }
              className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
            />
            <p className="text-[11px] text-[#6E6B65]">Tapping will filter the catalog strictly to this brand.</p>
          </div>
        )}

        {actionType === "SEARCH_QUERY" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2C2B29]">Catalog Query / Filter Parameter</label>
            <input
              type="text"
              placeholder="e.g. maxPrice=499 or Silk Saree or #OldMoney"
              value={actionValue || ""}
              onChange={(e) =>
                onChange({
                  actionType: "SEARCH_QUERY",
                  actionValue: e.target.value,
                })
              }
              className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["maxPrice=499", "maxPrice=999", "Silk Saree", "Linen", "#OldMoney"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    onChange({
                      actionType: "SEARCH_QUERY",
                      actionValue: preset,
                    })
                  }
                  className="rounded bg-[#EBE7DF] px-2 py-0.5 text-[10px] text-[#4A4742] hover:bg-[#E05A47] hover:text-white transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {actionType === "EXTERNAL_URL" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2C2B29]">Destination Web URL</label>
            <input
              type="url"
              placeholder="https://affordz.in/campaign/diwali-specials"
              value={actionValue || ""}
              onChange={(e) =>
                onChange({
                  actionType: "EXTERNAL_URL",
                  actionValue: e.target.value,
                })
              }
              className="w-full rounded-lg border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#2C2B29] focus:border-[#E05A47] focus:outline-none"
            />
          </div>
        )}

        {actionType === "NONE" && (
          <p className="text-xs text-[#6E6B65] italic">
            This banner will display as a non-clickable visual promotion.
          </p>
        )}
      </div>
    </div>
  );
}
