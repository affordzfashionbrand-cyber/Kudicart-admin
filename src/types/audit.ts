export type AuditActionType =
  | "DRIVER_KYC_APPROVED"
  | "VENDOR_REVIEW_START"
  | "PRODUCT_DRAFT_SUBMIT"
  | "CUSTOMER_TIER_UPGRADE"
  | "DRIVER_ASSIGNED_MANUAL"
  | "PAYOUT_HOLD_UPDATED"
  | "PRODUCT_STATUS_CHANGED"
  | "VENDOR_APPROVED"
  | "VENDOR_REJECTED";

export type AuditActorRole =
  | "Central Ops Lead"
  | "Admin"
  | "System Automation"
  | "Finance Settlement";

export type AuditEntityType =
  | "Vendor"
  | "Driver"
  | "Order"
  | "Product"
  | "Payment"
  | "Customer";

export interface AuditEvent {
  id: string;
  timestamp: string;
  timestampFull: string;
  actorId: string;
  actorName: string;
  actorRole: AuditActorRole;
  actorInitials: string;
  actionType: AuditActionType;
  entityId: string;
  entityName?: string;
  entityType: AuditEntityType;
  ipAddress: string;
  gatewayVpn?: string;
  userAgent: string;
  sessionTokenHash: string;
  summary: string;
  targetDescription: string;
  changePayload: Record<string, string | number | boolean>;
  entityLink?: string;
}
