export type NotificationCategory =
  | "KYC"
  | "Assignment"
  | "Order Updates"
  | "System Alerts";

export type NotificationTargetRole =
  | "Driver"
  | "Customer"
  | "Vendor"
  | "Central Admin";

export type NotificationDeliveryStatus = "Delivered" | "Queued" | "Failed";

export type NotificationChannel =
  | "Push Notification"
  | "SMS Gateway"
  | "Email Digest"
  | "In-App Dispatch";

export interface OperationalNotification {
  id: string;
  timestamp: string;
  timestampFull: string;
  category: NotificationCategory;
  targetRole: NotificationTargetRole;
  recipientName: string;
  recipientId: string;
  title: string;
  messagePreview: string;
  messageFull: string;
  deliveryStatus: NotificationDeliveryStatus;
  deliveryChannel: NotificationChannel;
  read: boolean;
  priority?: "Informational" | "Warning" | "Critical";
  dispatchedHub?: string;
}
