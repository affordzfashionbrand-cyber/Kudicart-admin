export type ReportCategory = "ORDERS" | "VENDORS" | "DRIVERS" | "CATALOG";

export type ReportingPeriod =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "MONTH_TO_DATE"
  | "CUSTOM";

export interface ReportConfig {
  id: ReportCategory;
  title: string;
  domain: string;
  description: string;
  schemaTag: string;
  icon: string;
}

export interface OrdersReportRow {
  orderId: string;
  dateTime: string;
  customerName: string;
  vendorName: string;
  itemsCount: number;
  grossGmv: number;
  commission: number;
  deliveryPartner: string;
  status: string;
}

export interface VendorReportRow {
  vendorId: string;
  boutiqueName: string;
  operatingHub: string;
  deliveredOrders: number;
  grossSales: number;
  commissionRate: number;
  commissionRetained: number;
  netPayable: number;
  settlementStatus: string;
}

export interface DriverReportRow {
  partnerId: string;
  name: string;
  vehicleType: string;
  activeHours: number;
  completedRuns: number;
  avgDeliveryMinutes: number;
  payoutTotal: number;
  status: string;
}

export interface CatalogReportRow {
  sku: string;
  title: string;
  brand: string;
  vendor: string;
  nodeHub: string;
  stockQty: number;
  lowStockAlert: boolean;
  mrp: number;
  sellingPrice: number;
  status: string;
}
