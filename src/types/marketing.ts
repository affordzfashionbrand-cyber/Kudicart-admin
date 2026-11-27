export type BannerPlacement =
  | 'HERO_CAROUSEL'
  | 'EDITORIAL_STRIP'
  | 'MODERN_REDEFINED'
  | 'PROMO_POPUP';

export type BannerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type DeepLinkActionType =
  | 'CATEGORY'
  | 'PRODUCT'
  | 'BRAND'
  | 'SEARCH_QUERY'
  | 'EXTERNAL_URL'
  | 'NONE';

export interface HomeBanner {
  id: string;
  placement: BannerPlacement;
  tag?: string | null;
  title1: string;
  title2?: string | null;
  discountText?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  targetGender: string;
  vendorId?: string | null;
  vendor?: { id: string; storeName: string; userId?: string } | null;
  status?: BannerApprovalStatus;
  rejectionComment?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  actionType: DeepLinkActionType;
  actionValue?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; slug?: string } | null;
  productId?: string | null;
  product?: { id: string; title: string; brand: string; price: number } | null;
  displayOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerInput {
  placement?: BannerPlacement;
  tag?: string;
  title1: string;
  title2?: string;
  discountText?: string;
  vendorId?: string;
  status?: BannerApprovalStatus;
  imageUrl: string;
  mobileImageUrl?: string;
  targetGender?: string;
  actionType?: DeepLinkActionType;
  actionValue?: string;
  categoryId?: string;
  productId?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export type UpdateBannerInput = Partial<CreateBannerInput>;

export interface BankOffer {
  id: string;
  bankName: string;
  badgeBgColor: string;
  title: string;
  subtitle: string;
  code?: string | null;
  discountText: string;
  minSpendText?: string | null;
  details: string;
  termsUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  validFrom?: string | null;
  validTill?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBankOfferInput {
  bankName: string;
  badgeBgColor?: string;
  title: string;
  subtitle: string;
  code?: string;
  discountText: string;
  minSpendText?: string;
  details: string;
  termsUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  validFrom?: string;
  validTill?: string;
}

export type UpdateBankOfferInput = Partial<CreateBankOfferInput>;

export interface HomeSectionItem {
  id: string;
  sectionConfigId?: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl: string;
  accentColor?: string | null;
  actionType: DeepLinkActionType;
  actionValue?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionItemInput {
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  accentColor?: string;
  actionType?: DeepLinkActionType;
  actionValue?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateSectionItemInput = Partial<CreateSectionItemInput>;

export interface HomeSectionConfig {
  id: string;
  sectionKey: string;
  displayName: string;
  title?: string | null;
  subtitle?: string | null;
  displayOrder: number;
  isEnabled: boolean;
  metadata?: any;
  items?: HomeSectionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSectionConfigInput {
  displayName?: string;
  title?: string;
  subtitle?: string;
  displayOrder?: number;
  isEnabled?: boolean;
  metadata?: any;
}
