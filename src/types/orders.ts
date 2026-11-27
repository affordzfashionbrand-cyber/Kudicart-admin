import type {
  OrderStatus,
  OrderType,
  DeliveryAssignmentStatus,
  PaymentMethod,
  PaymentStatus,
  FulfillmentType,
  TryAndBuyStage,
  TryAndBuyDecision,
  ReturnCondition,
  TryAndBuySessionContract,
  DispatchAssignmentContract,
} from '@/contracts/order-contracts';

export {
  CANONICAL_ORDER_STATUSES,
  ORDER_TYPES,
  DELIVERY_ASSIGNMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  FULFILLMENT_TYPES,
  TRY_AND_BUY_STAGES,
  LIVE_TRACKING_ACTIVE_STATUSES,
  TERMINAL_ORDER_STATUSES,
  VALID_ORDER_TRANSITIONS,
  ORDER_TRANSITION_ROLES,
  getCustomerOrderStatusLabel,
  getDeliveryAssignmentLabel,
} from '@/contracts/order-contracts';

export type {
  OrderStatus,
  OrderType,
  DeliveryAssignmentStatus,
  PaymentMethod,
  PaymentStatus,
  FulfillmentType,
  TryAndBuyStage,
  TryAndBuyDecision,
  ReturnCondition,
  TryAndBuySessionContract,
  DispatchAssignmentContract,
};

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
  tryAndBuyDecision?: TryAndBuyDecision | string | null;
  returnCondition?: ReturnCondition | string | null;
}

export interface OrderStatusHistoryItem {
  id?: string;
  status: OrderStatus;
  timestamp: string;
  createdAt?: string | null;
  performer?: string;
  actorRole?: string | null;
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

export interface OrderAddressInfo {
  line1: string;
  line2?: string;
  locality: string;
  city: string;
  pincode: string;
  label: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  version?: number;
  checkoutGroupId?: string | null;
  groupNumber?: string | null;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: OrderAddressInfo;
  vendorId: string;
  vendorName: string;
  pickupHub: string;
  pickupAddress: string;
  status: OrderStatus;
  orderType: OrderType;
  deliveryAssignmentStatus: DeliveryAssignmentStatus;
  assignmentFailureReason?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  fulfillmentType: FulfillmentType;
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  giftWrapFee?: number;
  donationAmount?: number;
  discountAmount: number;
  couponCode?: string | null;
  grandTotal: number;
  isTryAndBuy: boolean;
  acceptedAt?: string | null;
  packingStartedAt?: string | null;
  readyForPickupAt?: string | null;
  pickedUpAt?: string | null;
  tryAndBuyStartedAt?: string | null;
  arrivedAt?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  returnReason?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  rejectedByVendor?: boolean;
  expiresAt?: string | null;
  deliveryInstructions?: string | null;
  needGstInvoice?: boolean;
  customerGstin?: string | null;
  gstBusinessName?: string | null;
  verificationPhotos?: string[];
  tryAndBuySession?: TryAndBuySessionContract | null;
  dispatchAssignment?: DispatchAssignmentContract | null;
  tryAndBuyDetails?: {
    stage: TryAndBuyStage | string;
    trialDurationMinutes: number;
    handoverConfirmedAt?: string;
    trialEndsAt?: string | null;
    returnManifestId?: string;
  };
  assignedDriver?: AssignedDriverInfo | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  history: OrderStatusHistoryItem[];
}
