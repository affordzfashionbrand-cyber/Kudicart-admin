import {
  CANONICAL_ORDER_STATUSES,
  FULFILLMENT_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistoryItem,
  PaymentMethod,
  PaymentStatus,
  FulfillmentType,
} from "@/types/orders";

function normalizeOrderStatus(raw: unknown): OrderStatus {
  const value = String(raw || "PLACED").toUpperCase();
  if ((CANONICAL_ORDER_STATUSES as readonly string[]).includes(value)) {
    return value as OrderStatus;
  }
  return "PLACED";
}

function normalizePaymentMethod(raw: unknown): PaymentMethod {
  const value = String(raw || "RAZORPAY").toUpperCase();
  if ((PAYMENT_METHODS as readonly string[]).includes(value)) {
    return value as PaymentMethod;
  }
  return "RAZORPAY";
}

function normalizePaymentStatus(raw: unknown): PaymentStatus {
  const value = String(raw || "PENDING").toUpperCase();
  if ((PAYMENT_STATUSES as readonly string[]).includes(value)) {
    return value as PaymentStatus;
  }
  if (value === "PAID") return "COMPLETED";
  return "PENDING";
}

function normalizeFulfillmentType(raw: unknown): FulfillmentType {
  const value = String(raw || "DARK_STORE").toUpperCase();
  if ((FULFILLMENT_TYPES as readonly string[]).includes(value)) {
    return value as FulfillmentType;
  }
  return "DARK_STORE";
}

export function formatFulfillmentBadgeLabel(order: {
  isTryAndBuy?: boolean;
  fulfillmentType?: FulfillmentType | string;
}): string {
  if (order.isTryAndBuy) return "Try & Buy";
  if (order.fulfillmentType === "VENDOR") return "Vendor Boutique";
  if (order.fulfillmentType === "DARK_STORE") return "Dark Store (60m)";
  return String(order.fulfillmentType || "Standard");
}

function mapOrderItems(rawItems: any): OrderItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((it: any, index: number) => ({
    id: String(it.id || `item-${index}`),
    productId: String(it.productId || ""),
    title: String(it.title || it.productName || "Item"),
    brand: String(it.brand || "Partner Store"),
    size: String(it.size || "Free Size"),
    trialSize: it.trialSize ?? null,
    price: Math.round(Number(it.price ?? it.unitPrice ?? 0)),
    originalPrice:
      it.originalPrice !== undefined && it.originalPrice !== null
        ? Math.round(Number(it.originalPrice))
        : undefined,
    quantity: Number(it.quantity ?? 1),
    image: String(it.image || it.imageUrl || ""),
    tryAndBuyDecision: it.tryAndBuyDecision ?? null,
    returnCondition: it.returnCondition ?? null,
  }));
}

function mapOrderHistory(rawHistory: any): OrderStatusHistoryItem[] {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory.map((h: any) => ({
    id: h.id ? String(h.id) : undefined,
    status: normalizeOrderStatus(h.status),
    timestamp: String(h.timestamp || h.createdAt || ""),
    createdAt: h.createdAt ?? null,
    performer: h.performer || h.actorRole || undefined,
    actorRole: h.actorRole ?? null,
    note: h.note || undefined,
  }));
}

