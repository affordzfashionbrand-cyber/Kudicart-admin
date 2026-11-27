export type CouponDiscountType = "PERCENTAGE" | "FLAT";

export type CouponComputedStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  usedCount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status?: CouponComputedStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponInput {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate?: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateCouponInput {
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
