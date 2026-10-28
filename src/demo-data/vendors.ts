/**
 * KudiCart Central Ops — Frontend Demonstration Dataset: Vendors
 *
 * Isolated frontend demonstration data for UI design review and testing.
 * Contains no network requests, runtime API connections, or backend dependencies.
 */

import { VendorBoutique } from "@/types/vendors";
import { MOCK_VENDORS } from "@/mocks/vendors";

export const DEMO_VENDORS: VendorBoutique[] = MOCK_VENDORS;

/**
 * Retrieve demonstration vendor list
 */
export function getDemoVendors(): VendorBoutique[] {
  return DEMO_VENDORS;
}

/**
 * Retrieve a single demonstration vendor by ID
 */
export function getDemoVendorById(id: string): VendorBoutique | null {
  if (!id) return null;
  const cleanId = id.trim().replace(/^#/, "").toLowerCase();
  return (
    DEMO_VENDORS.find(
      (v) =>
        v.id.toLowerCase() === cleanId ||
        v.vendorNumber.toLowerCase() === cleanId ||
        v.vendorNumber.toLowerCase() === `#${cleanId}` ||
        v.vendorNumber.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "")
    ) || null
  );
}

/**
 * Generate CSV content from vendor records with RFC 4180 escaping
 */
export function generateVendorsCSV(vendors: VendorBoutique[]): string {
  const headers = [
    "Vendor ID",
    "Boutique Store Name",
    "Primary Category",
    "Owner Name",
    "Work Email",
    "Phone Number",
    "Operating Hub",
    "Approval Status",
    "Submission Date",
    "Products Count",
    "Active Orders",
  ];

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = vendors.map((v) => [
    escapeCSV(v.vendorNumber),
    escapeCSV(v.storeName),
    escapeCSV(v.category),
    escapeCSV(v.ownerName),
    escapeCSV(v.email),
    escapeCSV(v.phone),
    escapeCSV(v.operatingHub),
    escapeCSV(v.status),
    escapeCSV(v.submissionDate),
    escapeCSV(v.productCount),
    escapeCSV(v.activeOrderCount),
  ]);

  return "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