export function mapBackendOrderToWebOrder(raw: any): Order {
  const addr = raw?.deliveryAddress || raw?.customerAddress || raw?.address || {};
  const driverProfile = raw?.driverProfile || raw?.assignedDriver || null;
  const driverUser = raw?.driver || null;
  const vendorName = String(
    raw?.vendorName ||
      raw?.vendor?.storeName ||
      (raw?.vendorId ? "Partner Boutique" : "Affordz Official Store")
  );
  const pickupAddress = String(
    raw?.pickupAddress ||
      raw?.vendor?.address ||
      raw?.vendor?.city ||
      "Central Fulfillment Hub"
  );

  const hasDriver = Boolean(
    driverProfile || raw?.driverId || raw?.driverProfileId || raw?.driverName
  );

  const tnb = raw?.tryAndBuySession || raw?.tryAndBuyDetails || null;

  return {
    id: String(raw?.id || ""),
    orderNumber: String(raw?.orderNumber || raw?.id || ""),
    version: raw?.version !== undefined ? Number(raw.version) : 1,
    checkoutGroupId: raw?.checkoutGroupId ?? null,
    groupNumber: raw?.groupNumber ?? raw?.checkoutGroup?.groupNumber ?? null,
    customerId: String(raw?.customerId || raw?.customer?.id || ""),
    customerName: String(
      raw?.customerName ||
        raw?.customer?.name ||
        addr?.recipientName ||
        "Customer"
    ),
    customerPhone: String(
      raw?.customerPhone ||
        raw?.customer?.phone ||
        addr?.recipientPhone ||
        ""
    ),
    customerAddress: {
      line1: String(addr?.line1 || addr?.street || ""),
      line2: addr?.line2 ? String(addr.line2) : undefined,
      locality: String(addr?.locality || addr?.area || ""),
      city: String(addr?.city || ""),
      pincode: String(addr?.pincode || addr?.postalCode || ""),
      label: String(addr?.label || "Delivery Address"),
    },
    vendorId: String(raw?.vendorId || raw?.vendor?.id || ""),
    vendorName,
    pickupHub: String(raw?.pickupHub || vendorName),
    pickupAddress,
    status: normalizeOrderStatus(raw?.status),
    paymentMethod: normalizePaymentMethod(raw?.paymentMethod),
    paymentStatus: normalizePaymentStatus(raw?.paymentStatus),
    razorpayOrderId: raw?.razorpayOrderId ?? null,
    razorpayPaymentId: raw?.razorpayPaymentId ?? null,
    fulfillmentType: normalizeFulfillmentType(raw?.fulfillmentType),
    itemTotal: Math.round(Number(raw?.itemTotal ?? 0)),
    deliveryFee: Math.round(Number(raw?.deliveryFee ?? 0)),
    taxes: Math.round(Number(raw?.taxes ?? 0)),
    giftWrapFee: Math.round(Number(raw?.giftWrapFee ?? 0)),
    donationAmount: Math.round(Number(raw?.donationAmount ?? 0)),
    discountAmount: Math.round(Number(raw?.discountAmount ?? 0)),
    couponCode: raw?.couponCode ?? null,
    grandTotal: Math.round(Number(raw?.grandTotal ?? 0)),
    isTryAndBuy: Boolean(raw?.isTryAndBuy),
    arrivedAt: raw?.arrivedAt ?? null,
    deliveredAt: raw?.deliveredAt ?? null,
    cancelledAt: raw?.cancelledAt ?? null,
    cancellationReason: raw?.cancellationReason ?? null,
    rejectedByVendor: Boolean(raw?.rejectedByVendor),
    expiresAt: raw?.expiresAt ?? null,
    deliveryInstructions: raw?.deliveryInstructions
      ? String(raw.deliveryInstructions)
      : null,
    verificationPhotos: Array.isArray(raw?.verificationPhotos)
      ? raw.verificationPhotos.map(String).filter(Boolean)
      : [],
    tryAndBuySession: raw?.tryAndBuySession ?? null,
    tryAndBuyDetails: tnb
      ? {
          stage: String(tnb.stage || "HANDOVER_PENDING"),
          trialDurationMinutes: Number(tnb.trialDurationMinutes ?? 20),
          handoverConfirmedAt: tnb.handoverConfirmedAt ?? undefined,
          trialEndsAt: tnb.trialEndsAt ?? null,
          returnManifestId: tnb.returnManifestId ?? undefined,
        }
      : undefined,
    assignedDriver: hasDriver
      ? {
          id: String(
            driverProfile?.id || raw?.driverProfileId || raw?.driverId || ""
          ),
          fullName: String(
            driverProfile?.fullName ||
              raw?.driverName ||
              driverUser?.name ||
              "Assigned Partner"
          ),
          phone: String(
            driverProfile?.phone ||
              raw?.driverPhone ||
              driverUser?.phone ||
              ""
          ),
          vehicleType: String(
            driverProfile?.vehicleType || raw?.driverVehicle || "2W Scooter"
          ),
          vehicleModel: String(driverProfile?.vehicleModel || ""),
          vehicleRegistration: String(
            driverProfile?.vehicleRegistration || ""
          ),
          completedDeliveries: Number(driverProfile?.completedDeliveries ?? 0),
          kycStatus:
            (driverProfile?.kycStatus as "APPROVED" | "PENDING" | "REJECTED") ||
            "APPROVED",
        }
      : null,
    createdAt: String(raw?.createdAt || new Date().toISOString()),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
    items: mapOrderItems(raw?.items || raw?.orderItems),
    history: mapOrderHistory(raw?.history),
  };
}

export interface CanonicalOrderStats {
  all: number;
  placed: number;
  accepted: number;
  preparing: number;
  readyForPickup: number;
  assigned: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
  returning: number;
  returned: number;
  cancelled: number;
  failed: number;
}

export function calculateCanonicalOrderStats(
  orders: Order[]
): CanonicalOrderStats {
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
    returning: orders.filter((o) => o.status === "RETURNING").length,
    returned: orders.filter((o) => o.status === "RETURNED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    failed: orders.filter((o) => o.status === "FAILED").length,
  };
}

