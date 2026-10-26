export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export type PaymentMethod = 'RAZORPAY' | 'COD';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type FulfillmentType = 'Standard' | 'Express (60m)' | 'Try & Buy';

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  size: string;
  trialSize?: string | null;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  performer?: string;
  note?: string;
}

export interface AssignedDriverInfo {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleRegistration: string;
  completedDeliveries: number;
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: {
    line1: string;
    locality: string;
    city: string;
    pincode: string;
    label: string;
  };
  vendorId: string;
  vendorName: string;
  pickupHub: string;
  pickupAddress: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentType: FulfillmentType;
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  discountAmount: number;
  grandTotal: number;
  isTryAndBuy: boolean;
  tryAndBuyDetails?: {
    stage: string;
    trialDurationMinutes: number;
    handoverConfirmedAt?: string;
    returnManifestId?: string;
  };
  assignedDriver?: AssignedDriverInfo | null;
  createdAt: string;
  items: OrderItem[];
  history: OrderStatusHistoryItem[];
}
