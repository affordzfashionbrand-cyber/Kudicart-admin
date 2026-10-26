export type LedgerSettlementStatus =
  | "CYCLE_ACCRUING"
  | "READY_FOR_TRANSFER"
  | "TRANSFERRED"
  | "HOLD";

export interface VendorLedgerEntry {
  id: string; // e.g. #VEN-7821
  vendorName: string;
  hub: string;
  category: string;
  totalOrders: number;
  grossGmv: number;
  commissionRate: number; // e.g. 12.5%
  commissionRetained: number;
  netPayable: number;
  status: LedgerSettlementStatus;
  lastPayoutDate: string;
  gstin?: string;
  payoutAccount?: string;
  recentOrders?: {
    orderNumber: string;
    itemSummary: string;
    orderTotal: number;
    commissionAmount: number;
    netToVendor: number;
    deliveredAt: string;
  }[];
}

export interface LedgerSummaryMetrics {
  grossMarketplaceVolume: number;
  platformCommissionEarned: number;
  averageTakeRate: number;
  netVendorPayoutsDue: number;
  activeVendorsCount: number;
  fleetLogisticsCosts: number;
  currentCycle: string;
}
