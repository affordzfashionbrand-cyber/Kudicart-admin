/**
 * KudiCart Central Ops — Frontend Demonstration Dataset: Orders
 *
 * Isolated frontend demonstration data for UI design review and testing.
 * Contains no network requests, runtime API connections, or backend dependencies.
 */

import { Order, OrderStatus } from "@/types/orders";
import { MOCK_ORDERS } from "@/mocks/orders";

export const DEMO_ORDERS: Order[] = MOCK_ORDERS;

export interface OrderStats {
  all: number;
  placed: number;
  accepted: number;
  preparing: number;
  readyForPickup: number;
  assigned: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
}

/**
 * Retrieve demonstration orders list
 */
export function getDemoOrders(): Order[] {
  return DEMO_ORDERS;
}

/**
 * Retrieve a single demonstration order by ID
 */
export function getDemoOrderById(id: string): Order | null {
  if (!id) return null;
  const cleanId = id.trim().replace(/^#/, "");

  return (
    DEMO_ORDERS.find(
      (o) =>
        o.id === cleanId ||
        o.orderNumber.toLowerCase() === cleanId.toLowerCase() ||
        o.id.toLowerCase() === `ord-${cleanId.toLowerCase()}` ||
        o.orderNumber.toLowerCase() === `kc-${cleanId.toLowerCase()}`
    ) || null
  );
}

/**
 * Calculate dynamic counts across canonical order statuses
 */
export function calculateOrderStats(orders: Order[]): OrderStats {
  return {
    all: orders.length,
    placed: orders.filter((o) => o.status === "PLACED").length,
    accepted: orders.filter((o) => o.status === "ACCEPTED").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    readyForPickup: orders.filter((o) => o.status === "READY_FOR_PICKUP").length,
    assigned: orders.filter((o) => o.status === "ASSIGNED").length,
    pickedUp: orders.filter((o) => o.status === "PICKED_UP").length,
    outForDelivery: orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };
}

/**
 * Generates and triggers download of an RFC 4180 compliant CSV export
 */
export function exportOrdersToCSV(orders: Order[], filenamePrefix = "kudicart_orders"): boolean {
  if (!orders || orders.length === 0) {
    return false;
  }

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    "Order ID",
    "Created Date (UTC)",
    "Customer Name",
    "Customer Phone",
    "Delivery Address",
    "Vendor Boutique",
    "Pickup Hub",
    "Fulfillment Type",
    "Items Count",
    "Item Total (INR)",
    "Delivery Fee (INR)",
    "Taxes (INR)",
    "Grand Total (INR)",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Assigned Driver Name",
    "Assigned Driver Phone",
    "Driver Vehicle Type",
    "Driver Vehicle Reg",
  ];

  const rows = orders.map((o) => [
    escapeCSV(o.orderNumber),
    escapeCSV(o.createdAt),
    escapeCSV(o.customerName),
    escapeCSV(o.customerPhone),
    escapeCSV(
      `${o.customerAddress?.line1 || ""}, ${o.customerAddress?.locality || ""}, ${
        o.customerAddress?.city || ""
      } - ${o.customerAddress?.pincode || ""}`
    ),
    escapeCSV(o.vendorName),
    escapeCSV(o.pickupHub),
    escapeCSV(o.fulfillmentType),
    escapeCSV(o.items.reduce((sum, it) => sum + it.quantity, 0)),
    escapeCSV(o.itemTotal),
    escapeCSV(o.deliveryFee),
    escapeCSV(o.taxes),
    escapeCSV(o.grandTotal),
    escapeCSV(o.paymentMethod),
    escapeCSV(o.paymentStatus),
    escapeCSV(o.status),
    escapeCSV(o.assignedDriver?.fullName || "Unassigned"),
    escapeCSV(o.assignedDriver?.phone || "N/A"),
    escapeCSV(o.assignedDriver?.vehicleType || "N/A"),
    escapeCSV(o.assignedDriver?.vehicleRegistration || "N/A"),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
