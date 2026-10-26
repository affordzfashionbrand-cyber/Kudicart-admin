export type ReviewModerationStatus = "PUBLISHED" | "FLAGGED" | "REMOVED";

export interface AdminReviewItem {
  id: string; // e.g. #REV-5510
  productId: string;
  productTitle: string;
  productSku: string;
  productImage?: string;
  vendorName: string;
  customerName: string;
  customerEmail?: string;
  rating: number; // 1 to 5
  comment: string;
  orderNumber: string;
  date: string; // e.g. 24 Oct 2024
  status: ReviewModerationStatus;
  flagReason?: string;
  verifiedPurchase: boolean;
}

export interface ReviewsSummaryMetrics {
  averageRating: number;
  totalReviews: number;
  positivePercentage: number;
  ratingDistribution: {
    stars: number;
    count: number;
    percentage: number;
  }[];
  flaggedCount: number;
}
