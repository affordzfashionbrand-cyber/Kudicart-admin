export type AdminPaymentMethod =
  | "Razorpay UPI"
  | "Razorpay Netbanking"
  | "Razorpay Cards"
  | "Cash on Delivery";

export type AdminPaymentStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";

export interface PaymentRecord {
  id: string; // e.g. #PAY-992140
  orderId: string; // e.g. #KC-98214
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  netSettlement: number;
  method: AdminPaymentMethod;
  subMethod?: string;
  status: AdminPaymentStatus;
  gatewayProvider: string;
  gatewayPaymentId: string; // e.g. pay_O9kL21mNsZ
  bankRrn: string; // UTR or RRN
  feeDeducted: number;
  date: string; // e.g. 24 Oct, 14:28 IST
  orderDescription: string;
  dispatchWindow: string;
  webhookVerified: boolean;
  timeline: {
    title: string;
    time: string;
    completed: boolean;
  }[];
}

export interface PaymentSummaryMetrics {
  settledToday: number;
  settledOrdersCount: number;
  captureRate: number;
  razorpayOnline: number;
  razorpayOrdersCount: number;
  cashOnDelivery: number;
  codOrdersCount: number;
  failedAmount: number;
  failureRate: number;
  failedCount: number;
}
