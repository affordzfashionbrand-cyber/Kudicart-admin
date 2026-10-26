export type CustomerAccountStatus = "ACTIVE" | "SUSPENDED";

export interface CustomerAddress {
  id: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
  recipientName: string;
  phone: string;
  street: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  vendorName: string;
  itemCount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  status: "PLACED" | "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
}

export interface CustomerReview {
  id: string;
  productTitle: string;
  vendorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  orderNumber: string;
  verifiedPurchase: boolean;
}

export interface CustomerSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  assignedAgent: string;
  slaResponseTime: string;
  status: "RESOLVED" | "OPEN" | "IN_PROGRESS";
  resolvedAt?: string;
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  customerNumber: string; // e.g. #CUS-88219
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  tier: "Gold Patron" | "Silver Member" | "Standard Patron";
  kycLevel: "KYC Verified Level 2" | "KYC Verified Level 1" | "Pending KYC";
  status: CustomerAccountStatus;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  addresses: CustomerAddress[];
  orders: CustomerOrderSummary[];
  reviews: CustomerReview[];
  tickets: CustomerSupportTicket[];
}
