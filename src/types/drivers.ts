export type KycStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export type DriverWorkPreference = 'FULL_TIME' | 'PART_TIME';

export type DriverVehicleType =
  | 'Two-Wheeler'
  | 'EV / Electric'
  | 'Bike'
  | 'Scooty'
  | 'EV Bike'
  | 'EV Scooty';

export interface DeliveryPartner {
  id: string;
  driverCode: string; // e.g. #DRV-118
  fullName: string;
  phone: string;
  avatarUrl?: string;
  workPreference: DriverWorkPreference;
  vehicleType: DriverVehicleType;
  vehicleModel: string; // e.g. Ather 450X Gen 3
  vehicleRegistration: string; // e.g. MH 02 EE 8419
  isOnline: boolean;
  completedDeliveries: number;
  kycStatus: KycStatus;
  statusText?: 'Standby' | 'Active Delivery' | 'Offline';
  rating: number;
}

export interface KycDocumentSide {
  label: string; // e.g. "Front View (Identity)", "Back View (Address & QR)"
  url?: string;
  fileRecord?: {
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  };
  description?: string;
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  dataFields?: { label: string; value: string }[];
}

export interface KycDocumentGroup {
  id: string;
  key: 'selfie' | 'aadhaar' | 'pan' | 'drivingLicence' | 'vehicleRc';
  title: string;
  code: string; // 'A', 'B', 'C', 'D', 'E'
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  statusLabel: string;
  isSingleSided: boolean; // PAN and Selfie are single-sided (no back view)
  front: KycDocumentSide;
  back?: KycDocumentSide;
  metadata?: string;
}

export interface AuditTrailEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type?: 'primary' | 'success' | 'neutral';
}

export interface DeliveryPartnerDetail extends DeliveryPartner {
  email?: string;
  registeredAddress: string;
  dob?: string;
  submissionDate: string;
  assignedReviewer: string;
  terminalHub: string;
  vehicleDetails: {
    vehicleType: string;
    make: string;
    model: string;
    registrationNumber: string;
    isElectric: boolean;
    color?: string;
    rcStatus: string;
  };
  documents: {
    selfie: KycDocumentGroup;
    aadhaar: KycDocumentGroup;
    pan: KycDocumentGroup;
    drivingLicence: KycDocumentGroup;
    vehicleRc: KycDocumentGroup;
  };
  auditTrail: AuditTrailEvent[];
  rejectionReason?: string | null;
}

export interface KycReviewPayload {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface KycReviewResponse {
  success: boolean;
  message: string;
  driverId: string;
  kycStatus: KycStatus;
  rejectionReason?: string | null;
}
