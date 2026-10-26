export type VendorApprovalStatus = "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "DOCS_SUBMITTED" | "KYC_PENDING";

export interface VendorDocument {
  id: string;
  title: string;
  fileType: "PDF" | "JPG" | "PNG";
  fileSize: string;
  referenceOrHash: string;
  uploadedAt: string;
  verified: boolean;
}

export interface VendorDraftProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  draftStock: number;
  status: "Draft" | "Published";
  imageUrl: string;
}

export interface VendorBoutique {
  id: string;
  vendorNumber: string; // e.g. #VEN-7821
  storeName: string;
  legalEntityName: string;
  ownerName: string;
  ownerRole: string;
  email: string;
  phone: string;
  category: string;
  operatingHub: string;
  registeredAddress: string;
  gstin: string;
  pan: string;
  bankDetails: {
    bankName: string;
    accountMasked: string;
    ifsc: string;
  };
  productCount: number;
  activeOrderCount: number;
  submissionDate: string;
  status: VendorApprovalStatus;
  assignedReviewer: string;
  identityScreeningPassed: boolean;
  targetFulfillment: string;
  documents: VendorDocument[];
  draftProducts: VendorDraftProduct[];
}
