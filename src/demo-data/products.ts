/**
 * KudiCart Central Ops — Frontend Demonstration Dataset: Products & Catalog
 *
 * Isolated frontend demonstration data for UI design review and testing.
 * Contains no network requests, runtime API connections, or backend dependencies.
 */

import { CatalogProduct } from "@/types/products";
import { MOCK_PRODUCTS } from "@/mocks/products";

export const DEMO_PRODUCTS: CatalogProduct[] = MOCK_PRODUCTS;

/**
 * Retrieve demonstration product list
 */
export function getDemoProducts(): CatalogProduct[] {
  return DEMO_PRODUCTS;
}

/**
 * Retrieve a single demonstration product by ID
 */
export function getDemoProductById(id: string): CatalogProduct | null {
  if (!id) return null;
  const cleanId = id.trim().replace(/^#/, "").toLowerCase();
  return (
    DEMO_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === cleanId ||
        p.sku.toLowerCase() === cleanId ||
        p.id.toLowerCase().includes(cleanId)
    ) || null
  );
}

/**
 * Generate CSV content from product records with RFC 4180 escaping
 */
export function generateProductsCSV(products: CatalogProduct[]): string {
  const headers = [
    "SKU",
    "Product Title",
    "Boutique Vendor",
    "Category",
    "Selling Price (INR)",
    "MRP (INR)",
    "Available Stock",
    "Stock Status",
    "Listing Status",
    "Fulfillment Mode",
  ];

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = products.map((p) => [
    escapeCSV(p.sku),
    escapeCSV(p.title),
    escapeCSV(p.vendorName),
    escapeCSV(p.category),
    escapeCSV(p.sellingPrice.toFixed(2)),
    escapeCSV(p.originalPrice ? p.originalPrice.toFixed(2) : p.sellingPrice.toFixed(2)),
    escapeCSV(p.stockQuantity),
    escapeCSV(p.stockStatus),
    escapeCSV(p.listingStatus),
    escapeCSV(p.fulfillmentType),
  ]);

  return "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
