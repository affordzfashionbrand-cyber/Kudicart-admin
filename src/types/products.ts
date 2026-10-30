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

export interface CreateDarkStoreProductInput {
  title: string;
  brand?: string;
  description: string;
  categoryId: string;
  darkStoreHubId: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  readyToShip?: boolean;
  sizes: string[];
  fabric?: string;
  origin?: string;
  image: string;
  altText: string;
  galleryImages?: string[];
  fulfillmentType?: "DARK_STORE";
}

export interface DarkStoreHub {
  id: string;
  name: string;
  code?: string;
  locality?: string;
  address?: string;
  city?: string;
  pincode?: string;
  isActive?: boolean;
  slaMinutes?: number;
}
