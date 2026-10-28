/**
 * KudiCart Central Ops — Frontend Demonstration Dataset: Customers
 *
 * Isolated frontend demonstration data for UI design review and testing.
 * Contains no network requests, runtime API connections, or backend dependencies.
 */

import { CustomerUser } from "@/types/users";
import { MOCK_CUSTOMERS } from "@/mocks/users";

export const DEMO_CUSTOMERS: CustomerUser[] = MOCK_CUSTOMERS;

/**
 * Retrieve demonstration customer list
 */
export function getDemoCustomers(): CustomerUser[] {
  return DEMO_CUSTOMERS;
}

/**
 * Retrieve a single demonstration customer by ID
 */
export function getDemoCustomerById(id: string): CustomerUser | null {
  if (!id) return null;
  const cleanId = id.trim().replace(/^#/, "").toLowerCase();
  return (
    DEMO_CUSTOMERS.find(
      (c) =>
        c.id.toLowerCase() === cleanId ||
        c.customerNumber.toLowerCase() === cleanId ||
        c.customerNumber.toLowerCase() === `#${cleanId}` ||
        c.customerNumber.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "")
    ) || null
  );
}

/**
 * Generate CSV content from customer records with RFC 4180 escaping
 */
export function generateCustomersCSV(customers: CustomerUser[]): string {
  const headers = [
    "Customer ID",
    "Full Name",
    "Email Address",
    "Phone Number",
    "Registration Date",
    "Patron Tier",
    "KYC Status",
    "Account Status",
    "Total Orders",
    "Total Spent (INR)",
    "AOV (INR)",
  ];

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = customers.map((c) => [
    escapeCSV(c.customerNumber),
    escapeCSV(c.name),
    escapeCSV(c.email),
    escapeCSV(c.phone),
    escapeCSV(c.registrationDate),
    escapeCSV(c.tier),
    escapeCSV(c.kycLevel),
    escapeCSV(c.status),
    escapeCSV(c.totalOrders),
    escapeCSV(c.totalSpent.toFixed(2)),
    escapeCSV(c.avgOrderValue.toFixed(2)),
  ]);

  return "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