export function exportOrdersListToCSV(
  orders: Order[],
  filenamePrefix = "kudicart_orders"
): boolean {
  if (!orders || orders.length === 0) {
    return false;
  }

  const escapeCSV = (value: unknown): string => {
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
    "Fulfillment Channel",
    "Try & Buy",
    "Items Count",
    "Item Total (INR)",
    "Delivery Fee (INR)",
    "Taxes (INR)",
    "Gift Wrap Fee (INR)",
    "Grand Total (INR)",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Assigned Driver Name",
    "Assigned Driver Phone",
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
    escapeCSV(o.fulfillmentType),
    escapeCSV(o.isTryAndBuy ? "YES" : "NO"),
    escapeCSV(o.items.reduce((sum, it) => sum + it.quantity, 0)),
    escapeCSV(o.itemTotal),
    escapeCSV(o.deliveryFee),
    escapeCSV(o.taxes),
    escapeCSV(o.giftWrapFee ?? 0),
    escapeCSV(o.grandTotal),
    escapeCSV(o.paymentMethod),
    escapeCSV(o.paymentStatus),
    escapeCSV(o.status),
    escapeCSV(o.assignedDriver?.fullName || "Unassigned"),
    escapeCSV(o.assignedDriver?.phone || "N/A"),
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

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

export interface WebPaymentRow {
  id: string;
  orderId: string;
  orderRefId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  netSettlement: number;
  method: string;
  subMethod?: string;
  transactionType: string;
  status: PaymentStatus;
  gatewayProvider: string;
  gatewayPaymentId: string;
  bankRrn: string;
  feeDeducted: number;
  date: string;
  orderDescription: string;
  dispatchWindow: string;
  webhookVerified: boolean;
  failureReason?: string | null;
}

export function mapBackendPaymentToWebRecord(raw: any): WebPaymentRow {
  const amount = Math.round((Number(raw?.amount) || 0) * 100) / 100;
  const methodRaw = String(raw?.method || "Razorpay");
  const isCod = methodRaw.toLowerCase().includes("cod");
  const feeDeducted =
    raw?.feeDeducted !== undefined && raw?.feeDeducted !== null
      ? Math.round(Number(raw.feeDeducted) * 100) / 100
      : 0;
  const netSettlement =
    raw?.netSettlement !== undefined && raw?.netSettlement !== null
      ? Math.round(Number(raw.netSettlement) * 100) / 100
      : Math.round((amount - feeDeducted) * 100) / 100;
  const created = raw?.createdAt
    ? new Date(raw.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return {
    id: String(raw?.id || raw?.paymentId || ""),
    orderId: String(raw?.orderNumber || raw?.orderId || raw?.checkoutGroupId || "-"),
    orderRefId: String(raw?.orderId || raw?.orderNumber || ""),
    customerName: String(raw?.customerName || "Customer"),
    customerEmail: String(raw?.customerEmail || "-"),
    customerPhone: String(raw?.customerPhone || "-"),
    amount,
    netSettlement,
    method: methodRaw,
    subMethod: String(raw?.transactionType || "CAPTURE"),
    transactionType: String(raw?.transactionType || "CAPTURE"),
    status: normalizePaymentStatus(raw?.status),
    gatewayProvider: isCod ? "Doorstep Cash / UPI" : "Razorpay",
    gatewayPaymentId: String(raw?.paymentId || raw?.razorpayOrderId || raw?.id || "-"),
    bankRrn: String(raw?.refundId || raw?.razorpayOrderId || "-"),
    feeDeducted,
    date: created,
    orderDescription: `${String(raw?.transactionType || "CAPTURE")} transaction (${String(
      raw?.currency || "INR"
    )})`,
    dispatchWindow: isCod ? "Doorstep Settlement" : "Instant Webhook / Polling",
    webhookVerified: String(raw?.status || "").toUpperCase() === "COMPLETED",
    failureReason: raw?.failureReason ?? null,
  };
}

export interface WebLedgerRow {
  id: string;
  vendorId: string;
  vendorName: string;
  hub: string;
  category: string;
  totalOrders: number;
  grossGmv: number;
  commissionRate: number;
  commissionRetained: number;
  netPayable: number;
  status: "CYCLE_ACCRUING" | "READY_FOR_TRANSFER" | "TRANSFERRED" | "HOLD";
  lastPayoutDate: string;
}

export function mapBackendLedgerToWebRow(raw: any): WebLedgerRow {
  const statusUpper = String(raw?.status || "READY_FOR_TRANSFER").toUpperCase();
  const normalizedStatus: WebLedgerRow["status"] =
    statusUpper === "TRANSFERRED"
      ? "TRANSFERRED"
      : statusUpper === "HOLD"
      ? "HOLD"
      : statusUpper === "CYCLE_ACCRUING"
      ? "CYCLE_ACCRUING"
      : "READY_FOR_TRANSFER";

  const latestAt = raw?.latestEntryAt
    ? new Date(raw.latestEntryAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Current Cycle";

  return {
    id: String(raw?.vendorId || raw?.id || ""),
    vendorId: String(raw?.vendorId || raw?.id || ""),
    vendorName: String(raw?.vendorName || "Partner Store"),
    hub: String(raw?.hub || "Central Settlement"),
    category: String(raw?.category || "Fashion Apparel"),
    totalOrders: Number(raw?.ordersCount ?? raw?.totalOrders ?? 0),
    grossGmv: Math.round((Number(raw?.grossGmv ?? 0) + Number.EPSILON) * 100) / 100,
    commissionRate: Number(raw?.commissionRate ?? 0),
    commissionRetained:
      Math.round((Number(raw?.commissionRetained ?? 0) + Number.EPSILON) * 100) /
      100,
    netPayable:
      Math.round((Number(raw?.netPayable ?? 0) + Number.EPSILON) * 100) / 100,
    status: normalizedStatus,
    lastPayoutDate: latestAt,
  };
}
