export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type TicketPriority = "HIGH" | "MEDIUM" | "NORMAL";

export type TicketCategory =
  | "Try & Buy Inspection"
  | "Delivery Delay"
  | "Damaged Goods"
  | "Payment Failure"
  | "Vendor Dispute"
  | "Address Correction";

export interface SupportTicketItem {
  id: string; // e.g. #TICK-4032
  timeAgo: string; // e.g. 1h ago
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNumber: string; // e.g. #CUS-88219
  customerTier: string; // e.g. Tier-1 VIP
  location: string; // e.g. Bandra West, Mumbai
  category: TicketCategory;
  orderNumber: string; // e.g. #KC-98214
  orderProductSummary: string;
  orderAmount: number;
  orderDeliveryStatus: string;
  assignedCourier?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string; // e.g. Rahul M., Amara O., Unassigned
  subject: string;
  description: string;
  resolutionRemarks?: string;
  resolvedAt?: string;
}
