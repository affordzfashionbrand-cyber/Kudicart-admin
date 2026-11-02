export type CustomerAccountStatus = "ACTIVE" | "SUSPENDED";

export interface CustomerAddress {
  id: string;
  userId?: string;
  label?: string;
  type?: string;
  recipientName?: string | null;
  recipientPhone?: string | null;
  phone?: string;
  line1?: string;
  line2?: string | null;
  street?: string;
  locality?: string;
  city: string;
  state?: string | null;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  avatar?: string | null;
  registrationDate: string;
  status: CustomerAccountStatus;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  addresses: CustomerAddress[];
  tier?: string;
  kycLevel?: string;
  orders?: CustomerOrderSummary[];
  reviews?: CustomerReview[];
  tickets?: CustomerSupportTicket[];
}
