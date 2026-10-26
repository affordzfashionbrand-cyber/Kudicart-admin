export type FulfillmentType = "DARK_STORE" | "VENDOR";

export type ProductListingStatus = "ACTIVE" | "DRAFT" | "SUSPENDED" | "REVIEW";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface CatalogProduct {
  id: string;
  sku: string; // e.g. KLH-0102
  title: string;
  brand: string;
  category: string;
  vendorName: string;
  vendorId?: string;
  sellingPrice: number;
  originalPrice?: number;
  stockQuantity: number;
  stockStatus: StockStatus;
  fulfillmentType: FulfillmentType;
  listingStatus: ProductListingStatus;
  tryAndBuyEligible: boolean;
  hubAssignment?: string;
  primaryImageUrl: string;
  galleryImages: {
    url: string;
    label: string;
    tag?: string;
  }[];
  description?: string;
  specifications: ProductSpecification[];
  createdAt: string;
  updatedAt: string;
}
